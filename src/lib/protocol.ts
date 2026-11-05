import { isSquare } from './board';
import type {
  GameSnapshot,
  HistoryEntry,
  MovementMode,
  PieceType,
  ResultType,
  SessionMeta,
  Square,
} from '../types/chess';
import type {
  ClientMessage,
  HostMessage,
  RequestType,
} from '../types/protocol';

const PIECE_TYPES: PieceType[] = ['p', 'n', 'b', 'r', 'q', 'k'];
const REQUEST_TYPES: RequestType[] = [
  'undo',
  'restart',
  'new-game',
  'mode',
  'draw',
];
const RESULT_TYPES = [
  'checkmate',
  'stalemate',
  'draw',
  'resignation',
  'agreement',
  'session',
];

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function isColor(value: unknown): value is 'w' | 'b' {
  return value === 'w' || value === 'b';
}

export function isMode(value: unknown): value is MovementMode {
  return value === 'standard' || value === 'free';
}

function isPieceType(value: unknown): value is PieceType {
  return typeof value === 'string' && PIECE_TYPES.includes(value as PieceType);
}

function isPromotion(
  value: unknown,
): value is 'q' | 'r' | 'b' | 'n' {
  return value === 'q' || value === 'r' || value === 'b' || value === 'n';
}

function isRequestType(value: unknown): value is RequestType {
  return (
    typeof value === 'string' && REQUEST_TYPES.includes(value as RequestType)
  );
}

function isShortString(value: unknown, max = 120): value is string {
  return typeof value === 'string' && value.length > 0 && value.length <= max;
}

function parseModePayload(value: unknown): { mode: MovementMode } | undefined {
  if (!isRecord(value)) return undefined;
  if (!isMode(value.mode)) return undefined;
  return { mode: value.mode };
}

function parseHistoryEntry(value: unknown): HistoryEntry | null {
  if (!isRecord(value)) return null;
  if (
    typeof value.ply !== 'number' ||
    !Number.isInteger(value.ply) ||
    value.ply < 1 ||
    !isColor(value.color) ||
    !isSquare(value.from) ||
    !isSquare(value.to)
  ) {
    return null;
  }
  if (
    value.kind === 'standard' &&
    typeof value.san === 'string' &&
    value.san.length <= 20
  ) {
    return {
      kind: 'standard',
      ply: value.ply,
      color: value.color,
      san: value.san,
      from: value.from,
      to: value.to,
    };
  }
  if (
    value.kind === 'free' &&
    isPieceType(value.piece) &&
    (value.captured === null || isPieceType(value.captured))
  ) {
    return {
      kind: 'free',
      ply: value.ply,
      color: value.color,
      piece: value.piece,
      from: value.from,
      to: value.to,
      captured: value.captured,
    };
  }
  return null;
}

function parseCapturedList(value: unknown): PieceType[] | null {
  if (!Array.isArray(value) || value.length > 32) return null;
  if (!value.every(isPieceType)) return null;
  return value.slice();
}

export function parseSnapshot(value: unknown): GameSnapshot | null {
  if (!isRecord(value)) return null;
  if (
    typeof value.seq !== 'number' ||
    !Number.isInteger(value.seq) ||
    value.seq < 0 ||
    !isMode(value.mode) ||
    !isColor(value.turn) ||
    typeof value.check !== 'boolean'
  ) {
    return null;
  }
  if (!Array.isArray(value.board) || value.board.length !== 64) return null;

  const board = value.board.map((cell) => {
    if (cell === null) return null;
    if (!isRecord(cell)) return undefined;
    if (!isShortString(cell.id, 100) || !isPieceType(cell.type)) {
      return undefined;
    }
    if (!isColor(cell.color)) return undefined;
    return { id: cell.id, type: cell.type, color: cell.color };
  });
  if (board.some((cell) => cell === undefined)) return null;

  if (value.fen !== null && typeof value.fen !== 'string') return null;
  if (value.fen !== null && value.fen.length > 200) return null;

  if (!Array.isArray(value.history) || value.history.length > 1000) {
    return null;
  }
  const history: HistoryEntry[] = [];
  for (const entry of value.history) {
    const parsed = parseHistoryEntry(entry);
    if (!parsed) return null;
    history.push(parsed);
  }

  if (!isRecord(value.captured)) return null;
  const capturedW = parseCapturedList(value.captured.w);
  const capturedB = parseCapturedList(value.captured.b);
  if (!capturedW || !capturedB) return null;

  let lastMove: { from: Square; to: Square } | null = null;
  if (value.lastMove !== null) {
    if (
      !isRecord(value.lastMove) ||
      !isSquare(value.lastMove.from) ||
      !isSquare(value.lastMove.to)
    ) {
      return null;
    }
    lastMove = {
      from: value.lastMove.from,
      to: value.lastMove.to,
    };
  }

  if (value.checkSquare !== null && !isSquare(value.checkSquare)) return null;

  let result: GameSnapshot['result'] = null;
  if (value.result !== null) {
    if (
      !isRecord(value.result) ||
      typeof value.result.type !== 'string' ||
      !RESULT_TYPES.includes(value.result.type) ||
      (value.result.winner !== null && !isColor(value.result.winner)) ||
      typeof value.result.reason !== 'string' ||
      value.result.reason.length > 80
    ) {
      return null;
    }
    result = {
      type: value.result.type as ResultType,
      winner: value.result.winner as 'w' | 'b' | null,
      reason: value.result.reason,
    };
  }

  return {
    seq: value.seq,
    mode: value.mode,
    board: board as GameSnapshot['board'],
    fen: value.fen as string | null,
    turn: value.turn,
    history,
    captured: { w: capturedW, b: capturedB },
    lastMove,
    check: value.check,
    checkSquare: (value.checkSquare as Square | null) ?? null,
    result,
  };
}

export function parseMeta(value: unknown): SessionMeta | null {
  if (!isRecord(value)) return null;
  if (
    !isShortString(value.roomCode, 12) ||
    typeof value.hostName !== 'string' ||
    value.hostName.length > 40 ||
    typeof value.guestName !== 'string' ||
    value.guestName.length > 40 ||
    !isColor(value.hostColor) ||
    !isColor(value.guestColor) ||
    value.hostColor === value.guestColor
  ) {
    return null;
  }
  return {
    roomCode: value.roomCode.toUpperCase(),
    hostName: value.hostName,
    guestName: value.guestName,
    hostColor: value.hostColor,
    guestColor: value.guestColor,
  };
}

function parseRequest(value: Record<string, unknown>): boolean {
  if (!isShortString(value.requestId, 100) || !isRequestType(value.requestType)) {
    return false;
  }
  if (value.requestType === 'mode') {
    return parseModePayload(value.payload) !== undefined;
  }
  return true;
}

export function parseClientMessage(value: unknown): ClientMessage | null {
  if (!isRecord(value) || typeof value.type !== 'string') return null;
  switch (value.type) {
    case 'join':
      if (
        typeof value.name !== 'string' ||
        value.name.length > 40 ||
        !isShortString(value.token, 100) ||
        typeof value.reconnect !== 'boolean'
      ) {
        return null;
      }
      return {
        type: 'join',
        name: value.name,
        token: value.token,
        reconnect: value.reconnect,
      };
    case 'move': {
      if (
        !isShortString(value.moveId, 100) ||
        !isSquare(value.from) ||
        !isSquare(value.to)
      ) {
        return null;
      }
      const promotion =
        value.promotion === null ? undefined : value.promotion;
      if (promotion !== undefined && !isPromotion(promotion)) {
        return null;
      }
      return {
        type: 'move',
        moveId: value.moveId,
        from: value.from,
        to: value.to,
        promotion,
      };
    }
    case 'request':
      if (!parseRequest(value)) return null;
      return {
        type: 'request',
        requestId: value.requestId as string,
        requestType: value.requestType as RequestType,
        payload:
          value.requestType === 'mode'
            ? parseModePayload(value.payload)
            : undefined,
      };
    case 'response':
      if (!isShortString(value.requestId, 100) || typeof value.accept !== 'boolean') {
        return null;
      }
      return {
        type: 'response',
        requestId: value.requestId,
        accept: value.accept,
      };
    case 'resign':
      return { type: 'resign' };
    case 'end-session':
      return { type: 'end-session' };
    case 'ping':
      return { type: 'ping' };
    default:
      return null;
  }
}

export function parseHostMessage(value: unknown): HostMessage | null {
  if (!isRecord(value) || typeof value.type !== 'string') return null;
  switch (value.type) {
    case 'welcome': {
      const snapshot = parseSnapshot(value.snapshot);
      const meta = parseMeta(value.meta);
      if (!snapshot || !meta || typeof value.reconnect !== 'boolean') {
        return null;
      }
      return {
        type: 'welcome',
        snapshot,
        meta,
        reconnect: value.reconnect,
      };
    }
    case 'snapshot': {
      const snapshot = parseSnapshot(value.snapshot);
      const meta = parseMeta(value.meta);
      if (!snapshot || !meta) return null;
      return { type: 'snapshot', snapshot, meta };
    }
    case 'request':
      if (!parseRequest(value)) return null;
      return {
        type: 'request',
        requestId: value.requestId as string,
        requestType: value.requestType as RequestType,
        payload:
          value.requestType === 'mode'
            ? parseModePayload(value.payload)
            : undefined,
      };
    case 'response':
      if (!isShortString(value.requestId, 100) || typeof value.accept !== 'boolean') {
        return null;
      }
      return {
        type: 'response',
        requestId: value.requestId,
        accept: value.accept,
      };
    case 'error':
      if (typeof value.message !== 'string' || value.message.length > 200) {
        return null;
      }
      return { type: 'error', message: value.message };
    case 'rejected':
      if (typeof value.reason !== 'string' || value.reason.length > 200) {
        return null;
      }
      return { type: 'rejected', reason: value.reason };
    case 'ended':
      if (typeof value.reason !== 'string' || value.reason.length > 200) {
        return null;
      }
      return { type: 'ended', reason: value.reason };
    case 'pong':
      return { type: 'pong' };
    default:
      return null;
  }
}
