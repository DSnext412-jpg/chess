import { useEffect, useState, type FormEvent } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  ArrowRight,
  KeyRound,
  Link2,
  Loader2,
  ShieldCheck,
  UserRound,
  Wifi,
} from 'lucide-react';
import { Button } from './ui/Button';
import { Logo } from './ui/Logo';
import { useSession } from '../hooks/useSession';
import { isValidRoomCode, normalizeRoomCode } from '../lib/id';

interface JoinRoomProps {
  initialCode?: string;
  onBack: () => void;
}

const statusCopy = {
  connecting: 'Contacting the host through the signaling service…',
  waiting: 'Connected to the host. Waiting for the game to start…',
  reconnecting: 'The connection was interrupted. Reconnecting…',
  disconnected: 'The connection was lost. Cancel and try again.',
  idle: 'Preparing the peer connection…',
  connected: 'Connected. Opening the board…',
  error: 'The connection could not be established.',
};

function formatCode(value: string): string {
  return normalizeRoomCode(value);
}

export function JoinRoom({ initialCode = '', onBack }: JoinRoomProps) {
  const { state, actions } = useSession();
  const [code, setCode] = useState(() => formatCode(initialCode));
  const [name, setName] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);

  useEffect(() => {
    if (initialCode) {
      setCode(formatCode(initialCode));
    }
  }, [initialCode]);

  const submit = (event: FormEvent) => {
    event.preventDefault();
    const normalized = formatCode(code);
    if (!isValidRoomCode(normalized)) {
      setLocalError('Enter the six-character room code from your host.');
      return;
    }
    setLocalError(null);
    actions.joinRoom(normalized, name);
  };

  if (state.phase === 'joining') {
    return (
      <div className="relative flex min-h-screen flex-col overflow-hidden">
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute left-1/2 top-[10%] h-[420px] w-[560px] -translate-x-1/2 rounded-full bg-gold-500/[0.07] blur-[110px]" />
          <div className="bg-fine-grid absolute inset-0 opacity-25 [mask-image:radial-gradient(ellipse_at_center,black,transparent_70%)]" />
        </div>

        <header className="container-page flex h-20 items-center justify-between">
          <Logo link={false} />
          <button
            type="button"
            onClick={() => {
              actions.reset();
              onBack();
            }}
            className="inline-flex items-center gap-2 text-[12px] font-semibold text-ivory-200/55 transition hover:text-ivory-50"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Cancel
          </button>
        </header>

        <main className="container-page flex flex-1 items-center justify-center pb-20">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
            className="card-strong w-full max-w-md p-7 text-center sm:p-9"
          >
            <div className="relative mx-auto flex h-20 w-20 items-center justify-center">
              <span className="absolute inset-0 rounded-full border border-gold-400/20" />
              <span className="absolute inset-2 rounded-full border border-gold-400/10" />
              <Loader2 className="h-8 w-8 animate-spin text-gold-300" strokeWidth={1.5} />
            </div>
            <p className="eyebrow mt-6">Joining room</p>
            <p className="mt-2 font-mono text-4xl font-semibold tracking-[0.24em] text-ivory-50">
              {state.roomCode}
            </p>
            <p className="mx-auto mt-4 max-w-xs text-[13px] leading-6 text-ivory-200/50">
              {statusCopy[state.status]}
            </p>

            <div className="mt-7 rounded-xl border border-white/[0.07] bg-white/[0.025] p-4 text-left">
              <div className="flex items-start gap-3">
                <Wifi className="mt-0.5 h-4 w-4 shrink-0 text-gold-300/70" />
                <p className="text-[11px] leading-5 text-ivory-200/40">
                  A direct peer-to-peer connection is being negotiated. If your
                  network blocks WebRTC, the connection may time out — you will
                  see a clear error and can retry.
                </p>
              </div>
            </div>

            <Button
              variant="secondary"
              size="sm"
              className="mt-6"
              onClick={() => {
                actions.reset();
                onBack();
              }}
            >
              Cancel connection
            </Button>
          </motion.div>
        </main>
      </div>
    );
  }

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

      <main className="container-page grid gap-10 pb-20 pt-6 lg:grid-cols-[1fr_420px] lg:gap-16">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-xl"
        >
          <p className="eyebrow">Join session</p>
          <h1 className="mt-3 font-display text-5xl font-semibold leading-[0.95] text-ivory-50 sm:text-6xl">
            Meet your friend
            <br />
            <span className="text-gradient-gold italic">at the board.</span>
          </h1>
          <p className="mt-5 max-w-md text-sm leading-7 text-ivory-200/50">
            Enter the invitation code your host shared. You will play as Black,
            and the board will open from your side.
          </p>

          <form onSubmit={submit} className="mt-9 space-y-6">
            <div>
              <label htmlFor="room-code" className="field-label">
                Room code
              </label>
              <div className="relative">
                <KeyRound className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-ivory-200/30" />
                <input
                  id="room-code"
                  className="input h-14 pl-11 font-mono text-lg font-semibold uppercase tracking-[0.32em] placeholder:tracking-[0.28em]"
                  placeholder="7K4M9Q"
                  value={code}
                  onChange={(event) => {
                    setCode(formatCode(event.target.value));
                    setLocalError(null);
                  }}
                  maxLength={6}
                  autoComplete="off"
                  spellCheck={false}
                  autoFocus
                />
              </div>
              {initialCode && (
                <p className="mt-2 inline-flex items-center gap-1.5 text-[11px] text-gold-300/70">
                  <Link2 className="h-3 w-3" />
                  Invitation detected — the code is filled in.
                </p>
              )}
              {localError && (
                <p className="mt-2 text-[11px] text-red-300">{localError}</p>
              )}
            </div>

            <div>
              <label htmlFor="guest-name" className="field-label">
                Your display name
              </label>
              <div className="relative">
                <UserRound className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-ivory-200/30" />
                <input
                  id="guest-name"
                  className="input pl-11"
                  placeholder="e.g. Jamie"
                  maxLength={20}
                  autoComplete="off"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                />
              </div>
              <p className="mt-2 text-[11px] text-ivory-200/30">
                Optional. Only your opponent will see it.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <Button
                type="submit"
                size="lg"
                trailingIcon={<ArrowRight className="h-4 w-4" />}
              >
                Join room
              </Button>
              <span className="inline-flex items-center gap-2 text-[11px] text-ivory-200/30">
                <ShieldCheck className="h-3 w-3" />
                Only the host and you can connect
              </span>
            </div>
          </form>
        </motion.div>

        <motion.aside
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.55, delay: 0.1 }}
          className="card-strong relative h-fit overflow-hidden p-6"
        >
          <div className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full border border-gold-400/[0.08]" />
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-ivory-200/35">
            Before you join
          </p>
          <h2 className="mt-2 font-display text-2xl font-semibold text-ivory-50">
            What happens next
          </h2>
          <div className="mt-5 space-y-4">
            {[
              'We connect your browser directly to the host using WebRTC.',
              'The host is the source of truth for every move.',
              'If the host leaves, the temporary room is gone.',
              'Your name and room are never saved to a database.',
            ].map((text, index) => (
              <div key={text} className="flex gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-gold-400/20 bg-gold-400/[0.05] text-[10px] font-bold text-gold-300">
                  {index + 1}
                </span>
                <p className="text-[12px] leading-5 text-ivory-200/50">{text}</p>
              </div>
            ))}
          </div>
          <div className="divider my-5" />
          <div className="rounded-xl border border-white/[0.06] bg-black/20 p-4">
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-ivory-200/30">
              Tip
            </p>
            <p className="mt-2 text-[11.5px] leading-5 text-ivory-200/45">
              Both players should keep this tab open. Closing the page ends the
              temporary room and disconnects the game.
            </p>
          </div>
        </motion.aside>
      </main>
    </div>
  );
}
