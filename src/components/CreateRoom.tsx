import { useState, type FormEvent } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  ArrowRight,
  Crown,
  LockKeyhole,
  ShieldCheck,
  Sparkles,
  UserRound,
  Wifi,
} from 'lucide-react';
import type { MovementMode } from '../types/chess';
import { Button } from './ui/Button';
import { Logo } from './ui/Logo';
import { ChessPiece } from './ChessPiece';
import { PIECE_THEMES } from '../lib/themes';
import { useSession } from '../hooks/useSession';

interface CreateRoomProps {
  onBack: () => void;
}

const MODES: Array<{
  id: MovementMode;
  title: string;
  description: string;
  icon: typeof ShieldCheck;
}> = [
  {
    id: 'standard',
    title: 'Standard Chess',
    description:
      'Full legal move validation, checks, castling, promotion and draw detection.',
    icon: ShieldCheck,
  },
  {
    id: 'free',
    title: 'Free Movement',
    description:
      'Any piece to any square, on any turn. Casual, experimental, still synchronized.',
    icon: Sparkles,
  },
];

export function CreateRoom({ onBack }: CreateRoomProps) {
  const { actions } = useSession();
  const [name, setName] = useState('');
  const [mode, setMode] = useState<MovementMode>('standard');

  const submit = (event: FormEvent) => {
    event.preventDefault();
    actions.hostRoom(name, mode);
  };

  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-[-10%] h-[500px] w-[700px] -translate-x-1/2 rounded-full bg-gold-500/[0.06] blur-[120px]" />
        <div className="bg-fine-grid absolute inset-0 opacity-30 [mask-image:radial-gradient(ellipse_at_top,black,transparent_70%)]" />
      </div>

      <header className="container-page flex h-20 items-center justify-between">
        <Logo />
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 text-[12px] font-semibold text-ivory-200/55 transition hover:text-ivory-50"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back home
        </button>
      </header>

      <main className="container-page pb-20 pt-6">
        <div className="grid gap-10 lg:grid-cols-[1fr_420px] lg:gap-16">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-xl"
          >
            <p className="eyebrow">New session</p>
            <h1 className="mt-3 font-display text-5xl font-semibold leading-[0.95] text-ivory-50 sm:text-6xl">
              Open your
              <br />
              <span className="text-gradient-gold italic">private room.</span>
            </h1>
            <p className="mt-5 max-w-md text-sm leading-7 text-ivory-200/50">
              You will host the room and play as White. Your opponent joins
              with a six-character code or the invitation link you share.
            </p>

            <form onSubmit={submit} className="mt-9 space-y-7">
              <div>
                <label htmlFor="host-name" className="field-label">
                  Your display name
                </label>
                <div className="relative">
                  <UserRound className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-ivory-200/30" />
                  <input
                    id="host-name"
                    className="input pl-11"
                    placeholder="samiksha"
                    maxLength={20}
                    autoComplete="off"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                  />
                </div>
                <p className="mt-2 text-[11px] text-ivory-200/30">
                  Optional. Shown to your opponent only during this session.
                </p>
              </div>

              <div>
                <span className="field-label">Movement rules</span>
                <div className="grid gap-3 sm:grid-cols-2">
                  {MODES.map((item) => {
                    const Icon = item.icon;
                    const selected = mode === item.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setMode(item.id)}
                        className={`relative overflow-hidden rounded-2xl border p-4 text-left transition-all duration-200 ${
                          selected
                            ? 'border-gold-400/45 bg-gold-400/[0.07] shadow-[0_16px_40px_-24px_rgba(217,179,106,0.6)]'
                            : 'border-white/[0.08] bg-white/[0.025] hover:border-white/15 hover:bg-white/[0.04]'
                        }`}
                      >
                        <span
                          className={`flex h-9 w-9 items-center justify-center rounded-lg border ${
                            selected
                              ? 'border-gold-400/25 bg-gold-400/10 text-gold-300'
                              : 'border-white/[0.08] bg-white/[0.03] text-ivory-200/50'
                          }`}
                        >
                          <Icon className="h-4 w-4" strokeWidth={1.7} />
                        </span>
                        <span className="mt-3 block text-[13px] font-bold text-ivory-50">
                          {item.title}
                        </span>
                        <span className="mt-1 block text-[11.5px] leading-5 text-ivory-200/45">
                          {item.description}
                        </span>
                        <span
                          className={`absolute right-3 top-3 flex h-5 w-5 items-center justify-center rounded-full border transition ${
                            selected
                              ? 'border-gold-400/60 bg-gold-400 text-ink-950'
                              : 'border-white/15 bg-transparent'
                          }`}
                        >
                          {selected && (
                            <svg viewBox="0 0 12 12" className="h-2.5 w-2.5" fill="none">
                              <path
                                d="M2 6.2 4.6 8.8 10 3.4"
                                stroke="currentColor"
                                strokeWidth="1.8"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                          )}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <Button
                  type="submit"
                  size="lg"
                  trailingIcon={<ArrowRight className="h-4 w-4" />}
                >
                  Create room
                </Button>
                <span className="inline-flex items-center gap-2 text-[11px] text-ivory-200/30">
                  <LockKeyhole className="h-3 w-3" />
                  No account, no database, no permanent room
                </span>
              </div>
            </form>
          </motion.div>

          <motion.aside
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.55, delay: 0.1 }}
            className="relative"
          >
            <div className="card-strong relative overflow-hidden p-6">
              <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full border border-gold-400/10" />
              <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full border border-gold-400/[0.06]" />

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-ivory-200/35">
                    You will play
                  </p>
                  <div className="mt-1 flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full border border-black/20 bg-ivory-100 shadow" />
                    <p className="font-display text-2xl font-semibold text-ivory-50">
                      White
                    </p>
                  </div>
                </div>
                <span className="chip">
                  <Crown className="h-3 w-3 text-gold-300" />
                  Host
                </span>
              </div>

              <div className="relative mt-6 flex h-40 items-end justify-center overflow-hidden rounded-2xl border border-white/[0.06] bg-gradient-to-b from-white/[0.04] to-transparent">
                <div className="absolute inset-x-8 bottom-0 h-8 rounded-[50%] bg-black/40 blur-xl" />
                <ChessPiece
                  type="k"
                  color="w"
                  theme={PIECE_THEMES.ivory}
                  className="piece-shadow relative z-10 h-36 w-auto translate-y-1"
                />
                <ChessPiece
                  type="q"
                  color="w"
                  theme={PIECE_THEMES.ivory}
                  className="piece-shadow absolute bottom-0 left-5 z-10 h-28 w-auto -translate-x-1"
                />
                <ChessPiece
                  type="n"
                  color="b"
                  theme={PIECE_THEMES.ivory}
                  className="piece-shadow absolute bottom-0 right-4 z-10 h-28 w-auto"
                />
              </div>

              <div className="mt-6 space-y-3">
                {[
                  {
                    icon: Wifi,
                    text: 'One opponent joins over a direct WebRTC channel.',
                  },
                  {
                    icon: LockKeyhole,
                    text: 'The room lives in memory and closes with the session.',
                  },
                  {
                    icon: ShieldCheck,
                    text: 'The host is authoritative, preventing conflicting moves.',
                  },
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <div key={item.text} className="flex gap-3">
                      <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md border border-white/[0.07] bg-white/[0.03]">
                        <Icon className="h-3 w-3 text-gold-300/70" />
                      </span>
                      <p className="text-[11.5px] leading-5 text-ivory-200/45">
                        {item.text}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            <p className="mt-4 px-2 text-[10.5px] leading-5 text-ivory-200/25">
              PeerJS Cloud is used for signaling. If it is unavailable, we show
              a clear error instead of pretending the room connected.
            </p>
          </motion.aside>
        </div>
      </main>
    </div>
  );
}
