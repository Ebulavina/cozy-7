/**
 * MainMenu — replaces Source/Combination/Views/MainView.swift.
 *
 * Two actions: Resume (restore from localStorage) and New Game. App version
 * comes from Vite's `import.meta.env`.
 */
import { useGameStore } from '@entities/game/model/gameStore';
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
        <h1 className={styles.title}>Combination</h1>
        <p className={styles.subtitle}>A quiet 7×7 match puzzle</p>
      </header>

      <div className={styles.actions}>
        <Button variant="primary" onClick={handleNew}>New game</Button>
        <Button variant="ghost" onClick={handleResume} disabled={!hasSave}>
          {hasSave ? 'Resume' : 'No saved game'}
        </Button>
      </div>

      <footer className={styles.footer}>
        v{__APP_VERSION__}
      </footer>
    </main>
  );
}
