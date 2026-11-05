import { Crown, Sparkles, Wifi, WifiOff } from 'lucide-react';
import type { Color, MovementMode } from '../types/chess';
import { ChessPiece } from './ChessPiece';
import { PIECE_THEMES } from '../lib/themes';

interface PlayerInfoProps {
  name: string;
  color: Color;
  isMe: boolean;
  online: boolean;
  isTurn: boolean;
  mode: MovementMode;
  gameOver: boolean;
  advantage: number;
}

export function PlayerInfo({
  name,
  color,
  isMe,
  online,
  isTurn,
  mode,
  gameOver,
  advantage,
}: PlayerInfoProps) {
  const active = online && !gameOver && (mode === 'free' || isTurn);

  return (
    <div
      className={`relative flex items-center justify-between gap-3 overflow-hidden rounded-2xl border px-4 py-3 transition-all duration-300 ${
        active
          ? 'border-gold-400/30 bg-gradient-to-r from-gold-400/[0.075] to-transparent'
          : 'border-white/[0.07] bg-white/[0.025]'
      }`}
    >
      {active && (
        <span className="absolute inset-y-2 left-0 w-[2px] rounded-full bg-gradient-to-b from-gold-200 to-gold-500" />
      )}
      <div className="flex min-w-0 items-center gap-3">
        <div className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-white/[0.08] bg-black/25">
          <ChessPiece
            type="k"
            color={color}
            theme={PIECE_THEMES.ivory}
            className="h-8 w-8"
          />
          <span
            className={`absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-ink-900 ${
              online ? 'bg-emerald-400' : 'bg-red-400/80'
            }`}
          />
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <p className="truncate text-[13px] font-bold text-ivory-50">{name}</p>
            {isMe && (
              <span className="rounded-full border border-gold-400/20 bg-gold-400/[0.08] px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-[0.14em] text-gold-300">
                You
              </span>
            )}
          </div>
          <div className="mt-1 flex items-center gap-2 text-[10px] font-medium text-ivory-200/40">
            <span className="inline-flex items-center gap-1">
              <span
                className={`h-2 w-2 rounded-full border ${
                  color === 'w'
                    ? 'border-black/20 bg-ivory-100'
                    : 'border-white/20 bg-ink-700'
                }`}
              />
              {color === 'w' ? 'White' : 'Black'}
            </span>
            <span className="text-white/15">·</span>
            {online ? (
              <span className="inline-flex items-center gap-1">
                <Wifi className="h-2.5 w-2.5" /> Online
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-red-300/70">
                <WifiOff className="h-2.5 w-2.5" /> Offline
              </span>
            )}
            {advantage > 0 && (
              <>
                <span className="text-white/15">·</span>
                <span className="text-gold-300/80">+{advantage} material</span>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        {gameOver ? (
          <span className="rounded-full border border-white/10 bg-white/[0.03] px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.12em] text-ivory-200/35">
            Finished
          </span>
        ) : mode === 'free' ? (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/20 bg-emerald-400/[0.06] px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.12em] text-emerald-200/70">
            <Sparkles className="h-2.5 w-2.5" />
            Free play
          </span>
        ) : active ? (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-gold-400/25 bg-gold-400/[0.08] px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.12em] text-gold-200">
            <Crown className="h-2.5 w-2.5" />
            To move
          </span>
        ) : (
          <span className="rounded-full border border-white/[0.07] bg-white/[0.02] px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.12em] text-ivory-200/30">
            Waiting
          </span>
        )}
      </div>
    </div>
  );
}
