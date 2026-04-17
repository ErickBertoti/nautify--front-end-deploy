import React from 'react';
import { cn } from '@/lib/utils';

interface GoogleAuthButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isLoading?: boolean;
  label?: string;
}

function GoogleIcon() {
  return (
    <svg className="block h-5 w-5" viewBox="0 0 48 48" aria-hidden="true">
      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
      <path fill="none" d="M0 0h48v48H0z" />
    </svg>
  );
}

export function GoogleAuthButton({
  isLoading = false,
  label = 'Continuar com Google',
  className,
  disabled,
  type = 'button',
  ...props
}: GoogleAuthButtonProps) {
  const isDisabled = disabled || isLoading;

  return (
    <button
      type={type}
      disabled={isDisabled}
      className={cn(
        'group relative box-border h-12 w-full overflow-hidden rounded-md border border-transparent px-3 select-none transition-[background-color,border-color,box-shadow,transform] duration-200',
        'bg-[#f2f2f2] text-[#1f1f1f] outline-none',
        'hover:-translate-y-0.5 hover:shadow-[0_1px_2px_0_rgba(60,64,67,0.3),0_1px_3px_1px_rgba(60,64,67,0.15)]',
        'focus-visible:ring-2 focus-visible:ring-[#001d35]/25 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent',
        'active:translate-y-0 active:scale-[0.98]',
        'disabled:cursor-default disabled:bg-[#ffffff61] disabled:text-[#1f1f1f]',
        className,
      )}
      {...props}
    >
      <span
        aria-hidden="true"
        className={cn(
          'pointer-events-none absolute inset-0 bg-[#001d35] opacity-0 transition-opacity duration-200',
          'group-hover:opacity-[0.08] group-focus-visible:opacity-[0.12] group-active:opacity-[0.12]',
          'group-disabled:bg-[#1f1f1f1f] group-disabled:opacity-100',
        )}
      />

      <span className="relative flex h-full w-full items-center justify-between">
        <span className={cn('flex min-w-5 items-center', isDisabled && 'opacity-[0.38]')}>
          {isLoading ? (
            <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24" aria-hidden="true">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          ) : (
            <GoogleIcon />
          )}
        </span>

        <span
          className={cn(
            'flex-1 overflow-hidden text-ellipsis whitespace-nowrap px-3 text-center text-[14px] font-medium tracking-[0.25px]',
            isDisabled && 'opacity-[0.38]',
          )}
          style={{ fontFamily: 'var(--font-sans)' }}
        >
          {label}
        </span>

        <span aria-hidden="true" className="w-5 shrink-0" />
      </span>
    </button>
  );
}
