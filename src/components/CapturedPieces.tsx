import { motion } from 'framer-motion';
import { CircleSlash2 } from 'lucide-react';
import type { CapturedPieces as CapturedState, Color } from '../types/chess';
import { PIECE_NAMES, PIECE_VALUES } from '../types/chess';
import type { PieceTheme } from '../lib/themes';
import { ChessPiece } from './ChessPiece';

interface CapturedPiecesProps {
  captured: CapturedState;
  pieceTheme: PieceTheme;
}

function CaptureRow({
  color,
  pieces,
  pieceTheme,
}: {
  color: Color;
  pieces: CapturedState['w'];
  pieceTheme: PieceTheme;
}) {
  const value = pieces.reduce((total, piece) => total + PIECE_VALUES[piece], 0);
  return (
    <div>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span
            className={`h-2 w-2 rounded-full border ${
              color === 'w'
                ? 'border-black/20 bg-ivory-100'
                : 'border-white/20 bg-ink-700'
            }`}
          />
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-ivory-200/45">
            Captured {color === 'w' ? 'white' : 'black'}
          </p>
        </div>
        <span className="font-mono text-[10px] font-semibold text-ivory-200/35">
          {pieces.length}
          {value > 0 ? ` · ${value}` : ''}
        </span>
      </div>
      {pieces.length === 0 ? (
        <div className="mt-2 flex items-center gap-2 rounded-lg border border-dashed border-white/[0.06] px-3 py-2.5">
          <CircleSlash2 className="h-3 w-3 text-ivory-200/20" />
          <span className="text-[10px] text-ivory-200/25">No captures yet</span>
        </div>
      ) : (
        <div className="mt-2 flex min-h-[34px] flex-wrap items-end gap-x-0.5 gap-y-1 rounded-lg border border-white/[0.05] bg-black/15 px-2 py-1.5">
          {pieces.map((piece, index) => (
            <motion.div
              key={`${color}-${piece}-${index}`}
              layout
              initial={{ opacity: 0, scale: 0.35, y: 10, rotate: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 420, damping: 24 }}
              className="-ml-0.5"
              title={`Captured ${color === 'w' ? 'white' : 'black'} ${PIECE_NAMES[piece]}`}
            >
              <ChessPiece
                type={piece}
                color={color}
                theme={pieceTheme}
                className="h-5 w-5 opacity-85 sm:h-[22px] sm:w-[22px]"
              />
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

export function CapturedPieces({ captured, pieceTheme }: CapturedPiecesProps) {
  return (
    <div className="card p-4">
      <div className="flex items-center justify-between">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-ivory-200/35">
          Captured
        </p>
        <span className="text-[9px] font-medium uppercase tracking-[0.12em] text-ivory-200/20">
          Material
        </span>
      </div>
      <div className="mt-3 space-y-4">
        <CaptureRow color="w" pieces={captured.w} pieceTheme={pieceTheme} />
        <div className="divider" />
        <CaptureRow color="b" pieces={captured.b} pieceTheme={pieceTheme} />
      </div>
    </div>
  );
}
