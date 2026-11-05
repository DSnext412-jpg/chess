import { useEffect, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';

interface DialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children?: ReactNode;
  footer?: ReactNode;
  dismissible?: boolean;
  widthClass?: string;
}

export function Dialog({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  dismissible = true,
  widthClass = 'max-w-lg',
}: DialogProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && dismissible) onClose();
    };
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener('keydown', onKey);
    };
  }, [open, dismissible, onClose]);

  if (typeof document === 'undefined') return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-end justify-center p-4 sm:items-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
        >
          <div
            className="absolute inset-0 bg-black/75 backdrop-blur-sm"
            onClick={() => dismissible && onClose()}
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={title}
            className={`card-strong relative w-full ${widthClass} overflow-hidden rounded-3xl`}
            initial={{ opacity: 0, y: 24, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 360, damping: 30 }}
          >
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold-400/40 to-transparent" />
            <div className="flex items-start justify-between gap-4 px-6 pb-2 pt-6">
              <div>
                <h2 className="font-display text-3xl font-semibold leading-none text-ivory-50">
                  {title}
                </h2>
                {description && (
                  <p className="mt-2 text-sm leading-relaxed text-ivory-200/55">
                    {description}
                  </p>
                )}
              </div>
              {dismissible && (
                <button
                  type="button"
                  className="icon-btn -mr-1 -mt-1 shrink-0"
                  onClick={onClose}
                  aria-label="Close dialog"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            {children && <div className="px-6 py-4">{children}</div>}
            {footer && (
              <div className="flex flex-col-reverse gap-2 border-t border-white/[0.06] bg-black/20 px-6 py-4 sm:flex-row sm:justify-end">
                {footer}
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
