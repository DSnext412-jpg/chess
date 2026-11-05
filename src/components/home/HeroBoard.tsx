import { motion } from 'framer-motion';
import { Lock, Radio } from 'lucide-react';
import { ChessPiece } from '../ChessPiece';
import { BOARD_THEMES, PIECE_THEMES } from '../../lib/themes';
import type { Color, PieceType, Square } from '../../types/chess';

interface DemoPiece {
  type: PieceType;
  color: Color;
  square: Square;
}

const DEMO_PIECES: DemoPiece[] = [
  { type: 'r', color: 'w', square: 'a1' },
  { type: 'n', color: 'w', square: 'g1' },
  { type: 'b', color: 'w', square: 'c1' },
  { type: 'q', color: 'w', square: 'd1' },
  { type: 'k', color: 'w', square: 'e1' },
  { type: 'p', color: 'w', square: 'e4' },
  { type: 'p', color: 'w', square: 'f4' },
  { type: 'p', color: 'w', square: 'h2' },
  { type: 'r', color: 'b', square: 'h8' },
  { type: 'n', color: 'b', square: 'c6' },
  { type: 'b', color: 'b', square: 'g4' },
  { type: 'q', color: 'b', square: 'd8' },
  { type: 'k', color: 'b', square: 'e8' },
  { type: 'p', color: 'b', square: 'd5' },
  { type: 'p', color: 'b', square: 'e5' },
  { type: 'p', color: 'b', square: 'a7' },
];

const boardTheme = BOARD_THEMES.walnut;
const pieceTheme = PIECE_THEMES.ivory;

function squareIndex(square: Square): number {
  const file = square.charCodeAt(0) - 97;
  const rank = Number(square[1]);
  return (8 - rank) * 8 + file;
}

export function HeroBoard() {
  return (
    <div className="relative mx-auto w-full max-w-[520px]">
      <div className="pointer-events-none absolute -inset-16 -z-10">
        <div className="absolute inset-0 rounded-full bg-gold-500/10 blur-3xl" />
        <div className="absolute left-1/2 top-1/2 h-[70%] w-[70%] -translate-x-1/2 -translate-y-1/2 rounded-full border border-gold-400/10" />
        <div className="absolute left-1/2 top-1/2 h-[88%] w-[88%] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/[0.04]" />
      </div>

      <motion.div
        className="relative"
        initial={{ opacity: 0, y: 30, rotate: -2 }}
        animate={{ opacity: 1, y: 0, rotate: 0 }}
        transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1], delay: 0.15 }}
      >
        <div className="absolute -right-3 -top-5 z-20 sm:-right-6">
          <div className="flex items-center gap-2 rounded-full border border-emerald-400/25 bg-[#0c1712]/95 px-3.5 py-2 shadow-2xl backdrop-blur">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
            </span>
            <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-emerald-100/80">
              Live
            </span>
            <Radio className="h-3 w-3 text-emerald-300/70" />
          </div>
        </div>

        <div className="board-shell p-3.5 sm:p-4">
          <div
            className="board-inner aspect-square w-full"
            style={{
              background: `linear-gradient(150deg, ${boardTheme.frameAlt}, ${boardTheme.frame})`,
            }}
          >
            <div className="grid h-full w-full grid-cols-8">
              {Array.from({ length: 64 }, (_, displayIndex) => {
                const actualIndex = displayIndex;
                const light = (() => {
                  const file = actualIndex % 8;
                  const rank = 8 - Math.floor(actualIndex / 8);
                  return (file + rank) % 2 === 0;
                })();
                return (
                  <div
                    key={displayIndex}
                    className="relative"
                    style={{
                      background: light
                        ? `linear-gradient(145deg, ${boardTheme.light}, ${boardTheme.lightAlt})`
                        : `linear-gradient(145deg, ${boardTheme.dark}, ${boardTheme.darkAlt})`,
                      boxShadow: light
                        ? 'inset 0 1px 0 rgba(255,255,255,.18)'
                        : 'inset 0 1px 0 rgba(255,255,255,.06)',
                    }}
                  />
                );
              })}
            </div>

            <div className="pointer-events-none absolute inset-0">
              {DEMO_PIECES.map((piece, index) => {
                const boardIndex = squareIndex(piece.square);
                const file = boardIndex % 8;
                const rankRow = Math.floor(boardIndex / 8);
                return (
                  <motion.div
                    key={`${piece.square}-${piece.type}`}
                    className="absolute left-0 top-0 h-[12.5%] w-[12.5%]"
                    style={{ zIndex: 5 + rankRow }}
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{
                      opacity: 1,
                      scale: 1,
                      x: `${file * 100}%`,
                      y: `${rankRow * 100}%`,
                    }}
                    transition={{
                      delay: 0.35 + index * 0.035,
                      type: 'spring',
                      stiffness: 180,
                      damping: 18,
                    }}
                  >
                    <div className="absolute inset-x-[3%] -top-[19%] h-[128%]">
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
            </div>

            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_35%_18%,rgba(255,255,255,0.13),transparent_42%)]" />
          </div>
        </div>

        <div className="absolute -bottom-6 left-2 z-20 flex items-center gap-2 rounded-2xl border border-white/10 bg-ink-850/95 px-4 py-2.5 shadow-2xl backdrop-blur sm:left-4">
          <Lock className="h-3.5 w-3.5 text-gold-300/80" />
          <div>
            <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-ivory-200/40">
              Private room
            </p>
            <p className="font-mono text-[12px] font-semibold tracking-[0.16em] text-ivory-100">
              K7M·4Q9
            </p>
          </div>
        </div>

        <div className="absolute -right-2 bottom-14 z-20 hidden rounded-2xl border border-white/10 bg-ink-850/95 px-4 py-3 text-right shadow-2xl backdrop-blur sm:block">
          <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-ivory-200/40">
            Move 24
          </p>
          <p className="mt-0.5 font-display text-lg font-semibold text-ivory-50">
            Qd1–h5<span className="text-gold-300">+</span>
          </p>
        </div>
      </motion.div>

      <div className="pointer-events-none absolute -left-6 top-1/2 hidden h-24 w-24 -translate-y-1/2 rounded-full bg-gold-500/10 blur-2xl lg:block" />
      <p className="mt-10 text-center text-[10px] font-semibold uppercase tracking-[0.22em] text-ivory-200/30">
        Direct WebRTC · no game server · no account
      </p>
    </div>
  );
}
