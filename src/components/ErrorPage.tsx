import { motion } from 'framer-motion';
import {
  AlertTriangle,
  ArrowRight,
  Home,
  KeyRound,
  RefreshCw,
  WifiOff,
} from 'lucide-react';
import { useSession } from '../hooks/useSession';
import { Logo } from './ui/Logo';
import { Button } from './ui/Button';

interface ErrorPageProps {
  onHome: () => void;
  onJoin: () => void;
}

export function ErrorPage({ onHome, onJoin }: ErrorPageProps) {
  const { state, actions } = useSession();
  const isGuest = state.role === 'guest';

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-[-10%] h-[460px] w-[640px] -translate-x-1/2 rounded-full bg-red-500/[0.045] blur-[130px]" />
        <div className="bg-fine-grid absolute inset-0 opacity-20 [mask-image:radial-gradient(ellipse_at_center,black,transparent_72%)]" />
      </div>

      <header className="container-page flex h-20 items-center justify-between">
        <Logo link={false} />
        <span className="inline-flex items-center gap-2 rounded-full border border-red-400/20 bg-red-500/[0.055] px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-red-200/60">
          <AlertTriangle className="h-3 w-3" />
          Connection issue
        </span>
      </header>

      <main className="container-page flex flex-1 items-center justify-center pb-24">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="card-strong relative w-full max-w-xl overflow-hidden p-8 text-left sm:p-10"
        >
          <div className="pointer-events-none absolute -right-16 -top-16 h-44 w-44 rounded-full border border-red-400/[0.07]" />

          <span className="flex h-12 w-12 items-center justify-center rounded-2xl border border-red-400/20 bg-red-500/[0.07] text-red-200/80">
            <WifiOff className="h-5 w-5" />
          </span>
          <p className="eyebrow mt-5 !text-red-300/60">Could not connect</p>
          <h1 className="mt-2 font-display text-4xl font-semibold leading-tight text-ivory-50 sm:text-5xl">
            The room slipped away.
          </h1>
          <p className="mt-4 text-[13px] leading-6 text-ivory-200/50">
            {state.error ??
              'The peer connection could not be established. The room may have closed, or your network may block WebRTC.'}
          </p>

          {state.roomCode && (
            <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-white/[0.07] bg-white/[0.025] px-3 py-1.5">
              <KeyRound className="h-3 w-3 text-gold-300/60" />
              <span className="text-[9px] font-bold uppercase tracking-[0.14em] text-ivory-200/30">
                Room
              </span>
              <span className="font-mono text-[12px] font-semibold tracking-[0.2em] text-ivory-100/70">
                {state.roomCode}
              </span>
            </div>
          )}

          <div className="mt-6 rounded-xl border border-white/[0.06] bg-black/20 p-4">
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-ivory-200/30">
              What you can try
            </p>
            <ul className="mt-2 space-y-1.5 text-[11px] leading-5 text-ivory-200/40">
              <li>Ask the host whether the room is still open.</li>
              <li>Check that both browsers are online and allow WebRTC.</li>
              <li>Retry once — signaling can recover from a brief outage.</li>
            </ul>
          </div>

          <div className="mt-7 flex flex-col gap-2 sm:flex-row">
            {state.canRetry && (
              <Button
                onClick={actions.retry}
                icon={<RefreshCw className="h-4 w-4" />}
              >
                Try again
              </Button>
            )}
            <Button
              variant={state.canRetry ? 'secondary' : 'primary'}
              onClick={() => {
                actions.reset();
                onJoin();
              }}
              icon={<KeyRound className="h-4 w-4" />}
              trailingIcon={<ArrowRight className="h-3.5 w-3.5" />}
            >
              {isGuest ? 'Join another room' : 'Join a room'}
            </Button>
            <Button
              variant="ghost"
              onClick={() => {
                actions.reset();
                onHome();
              }}
              icon={<Home className="h-4 w-4" />}
            >
              Back home
            </Button>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
