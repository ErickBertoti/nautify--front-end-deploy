'use client';

import React, { useState } from 'react';
import { User } from 'lucide-react';
import { cn, getInitials } from '@/lib/utils';

interface UserAvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string | null;
  name?: string | null;
  size?: number;
  imgClassName?: string;
}

export function UserAvatar({
  src,
  name,
  size = 40,
  className,
  imgClassName,
  ...props
}: UserAvatarProps) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const initials = name?.trim() ? getInitials(name.trim()) : '';
  const showImage = Boolean(src) && failedSrc !== src;
  const fallbackTextSize = Math.max(Math.floor(size * 0.34), 12);
  const fallbackIconSize = Math.max(Math.floor(size * 0.45), 18);

  return (
    <div
      className={cn(
        'inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-nautify-100 text-nautify-700',
        className,
      )}
      style={{ width: size, height: size }}
      {...props}
    >
      {showImage ? (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
          src={src ?? undefined}
          alt={name ? `Foto de ${name}` : 'Foto de perfil'}
          className={cn('h-full w-full object-cover', imgClassName)}
          onError={() => setFailedSrc(src ?? null)}
          />
        </>
      ) : initials ? (
        <span
          className="font-semibold uppercase"
          style={{ fontSize: fallbackTextSize, lineHeight: 1 }}
          aria-hidden="true"
        >
          {initials}
        </span>
      ) : (
        <User
          className="text-nautify-700"
          style={{ width: fallbackIconSize, height: fallbackIconSize }}
          aria-hidden="true"
        />
      )}
    </div>
  );
}
