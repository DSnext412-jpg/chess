import type { GameSnapshot, MovementMode, SessionMeta, Square } from './chess';

export type RequestType =
  | 'undo'
  | 'restart'
  | 'new-game'
  | 'mode'
  | 'draw';

export interface JoinMessage {
  type: 'join';
  name: string;
  token: string;
  reconnect: boolean;
}

export interface MoveMessage {
  type: 'move';
  moveId: string;
  from: Square;
  to: Square;
  promotion?: 'q' | 'r' | 'b' | 'n';
}

export interface RequestMessage {
  type: 'request';
  requestId: string;
  requestType: RequestType;
  payload?: { mode: MovementMode };
}

export interface ResponseMessage {
  type: 'response';
  requestId: string;
  accept: boolean;
}

export interface ResignMessage {
  type: 'resign';
}

export interface EndSessionMessage {
  type: 'end-session';
}

export interface PingMessage {
  type: 'ping';
}

export type ClientMessage =
  | JoinMessage
  | MoveMessage
  | RequestMessage
  | ResponseMessage
  | ResignMessage
  | EndSessionMessage
  | PingMessage;

export interface WelcomeMessage {
  type: 'welcome';
  snapshot: GameSnapshot;
  meta: SessionMeta;
  reconnect: boolean;
}

export interface SnapshotMessage {
  type: 'snapshot';
  snapshot: GameSnapshot;
  meta: SessionMeta;
}

export interface HostRequestMessage {
  type: 'request';
  requestId: string;
  requestType: RequestType;
  payload?: { mode: MovementMode };
}

export interface HostResponseMessage {
  type: 'response';
  requestId: string;
  accept: boolean;
}

export interface ErrorMessage {
  type: 'error';
  message: string;
}

export interface RejectedMessage {
  type: 'rejected';
  reason: string;
}

export interface EndedMessage {
  type: 'ended';
  reason: string;
}

export interface PongMessage {
  type: 'pong';
}

export type HostMessage =
  | WelcomeMessage
  | SnapshotMessage
  | HostRequestMessage
  | HostResponseMessage
  | ErrorMessage
  | RejectedMessage
  | EndedMessage
  | PongMessage;

export interface IncomingRequest {
  requestId: string;
  requestType: RequestType;
  payload?: { mode: MovementMode };
  from: 'host' | 'guest';
}

export interface OutgoingRequest {
  requestId: string;
  requestType: RequestType;
  payload?: { mode: MovementMode };
}

export type ConnectionStatus =
  | 'idle'
  | 'connecting'
  | 'waiting'
  | 'connected'
  | 'reconnecting'
  | 'disconnected'
  | 'error';
