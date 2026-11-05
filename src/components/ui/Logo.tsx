import { ChessPiece } from '../ChessPiece';
import { PIECE_THEMES } from '../../lib/themes';

interface LogoProps {
  compact?: boolean;
  link?: boolean;
}

export function Logo({ compact = false, link = true }: LogoProps) {
  const content = (
    <>
      <span className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-gold-400/25 bg-gradient-to-br from-gold-300/15 via-white/[0.03] to-transparent shadow-[0_10px_30px_-14px_rgba(217,179,106,0.5)]">
        <ChessPiece
          type="n"
          color="w"
          theme={PIECE_THEMES.ivory}
          className="h-7 w-7 translate-y-[1px]"
        />
        <span className="absolute inset-x-2 bottom-1 h-px bg-gradient-to-r from-transparent via-gold-400/40 to-transparent" />
      </span>
      {!compact && (
        <span className="leading-none">
          <span className="block font-display text-[22px] font-semibold tracking-wide text-ivory-50">
            Chess Session
          </span>
          <span className="mt-1 block text-[9px] font-bold uppercase tracking-[0.28em] text-gold-300/55">
            Private P2P Rooms
          </span>
        </span>
      )}
    </>
  );

  if (!link) {
    return (
      <div className="flex items-center gap-3" aria-label="Chess Session">
        {content}
      </div>
    );
  }

  return (
    <a href="#/" className="group flex items-center gap-3" aria-label="Chess Session home">
      {content}
    </a>
  );
}
