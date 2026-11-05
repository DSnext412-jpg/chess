import { useEffect, useRef } from 'react';
import { ScrollText, Swords } from 'lucide-react';
import type { GameSnapshot } from '../types/chess';
import { PIECE_NAMES } from '../types/chess';
import type { PieceTheme } from '../lib/themes';
import { ChessPiece } from './ChessPiece';

interface MoveHistoryProps {
  snapshot: GameSnapshot;
  pieceTheme: PieceTheme;
}

function StandardHistory({ snapshot }: { snapshot: GameSnapshot }) {
  const entries = snapshot.history.filter((entry) => entry.kind === 'standard');
  const rows: Array<{
    number: number;
    white?: (typeof entries)[number];
    black?: (typeof entries)[number];
    whiteIndex: number;
    blackIndex: number;
  }> = [];

  for (let index = 0; index < entries.length; index += 2) {
    rows.push({
      number: Math.floor(index / 2) + 1,
      white: entries[index],
      black: entries[index + 1],
      whiteIndex: index,
      blackIndex: index + 1,
    });
  }

  return (
    <div className="text-[11.5px]">
      <div className="grid grid-cols-[2rem_1fr_1fr] border-b border-white/[0.06] pb-2 text-[9px] font-bold uppercase tracking-[0.14em] text-ivory-200/25">
        <span>#</span>
        <span>White</span>
        <span>Black</span>
      </div>
      <div className="mt-1 space-y-0.5">
        {rows.map((row) => (
          <div
            key={row.number}
            className="grid grid-cols-[2rem_1fr_1fr] items-center rounded-md py-1 transition hover:bg-white/[0.025]"
          >
            <span className="font-mono text-[10px] text-ivory-200/25">
              {row.number}.
            </span>
            {['white', 'black'].map((side) => {
              const entry = side === 'white' ? row.white : row.black;
              const entryIndex =
                side === 'white' ? row.whiteIndex : row.blackIndex;
              if (!entry) {
                return <span key={side} />;
              }
              const isLast = entryIndex === entries.length - 1;
              return (
                <span
                  key={side}
                  className={`inline-flex w-fit items-center gap-1 rounded px-1.5 py-0.5 font-mono font-semibold ${
                    isLast
                      ? 'bg-gold-400/[0.12] text-gold-200'
                      : 'text-ivory-100/75'
                  }`}
                >
                  {entry.san}
                </span>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

function FreeHistory({
  snapshot,
  pieceTheme,
}: {
  snapshot: GameSnapshot;
  pieceTheme: PieceTheme;
}) {
  const entries = snapshot.history.filter((entry) => entry.kind === 'free');
  return (
    <div className="space-y-1">
      {entries.map((entry, index) => {
        const isLast = index === entries.length - 1;
        return (
          <div
            key={`${entry.ply}-${entry.from}-${entry.to}`}
            className={`flex items-center gap-2 rounded-lg px-2 py-1.5 ${
              isLast ? 'bg-gold-400/[0.07]' : ''
            }`}
          >
            <span className="w-5 shrink-0 font-mono text-[9px] text-ivory-200/25">
              {entry.ply}
            </span>
            <span className="flex h-6 w-6 shrink-0 items-center justify-center">
              <ChessPiece
                type={entry.piece}
                color={entry.color}
                theme={pieceTheme}
                className="h-6 w-6"
              />
            </span>
            <div className="min-w-0 flex-1">
              <p className="font-mono text-[10.5px] font-semibold text-ivory-100/75">
                {entry.from.toUpperCase()}
                <span className="mx-1 text-ivory-200/25">→</span>
                {entry.to.toUpperCase()}
              </p>
              <p className="truncate text-[9px] text-ivory-200/30">
                {PIECE_NAMES[entry.piece]}
                {entry.captured
                  ? ` · captured ${PIECE_NAMES[entry.captured]}`
                  : ''}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function MoveHistory({ snapshot, pieceTheme }: MoveHistoryProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const count = snapshot.history.length;

  useEffect(() => {
    const container = scrollRef.current;
    if (container && count > 0) {
      container.scrollTo({ top: container.scrollHeight, behavior: 'smooth' });
    }
  }, [count]);

  return (
    <div className="card flex min-h-0 flex-col p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ScrollText className="h-3.5 w-3.5 text-gold-300/60" />
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-ivory-200/35">
            Move history
          </p>
        </div>
        <span className="chip !px-2 !py-0.5 !text-[9px]">
          {snapshot.history.length} {snapshot.history.length === 1 ? 'move' : 'moves'}
        </span>
      </div>

      <div
        ref={scrollRef}
        className="scroll-fade mt-3 min-h-[120px] max-h-[260px] flex-1 overflow-y-auto pr-1"
      >
        {snapshot.history.length === 0 ? (
          <div className="flex h-full min-h-[120px] flex-col items-center justify-center rounded-xl border border-dashed border-white/[0.06]">
            <Swords className="h-5 w-5 text-ivory-200/15" />
            <p className="mt-2 text-[10px] text-ivory-200/25">
              The first move is yours to make
            </p>
          </div>
        ) : snapshot.mode === 'standard' ? (
          <StandardHistory snapshot={snapshot} />
        ) : (
          <FreeHistory snapshot={snapshot} pieceTheme={pieceTheme} />
        )}
      </div>
    </div>
  );
}
