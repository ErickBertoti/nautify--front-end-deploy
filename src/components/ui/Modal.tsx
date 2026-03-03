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
  children: React.ReactNode;
}

export function Modal({ isOpen, onClose, title, description, className, children }: ModalProps) {
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
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className={cn(
          'fixed inset-0 bg-black/50 backdrop-blur-sm',
          isClosing ? 'animate-backdrop-out' : 'animate-backdrop-in'
        )}
        onClick={handleClose}
      />
      <div
        className={cn(
          'relative z-50 w-full max-w-lg mx-4 sm:mx-auto rounded-xl bg-card/95 backdrop-blur-md border border-border/50 shadow-2xl',
          'max-h-[85vh] overflow-y-auto',
          'before:absolute before:inset-x-0 before:top-0 before:h-[2px] before:bg-gradient-to-r before:from-transparent before:via-accent-gold/40 before:to-transparent',
          isClosing ? 'animate-modal-out' : 'animate-modal-in',
          className
        )}
      >
        {(title || description) && (
          <div className="flex items-start justify-between px-6 pt-6 pb-2">
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
        <div className="px-6 pb-6 pt-2">{children}</div>
      </div>
    </div>
  );
}
