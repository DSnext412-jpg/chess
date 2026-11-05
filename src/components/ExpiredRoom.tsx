import { motion } from 'framer-motion';
import { ArrowRight, Clock, Home, KeyRound, Sparkles } from 'lucide-react';
import { Logo } from './ui/Logo';
import { Button } from './ui/Button';
import { ChessPiece } from './ChessPiece';
import { PIECE_THEMES } from '../lib/themes';

interface ExpiredRoomProps {
  code?: string;
  onJoin: () => void;
  onHome: () => void;
  onCreate: () => void;
}

export function ExpiredRoom({ code, onJoin, onHome, onCreate }: ExpiredRoomProps) {
  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-[-8%] h-[460px] w-[640px] -translate-x-1/2 rounded-full bg-gold-500/[0.05] blur-[130px]" />
        <div className="bg-fine-grid absolute inset-0 opacity-20 [mask-image:radial-gradient(ellipse_at_center,black,transparent_72%)]" />
      </div>

      <header className="container-page flex h-20 items-center justify-between">
        <Logo link={false} />
        <span className="inline-flex items-center gap-2 rounded-full border border-white/[0.07] bg-white/[0.025] px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-ivory-200/35">
          <Clock className="h-3 w-3" />
          Room expired
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
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.03]">
            <ChessPiece
              type="p"
              color="w"
              theme={PIECE_THEMES.ivory}
              className="h-12 w-12 opacity-50"
            />
          </div>

          <p className="eyebrow mt-6">Temporary rooms</p>
          <h1 className="mt-2 font-display text-4xl font-semibold text-ivory-50 sm:text-5xl">
            This room has closed.
          </h1>
          <p className="mx-auto mt-3 max-w-sm text-[13px] leading-6 text-ivory-200/45">
            Chess rooms exist only while the host&apos;s session is open. Ask
            your host for a fresh invitation, or open a room of your own.
          </p>

          {code && (
            <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-white/[0.07] bg-white/[0.025] px-3 py-1.5">
              <KeyRound className="h-3 w-3 text-gold-300/50" />
              <span className="font-mono text-[12px] font-semibold tracking-[0.22em] text-ivory-200/45">
                {code}
              </span>
            </div>
          )}

          <div className="mt-8 flex flex-col gap-2 sm:flex-row sm:justify-center">
            <Button
              onClick={onJoin}
              icon={<KeyRound className="h-4 w-4" />}
              trailingIcon={<ArrowRight className="h-3.5 w-3.5" />}
            >
              Join a room
            </Button>
            <Button
              variant="secondary"
              onClick={onCreate}
              icon={<Sparkles className="h-4 w-4" />}
            >
              Create a room
            </Button>
            <Button
              variant="ghost"
              onClick={onHome}
              icon={<Home className="h-4 w-4" />}
            >
              Home
            </Button>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
