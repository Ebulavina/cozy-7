/**
 * MainMenu — replaces Source/Combination/Views/MainView.swift.
 *
 * Two actions: Resume (restore from localStorage) and New Game. App version
 * comes from Vite's `import.meta.env`.
 */
import { useGameStore } from '@entities/game/model/gameStore';
import { useTheme } from '@shared/lib/useTheme';
import { useLocale } from '@shared/lib/useLocale';
import { Button } from '@shared/ui/Button/Button';
import { storage } from '@shared/lib/storage';
import styles from './MainMenu.module.css';

interface Props {
  onStart: () => void;
}

const HAS_SAVE_KEY = 'gameState';

export function MainMenu({ onStart }: Props) {
  const restore = useGameStore((s) => s.restoreSnapshot);
  const newGame = useGameStore((s) => s.newGame);
  const { theme, toggle } = useTheme();
  const { t, toggleLocale } = useLocale();

  const hasSave = storage.get(HAS_SAVE_KEY) != null;

  const handleResume = () => {
    if (restore()) onStart();
  };

  const handleNew = () => {
    newGame();
    onStart();
  };

  return (
    <main className={styles.menu}>
      <header className={styles.header}>
        <h1 className={styles.title}>Cozy 7</h1>
        <p className={styles.subtitle}>{t.subtitle}</p>
      </header>

      <div className={styles.actions}>
        <Button variant="primary" onClick={handleNew}>{t.newGame}</Button>
        <Button variant="ghost" onClick={handleResume} disabled={!hasSave}>
          {hasSave ? t.resume : t.noSave}
        </Button>
      </div>

      <footer className={styles.footer}>
        <Button className={styles.buttonTheme} variant="ghost" onClick={toggle}>
          {t.toggleTheme}
          <span>{theme === 'dark' ? '☀' : '☾'}</span>
        </Button>
        <Button variant="ghost" onClick={toggleLocale}>{t.toggleLocale}</Button>
        v{__APP_VERSION__}
      </footer>
    </main>
  );
}
