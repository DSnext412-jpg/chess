import { Radio } from 'lucide-react';
import type { ConnectionStatus } from '../../types/protocol';

const labels: Record<ConnectionStatus, string> = {
  idle: 'Offline',
  connecting: 'Connecting',
  waiting: 'Waiting for opponent',
  connected: 'Connected',
  reconnecting: 'Reconnecting',
  disconnected: 'Disconnected',
  error: 'Connection error',
};

const dotColor: Record<ConnectionStatus, string> = {
  idle: 'bg-white/30',
  connecting: 'bg-gold-300 animate-pulse',
  waiting: 'bg-gold-300 animate-pulse',
  connected: 'bg-emerald-400',
  reconnecting: 'bg-amber-400 animate-pulse',
  disconnected: 'bg-red-400',
  error: 'bg-red-400',
};

export function ConnectionBadge({
  status,
  compact = false,
}: {
  status: ConnectionStatus;
  compact?: boolean;
}) {
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-[11px] font-semibold tracking-wide ${
        status === 'connected'
          ? 'text-emerald-200/90'
          : status === 'disconnected' || status === 'error'
            ? 'text-red-200/90'
            : 'text-ivory-200/70'
      }`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${dotColor[status]}`} />
      {!compact && <span>{labels[status]}</span>}
      {compact && <Radio className="h-3 w-3" />}
    </span>
  );
}
