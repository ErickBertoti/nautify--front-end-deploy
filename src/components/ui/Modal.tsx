'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  className?: string;
  bodyClassName?: string;
  footer?: React.ReactNode;
  children: React.ReactNode;
}

export function Modal({ isOpen, onClose, title, description, className, bodyClassName, footer, children }: ModalProps) {
  const [visible, setVisible] = useState(false);

  // React recommended pattern: adjust state during render when props change
  // https://react.dev/learn/you-might-not-need-an-effect#adjusting-some-state-when-a-prop-changes
  if (isOpen && !visible) {
    setVisible(true);
  }

  // Derive closing state: modal is still mounted but isOpen is false
  const isClosing = visible && !isOpen;

  // Handle closing animation delay and body overflow side effects
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = '';
      };
    }

    if (visible) {
      // Closing: wait for animation to finish, then unmount
      const timer = setTimeout(() => {
        setVisible(false);
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [isOpen, visible]);

  const handleClose = useCallback(() => {
    onClose();
  }, [onClose]);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [handleClose]);

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      <div
        className={cn(
          'fixed inset-0 bg-black/50 backdrop-blur-sm',
          isClosing ? 'animate-backdrop-out' : 'animate-backdrop-in'
        )}
        onClick={handleClose}
      />
      <div
        className={cn(
          'relative z-50 flex max-h-[100dvh] w-full flex-col overflow-hidden border border-border/50 bg-card/95 backdrop-blur-md shadow-2xl',
          'rounded-t-[1.75rem] sm:mx-4 sm:max-h-[85vh] sm:max-w-lg sm:rounded-xl',
          'before:absolute before:inset-x-0 before:top-0 before:h-[2px] before:bg-gradient-to-r before:from-transparent before:via-accent-gold/40 before:to-transparent',
          isClosing ? 'animate-modal-out' : 'animate-modal-in',
          className
        )}
      >
        <div className="mx-auto mt-3 h-1.5 w-12 rounded-full bg-white/10 sm:hidden" />
        {(title || description) && (
          <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-border/60 bg-card/95 px-4 pb-3 pt-4 backdrop-blur-md sm:px-6 sm:pb-2 sm:pt-6">
            <div>
              {title && <h2 className="text-xl font-bold text-foreground !font-heading">{title}</h2>}
              {description && <p className="text-sm text-muted-foreground mt-1">{description}</p>}
            </div>
            <button
              onClick={handleClose}
              className="rounded-lg p-1 text-muted-foreground hover:bg-accent hover:text-foreground transition-colors cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        )}
        <div className={cn('flex-1 overflow-y-auto px-4 pb-4 pt-3 sm:px-6 sm:pb-6 sm:pt-4', bodyClassName)}>
          {children}
        </div>
        {footer && (
          <div className="sticky bottom-0 z-10 border-t border-border/60 bg-card/95 px-4 py-4 backdrop-blur-md sm:px-6">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
