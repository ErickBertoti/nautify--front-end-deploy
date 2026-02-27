'use client';

import { usePathname } from 'next/navigation';
import { useState } from 'react';

export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [prevPath, setPrevPath] = useState(pathname);
  const [animating, setAnimating] = useState(false);

  if (prevPath !== pathname) {
    setPrevPath(pathname);
    setAnimating(true);
  }

  return (
    <div
      className={animating ? 'animate-page-fade-in' : ''}
      onAnimationEnd={() => setAnimating(false)}
    >
      {children}
    </div>
  );
}
