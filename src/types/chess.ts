export type Color = 'w' | 'b';

export type PieceType = 'p' | 'n' | 'b' | 'r' | 'q' | 'k';

export type MovementMode = 'standard' | 'free';

export interface Piece {
  id: string;
  type: PieceType;
  color: Color;
}

export type Cell = Piece | null;

/** 64 cells. Index 0 is a8, index 63 is h1. */
export type Board = Cell[];

export type Square = string;

export interface CapturedPieces {
  /** White pieces that have been captured (by black). */
  w: PieceType[];
  /** Black pieces that have been captured (by white). */
  b: PieceType[];
}

export interface LastMove {
  from: Square;
  to: Square;
}

export interface StandardHistoryEntry {
  kind: 'standard';
  ply: number;
  color: Color;
  san: string;
  from: Square;
  to: Square;
}

export interface FreeHistoryEntry {
  kind: 'free';
  ply: number;
  color: Color;
  piece: PieceType;
  from: Square;
  to: Square;
  captured: PieceType | null;
}

export type HistoryEntry = StandardHistoryEntry | FreeHistoryEntry;

export type ResultType =
  | 'checkmate'
  | 'stalemate'
  | 'draw'
  | 'resignation'
  | 'agreement'
  | 'session';

export interface GameResult {
  type: ResultType;
  winner: Color | null;
  reason: string;
}

export interface GameSnapshot {
  /** Authoritative state version. Incremented by the host on every change. */
  seq: number;
  mode: MovementMode;
  board: Board;
  /** FEN is present in standard mode and null in free mode. */
  fen: string | null;
  turn: Color;
  history: HistoryEntry[];
  captured: CapturedPieces;
  lastMove: LastMove | null;
  check: boolean;
  checkSquare: Square | null;
  result: GameResult | null;
}

export interface PlayerSeat {
  name: string;
  color: Color;
}

export interface SessionMeta {
  roomCode: string;
  hostName: string;
  guestName: string;
  hostColor: Color;
  guestColor: Color;
}

export const PIECE_VALUES: Record<PieceType, number> = {
  p: 1,
  n: 3,
  b: 3,
  r: 5,
  q: 9,
  k: 0,
};

export const PIECE_NAMES: Record<PieceType, string> = {
  p: 'Pawn',
  n: 'Knight',
  b: 'Bishop',
  r: 'Rook',
  q: 'Queen',
  k: 'King',
};
