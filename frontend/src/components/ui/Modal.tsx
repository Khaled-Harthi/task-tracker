'use client';

import { forwardRef, HTMLAttributes, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { overlayVariants, modalVariants } from '@/lib/motion';
import { X } from 'lucide-react';

interface ModalProps extends HTMLAttributes<HTMLDivElement> {
  open: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const Modal = forwardRef<HTMLDivElement, ModalProps>(
  ({ className, open, onClose, title, description, size = 'md', children, ...props }, ref) => {
    // Close on escape key
    useEffect(() => {
      const handleEscape = (e: KeyboardEvent) => {
        if (e.key === 'Escape') onClose();
      };
      if (open) {
        document.addEventListener('keydown', handleEscape);
        document.body.style.overflow = 'hidden';
      }
      return () => {
        document.removeEventListener('keydown', handleEscape);
        document.body.style.overflow = 'unset';
      };
    }, [open, onClose]);

    const sizes = {
      sm: 'max-w-sm',
      md: 'max-w-md',
      lg: 'max-w-lg',
      xl: 'max-w-xl',
    };

    return (
      <AnimatePresence>
        {open && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Overlay */}
            <motion.div
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              variants={overlayVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              onClick={onClose}
            />

            {/* Modal */}
            <motion.div
              ref={ref}
              className={cn(
                'relative w-full bg-surface border border-surface-light rounded-2xl shadow-2xl',
                'overflow-hidden',
                sizes[size],
                className
              )}
              variants={modalVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              {...props}
            >
              {/* Coral glow effect at top */}
              <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-coral-500/50 to-transparent" />

              {/* Header */}
              {(title || description) && (
                <div className="px-6 pt-6 pb-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      {title && (
                        <h2 className="text-xl font-semibold text-text-primary">{title}</h2>
                      )}
                      {description && (
                        <p className="mt-1 text-sm text-text-secondary">{description}</p>
                      )}
                    </div>
                    <button
                      onClick={onClose}
                      className="p-2 rounded-lg text-text-muted hover:text-text-primary hover:bg-surface-light transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              )}

              {/* Content */}
              <div className={cn('px-6 pb-6', !title && !description && 'pt-6')}>
                {children}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    );
  }
);

Modal.displayName = 'Modal';

// Modal Footer for actions
interface ModalFooterProps extends HTMLAttributes<HTMLDivElement> {}

const ModalFooter = forwardRef<HTMLDivElement, ModalFooterProps>(
  ({ className, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'flex items-center justify-end gap-3 pt-4 mt-4 border-t border-surface-light',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
);

ModalFooter.displayName = 'ModalFooter';

export { Modal, ModalFooter };
