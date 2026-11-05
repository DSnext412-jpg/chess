import Peer, { type DataConnection, type PeerError } from 'peerjs';
import { GameEngine, type PromotionPiece } from '../lib/gameEngine';
import {
  createId,
  createRoomCode,
  createToken,
  inviteLink,
  isValidRoomCode,
  normalizeRoomCode,
  peerIdForRoom,
  sanitizeName,
} from '../lib/id';
import { parseClientMessage, parseHostMessage } from '../lib/protocol';
import type {
  Color,
  GameSnapshot,
  MovementMode,
  SessionMeta,
  Square,
} from '../types/chess';
import type {
  ClientMessage,
  ConnectionStatus,
  HostMessage,
  IncomingRequest,
  OutgoingRequest,
  RequestType,
} from '../types/protocol';

export type SessionPhase =
  | 'idle'
  | 'waiting'
  | 'joining'
  | 'playing'
  | 'ended'
  | 'error';

export type NoticeTone = 'info' | 'success' | 'error';

export interface SessionNotice {
  id: string;
  message: string;
  tone: NoticeTone;
}

export interface SessionState {
  phase: SessionPhase;
  role: 'host' | 'guest' | null;
  roomCode: string | null;
  status: ConnectionStatus;
  error: string | null;
  hostName: string;
  guestName: string;
  hostColor: Color;
  guestColor: Color;
  snapshot: GameSnapshot;
  guestPresent: boolean;
  incomingRequest: IncomingRequest | null;
  outgoingRequest: OutgoingRequest | null;
  endedReason: string | null;
  canRetry: boolean;
  notice: SessionNotice | null;
}

function configuredIceServers(): RTCIceServer[] {
  const defaults: RTCIceServer[] = [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:global.stun.twilio.com:3478' },
  ];

  // Optional static-site configuration. TURN credentials placed in Vite env
  // variables are visible to visitors; use short-lived credentials if your
  // TURN provider supports them. No credentials are bundled by default.
  const raw = import.meta.env.VITE_ICE_SERVERS;
  if (raw) {
    try {
      const parsed: unknown = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed as RTCIceServer[];
    } catch {
      // Keep the safe STUN defaults when optional configuration is malformed.
    }
  }
  return defaults;
}

const PEER_OPTIONS = {
  debug: 0,
  config: { iceServers: configuredIceServers() },
} as const;

const CONNECT_TIMEOUT = 12_000;
const JOIN_TIMEOUT = 12_000;
const REQUEST_TIMEOUT = 45_000;
const NOTICE_TIMEOUT = 4_500;
const ROOM_DISCONNECT_GRACE_MS = 10 * 60 * 1_000;
const GUEST_TOKEN_PREFIX = 'chess-session:guest-token:';
const MAX_RECONNECT_ATTEMPTS = 5;
const RECONNECT_DELAYS = [1200, 2200, 3500, 5000, 7000];

function initialSnapshot(): GameSnapshot {
  return new GameEngine('standard').getSnapshot();
}

function errorType(error: unknown): string {
  if (error && typeof error === 'object' && 'type' in error) {
    return String((error as { type: unknown }).type);
  }
  return 'unknown';
}

function peerErrorMessage(type: string): string {
  switch (type) {
    case 'browser-incompatible':
      return 'This browser does not support the WebRTC features needed for a live game. Try the latest Chrome, Edge, Firefox or Safari.';
    case 'ssl-unavailable':
      return 'The connection service could not be reached securely. Please try again from an HTTPS page.';
    case 'network':
    case 'server-error':
    case 'socket-error':
    case 'socket-closed':
      return 'The PeerJS connection service is unreachable right now. Check your internet connection and retry in a moment.';
    case 'invalid-id':
    case 'invalid-key':
      return 'The room identifier was rejected by the connection service. Please create a new room.';
    default:
      return 'Could not establish a peer connection. Please retry, or try a different network.';
  }
}

export class SessionManager {
  private state: SessionState;
  private engine = new GameEngine('standard');
  private listeners = new Set<() => void>();

  private role: 'host' | 'guest' | null = null;
  private peer: Peer | null = null;
  private conn: DataConnection | null = null;
  private pendingConn: DataConnection | null = null;
  private guestToken: string | null = null;
  private myToken = createToken();

  private lastHost: { name: string; mode: MovementMode } | null = null;
  private lastJoin: { code: string; name: string } | null = null;
  private hostAttempts = 0;

  private closed = true;
  private connectionEpoch = 0;
  private connectTimer: ReturnType<typeof setTimeout> | null = null;
  private joinTimer: ReturnType<typeof setTimeout> | null = null;
  private requestTimer: ReturnType<typeof setTimeout> | null = null;
  private incomingTimer: ReturnType<typeof setTimeout> | null = null;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private roomExpiryTimer: ReturnType<typeof setTimeout> | null = null;
  private noticeTimer: ReturnType<typeof setTimeout> | null = null;
  private reconnectAttempts = 0;

  private processedMoveIds = new Set<string>();
  private moveIdOrder: string[] = [];
  private lastWelcomeSeq = -1;
  private pendingMove = false;

  constructor() {
    this.state = {
      phase: 'idle',
      role: null,
      roomCode: null,
      status: 'idle',
      error: null,
      hostName: '',
      guestName: '',
      hostColor: 'w',
      guestColor: 'b',
      snapshot: initialSnapshot(),
      guestPresent: false,
      incomingRequest: null,
      outgoingRequest: null,
      endedReason: null,
      canRetry: false,
      notice: null,
    };
  }

  subscribe = (listener: () => void): (() => void) => {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  };

  getState = (): SessionState => this.state;

  getMyColor(): Color | null {
    if (!this.state.role) return null;
    return this.state.role === 'host'
      ? this.state.hostColor
      : this.state.guestColor;
  }

  private setState(patch: Partial<SessionState>): void {
    this.state = { ...this.state, ...patch };
    for (const listener of this.listeners) listener();
  }

  private notify(message: string, tone: NoticeTone = 'info'): void {
    if (this.noticeTimer) clearTimeout(this.noticeTimer);
    const id = createId('notice');
    this.setState({ notice: { id, message, tone } });
    this.noticeTimer = setTimeout(() => {
      if (this.state.notice?.id === id) {
        this.setState({ notice: null });
      }
    }, NOTICE_TIMEOUT);
  }

  clearNotice(): void {
    if (this.noticeTimer) clearTimeout(this.noticeTimer);
    this.setState({ notice: null });
  }

  private getMeta(): SessionMeta {
    return {
      roomCode: this.state.roomCode ?? '',
      hostName: this.state.hostName,
      guestName: this.state.guestName,
      hostColor: this.state.hostColor,
      guestColor: this.state.guestColor,
    };
  }

  private clearTimers(): void {
    for (const timer of [
      this.connectTimer,
      this.joinTimer,
      this.requestTimer,
      this.incomingTimer,
      this.reconnectTimer,
      this.roomExpiryTimer,
    ]) {
      if (timer) clearTimeout(timer);
    }
    this.connectTimer = null;
    this.joinTimer = null;
    this.requestTimer = null;
    this.incomingTimer = null;
    this.reconnectTimer = null;
    this.roomExpiryTimer = null;
  }

  private clearRoomExpiry(): void {
    if (this.roomExpiryTimer) clearTimeout(this.roomExpiryTimer);
    this.roomExpiryTimer = null;
  }

  private scheduleRoomExpiry(): void {
    if (this.role !== 'host' || this.closed || this.state.guestPresent) return;
    this.clearRoomExpiry();
    this.roomExpiryTimer = setTimeout(() => {
      this.roomExpiryTimer = null;
      if (this.closed || this.state.guestPresent) return;
      this.finishSession(
        'This temporary room expired after 10 minutes without an active opponent.',
        false,
      );
    }, ROOM_DISCONNECT_GRACE_MS);
  }

  private guestTokenStorageKey(code: string): string {
    return `${GUEST_TOKEN_PREFIX}${code}`;
  }

  private readGuestToken(code: string): string | null {
    try {
      return window.sessionStorage.getItem(this.guestTokenStorageKey(code));
    } catch {
      return null;
    }
  }

  private saveGuestToken(code: string, token: string): void {
    try {
      window.sessionStorage.setItem(this.guestTokenStorageKey(code), token);
    } catch {
      // Storage can be unavailable in private browsing; in-memory play still works.
    }
  }

  private clearGuestToken(code?: string | null): void {
    if (!code) return;
    try {
      window.sessionStorage.removeItem(this.guestTokenStorageKey(code));
    } catch {
      // Ignore storage restrictions.
    }
  }

  private beginIncomingTimeout(): void {
    if (this.incomingTimer) clearTimeout(this.incomingTimer);
    this.incomingTimer = setTimeout(() => {
      this.incomingTimer = null;
      const request = this.state.incomingRequest;
      if (!request) return;
      this.send({
        type: 'response',
        requestId: request.requestId,
        accept: false,
      });
      this.setState({ incomingRequest: null });
      this.notify('The request expired without a response.', 'info');
    }, REQUEST_TIMEOUT);
  }

  private destroyPeer(): void {
    this.connectionEpoch += 1;
    this.clearTimers();
    const conn = this.conn;
    const pending = this.pendingConn;
    const peer = this.peer;
    this.conn = null;
    this.pendingConn = null;
    this.peer = null;
    if (conn) {
      try {
        conn.close();
      } catch {
        /* ignore */
      }
    }
    if (pending && pending !== conn) {
      try {
        pending.close();
      } catch {
        /* ignore */
      }
    }
    if (peer) {
      try {
        peer.destroy();
      } catch {
        /* ignore */
      }
    }
  }

  private stopNetworking(): void {
    this.closed = true;
    this.destroyPeer();
  }

  private send(message: ClientMessage | HostMessage): boolean {
    const conn = this.conn;
    if (!conn || !conn.open) return false;
    try {
      conn.send(message);
      return true;
    } catch {
      return false;
    }
  }

  private sendTo(conn: DataConnection, message: ClientMessage | HostMessage): void {
    if (!conn.open) return;
    try {
      conn.send(message);
    } catch {
      /* ignore */
    }
  }

  private rejectConnection(conn: DataConnection, reason: string): void {
    let sent = false;
    const finish = () => {
      if (sent) return;
      sent = true;
      this.sendTo(conn, { type: 'rejected', reason });
      setTimeout(() => {
        try {
          conn.close();
        } catch {
          /* ignore */
        }
      }, 120);
    };
    if (conn.open) finish();
    else conn.on('open', finish);
  }

  // ---------------------------------------------------------------- host

  hostRoom(name: string, mode: MovementMode): void {
    this.stopNetworking();
    this.closed = false;
    this.role = 'host';
    this.hostAttempts = 0;
    this.clearRoomExpiry();
    this.guestToken = null;
    this.pendingConn = null;
    this.processedMoveIds.clear();
    this.moveIdOrder = [];
    this.engine.reset(mode);
    const hostName = sanitizeName(name, 'Player 1');
    this.lastHost = { name: hostName, mode };
    this.setState({
      phase: 'waiting',
      role: 'host',
      roomCode: null,
      status: 'connecting',
      error: null,
      hostName,
      guestName: '',
      hostColor: 'w',
      guestColor: 'b',
      snapshot: this.engine.getSnapshot(),
      guestPresent: false,
      incomingRequest: null,
      outgoingRequest: null,
      endedReason: null,
      canRetry: false,
      notice: null,
    });
    this.beginHostAttempt();
  }

  private beginHostAttempt(): void {
    if (this.closed || !this.lastHost) return;
    this.hostAttempts += 1;
    const code = createRoomCode();
    this.setState({
      roomCode: code,
      status: 'connecting',
      phase: 'waiting',
    });

    const peer = new Peer(peerIdForRoom(code), PEER_OPTIONS);
    this.peer = peer;
    const epoch = ++this.connectionEpoch;

    peer.on('open', () => {
      if (this.closed || epoch !== this.connectionEpoch) return;
      this.setState({ status: 'waiting' });
    });

    peer.on('connection', (conn) => {
      if (this.closed || epoch !== this.connectionEpoch) return;
      this.handleIncomingConnection(conn);
    });

    peer.on('disconnected', () => {
      if (this.closed || epoch !== this.connectionEpoch) return;
      if (this.state.guestPresent) {
        try {
          peer.reconnect();
        } catch {
          /* ignore */
        }
        return;
      }
      this.setState({ status: 'reconnecting' });
      this.notify('Signaling connection lost. Reconnecting…', 'error');
      setTimeout(() => {
        if (this.closed || epoch !== this.connectionEpoch) return;
        try {
          peer.reconnect();
        } catch {
          /* ignore */
        }
      }, 1200);
    });

    peer.on('error', (error) => {
      if (this.closed || epoch !== this.connectionEpoch) return;
      this.handleHostPeerError(error);
    });
  }

  private handleHostPeerError(error: PeerError<string>): void {
    const type = errorType(error);
    if (type === 'unavailable-id') {
      if (this.hostAttempts < 5) {
        const peer = this.peer;
        this.peer = null;
        if (peer) {
          try {
            peer.destroy();
          } catch {
            /* ignore */
          }
        }
        this.beginHostAttempt();
        return;
      }
      this.failSession('Could not reserve a room code. Please retry.');
      return;
    }

    if (this.state.guestPresent) {
      this.notify(
        'The signaling service was interrupted, but your direct game connection is still active.',
        'error',
      );
      return;
    }

    if (type === 'peer-unavailable') return;
    this.failSession(peerErrorMessage(type));
  }

  private handleIncomingConnection(conn: DataConnection): void {
    if (this.closed) return;
    const metadata = (conn.metadata ?? {}) as Record<string, unknown>;
    const token = typeof metadata.token === 'string' ? metadata.token : '';

    if (!token) {
      this.rejectConnection(conn, 'Invalid join request.');
      return;
    }

    if (this.guestToken && token !== this.guestToken) {
      this.rejectConnection(
        conn,
        'This room is full. Ask the host to start a new session.',
      );
      return;
    }

    if (this.pendingConn && this.pendingConn !== conn) {
      const pendingMeta = (this.pendingConn.metadata ?? {}) as Record<
        string,
        unknown
      >;
      if (pendingMeta.token !== token) {
        this.rejectConnection(
          conn,
          'This room is full. Ask the host to start a new session.',
        );
        return;
      }
    }

    if (this.conn && this.conn.open && this.conn !== conn) {
      if (!this.guestToken || token !== this.guestToken) {
        this.rejectConnection(
          conn,
          'This room is full. Ask the host to start a new session.',
        );
        return;
      }
      try {
        this.conn.close();
      } catch {
        /* ignore */
      }
    }

    this.pendingConn = conn;
    let admitted = false;
    const epoch = this.connectionEpoch;

    if (this.joinTimer) clearTimeout(this.joinTimer);
    this.joinTimer = setTimeout(() => {
      if (!admitted && this.pendingConn === conn) {
        this.rejectConnection(conn, 'Join timed out.');
        this.pendingConn = null;
      }
    }, JOIN_TIMEOUT);

    conn.on('data', (data: unknown) => {
      if (this.closed || epoch !== this.connectionEpoch) return;
      if (!admitted) {
        const message = parseClientMessage(data);
        if (!message || message.type !== 'join') {
          this.rejectConnection(conn, 'Invalid join request.');
          return;
        }
        if (this.guestToken && message.token !== this.guestToken) {
          this.rejectConnection(
            conn,
            'This room is full. Ask the host to start a new session.',
          );
          return;
        }
        if (token && message.token !== token) {
          this.rejectConnection(conn, 'Invalid join token.');
          return;
        }

        admitted = true;
        if (this.joinTimer) {
          clearTimeout(this.joinTimer);
          this.joinTimer = null;
        }
        const previous = this.conn;
        const isReconnect = !!this.guestToken;
        this.clearRoomExpiry();
        this.conn = conn;
        this.pendingConn = null;
        this.guestToken = message.token;
        if (previous && previous !== conn) {
          try {
            previous.close();
          } catch {
            /* ignore */
          }
        }
        const guestName = sanitizeName(message.name, 'Player 2');
        this.setState({
          phase: 'playing',
          status: 'connected',
          guestName,
          guestPresent: true,
          error: null,
          endedReason: null,
          canRetry: false,
          incomingRequest: null,
          outgoingRequest: null,
        });
        this.sendWelcome(isReconnect);
        this.notify(
          isReconnect
            ? `${guestName} reconnected.`
            : `${guestName} joined the game.`,
          'success',
        );
        return;
      }

      if (this.conn !== conn) return;
      this.handleClientMessage(data);
    });

    conn.on('close', () => {
      if (this.closed) return;
      if (this.pendingConn === conn) this.pendingConn = null;
      if (this.conn === conn) {
        this.conn = null;
            this.setState({
          status: 'disconnected',
          guestPresent: false,
          incomingRequest: null,
          outgoingRequest: null,
        });
        this.notify(
          'Your opponent disconnected. They have 10 minutes to reconnect before this room expires.',
          'error',
        );
        this.scheduleRoomExpiry();
      }
    });

    conn.on('error', () => {
      if (this.closed) return;
      if (this.conn === conn) {
        this.conn = null;
            this.setState({
          status: 'disconnected',
          guestPresent: false,
        });
        this.notify('The data connection failed. Waiting up to 10 minutes for your opponent to reconnect…', 'error');
        this.scheduleRoomExpiry();
      }
    });
  }

  private sendWelcome(reconnect: boolean): void {
    this.send({
      type: 'welcome',
      snapshot: this.engine.getSnapshot(),
      meta: this.getMeta(),
      reconnect,
    });
  }

  private broadcastSnapshot(): void {
    const snapshot = this.engine.getSnapshot();
    this.setState({ snapshot });
    this.send({
      type: 'snapshot',
      snapshot,
      meta: this.getMeta(),
    });
  }

  private handleClientMessage(data: unknown): void {
    const message = parseClientMessage(data);
    if (!message) return;
    switch (message.type) {
      case 'move':
        this.handleGuestMove(message);
        break;
      case 'request':
        this.handleGuestRequest(message);
        break;
      case 'response':
        this.handleGuestResponse(message);
        break;
      case 'resign':
        if (this.engine.getResult()) return;
        this.engine.endByResignation(this.state.hostColor);
        this.broadcastSnapshot();
        this.notify('Your opponent resigned.', 'success');
        break;
      case 'end-session':
        this.finishSession('Your opponent ended the session.', false, {
          graceMs: 150,
        });
        break;
      case 'ping':
        this.send({ type: 'pong' });
        break;
      case 'join':
        break;
    }
  }

  private handleGuestMove(
    message: Extract<ClientMessage, { type: 'move' }>,
  ): void {
    if (this.processedMoveIds.has(message.moveId)) return;
    if (this.state.incomingRequest) {
      this.send({ type: 'error', message: 'Resolve the pending request first.' });
      return;
    }
    if (this.state.status !== 'connected') {
      this.send({ type: 'error', message: 'Opponent is not connected.' });
      return;
    }
    const outcome = this.engine.tryMove(
      message.from,
      message.to,
      message.promotion,
      this.state.guestColor,
    );
    if (!outcome.ok) {
      this.send({ type: 'error', message: outcome.error });
      this.send({
        type: 'snapshot',
        snapshot: this.engine.getSnapshot(),
        meta: this.getMeta(),
      });
      return;
    }
    this.rememberMoveId(message.moveId);
    this.broadcastSnapshot();
  }

  private rememberMoveId(moveId: string): void {
    this.processedMoveIds.add(moveId);
    this.moveIdOrder.push(moveId);
    while (this.moveIdOrder.length > 200) {
      const old = this.moveIdOrder.shift();
      if (old) this.processedMoveIds.delete(old);
    }
  }

  private handleGuestRequest(
    message: Extract<ClientMessage, { type: 'request' }>,
  ): void {
    if (this.state.incomingRequest) {
      this.send({
        type: 'response',
        requestId: message.requestId,
        accept: false,
      });
      return;
    }
    if (message.requestType === 'mode') {
      this.send({
        type: 'response',
        requestId: message.requestId,
        accept: false,
      });
      this.notify('Only the host can change movement rules.', 'error');
      return;
    }
    if (!this.canRequestNow(message.requestType)) {
      this.send({
        type: 'response',
        requestId: message.requestId,
        accept: false,
      });
      this.notify('That request cannot be accepted right now.', 'error');
      return;
    }
    this.setState({
      incomingRequest: {
        requestId: message.requestId,
        requestType: message.requestType,
        payload: message.payload,
        from: 'guest',
      },
    });
    this.beginIncomingTimeout();
  }

  private handleGuestResponse(
    message: Extract<ClientMessage, { type: 'response' }>,
  ): void {
    const outgoing = this.state.outgoingRequest;
    if (!outgoing || outgoing.requestId !== message.requestId) return;
    if (this.requestTimer) {
      clearTimeout(this.requestTimer);
      this.requestTimer = null;
    }
    this.setState({ outgoingRequest: null });
    if (!message.accept) {
      this.notify('Your opponent declined the request.', 'info');
      return;
    }
    this.applyRequestedAction(outgoing);
  }

  private canRequestNow(type: RequestType): boolean {
    if (this.state.status !== 'connected') return false;
    if (type === 'undo') {
      const hasHistory =
        this.role === 'guest'
          ? this.state.snapshot.history.length > 0
          : this.engine.hasUndo();
      return !this.engine.getResult() && hasHistory;
    }
    if (type === 'draw') {
      return !this.engine.getResult();
    }
    return true;
  }

  private applyRequestedAction(request: OutgoingRequest): void {
    if (this.role !== 'host') return;
    switch (request.requestType) {
      case 'undo': {
        if (!this.engine.undo()) {
          this.notify('There is no move to undo.', 'error');
          return;
        }
        this.broadcastSnapshot();
        this.notify('Move undone for both players.', 'success');
        break;
      }
      case 'restart': {
        this.engine.reset(this.engine.getMode());
        this.broadcastSnapshot();
        this.notify('Game restarted.', 'success');
        break;
      }
      case 'new-game': {
        this.engine.reset(this.engine.getMode());
        const hostColor = this.state.hostColor === 'w' ? 'b' : 'w';
        const guestColor = hostColor === 'w' ? 'b' : 'w';
        this.setState({ hostColor, guestColor });
        this.broadcastSnapshot();
        this.notify('New game started. Colors have been swapped.', 'success');
        break;
      }
      case 'mode': {
        const mode = request.payload?.mode;
        if (!mode) return;
        this.engine.setMode(mode);
        this.broadcastSnapshot();
        this.notify(
          mode === 'free'
            ? 'Free Movement is now on. New game started.'
            : 'Standard Chess is now on. New game started.',
          'success',
        );
        break;
      }
      case 'draw': {
        if (this.engine.getResult()) return;
        this.engine.endByAgreement();
        this.broadcastSnapshot();
        this.notify('Draw agreed.', 'success');
        break;
      }
    }
  }

  // --------------------------------------------------------------- guest

  joinRoom(code: string, name: string): void {
    const roomCode = normalizeRoomCode(code);
    if (!isValidRoomCode(roomCode)) {
      this.setState({
        phase: 'error',
        canRetry: false,
        error: 'That room code is not valid. Room codes contain 6 letters or digits.',
      });
      return;
    }
    this.stopNetworking();
    this.closed = false;
    this.role = 'guest';
    this.engine.reset('standard');
    this.myToken = this.readGuestToken(roomCode) ?? createToken();
    this.saveGuestToken(roomCode, this.myToken);
    this.reconnectAttempts = 0;
    this.lastWelcomeSeq = -1;
    this.pendingMove = false;
    this.lastJoin = { code: roomCode, name: sanitizeName(name, 'Player 2') };
    this.setState({
      phase: 'joining',
      role: 'guest',
      roomCode,
      status: 'connecting',
      error: null,
      hostName: '',
      guestName: this.lastJoin.name,
      hostColor: 'w',
      guestColor: 'b',
      snapshot: this.engine.getSnapshot(),
      guestPresent: false,
      incomingRequest: null,
      outgoingRequest: null,
      endedReason: null,
      canRetry: true,
      notice: null,
    });
    this.startGuestPeer(false);
  }

  private startGuestPeer(reconnect: boolean): void {
    if (this.closed) return;
    this.destroyPeer();
    const epoch = this.connectionEpoch;
    let opened = false;
    let peer: Peer;
    try {
      peer = new Peer(PEER_OPTIONS);
    } catch {
      this.failSession(peerErrorMessage('browser-incompatible'));
      return;
    }
    this.peer = peer;

    peer.on('open', () => {
      if (this.closed || epoch !== this.connectionEpoch) return;
      if (opened) return;
      opened = true;
      this.openGuestConnection(reconnect);
    });

    peer.on('disconnected', () => {
      if (this.closed || epoch !== this.connectionEpoch) return;
      try {
        peer.reconnect();
      } catch {
        /* ignore */
      }
    });

    peer.on('error', (error) => {
      if (this.closed || epoch !== this.connectionEpoch) return;
      this.handleGuestPeerError(error, reconnect);
    });
  }

  private openGuestConnection(reconnect: boolean): void {
    if (this.closed || !this.peer || !this.state.roomCode) return;
    const code = this.state.roomCode;
    const epoch = this.connectionEpoch;
    let conn: DataConnection;
    try {
      conn = this.peer.connect(peerIdForRoom(code), {
        reliable: true,
        metadata: {
          name: this.state.guestName || this.lastJoin?.name || 'Player 2',
          token: this.myToken,
        },
      });
    } catch {
      this.failSession(
        'Could not start the peer connection. Please check your network and retry.',
      );
      return;
    }
    this.conn = conn;
    this.setState({
      status: reconnect ? 'reconnecting' : 'connecting',
    });

    if (this.connectTimer) clearTimeout(this.connectTimer);
    this.connectTimer = setTimeout(() => {
      if (this.closed || epoch !== this.connectionEpoch) return;
      if (this.conn !== conn) return;
      try {
        conn.close();
      } catch {
        /* ignore */
      }
      if (this.state.phase === 'joining' && !reconnect) {
        this.failSession(
          'The connection attempt timed out. The room may have closed, or your network may block direct WebRTC connections. Ask the host to check the room, then retry.',
        );
      } else {
        this.scheduleGuestReconnect();
      }
    }, CONNECT_TIMEOUT);

    conn.on('open', () => {
      if (this.closed || epoch !== this.connectionEpoch) return;
      if (this.conn !== conn) return;
      this.send({
        type: 'join',
        name: this.lastJoin?.name || this.state.guestName,
        token: this.myToken,
        reconnect,
      });
      this.setState({ status: reconnect ? 'reconnecting' : 'waiting' });
    });

    conn.on('data', (data: unknown) => {
      if (this.closed || epoch !== this.connectionEpoch) return;
      if (this.conn !== conn) return;
      this.handleHostMessage(data);
    });

    conn.on('close', () => {
      if (this.closed || epoch !== this.connectionEpoch) return;
      if (this.conn !== conn) return;
      this.conn = null;
      if (this.state.phase === 'ended') return;
      this.scheduleGuestReconnect();
    });

    conn.on('error', () => {
      if (this.closed || epoch !== this.connectionEpoch) return;
      if (this.conn !== conn) return;
      this.conn = null;
      this.scheduleGuestReconnect();
    });
  }

  private handleGuestPeerError(
    error: PeerError<string>,
    reconnect: boolean,
  ): void {
    const type = errorType(error);
    if (type === 'peer-unavailable') {
      if (this.state.phase === 'joining' && !reconnect) {
        this.failSession(
          'Room not found. Check the code with your host — they may have closed the room.',
        );
      } else if (this.state.phase === 'playing' && this.reconnectAttempts === 0) {
        this.scheduleGuestReconnect();
      } else if (this.reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
        if (this.state.phase === 'joining') {
          this.failSession(
            'Room not found. Check the code with your host — they may have closed the room.',
          );
        } else {
          this.markDisconnected(
            'The host is no longer available. They may have closed the room.',
          );
        }
      } else {
        this.scheduleGuestReconnect();
      }
      return;
    }

    if (type === 'browser-incompatible' || type === 'ssl-unavailable') {
      this.failSession(peerErrorMessage(type));
      return;
    }

    if (
      type === 'network' ||
      type === 'server-error' ||
      type === 'socket-error' ||
      type === 'socket-closed'
    ) {
      if (this.state.phase === 'joining' && !reconnect) {
        this.failSession(peerErrorMessage(type));
      } else {
        this.scheduleGuestReconnect();
      }
      return;
    }

    if (this.state.phase === 'joining' && !reconnect) {
      this.failSession(peerErrorMessage(type));
    } else {
      this.scheduleGuestReconnect();
    }
  }

  private scheduleGuestReconnect(): void {
    if (this.closed || this.role !== 'guest') return;
    if (this.state.phase === 'ended' || this.state.phase === 'error') return;
    if (this.reconnectTimer) return;
    if (this.reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
      if (this.state.phase === 'joining') {
        this.failSession(
          'Could not connect to the room. Check the code with your host, then retry. If it still fails, a restrictive network may be blocking WebRTC.',
        );
      } else {
        this.markDisconnected(
          'Lost the connection to the host. They may have closed the room or the network changed.',
        );
      }
      return;
    }
    const delay =
      RECONNECT_DELAYS[this.reconnectAttempts] ??
      RECONNECT_DELAYS[RECONNECT_DELAYS.length - 1];
    this.reconnectAttempts += 1;
    this.pendingMove = false;
    this.setState({
      status: 'reconnecting',
      guestPresent: false,
      incomingRequest: null,
      outgoingRequest: null,
      canRetry: true,
    });
    this.notify('Connection lost. Trying to reconnect…', 'error');
    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      if (this.closed) return;
      this.startGuestPeer(true);
    }, delay);
  }

  reconnect(): void {
    if (this.role !== 'guest' || this.closed) return;
    if (this.state.phase === 'ended') return;
    this.reconnectAttempts = 0;
    this.setState({
      status: 'reconnecting',
      canRetry: true,
      error: null,
    });
    this.startGuestPeer(true);
  }

  private markDisconnected(message: string): void {
    this.setState({
      status: 'disconnected',
      canRetry: true,
      guestPresent: false,
    });
    this.notify(message, 'error');
  }

  private handleHostMessage(data: unknown): void {
    const message = parseHostMessage(data);
    if (!message) return;
    switch (message.type) {
      case 'welcome':
        this.handleWelcome(message);
        break;
      case 'snapshot':
        this.handleRemoteSnapshot(message);
        break;
      case 'request':
        if (this.state.incomingRequest) {
          this.send({
            type: 'response',
            requestId: message.requestId,
            accept: false,
          });
          return;
        }
        this.setState({
          incomingRequest: {
            requestId: message.requestId,
            requestType: message.requestType,
            payload: message.payload,
            from: 'host',
          },
        });
        this.beginIncomingTimeout();
        break;
      case 'response': {
        const outgoing = this.state.outgoingRequest;
        if (!outgoing || outgoing.requestId !== message.requestId) return;
        if (this.requestTimer) {
          clearTimeout(this.requestTimer);
          this.requestTimer = null;
        }
        this.setState({ outgoingRequest: null });
        if (message.accept) {
          this.notify('Your opponent accepted.', 'success');
        } else {
          this.notify('Your opponent declined the request.', 'info');
        }
        break;
      }
      case 'error':
        this.pendingMove = false;
        this.notify(message.message, 'error');
        break;
      case 'rejected':
        this.failSession(message.reason);
        break;
      case 'ended':
        this.finishSession(message.reason, false);
        break;
      case 'pong':
        break;
    }
  }

  private handleWelcome(
    message: Extract<HostMessage, { type: 'welcome' }>,
  ): void {
    if (this.connectTimer) {
      clearTimeout(this.connectTimer);
      this.connectTimer = null;
    }
    this.reconnectAttempts = 0;
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    this.lastWelcomeSeq = message.snapshot.seq;
    this.pendingMove = false;
    this.engine.loadSnapshot(message.snapshot);
    this.setState({
      phase: 'playing',
      status: 'connected',
      roomCode: message.meta.roomCode,
      hostName: message.meta.hostName,
      guestName: message.meta.guestName || this.state.guestName,
      hostColor: message.meta.hostColor,
      guestColor: message.meta.guestColor,
      snapshot: message.snapshot,
      guestPresent: true,
      incomingRequest: null,
      outgoingRequest: null,
      error: null,
      endedReason: null,
      canRetry: false,
    });
    this.notify(
      message.reconnect ? 'Reconnected to the game.' : 'Connected. Game on.',
      'success',
    );
  }

  private handleRemoteSnapshot(
    message: Extract<HostMessage, { type: 'snapshot' }>,
  ): void {
    if (message.snapshot.seq < this.lastWelcomeSeq) return;
    if (message.snapshot.seq === this.lastWelcomeSeq) return;
    this.lastWelcomeSeq = message.snapshot.seq;
    this.pendingMove = false;
    this.engine.loadSnapshot(message.snapshot);
    this.setState({
      snapshot: message.snapshot,
      hostName: message.meta.hostName,
      guestName: message.meta.guestName || this.state.guestName,
      hostColor: message.meta.hostColor,
      guestColor: message.meta.guestColor,
      status: 'connected',
      guestPresent: true,
      canRetry: false,
    });
    if (message.snapshot.result) {
      this.setState({
        incomingRequest: null,
        outgoingRequest: null,
      });
    }
  }

  // ------------------------------------------------------------- actions

  changeWaitingMode(mode: MovementMode): void {
    if (
      this.role !== 'host' ||
      this.state.phase !== 'waiting' ||
      this.state.guestPresent
    ) {
      return;
    }
    if (this.engine.getMode() === mode) return;
    this.engine.setMode(mode);
    if (this.lastHost) this.lastHost = { ...this.lastHost, mode };
    this.setState({ snapshot: this.engine.getSnapshot() });
    this.notify(
      mode === 'free'
        ? 'Free Movement selected. The game will start with free rules.'
        : 'Standard Chess selected.',
      'info',
    );
  }

  move(from: Square, to: Square, promotion?: PromotionPiece): void {
    if (this.state.phase !== 'playing') return;
    if (this.state.status !== 'connected') {
      this.notify('Cannot move while the opponent is disconnected.', 'error');
      return;
    }
    if (this.state.incomingRequest || this.state.outgoingRequest) {
      this.notify('Finish the pending request first.', 'error');
      return;
    }
    if (this.pendingMove) {
      this.notify('Waiting for the move to be confirmed.', 'info');
      return;
    }
    if (this.engine.getResult()) return;

    if (this.role === 'host') {
      const outcome = this.engine.tryMove(
        from,
        to,
        promotion,
        this.state.hostColor,
      );
      if (!outcome.ok) {
        this.notify(outcome.error, 'error');
        return;
      }
      this.broadcastSnapshot();
      return;
    }

    const myColor = this.state.guestColor;
    if (!this.engine.canMove(from, to, myColor)) {
      this.notify('That move is not legal.', 'error');
      return;
    }
    this.pendingMove = true;
    const sent = this.send({
      type: 'move',
      moveId: createId('move'),
      from,
      to,
      ...(promotion ? { promotion } : {}),
    });
    if (!sent) {
      this.pendingMove = false;
      this.notify('Could not send the move. Trying to reconnect…', 'error');
      this.scheduleGuestReconnect();
    }
  }

  requestAction(
    type: RequestType,
    payload?: { mode: MovementMode },
    options?: { silent?: boolean },
  ): void {
    if (this.state.status !== 'connected') {
      this.notify('Your opponent is not connected.', 'error');
      return;
    }
    if (this.state.incomingRequest) {
      this.notify('Respond to the pending request first.', 'error');
      return;
    }
    if (this.state.outgoingRequest) {
      this.notify('A request is already waiting for a response.', 'info');
      return;
    }
    if (this.role === 'guest' && type === 'mode') {
      this.notify('Only the host can change movement rules.', 'error');
      return;
    }
    if (!this.canRequestNow(type)) {
      this.notify(
        type === 'undo'
          ? 'There is no move available to undo.'
          : 'That request cannot be sent right now.',
        'error',
      );
      return;
    }
    const requestId = createId('req');
    const outgoing: OutgoingRequest = {
      requestId,
      requestType: type,
      payload: type === 'mode' ? payload : undefined,
    };
    const sent = this.send({
      type: 'request',
      requestId,
      requestType: type,
      payload: outgoing.payload,
    });
    if (!sent) {
      this.notify('Could not send the request. Your opponent may be offline.', 'error');
      return;
    }
    this.setState({ outgoingRequest: outgoing });
    if (this.requestTimer) clearTimeout(this.requestTimer);
    this.requestTimer = setTimeout(() => {
      if (this.state.outgoingRequest?.requestId === requestId) {
        this.setState({ outgoingRequest: null });
        this.notify('The request expired without a response.', 'info');
      }
    }, REQUEST_TIMEOUT);
    if (!options?.silent) {
      const label =
        type === 'undo'
          ? 'Undo request sent.'
          : type === 'restart'
            ? 'Restart request sent.'
            : type === 'new-game'
              ? 'New game request sent.'
              : type === 'mode'
                ? 'Movement rules change requested.'
                : 'Draw offer sent.';
      this.notify(label, 'info');
    }
  }

  respondRequest(accept: boolean): void {
    const request = this.state.incomingRequest;
    if (!request) return;
    if (this.incomingTimer) {
      clearTimeout(this.incomingTimer);
      this.incomingTimer = null;
    }
    this.send({
      type: 'response',
      requestId: request.requestId,
      accept,
    });
    this.setState({ incomingRequest: null });
    if (this.role === 'host' && accept) {
      this.applyRequestedAction({
        requestId: request.requestId,
        requestType: request.requestType,
        payload: request.payload,
      });
    } else if (this.role === 'guest' && accept) {
      this.notify('Accepted. Waiting for the host…', 'info');
    } else if (!accept) {
      this.notify('Request declined.', 'info');
    }
  }

  resign(): void {
    if (this.state.phase !== 'playing' && this.state.phase !== 'waiting') return;
    if (this.engine.getResult()) return;
    if (this.role === 'host') {
      this.engine.endByResignation(this.state.guestColor);
      this.broadcastSnapshot();
      this.notify('You resigned.', 'info');
      return;
    }
    if (this.state.status !== 'connected') {
      this.notify('Your opponent is not connected.', 'error');
      return;
    }
    this.send({ type: 'resign' });
    this.notify('Resignation sent.', 'info');
  }

  offerDraw(): void {
    this.requestAction('draw');
  }

  endSession(): void {
    if (this.state.phase === 'idle' || this.state.phase === 'ended') return;
    if (this.role === 'host') {
      this.finishSession('You ended the session.', true, {
        sendEnded: 'The host ended the session.',
        graceMs: 400,
      });
      return;
    }
    this.send({ type: 'end-session' });
    this.finishSession('You ended the session.', true, { graceMs: 400 });
  }

  private finishSession(
    reason: string,
    local: boolean,
    options?: { sendEnded?: string; graceMs?: number },
  ): void {
    const endingRoomCode = this.state.roomCode;
    if (options?.sendEnded) {
      this.send({ type: 'ended', reason: options.sendEnded });
    }
    this.closed = true;
    this.clearGuestToken(endingRoomCode);
    this.clearRoomExpiry();
    this.connectionEpoch += 1;
    this.clearTimers();
    this.setState({
      phase: 'ended',
      status: 'disconnected',
      endedReason: reason,
      incomingRequest: null,
      outgoingRequest: null,
      guestPresent: false,
      canRetry: false,
    });
    if (!local) {
      this.notify(reason, 'info');
    }
    const destroy = () => this.destroyPeer();
    if (options?.graceMs) {
      setTimeout(destroy, options.graceMs);
    } else {
      destroy();
    }
  }

  private failSession(message: string): void {
    this.stopNetworking();
    this.setState({
      phase: 'error',
      status: 'error',
      error: message,
      canRetry: !!this.lastHost || !!this.lastJoin,
      incomingRequest: null,
      outgoingRequest: null,
      guestPresent: false,
    });
  }

  retry(): void {
    if (this.lastHost && (!this.role || this.role === 'host')) {
      this.hostRoom(this.lastHost.name, this.lastHost.mode);
      return;
    }
    if (this.lastJoin) {
      this.joinRoom(this.lastJoin.code, this.lastJoin.name);
    }
  }

  reset(): void {
    this.stopNetworking();
    this.role = null;
    this.lastHost = null;
    this.lastJoin = null;
    this.guestToken = null;
    this.clearGuestToken(this.state.roomCode);
    this.clearRoomExpiry();
    this.pendingConn = null;
    this.closed = true;
    this.reconnectAttempts = 0;
    this.lastWelcomeSeq = -1;
    this.pendingMove = false;
    this.processedMoveIds.clear();
    this.moveIdOrder = [];
    if (this.requestTimer) clearTimeout(this.requestTimer);
    if (this.noticeTimer) clearTimeout(this.noticeTimer);
    this.requestTimer = null;
    this.noticeTimer = null;
    this.engine.reset('standard');
    this.setState({
      phase: 'idle',
      role: null,
      roomCode: null,
      status: 'idle',
      error: null,
      hostName: '',
      guestName: '',
      hostColor: 'w',
      guestColor: 'b',
      snapshot: this.engine.getSnapshot(),
      guestPresent: false,
      incomingRequest: null,
      outgoingRequest: null,
      endedReason: null,
      canRetry: false,
      notice: null,
    });
  }

  getInviteLink(): string {
    return this.state.roomCode ? inviteLink(this.state.roomCode) : '';
  }

  dispose(): void {
    this.stopNetworking();
    if (this.noticeTimer) clearTimeout(this.noticeTimer);
    this.listeners.clear();
  }
}

export const sessionManager = new SessionManager();
