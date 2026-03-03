'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { getPasswordStrength } from '@/lib/validators';
import { Check, X } from 'lucide-react';

interface PasswordStrengthBarProps {
  password: string;
  className?: string;
}

export function PasswordStrengthBar({ password, className }: PasswordStrengthBarProps) {
  const { score, label, color, checks } = getPasswordStrength(password);

  if (!password) return null;

  const requirements = [
    { key: 'minLength', label: 'Mínimo 8 caracteres', met: checks.minLength },
    { key: 'hasUpper', label: 'Letra maiúscula', met: checks.hasUpper },
    { key: 'hasLower', label: 'Letra minúscula', met: checks.hasLower },
    { key: 'hasNumber', label: 'Número', met: checks.hasNumber },
    { key: 'hasSpecial', label: 'Caractere especial', met: checks.hasSpecial },
  ];

  return (
    <div className={cn('space-y-2', className)}>
      {/* Strength bar */}
      <div className="flex items-center gap-2">
        <div className="flex-1 flex gap-1">
          {[1, 2, 3, 4, 5].map((level) => (
            <div
              key={level}
              className={cn(
                'h-1.5 flex-1 rounded-full transition-all duration-300',
                score >= level ? color : 'bg-muted'
              )}
            />
          ))}
        </div>
        {label && (
          <span className="text-xs font-medium text-muted-foreground whitespace-nowrap">
            {label}
          </span>
        )}
      </div>

      {/* Requirements grid */}
      <div className="grid grid-cols-2 gap-x-3 gap-y-1">
        {requirements.map((req) => (
          <div key={req.key} className="flex items-center gap-1.5">
            {req.met ? (
              <Check className="h-3 w-3 text-emerald-500 shrink-0" />
            ) : (
              <X className="h-3 w-3 text-muted-foreground/50 shrink-0" />
            )}
            <span
              className={cn(
                'text-[11px] transition-colors',
                req.met ? 'text-emerald-600' : 'text-muted-foreground'
              )}
            >
              {req.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
