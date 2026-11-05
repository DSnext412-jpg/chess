import { AnimatePresence, motion } from 'framer-motion';
import { AlertTriangle, CheckCircle2, Info, X } from 'lucide-react';
import type { SessionNotice } from '../../session/SessionManager';

interface ToastProps {
  notice: SessionNotice | null;
  onDismiss: () => void;
}

const config = {
  info: {
    icon: Info,
    className: 'border-white/10 bg-ink-800/95 text-ivory-100',
    iconClass: 'text-gold-300',
  },
  success: {
    icon: CheckCircle2,
    className: 'border-emerald-400/25 bg-[#0f1d18]/95 text-emerald-50',
    iconClass: 'text-emerald-300',
  },
  error: {
    icon: AlertTriangle,
    className: 'border-red-400/25 bg-[#1d1010]/95 text-red-50',
    iconClass: 'text-red-300',
  },
} as const;

export function Toast({ notice, onDismiss }: ToastProps) {
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-5 z-[120] flex justify-center px-4">
      <AnimatePresence>
        {notice && (
          <motion.div
            key={notice.id}
            initial={{ opacity: 0, y: 20, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            className={`pointer-events-auto flex max-w-md items-center gap-3 rounded-2xl border px-4 py-3 shadow-2xl backdrop-blur-md ${
              config[notice.tone].className
            }`}
          >
            {(() => {
              const Icon = config[notice.tone].icon;
              return (
                <Icon
                  className={`h-4 w-4 shrink-0 ${config[notice.tone].iconClass}`}
                />
              );
            })()}
            <p className="text-[13px] font-medium leading-snug">
              {notice.message}
            </p>
            <button
              type="button"
              onClick={onDismiss}
              className="ml-1 shrink-0 rounded-full p-1 text-current opacity-50 transition hover:opacity-100"
              aria-label="Dismiss notification"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
