import { useCallback, useEffect, useState } from 'react';

type Theme = 'light' | 'dark' | 'neon';

const KEY = 'theme';

const _initial = localStorage.getItem(KEY) as Theme | null;
if (_initial) document.documentElement.dataset.theme = _initial;

function systemTheme(): Theme {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

const CYCLE: Theme[] = ['light', 'dark', 'neon'];

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(() => {
    return (localStorage.getItem(KEY) as Theme | null) ?? systemTheme();
  });

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem(KEY, theme);
  }, [theme]);

  const toggle = useCallback(() => setTheme(t => {
    const next = CYCLE[(CYCLE.indexOf(t) + 1) % CYCLE.length];
    return next;
  }), []);

  return { theme, toggle };
}