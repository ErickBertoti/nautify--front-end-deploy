'use client';

import { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark' | 'system';
type ResolvedTheme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  resolvedTheme: ResolvedTheme;
  mounted: boolean;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: 'system',
  resolvedTheme: 'light',
  mounted: false,
  setTheme: () => {},
});

export function useTheme() {
  return useContext(ThemeContext);
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>('system');
  const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>('light');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const storedTheme = (localStorage.getItem('nautify-theme') as Theme | null) || 'system';
    setTheme(storedTheme);
    setMounted(true);
  }, []);

  useEffect(() => {
    const root = document.documentElement;

    function getResolvedTheme(t: Theme): ResolvedTheme {
      if (t === 'system') {
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      }
      return t;
    }

    function applyTheme(t: Theme) {
      const nextResolvedTheme = getResolvedTheme(t);
      setResolvedTheme(nextResolvedTheme);

      if (t === 'system') {
        root.classList.toggle('dark', nextResolvedTheme === 'dark');
      } else {
        root.classList.toggle('dark', t === 'dark');
      }
    }

    applyTheme(theme);
    localStorage.setItem('nautify-theme', theme);

    if (theme === 'system') {
      const mq = window.matchMedia('(prefers-color-scheme: dark)');
      const handler = () => applyTheme('system');
      mq.addEventListener('change', handler);
      return () => mq.removeEventListener('change', handler);
    }
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme, mounted, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}
