import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Chess, type Square as ChessSquare } from 'chess.js';
import { Maximize2, Minimize2 } from 'lucide-react';
import type {
  BoardTheme,
  PieceTheme,
} from '../lib/themes';
import type {
  Board,
  Color,
  GameSnapshot,
  Piece,
  Square,
} from '../types/chess';
import type { PromotionPiece } from '../lib/gameEngine';
import { indexToSquare, isLightSquare, squareToIndex } from '../lib/board';
import { ChessPiece } from './ChessPiece';
import { Dialog } from './ui/Dialog';
import { Button } from './ui/Button';
import { PIECE_NAMES } from '../types/chess';

interface ChessBoardProps {
  snapshot: GameSnapshot;
  boardTheme: BoardTheme;
  pieceTheme: PieceTheme;
  myColor: Color;
  flippedPreference: boolean;
  legalHints: boolean;
  interactive: boolean;
  onMove: (from: Square, to: Square, promotion?: PromotionPiece) => void;
}

interface PromotionState {
  from: Square;
  to: Square;
  color: Color;
}

const PROMOTION_OPTIONS: PromotionPiece[] = ['q', 'r', 'b', 'n'];

function pieceAt(board: Board, square: Square): Piece | null {
  const index = squareToIndex(square);
  return index >= 0 ? board[index] ?? null : null;
}

export function ChessBoard({
  snapshot,
  boardTheme,
  pieceTheme,
  myColor,
  flippedPreference,
  legalHints,
  interactive,
  onMove,
}: ChessBoardProps) {
  const [selected, setSelected] = useState<Square | null>(null);
  const [promotion, setPromotion] = useState<PromotionState | null>(null);
  const [fullscreen, setFullscreen] = useState(false);
  const [pseudoFullscreen, setPseudoFullscreen] = useState(false);
  const boardRef = useRef<HTMLDivElement>(null);

  const isFlipped = (myColor === 'b') !== flippedPreference;
  const expanded = fullscreen || pseudoFullscreen;

  useEffect(() => {
    setSelected(null);
    setPromotion(null);
  }, [snapshot.seq]);

  useEffect(() => {
    const onChange = () =>
      setFullscreen(document.fullscreenElement === boardRef.current);
    document.addEventListener('fullscreenchange', onChange);
    return () => document.removeEventListener('fullscreenchange', onChange);
  }, []);

  useEffect(() => {
    if (!pseudoFullscreen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setPseudoFullscreen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [pseudoFullscreen]);

  const legalTargets = useMemo(() => {
    if (!legalHints || !selected || snapshot.mode !== 'standard' || !snapshot.fen) {
      return new Map<Square, boolean>();
    }
    const piece = pieceAt(snapshot.board, selected);
    if (!piece || piece.color !== myColor || snapshot.turn !== myColor) {
      return new Map<Square, boolean>();
    }
    try {
      const chess = new Chess(snapshot.fen);
      const moves = chess.moves({
        square: selected as ChessSquare,
        verbose: true,
      });
      const map = new Map<Square, boolean>();
      for (const move of moves) {
        map.set(move.to, !!move.captured || move.flags.includes('e'));
      }
      return map;
    } catch {
      return new Map<Square, boolean>();
    }
  }, [legalHints, selected, snapshot, myColor]);

  const canSelect = (square: Square): boolean => {
    if (!interactive || snapshot.result) return false;
    const piece = pieceAt(snapshot.board, square);
    if (!piece) return false;
    if (snapshot.mode === 'free') return true;
    return piece.color === myColor && snapshot.turn === myColor;
  };

  const tryMove = (from: Square, to: Square) => {
    if (snapshot.mode === 'standard') {
      const piece = pieceAt(snapshot.board, from);
      const destRank = Number(to[1]);
      const promotionRank = piece?.color === 'w' ? 8 : 1;
      if (piece?.type === 'p' && destRank === promotionRank) {
        setPromotion({ from, to, color: piece.color });
        return;
      }
    }
    onMove(from, to);
    setSelected(null);
  };

  const handleSquare = (square: Square) => {
    if (!interactive || snapshot.result) return;
    if (selected) {
      if (square === selected) {
        setSelected(null);
        return;
      }
      const target = pieceAt(snapshot.board, square);
      if (
        snapshot.mode === 'standard' &&
        target &&
        target.color === myColor &&
        target.color === snapshot.turn
      ) {
        setSelected(square);
        return;
      }
      const source = pieceAt(snapshot.board, selected);
      if (source) {
        tryMove(selected, square);
        return;
      }
      setSelected(canSelect(square) ? square : null);
      return;
    }
    if (canSelect(square)) {
      setSelected(square);
    }
  };

  const toggleFullscreen = async () => {
    const element = boardRef.current;
    if (!element) return;
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
        return;
      }
      if (element.requestFullscreen) {
        await element.requestFullscreen();
      } else {
        setPseudoFullscreen((value) => !value);
      }
    } catch {
      setPseudoFullscreen((value) => !value);
    }
  };

  const light = (actualIndex: number) => isLightSquare(actualIndex);

  const boardContent = (
    <div
      className={`board-shell w-full transition-shadow duration-300 ${
        expanded ? 'max-w-[min(92vh,92vw)]' : ''
      }`}
      style={{
        background: `linear-gradient(155deg, ${boardTheme.frameAlt}, ${boardTheme.frame})`,
      }}
    >
      <div className="relative">
        <button
          type="button"
          onClick={() => void toggleFullscreen()}
          className="absolute -right-1 -top-1 z-30 flex h-8 w-8 translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-white/10 bg-ink-900/90 text-ivory-200/60 shadow-lg backdrop-blur transition hover:border-gold-400/35 hover:text-gold-200"
          title={fullscreen || pseudoFullscreen ? 'Exit fullscreen' : 'Fullscreen board'}
          aria-label={fullscreen || pseudoFullscreen ? 'Exit fullscreen' : 'Fullscreen board'}
        >
          {fullscreen || pseudoFullscreen ? (
            <Minimize2 className="h-3.5 w-3.5" />
          ) : (
            <Maximize2 className="h-3.5 w-3.5" />
          )}
        </button>

        <div
          className="board-inner aspect-square w-full"
          style={{ background: boardTheme.frame }}
        >
          <div className="grid h-full w-full grid-cols-8">
            {Array.from({ length: 64 }, (_, displayIndex) => {
              const actualIndex = isFlipped ? 63 - displayIndex : displayIndex;
              const square = indexToSquare(actualIndex);
              const lightSquare = light(actualIndex);
              const isSelected = selected === square;
              const isLast = snapshot.lastMove
                ? snapshot.lastMove.from === square || snapshot.lastMove.to === square
                : false;
              const isCheck = snapshot.checkSquare === square;
              const target = legalTargets.get(square);
              const showTarget = target !== undefined;
              const captureTarget = target === true;
              const row = Math.floor(displayIndex / 8);
              const col = displayIndex % 8;
              return (
                <button
                  key={square}
                  type="button"
                  draggable={canSelect(square)}
                  onDragStart={(event) => {
                    if (!canSelect(square)) {
                      event.preventDefault();
                      return;
                    }
                    setSelected(square);
                    event.dataTransfer.effectAllowed = 'move';
                    event.dataTransfer.setData('text/plain', square);
                  }}
                  onDragOver={(event) => {
                    if (selected && interactive) event.preventDefault();
                  }}
                  onDrop={(event) => {
                    event.preventDefault();
                    const from = (event.dataTransfer.getData('text/plain') || selected) as Square | null;
                    if (from && from !== square && pieceAt(snapshot.board, from)) {
                      tryMove(from, square);
                    }
                    setSelected(null);
                  }}
                  onClick={() => handleSquare(square)}
                  aria-label={`${square}${pieceAt(snapshot.board, square) ? ` ${pieceAt(snapshot.board, square)?.color === 'w' ? 'white' : 'black'} ${PIECE_NAMES[pieceAt(snapshot.board, square)!.type]}` : ''}`}
                  className="group relative cursor-pointer focus-visible:z-20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-gold-300/70"
                  style={{
                    background: lightSquare
                      ? `linear-gradient(145deg, ${boardTheme.light}, ${boardTheme.lightAlt})`
                      : `linear-gradient(145deg, ${boardTheme.dark}, ${boardTheme.darkAlt})`,
                    boxShadow: lightSquare
                      ? 'inset 0 1px 0 rgba(255,255,255,0.16)'
                      : 'inset 0 1px 0 rgba(255,255,255,0.05)',
                  }}
                >
                  {isLast && (
                    <span
                      className="pointer-events-none absolute inset-0"
                      style={{ background: boardTheme.lastMove }}
                    />
                  )}
                  {isSelected && (
                    <span
                      className="pointer-events-none absolute inset-0"
                      style={{
                        background: boardTheme.selected,
                        boxShadow: 'inset 0 0 0 2px rgba(247, 224, 166, 0.75)',
                      }}
                    />
                  )}
                  {isCheck && (
                    <span
                      className="pointer-events-none absolute inset-0 animate-pulse"
                      style={{
                        background: `radial-gradient(circle at 50% 50%, ${boardTheme.check}, transparent 72%)`,
                      }}
                    />
                  )}
                  {showTarget && !captureTarget && (
                    <span
                      className="pointer-events-none absolute left-1/2 top-1/2 h-[20%] w-[20%] -translate-x-1/2 -translate-y-1/2 rounded-full"
                      style={{
                        background: boardTheme.legalDot,
                        boxShadow: '0 1px 2px rgba(0,0,0,0.18)',
                      }}
                    />
                  )}
                  {showTarget && captureTarget && (
                    <span
                      className="pointer-events-none absolute inset-[6%] rounded-full border-[3px]"
                      style={{ borderColor: boardTheme.legalRing }}
                    />
                  )}
                  {row === 7 && (
                    <span
                      className="pointer-events-none absolute bottom-1 right-1.5 text-[8px] font-bold uppercase sm:text-[9px]"
                      style={{
                        color: lightSquare
                          ? boardTheme.coordinateOnLight
                          : boardTheme.coordinateOnDark,
                      }}
                    >
                      {square[0]}
                    </span>
                  )}
                  {col === 0 && (
                    <span
                      className="pointer-events-none absolute left-1 top-1 text-[8px] font-bold sm:text-[9px]"
                      style={{
                        color: lightSquare
                          ? boardTheme.coordinateOnLight
                          : boardTheme.coordinateOnDark,
                      }}
                    >
                      {square[1]}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <div className="pointer-events-none absolute inset-0">
            <AnimatePresence initial={false}>
              {snapshot.board.map((piece, actualIndex) => {
                if (!piece) return null;
                const displayIndex = isFlipped ? 63 - actualIndex : actualIndex;
                const file = displayIndex % 8;
                const row = Math.floor(displayIndex / 8);
                return (
                  <motion.div
                    key={`${piece.id}-${isFlipped ? 'flip' : 'normal'}`}
                    className="absolute left-0 top-0 h-[12.5%] w-[12.5%]"
                    initial={{ opacity: 0, scale: 0.72, x: `${file * 100}%`, y: `${row * 100}%` }}
                    animate={{
                      opacity: 1,
                      scale: 1,
                      x: `${file * 100}%`,
                      y: `${row * 100}%`,
                    }}
                    exit={{ opacity: 0, scale: 0.34, rotate: 14, y: -7, filter: 'blur(3px)' }}
                    transition={{
                      type: 'spring',
                      stiffness: 420,
                      damping: 34,
                      mass: 0.7,
                    }}
                    style={{ zIndex: 10 + row }}
                  >
                    <div className="absolute inset-x-[2%] -top-[17%] h-[126%]">
                      <ChessPiece
                        type={piece.type}
                        color={piece.color}
                        theme={pieceTheme}
                        className="piece-shadow h-full w-full"
                      />
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>

          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_30%_10%,rgba(255,255,255,0.09),transparent_42%)]" />
        </div>
      </div>
    </div>
  );

  return (
    <>
      <div
        ref={boardRef}
        className={
          expanded
            ? 'fixed inset-0 z-[90] flex items-center justify-center bg-ink-950/[0.98] p-4 backdrop-blur'
            : 'w-full'
        }
      >
        {expanded && (
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(217,179,106,0.08),transparent_60%)]" />
        )}
        <div className={expanded ? 'relative w-full max-w-[min(92vh,92vw)]' : 'w-full'}>
          {boardContent}
        </div>
      </div>

      <Dialog
        open={!!promotion}
        onClose={() => setPromotion(null)}
        title="Choose a promotion"
        description="Your pawn reached the final rank."
        widthClass="max-w-sm"
        footer={
          <Button variant="ghost" size="sm" onClick={() => setPromotion(null)}>
            Cancel move
          </Button>
        }
      >
        <div className="grid grid-cols-4 gap-2">
          {PROMOTION_OPTIONS.map((option) => (
            <button
              key={option}
              type="button"
              className="group flex flex-col items-center gap-1 rounded-xl border border-white/[0.08] bg-white/[0.03] p-2 transition hover:border-gold-400/40 hover:bg-gold-400/[0.07]"
              onClick={() => {
                if (!promotion) return;
                onMove(promotion.from, promotion.to, option);
                setPromotion(null);
                setSelected(null);
              }}
            >
              <ChessPiece
                type={option}
                color={promotion?.color ?? 'w'}
                theme={pieceTheme}
                className="h-14 w-14 transition-transform group-hover:-translate-y-0.5"
              />
              <span className="text-[10px] font-semibold text-ivory-200/60">
                {PIECE_NAMES[option]}
              </span>
            </button>
          ))}
        </div>
      </Dialog>
    </>
  );
}
