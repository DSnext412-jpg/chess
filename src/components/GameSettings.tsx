import { useState } from 'react';
import {
  Lock,
  Palette,
  Settings2,
  Sparkles,
  Swords,
  Volume2,
  VolumeX,
} from 'lucide-react';
import type { MovementMode } from '../types/chess';
import type { Preferences } from '../hooks/usePreferences';
import { BOARD_THEME_LIST, PIECE_THEME_LIST } from '../lib/themes';
import { useSession } from '../hooks/useSession';
import { Dialog } from './ui/Dialog';
import { Button } from './ui/Button';
import { ChessPiece } from './ChessPiece';

interface GameSettingsProps {
  preferences: Preferences;
  update: <K extends keyof Preferences>(key: K, value: Preferences[K]) => void;
  toggleFlip: () => void;
}

export function GameSettings({
  preferences,
  update,
  toggleFlip,
}: GameSettingsProps) {
  const { state, actions } = useSession();
  const [pendingMode, setPendingMode] = useState<MovementMode | null>(null);
  const isHost = state.role === 'host';
  const connected = state.status === 'connected';
  const pending = !!(state.incomingRequest || state.outgoingRequest);
  const mode = state.snapshot.mode;

  const chooseMode = (next: MovementMode) => {
    if (next === mode) return;
    if (!isHost) return;
    setPendingMode(next);
  };

  return (
    <div className="card p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Settings2 className="h-3.5 w-3.5 text-gold-300/60" />
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-ivory-200/35">
            Settings
          </p>
        </div>
        <button
          type="button"
          onClick={toggleFlip}
          className="text-[9px] font-semibold uppercase tracking-[0.12em] text-ivory-200/35 transition hover:text-gold-300"
        >
          Flip board
        </button>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => update('sound', !preferences.sound)}
          className={`flex flex-col items-start gap-1.5 rounded-xl border px-3 py-2.5 text-left transition ${
            preferences.sound
              ? 'border-gold-400/20 bg-gold-400/[0.05]'
              : 'border-white/[0.06] bg-white/[0.02]'
          }`}
        >
          {preferences.sound ? (
            <Volume2 className="h-4 w-4 text-gold-300/80" />
          ) : (
            <VolumeX className="h-4 w-4 text-ivory-200/30" />
          )}
          <span className="text-[10px] font-semibold text-ivory-100/75">
            Sound {preferences.sound ? 'on' : 'off'}
          </span>
        </button>
        <button
          type="button"
          onClick={() => update('legalHints', !preferences.legalHints)}
          className={`flex flex-col items-start gap-1.5 rounded-xl border px-3 py-2.5 text-left transition ${
            preferences.legalHints
              ? 'border-gold-400/20 bg-gold-400/[0.05]'
              : 'border-white/[0.06] bg-white/[0.02]'
          }`}
        >
          <Sparkles
            className={`h-4 w-4 ${
              preferences.legalHints ? 'text-gold-300/80' : 'text-ivory-200/30'
            }`}
          />
          <span className="text-[10px] font-semibold text-ivory-100/75">
            Move hints {preferences.legalHints ? 'on' : 'off'}
          </span>
        </button>
      </div>

      <div className="mt-4">
        <div className="mb-2 flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-[0.14em] text-ivory-200/30">
          <Palette className="h-3 w-3" />
          Board theme
        </div>
        <div className="grid grid-cols-4 gap-1.5">
          {BOARD_THEME_LIST.map((theme) => (
            <button
              key={theme.id}
              type="button"
              onClick={() => update('boardTheme', theme.id)}
              title={theme.name}
              aria-label={`${theme.name} board theme`}
              className={`group overflow-hidden rounded-lg border p-1 transition ${
                preferences.boardTheme === theme.id
                  ? 'border-gold-400/50 bg-gold-400/[0.06]'
                  : 'border-white/[0.06] hover:border-white/15'
              }`}
            >
              <span className="grid grid-cols-2 overflow-hidden rounded-[4px]">
                <span className="h-3.5" style={{ background: theme.light }} />
                <span className="h-3.5" style={{ background: theme.dark }} />
                <span className="h-3.5" style={{ background: theme.dark }} />
                <span className="h-3.5" style={{ background: theme.light }} />
              </span>
              <span className="mt-1 block truncate text-center text-[8px] font-semibold text-ivory-200/40 group-hover:text-ivory-200/65">
                {theme.name}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="mt-4">
        <div className="mb-2 text-[9px] font-bold uppercase tracking-[0.14em] text-ivory-200/30">
          Piece style
        </div>
        <div className="grid grid-cols-3 gap-1.5">
          {PIECE_THEME_LIST.map((theme) => (
            <button
              key={theme.id}
              type="button"
              onClick={() => update('pieceTheme', theme.id)}
              title={theme.name}
              aria-label={`${theme.name} piece style`}
              className={`flex flex-col items-center justify-center gap-0.5 rounded-lg border px-1 py-1.5 transition ${
                preferences.pieceTheme === theme.id
                  ? 'border-gold-400/50 bg-gold-400/[0.06]'
                  : 'border-white/[0.06] hover:border-white/15'
              }`}
            >
              <span className="flex items-center justify-center gap-0.5">
                <ChessPiece
                  type="n"
                  color="w"
                  theme={theme}
                  className="h-6 w-6"
                />
                <ChessPiece
                  type="p"
                  color="b"
                  theme={theme}
                  className="h-6 w-6"
                />
              </span>
              <span className="text-[8px] font-semibold text-ivory-200/55">{theme.name}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="divider my-4" />

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-[0.14em] text-ivory-200/30">
          <Swords className="h-3 w-3" />
          Movement rules
        </div>
        {!isHost && (
          <span className="inline-flex items-center gap-1 text-[8.5px] text-ivory-200/25">
            <Lock className="h-2.5 w-2.5" /> Host only
          </span>
        )}
      </div>
      <div className="mt-2 grid grid-cols-2 gap-1.5">
        {(
          [
            ['standard', 'Standard'],
            ['free', 'Free movement'],
          ] as const
        ).map(([value, label]) => (
          <button
            key={value}
            type="button"
            disabled={!isHost || !connected || pending}
            onClick={() => chooseMode(value)}
            className={`rounded-lg border px-2 py-2 text-[10px] font-semibold transition disabled:cursor-not-allowed disabled:opacity-40 ${
              mode === value
                ? 'border-gold-400/40 bg-gold-400/[0.08] text-gold-200'
                : 'border-white/[0.07] bg-white/[0.02] text-ivory-200/45 hover:border-white/15'
            }`}
          >
            {label}
          </button>
        ))}
      </div>
      <p className="mt-2 text-[9px] leading-4 text-ivory-200/25">
        {isHost
          ? 'Changing rules requires your opponent’s approval and starts a new game.'
          : 'Your opponent controls the movement rules for this room.'}
      </p>

      <Dialog
        open={!!pendingMode}
        onClose={() => setPendingMode(null)}
        title="Change movement rules?"
        description="This starts a new game from the starting position and requires your opponent to accept."
        footer={
          <>
            <Button variant="ghost" onClick={() => setPendingMode(null)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (pendingMode) {
                  actions.requestAction('mode', { mode: pendingMode });
                }
                setPendingMode(null);
              }}
            >
              Send request
            </Button>
          </>
        }
      >
        <div className="rounded-xl border border-gold-400/15 bg-gold-400/[0.04] p-4 text-[12px] leading-6 text-ivory-200/55">
          You are switching to{' '}
          <span className="font-semibold text-ivory-50">
            {pendingMode === 'free' ? 'Free Movement' : 'Standard Chess'}
          </span>
          . The current board and move history will be cleared once both players
          agree.
        </div>
      </Dialog>
    </div>
  );
}
