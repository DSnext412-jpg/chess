import type { Board, Color, Piece, PieceType, Square } from '../types/chess';

export const FILES = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'] as const;

export function squareToIndex(square: Square): number {
  const file = square.charCodeAt(0) - 97;
  const rank = Number(square[1]);
  if (file < 0 || file > 7 || rank < 1 || rank > 8) return -1;
  return (8 - rank) * 8 + file;
}

export function indexToSquare(index: number): Square {
  const file = index % 8;
  const rank = 8 - Math.floor(index / 8);
  return `${FILES[file]}${rank}`;
}

export function isSquare(value: unknown): value is Square {
  return typeof value === 'string' && /^[a-h][1-8]$/.test(value);
}

export function isLightSquare(index: number): boolean {
  const file = index % 8;
  const rank = 8 - Math.floor(index / 8);
  return (file + rank) % 2 === 0;
}

export function opposite(color: Color): Color {
  return color === 'w' ? 'b' : 'w';
}

export function emptyBoard(): Board {
  return Array.from({ length: 64 }, () => null);
}

export const START_PIECES: Array<{
  type: PieceType;
  color: Color;
  square: Square;
}> = [
  { type: 'r', color: 'w', square: 'a1' },
  { type: 'n', color: 'w', square: 'b1' },
  { type: 'b', color: 'w', square: 'c1' },
  { type: 'q', color: 'w', square: 'd1' },
  { type: 'k', color: 'w', square: 'e1' },
  { type: 'b', color: 'w', square: 'f1' },
  { type: 'n', color: 'w', square: 'g1' },
  { type: 'r', color: 'w', square: 'h1' },
  { type: 'p', color: 'w', square: 'a2' },
  { type: 'p', color: 'w', square: 'b2' },
  { type: 'p', color: 'w', square: 'c2' },
  { type: 'p', color: 'w', square: 'd2' },
  { type: 'p', color: 'w', square: 'e2' },
  { type: 'p', color: 'w', square: 'f2' },
  { type: 'p', color: 'w', square: 'g2' },
  { type: 'p', color: 'w', square: 'h2' },
  { type: 'r', color: 'b', square: 'a8' },
  { type: 'n', color: 'b', square: 'b8' },
  { type: 'b', color: 'b', square: 'c8' },
  { type: 'q', color: 'b', square: 'd8' },
  { type: 'k', color: 'b', square: 'e8' },
  { type: 'b', color: 'b', square: 'f8' },
  { type: 'n', color: 'b', square: 'g8' },
  { type: 'r', color: 'b', square: 'h8' },
  { type: 'p', color: 'b', square: 'a7' },
  { type: 'p', color: 'b', square: 'b7' },
  { type: 'p', color: 'b', square: 'c7' },
  { type: 'p', color: 'b', square: 'd7' },
  { type: 'p', color: 'b', square: 'e7' },
  { type: 'p', color: 'b', square: 'f7' },
  { type: 'p', color: 'b', square: 'g7' },
  { type: 'p', color: 'b', square: 'h7' },
];

export function cloneBoard(board: Board): Board {
  return board.slice();
}

export function makePiece(
  type: PieceType,
  color: Color,
  idFactory: () => string,
): Piece {
  return { id: idFactory(), type, color };
}

export function createStartingBoard(idFactory: () => string): Board {
  const board = emptyBoard();
  for (const { type, color, square } of START_PIECES) {
    board[squareToIndex(square)] = makePiece(type, color, idFactory);
  }
  return board;
}

export function findKing(board: Board, color: Color): Square | null {
  const index = board.findIndex(
    (cell) => cell?.type === 'k' && cell.color === color,
  );
  return index === -1 ? null : indexToSquare(index);
}
