import {
  Chess,
  type Move,
  type Square as ChessSquare,
} from 'chess.js';
import { createPieceId } from './id';
import {
  cloneBoard,
  createStartingBoard,
  findKing,
  indexToSquare,
  opposite,
  squareToIndex,
} from './board';
import type {
  Board,
  CapturedPieces,
  Color,
  GameResult,
  GameSnapshot,
  HistoryEntry,
  LastMove,
  MovementMode,
  Piece,
  PieceType,
  Square,
} from '../types/chess';

export type PromotionPiece = 'q' | 'r' | 'b' | 'n';

export type MoveOutcome =
  | {
      ok: true;
      capture: boolean;
      check: boolean;
      result: GameResult | null;
    }
  | { ok: false; error: string };

interface EngineState {
  mode: MovementMode;
  board: Board;
  fen: string | null;
  turn: Color;
  captured: CapturedPieces;
  history: HistoryEntry[];
  lastMove: LastMove | null;
  result: GameResult | null;
}

function copyCaptured(captured: CapturedPieces): CapturedPieces {
  return { w: captured.w.slice(), b: captured.b.slice() };
}

function copyResult(result: GameResult | null): GameResult | null {
  return result ? { ...result } : null;
}

function samePiece(piece: Piece | null, type: PieceType, color: Color): boolean {
  return !!piece && piece.type === type && piece.color === color;
}

export class GameEngine {
  private mode: MovementMode;
  private chess: Chess;
  private board: Board;
  private turn: Color;
  private captured: CapturedPieces;
  private history: HistoryEntry[];
  private lastMove: LastMove | null;
  private result: GameResult | null;
  private check: boolean;
  private seq: number;
  private undoStack: EngineState[];

  constructor(mode: MovementMode = 'standard') {
    this.mode = mode;
    this.chess = new Chess();
    this.board = createStartingBoard(createPieceId);
    this.turn = 'w';
    this.captured = { w: [], b: [] };
    this.history = [];
    this.lastMove = null;
    this.result = null;
    this.check = false;
    this.seq = 0;
    this.undoStack = [];
  }

  getSnapshot(): GameSnapshot {
    return {
      seq: this.seq,
      mode: this.mode,
      board: cloneBoard(this.board),
      fen: this.mode === 'standard' ? this.chess.fen() : null,
      turn: this.turn,
      history: this.history.slice(),
      captured: copyCaptured(this.captured),
      lastMove: this.lastMove ? { ...this.lastMove } : null,
      check: this.mode === 'standard' ? this.check : false,
      checkSquare:
        this.mode === 'standard' && this.check
          ? findKing(this.board, this.turn)
          : null,
      result: copyResult(this.result),
    };
  }

  loadSnapshot(snapshot: GameSnapshot): void {
    this.mode = snapshot.mode;
    this.board = snapshot.board.slice();
    this.turn = snapshot.turn;
    this.captured = copyCaptured(snapshot.captured);
    this.history = snapshot.history.slice();
    this.lastMove = snapshot.lastMove ? { ...snapshot.lastMove } : null;
    this.result = copyResult(snapshot.result);
    this.check = snapshot.check;
    this.seq = snapshot.seq;
    this.undoStack = [];
    if (snapshot.mode === 'standard' && snapshot.fen) {
      try {
        this.chess = new Chess(snapshot.fen);
      } catch {
        this.chess = new Chess();
      }
    } else {
      this.chess = new Chess();
    }
  }

  canMove(from: Square, to: Square, allowedColor?: Color): boolean {
    if (this.result) return false;
    if (from === to) return false;
    const fromIndex = squareToIndex(from);
    const toIndex = squareToIndex(to);
    if (fromIndex < 0 || toIndex < 0) return false;
    const piece = this.board[fromIndex];
    if (!piece) return false;

    if (this.mode === 'free') return true;

    if (allowedColor && piece.color !== allowedColor) return false;
    if (piece.color !== this.turn) return false;
    try {
      const moves = this.chess.moves({
        square: from as ChessSquare,
        verbose: true,
      });
      return moves.some((move) => move.to === to);
    } catch {
      return false;
    }
  }

  tryMove(
    from: Square,
    to: Square,
    promotion?: PromotionPiece,
    allowedColor?: Color,
  ): MoveOutcome {
    if (this.result) {
      return { ok: false, error: 'The game has already ended.' };
    }
    if (from === to) {
      return { ok: false, error: 'Pick a different square.' };
    }
    const fromIndex = squareToIndex(from);
    const toIndex = squareToIndex(to);
    if (fromIndex < 0 || toIndex < 0) {
      return { ok: false, error: 'Invalid square.' };
    }
    const movingPiece = this.board[fromIndex];
    if (!movingPiece) {
      return { ok: false, error: 'There is no piece on that square.' };
    }
    if (this.mode === 'free') {
      return this.applyFreeMove(fromIndex, toIndex, movingPiece, from, to);
    }
    return this.applyStandardMove(
      from,
      to,
      fromIndex,
      toIndex,
      movingPiece,
      promotion,
      allowedColor,
    );
  }

  private pushUndoState(): void {
    this.undoStack.push({
      mode: this.mode,
      board: cloneBoard(this.board),
      fen: this.mode === 'standard' ? this.chess.fen() : null,
      turn: this.turn,
      captured: copyCaptured(this.captured),
      history: this.history.slice(),
      lastMove: this.lastMove ? { ...this.lastMove } : null,
      result: copyResult(this.result),
    });
    if (this.undoStack.length > 120) this.undoStack.shift();
  }

  private applyStandardMove(
    from: Square,
    to: Square,
    fromIndex: number,
    toIndex: number,
    movingPiece: Piece,
    promotion: PromotionPiece | undefined,
    allowedColor: Color | undefined,
  ): MoveOutcome {
    if (allowedColor && movingPiece.color !== allowedColor) {
      return { ok: false, error: 'You can only move your own pieces.' };
    }
    if (movingPiece.color !== this.turn) {
      return { ok: false, error: 'It is not your turn.' };
    }

    this.pushUndoState();
    let move: Move;
    try {
      move = this.chess.move({ from, to, promotion });
    } catch {
      this.undoStack.pop();
      return { ok: false, error: 'That move is not legal.' };
    }

    const nextBoard = cloneBoard(this.board);
    const capturedType = move.captured as PieceType | undefined;
    let capture = false;

    if (move.flags.includes('e')) {
      const capturedSquare = `${to[0]}${from[1]}`;
      const capturedIndex = squareToIndex(capturedSquare);
      const capturedPiece = nextBoard[capturedIndex];
      if (capturedPiece) {
        this.captured[capturedPiece.color].push(capturedPiece.type);
        nextBoard[capturedIndex] = null;
        capture = true;
      }
    } else if (nextBoard[toIndex]) {
      const capturedPiece = nextBoard[toIndex]!;
      this.captured[capturedPiece.color].push(capturedPiece.type);
      capture = true;
    } else if (capturedType) {
      this.captured[opposite(movingPiece.color)].push(capturedType);
      capture = true;
    }

    nextBoard[toIndex] = move.promotion
      ? { ...movingPiece, type: move.promotion as PieceType }
      : movingPiece;
    nextBoard[fromIndex] = null;

    if (move.flags.includes('k')) {
      const rookFrom = squareToIndex(`h${from[1]}`);
      const rookTo = squareToIndex(`f${from[1]}`);
      const rook = nextBoard[rookFrom];
      if (samePiece(rook, 'r', movingPiece.color)) {
        nextBoard[rookTo] = rook;
        nextBoard[rookFrom] = null;
      }
    } else if (move.flags.includes('q')) {
      const rookFrom = squareToIndex(`a${from[1]}`);
      const rookTo = squareToIndex(`d${from[1]}`);
      const rook = nextBoard[rookFrom];
      if (samePiece(rook, 'r', movingPiece.color)) {
        nextBoard[rookTo] = rook;
        nextBoard[rookFrom] = null;
      }
    }

    this.board = nextBoard;
    this.turn = this.chess.turn();
    this.lastMove = { from, to };
    this.history.push({
      kind: 'standard',
      ply: this.history.length + 1,
      color: movingPiece.color,
      san: move.san,
      from,
      to,
    });

    this.check = this.chess.isCheck();
    this.result = this.evaluateResult();

    this.seq += 1;
    return {
      ok: true,
      capture,
      check: this.check,
      result: this.result,
    };
  }

  private applyFreeMove(
    fromIndex: number,
    toIndex: number,
    movingPiece: Piece,
    from: Square,
    to: Square,
  ): MoveOutcome {
    this.pushUndoState();
    const nextBoard = cloneBoard(this.board);
    const displaced = nextBoard[toIndex];
    let capture = false;

    if (displaced) {
      this.captured[displaced.color].push(displaced.type);
      capture = true;
    }

    nextBoard[toIndex] = movingPiece;
    nextBoard[fromIndex] = null;
    this.board = nextBoard;
    this.turn = opposite(this.turn);
    this.lastMove = { from, to };
    this.history.push({
      kind: 'free',
      ply: this.history.length + 1,
      color: movingPiece.color,
      piece: movingPiece.type,
      from,
      to,
      captured: displaced ? displaced.type : null,
    });
    this.check = false;
    this.seq += 1;

    return {
      ok: true,
      capture,
      check: false,
      result: this.result,
    };
  }

  private evaluateResult(): GameResult | null {
    if (this.chess.isCheckmate()) {
      return {
        type: 'checkmate',
        winner: opposite(this.chess.turn()),
        reason: 'Checkmate',
      };
    }
    if (this.chess.isStalemate()) {
      return { type: 'stalemate', winner: null, reason: 'Stalemate' };
    }
    if (this.chess.isInsufficientMaterial()) {
      return {
        type: 'draw',
        winner: null,
        reason: 'Insufficient material',
      };
    }
    if (this.chess.isThreefoldRepetition()) {
      return {
        type: 'draw',
        winner: null,
        reason: 'Threefold repetition',
      };
    }
    if (this.chess.isDraw()) {
      return { type: 'draw', winner: null, reason: 'Draw' };
    }
    return null;
  }

  undo(): boolean {
    const previous = this.undoStack.pop();
    if (!previous) return false;
    this.mode = previous.mode;
    this.board = previous.board;
    this.turn = previous.turn;
    this.captured = previous.captured;
    this.history = previous.history;
    this.lastMove = previous.lastMove;
    this.result = previous.result;
    this.check = false;
    if (this.mode === 'standard' && previous.fen) {
      try {
        this.chess = new Chess(previous.fen);
        this.check = this.chess.isCheck();
      } catch {
        this.chess = new Chess();
      }
    }
    this.seq += 1;
    return true;
  }

  reset(mode: MovementMode = this.mode): void {
    this.mode = mode;
    this.chess = new Chess();
    this.board = createStartingBoard(createPieceId);
    this.turn = 'w';
    this.captured = { w: [], b: [] };
    this.history = [];
    this.lastMove = null;
    this.result = null;
    this.check = false;
    this.undoStack = [];
    this.seq += 1;
  }

  /** Changing the rules starts a fresh game so both sides share a legal position. */
  setMode(mode: MovementMode): void {
    if (mode === this.mode) return;
    this.reset(mode);
  }

  endByResignation(winner: Color): void {
    this.result = {
      type: 'resignation',
      winner,
      reason: `${winner === 'w' ? 'White' : 'Black'} wins by resignation`,
    };
    this.check = false;
    this.seq += 1;
  }

  endByAgreement(): void {
    this.result = {
      type: 'agreement',
      winner: null,
      reason: 'Draw by agreement',
    };
    this.check = false;
    this.seq += 1;
  }

  hasUndo(): boolean {
    return this.undoStack.length > 0;
  }

  getBoard(): Board {
    return cloneBoard(this.board);
  }

  getTurn(): Color {
    return this.turn;
  }

  getMode(): MovementMode {
    return this.mode;
  }

  getResult(): GameResult | null {
    return copyResult(this.result);
  }

  getIndexSquare(index: number): Square {
    return indexToSquare(index);
  }
}
