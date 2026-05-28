import { useCallback, useEffect, useState } from 'react';

type Theme = 'light' | 'dark';

const KEY = 'theme';

// Apply stored preference synchronously on module load — avoids flash on reload.
const _initial = localStorage.getItem(KEY) as Theme | null;
if (_initial) document.documentElement.dataset.theme = _initial;

function systemTheme(): Theme {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(() => {
    return (localStorage.getItem(KEY) as Theme | null) ?? systemTheme();
  });

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem(KEY, theme);
  }, [theme]);

  const toggle = useCallback(() => setTheme(t => (t === 'dark' ? 'light' : 'dark')), []);

  return { theme, toggle };
}