import { useState } from 'react';
import {
  FlipVertical2,
  Flag,
  Handshake,
  Loader2,
  LogOut,
  RotateCcw,
  Sparkles,
  Undo2,
} from 'lucide-react';
import { useSession } from '../hooks/useSession';
import { Dialog } from './ui/Dialog';
import { Button } from './ui/Button';

type ConfirmAction = 'restart' | 'new-game' | 'resign' | 'end';

const confirmCopy: Record<
  ConfirmAction,
  { title: string; description: string; label: string; danger?: boolean }
> = {
  restart: {
    title: 'Request a restart?',
    description:
      'The board resets to the starting position and your opponent must accept.',
    label: 'Send restart request',
  },
  'new-game': {
    title: 'Start a new game?',
    description:
      'The board resets and colors are swapped. Your opponent must accept.',
    label: 'Send new game request',
  },
  resign: {
    title: 'Resign this game?',
    description:
      'Your opponent will win immediately. This cannot be undone and does not close the room.',
    label: 'Resign',
    danger: true,
  },
  end: {
    title: 'End the session?',
    description:
      'The peer connection closes, the temporary room disappears, and both players see the session-ended screen.',
    label: 'End session',
    danger: true,
  },
};

interface GameControlsProps {
  toggleFlip: () => void;
}

function ControlTile({
  icon,
  label,
  onClick,
  disabled,
  danger,
  title,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  disabled?: boolean;
  danger?: boolean;
  title?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title ?? label}
      className={`flex flex-col items-center gap-1.5 rounded-xl border px-2 py-2.5 transition disabled:cursor-not-allowed disabled:opacity-35 ${
        danger
          ? 'border-red-400/15 bg-red-400/[0.035] text-red-200/80 hover:border-red-400/30 hover:bg-red-400/[0.07]'
          : 'border-white/[0.06] bg-white/[0.02] text-ivory-200/65 hover:border-gold-400/25 hover:bg-white/[0.045] hover:text-ivory-50'
      }`}
    >
      {icon}
      <span className="text-[9.5px] font-semibold leading-none">{label}</span>
    </button>
  );
}

export function GameControls({ toggleFlip }: GameControlsProps) {
  const { state, actions } = useSession();
  const [confirm, setConfirm] = useState<ConfirmAction | null>(null);

  const connected = state.status === 'connected';
  const gameOver = !!state.snapshot.result;
  const hasHistory = state.snapshot.history.length > 0;
  const pending = !!(state.incomingRequest || state.outgoingRequest);

  const outgoingLabel =
    state.outgoingRequest?.requestType === 'undo'
      ? 'Undo request'
      : state.outgoingRequest?.requestType === 'restart'
        ? 'Restart request'
        : state.outgoingRequest?.requestType === 'new-game'
          ? 'New game request'
          : state.outgoingRequest?.requestType === 'mode'
            ? 'Rules change request'
            : 'Draw offer';

  const run = (action: ConfirmAction) => {
    if (action === 'restart') actions.requestAction('restart');
    if (action === 'new-game') actions.requestAction('new-game');
    if (action === 'resign') actions.resign();
    if (action === 'end') actions.endSession();
  };

  return (
    <div className="card p-4">
      <div className="flex items-center justify-between">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-ivory-200/35">
          Game controls
        </p>
        {pending && (
          <span className="inline-flex items-center gap-1.5 text-[9px] font-semibold text-gold-300/70">
            <Loader2 className="h-2.5 w-2.5 animate-spin" />
            {state.outgoingRequest ? outgoingLabel : 'Request pending'}
          </span>
        )}
      </div>

      <div className="mt-3 grid grid-cols-4 gap-1.5">
        <ControlTile
          icon={<Undo2 className="h-4 w-4" />}
          label="Undo"
          disabled={!connected || gameOver || !hasHistory || pending}
          onClick={() => actions.requestAction('undo')}
          title="Request an undo — your opponent must accept"
        />
        <ControlTile
          icon={<Handshake className="h-4 w-4" />}
          label="Draw"
          disabled={!connected || gameOver || pending}
          onClick={() => actions.offerDraw()}
          title="Offer a draw"
        />
        <ControlTile
          icon={<RotateCcw className="h-4 w-4" />}
          label="Restart"
          disabled={!connected || pending}
          onClick={() => setConfirm('restart')}
          title="Restart the game with both players' approval"
        />
        <ControlTile
          icon={<Sparkles className="h-4 w-4" />}
          label="New game"
          disabled={!connected || pending}
          onClick={() => setConfirm('new-game')}
          title="Reset the board and swap colors"
        />
        <ControlTile
          icon={<FlipVertical2 className="h-4 w-4" />}
          label="Flip"
          onClick={toggleFlip}
          title="Flip the board view"
        />
        <ControlTile
          icon={<Flag className="h-4 w-4" />}
          label="Resign"
          danger
          disabled={!connected || gameOver || pending}
          onClick={() => setConfirm('resign')}
        />
        <ControlTile
          icon={<LogOut className="h-4 w-4" />}
          label="End"
          danger
          onClick={() => setConfirm('end')}
          title="End the session and close the room"
        />
        <div className="flex flex-col items-center justify-center gap-1 rounded-xl border border-white/[0.04] bg-transparent px-1 text-center">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400/60" />
          <span className="text-[8px] font-semibold leading-tight text-ivory-200/25">
            {gameOver ? 'Review' : 'Live'}
          </span>
        </div>
      </div>

      <Dialog
        open={!!confirm}
        onClose={() => setConfirm(null)}
        title={confirm ? confirmCopy[confirm].title : ''}
        description={confirm ? confirmCopy[confirm].description : ''}
        footer={
          <>
            <Button variant="ghost" onClick={() => setConfirm(null)}>
              Cancel
            </Button>
            <Button
              variant={confirmCopy[confirm ?? 'end'].danger ? 'danger' : 'primary'}
              onClick={() => {
                if (confirm) run(confirm);
                setConfirm(null);
              }}
            >
              {confirm ? confirmCopy[confirm].label : 'Confirm'}
            </Button>
          </>
        }
      />
    </div>
  );
}
