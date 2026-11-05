import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Check,
  Clock,
  Copy,
  Crown,
  Link2,
  LogOut,
  Share2,
  ShieldCheck,
  Sparkles,
  Swords,
  UserRound,
} from 'lucide-react';
import type { MovementMode } from '../types/chess';
import type { SessionState } from '../session/SessionManager';
import { Button } from './ui/Button';
import { Dialog } from './ui/Dialog';
import { Logo } from './ui/Logo';
import { ConnectionBadge } from './ui/ConnectionBadge';
import { ChessPiece } from './ChessPiece';
import { PIECE_THEMES } from '../lib/themes';
import { copyText } from '../lib/clipboard';
import { useSession } from '../hooks/useSession';

interface WaitingRoomProps {
  state: SessionState;
}

export function WaitingRoom({ state }: WaitingRoomProps) {
  const { actions } = useSession();
  const [copied, setCopied] = useState<'code' | 'link' | null>(null);
  const [confirmClose, setConfirmClose] = useState(false);

  const link = actions.getInviteLink();
  const isFree = state.snapshot.mode === 'free';

  const copy = async (kind: 'code' | 'link') => {
    const value = kind === 'code' ? state.roomCode ?? '' : link;
    const ok = await copyText(value);
    if (ok) {
      setCopied(kind);
      setTimeout(() => setCopied(null), 1800);
    }
  };

  const share = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Chess Session',
          text: `Join my private chess room ${state.roomCode}`,
          url: link,
        });
        return;
      } catch {
        /* fall back to copy */
      }
    }
    void copy('link');
  };

  const changeMode = (mode: MovementMode) => {
    actions.changeWaitingMode(mode);
  };

  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-[6%] h-[480px] w-[640px] -translate-x-1/2 rounded-full bg-gold-500/[0.07] blur-[120px]" />
        <div className="bg-fine-grid absolute inset-0 opacity-25 [mask-image:radial-gradient(ellipse_at_top,black,transparent_72%)]" />
      </div>

      <header className="container-page flex h-20 items-center justify-between">
        <Logo link={false} />
        <div className="flex items-center gap-3">
          <ConnectionBadge status={state.status} />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setConfirmClose(true)}
            icon={<LogOut className="h-3.5 w-3.5" />}
          >
            Close room
          </Button>
        </div>
      </header>

      <main className="container-page pb-20 pt-4">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mx-auto max-w-3xl text-center"
        >
          <p className="eyebrow">Room created</p>
          <h1 className="mt-3 font-display text-5xl font-semibold leading-[0.95] text-ivory-50 sm:text-6xl">
            Send the invitation.
            <br />
            <span className="text-gradient-gold italic">I&apos;ll hold the board.</span>
          </h1>
          <p className="mx-auto mt-4 max-w-md text-sm leading-6 text-ivory-200/45">
            Your temporary room is open. Share the code or link with one friend.
            The game starts the moment they join.
          </p>
        </motion.div>

        <div className="mx-auto mt-10 grid max-w-4xl gap-4 lg:grid-cols-[1.15fr_0.85fr]">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.08 }}
            className="card-strong relative overflow-hidden p-6 sm:p-8"
          >
            <div className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full border border-gold-400/[0.08]" />
            <div className="pointer-events-none absolute -right-10 -top-12 h-40 w-40 rounded-full border border-gold-400/[0.055]" />

            <div className="flex items-center justify-between">
              <span className="chip">
                <Clock className="h-3 w-3 text-gold-300" />
                Waiting for opponent
              </span>
              <span className="inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-ivory-200/30">
                <ShieldCheck className="h-3 w-3" />
                Temporary
              </span>
            </div>

            <p className="mt-8 text-center text-[10px] font-bold uppercase tracking-[0.24em] text-ivory-200/35">
              Room code
            </p>
            <button
              type="button"
              onClick={() => void copy('code')}
              className="group mx-auto mt-2 flex items-center justify-center gap-3"
              title="Copy room code"
            >
              <span className="font-mono text-[42px] font-semibold leading-none tracking-[0.24em] text-ivory-50 sm:text-[52px]">
                {state.roomCode ?? '······'}
              </span>
              <span className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-ivory-200/50 transition group-hover:border-gold-400/30 group-hover:text-gold-300">
                {copied === 'code' ? (
                  <Check className="h-4 w-4 text-emerald-300" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </span>
            </button>

            <div className="mt-7">
              <label className="field-label" htmlFor="invite-link">
                Invitation link
              </label>
              <div className="flex gap-2">
                <input
                  id="invite-link"
                  readOnly
                  value={link}
                  className="input h-11 flex-1 truncate bg-black/30 font-mono text-[11px] tracking-tight text-ivory-200/60"
                  onFocus={(event) => event.currentTarget.select()}
                />
                <Button
                  variant="secondary"
                  size="sm"
                  className="h-11 shrink-0 rounded-xl"
                  onClick={() => void copy('link')}
                  icon={
                    copied === 'link' ? (
                      <Check className="h-3.5 w-3.5 text-emerald-300" />
                    ) : (
                      <Link2 className="h-3.5 w-3.5" />
                    )
                  }
                >
                  {copied === 'link' ? 'Copied' : 'Copy'}
                </Button>
              </div>
            </div>

            <div className="mt-4 flex flex-col gap-2 sm:flex-row">
              <Button
                fullWidth
                variant="secondary"
                size="sm"
                onClick={() => void share()}
                icon={<Share2 className="h-3.5 w-3.5" />}
              >
                Share invitation
              </Button>
              <Button
                fullWidth
                variant="ghost"
                size="sm"
                onClick={() => void copy('code')}
                icon={<Copy className="h-3.5 w-3.5" />}
              >
                Copy code
              </Button>
            </div>

            <div className="divider my-6" />

            <div className="flex items-center gap-3">
              <span className="relative flex h-2.5 w-2.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-gold-300 opacity-50" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-gold-300" />
              </span>
              <p className="text-[11.5px] text-ivory-200/40">
                {state.status === 'reconnecting'
                  ? 'Reconnecting to the signaling service…'
                  : 'Keep this tab open. The board will appear automatically.'}
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="space-y-4"
          >
            <div className="card p-5">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-ivory-200/35">
                Players
              </p>
              <div className="mt-4 space-y-3">
                <div className="flex items-center justify-between rounded-xl border border-white/[0.06] bg-white/[0.025] p-3">
                  <div className="flex items-center gap-3">
                    <span className="flex h-9 w-9 items-center justify-center rounded-full border border-gold-400/25 bg-gold-400/10 text-gold-300">
                      <Crown className="h-4 w-4" />
                    </span>
                    <div>
                      <p className="text-[12px] font-semibold text-ivory-50">
                        {state.hostName}
                      </p>
                      <p className="text-[10px] text-ivory-200/35">
                        White · Host
                      </p>
                    </div>
                  </div>
                  <span className="flex items-center gap-1.5 text-[10px] font-semibold text-emerald-300/80">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                    Online
                  </span>
                </div>

                <div className="flex items-center justify-between rounded-xl border border-dashed border-white/[0.08] bg-transparent p-3">
                  <div className="flex items-center gap-3">
                    <span className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/[0.03] text-ivory-200/30">
                      <UserRound className="h-4 w-4" />
                    </span>
                    <div>
                      <p className="text-[12px] font-semibold text-ivory-200/55">
                        Waiting for opponent
                      </p>
                      <p className="text-[10px] text-ivory-200/30">Black</p>
                    </div>
                  </div>
                  <span className="flex items-center gap-1.5 text-[10px] font-semibold text-ivory-200/30">
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-gold-300/70" />
                    Pending
                  </span>
                </div>
              </div>
            </div>

            <div className="card p-5">
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-ivory-200/35">
                  Movement rules
                </p>
                <span className="chip">
                  {isFree ? (
                    <Sparkles className="h-3 w-3 text-emerald-300/70" />
                  ) : (
                    <Swords className="h-3 w-3 text-gold-300" />
                  )}
                  {isFree ? 'Free' : 'Standard'}
                </span>
              </div>
              <p className="mt-3 text-[11.5px] leading-5 text-ivory-200/45">
                {isFree
                  ? 'Any piece can move anywhere, on any turn. Displaced pieces count as captured.'
                  : 'Regulation chess: legal moves, checks, castling, promotion and draw rules.'}
              </p>
              <div className="mt-4 grid grid-cols-2 gap-2">
                {(
                  [
                    ['standard', 'Standard'],
                    ['free', 'Free'],
                  ] as const
                ).map(([mode, label]) => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => changeMode(mode)}
                    className={`rounded-lg border px-3 py-2 text-[11px] font-semibold transition ${
                      state.snapshot.mode === mode
                        ? 'border-gold-400/35 bg-gold-400/[0.08] text-gold-200'
                        : 'border-white/[0.07] bg-white/[0.02] text-ivory-200/45 hover:border-white/15'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
              <p className="mt-2 text-[10px] leading-4 text-ivory-200/25">
                You can change rules until your opponent joins.
              </p>
            </div>

            <div className="flex items-center justify-center gap-4 rounded-2xl border border-white/[0.05] bg-black/20 p-4">
              <ChessPiece
                type="p"
                color="w"
                theme={PIECE_THEMES.ivory}
                className="h-10 w-10 opacity-60"
              />
              <ChessPiece
                type="k"
                color="b"
                theme={PIECE_THEMES.ivory}
                className="h-12 w-12 opacity-70"
              />
              <ChessPiece
                type="p"
                color="w"
                theme={PIECE_THEMES.ivory}
                className="h-10 w-10 opacity-60"
              />
            </div>
          </motion.div>
        </div>
      </main>

      <Dialog
        open={confirmClose}
        onClose={() => setConfirmClose(false)}
        title="Close this room?"
        description="The temporary room will disappear and the invitation will stop working."
        footer={
          <>
            <Button variant="ghost" onClick={() => setConfirmClose(false)}>
              Keep waiting
            </Button>
            <Button
              variant="danger"
              onClick={() => {
                setConfirmClose(false);
                actions.endSession();
              }}
              icon={<LogOut className="h-4 w-4" />}
            >
              Close room
            </Button>
          </>
        }
      />
    </div>
  );
}
