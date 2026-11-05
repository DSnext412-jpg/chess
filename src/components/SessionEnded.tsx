import { motion } from 'framer-motion';
import { ArrowRight, Home, LogOut, Sparkles, UserRound } from 'lucide-react';
import { useSession } from '../hooks/useSession';
import { Logo } from './ui/Logo';
import { Button } from './ui/Button';
import { ChessPiece } from './ChessPiece';
import { PIECE_THEMES } from '../lib/themes';

interface SessionEndedProps {
  onHome: () => void;
  onCreate: () => void;
}

export function SessionEnded({ onHome, onCreate }: SessionEndedProps) {
  const { state, actions } = useSession();
  const isHost = state.role === 'host';

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-[-8%] h-[480px] w-[680px] -translate-x-1/2 rounded-full bg-gold-500/[0.06] blur-[130px]" />
        <div className="bg-fine-grid absolute inset-0 opacity-20 [mask-image:radial-gradient(ellipse_at_center,black,transparent_72%)]" />
      </div>

      <header className="container-page flex h-20 items-center justify-between">
        <Logo link={false} />
        <span className="inline-flex items-center gap-2 rounded-full border border-white/[0.07] bg-white/[0.025] px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-ivory-200/35">
          <LogOut className="h-3 w-3" />
          Room closed
        </span>
      </header>

      <main className="container-page flex flex-1 items-center justify-center pb-24">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="card-strong relative w-full max-w-lg overflow-hidden p-8 text-center sm:p-10"
        >
          <div className="pointer-events-none absolute -right-16 -top-16 h-44 w-44 rounded-full border border-gold-400/[0.08]" />
          <div className="pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full border border-gold-400/[0.05]" />

          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl border border-gold-400/20 bg-gradient-to-b from-gold-400/[0.1] to-transparent">
            <ChessPiece
              type="k"
              color="w"
              theme={PIECE_THEMES.ivory}
              className="h-14 w-14"
            />
          </div>

          <p className="eyebrow mt-6">Session ended</p>
          <h1 className="mt-2 font-display text-4xl font-semibold text-ivory-50 sm:text-5xl">
            The board is closed.
          </h1>
          <p className="mx-auto mt-3 max-w-sm text-[13px] leading-6 text-ivory-200/45">
            {state.endedReason ??
              'This temporary room is no longer available. Nothing was saved.'}
          </p>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-2 text-[10px] text-ivory-200/30">
            {state.roomCode && (
              <span className="rounded-full border border-white/[0.07] bg-white/[0.02] px-2.5 py-1 font-mono tracking-[0.14em]">
                {state.roomCode}
              </span>
            )}
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/[0.07] bg-white/[0.02] px-2.5 py-1">
              <UserRound className="h-2.5 w-2.5" />
              {isHost ? state.hostName : state.guestName}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/[0.07] bg-white/[0.02] px-2.5 py-1">
              Peer-to-peer
            </span>
          </div>

          <div className="mt-8 flex flex-col gap-2 sm:flex-row sm:justify-center">
            <Button
              onClick={() => {
                actions.reset();
                onCreate();
              }}
              icon={<Sparkles className="h-4 w-4" />}
              trailingIcon={<ArrowRight className="h-4 w-4" />}
            >
              New room
            </Button>
            <Button
              variant="secondary"
              onClick={() => {
                actions.reset();
                onHome();
              }}
              icon={<Home className="h-4 w-4" />}
            >
              Back home
            </Button>
          </div>

          <p className="mt-6 text-[10px] leading-5 text-ivory-200/25">
            Temporary rooms live only in memory. No game history, names or
            account details are stored.
          </p>
        </motion.div>
      </main>
    </div>
  );
}
