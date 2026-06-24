/**
 * MainMenu — replaces Source/Combination/Views/MainView.swift.
 *
 * Two actions: Resume (restore from localStorage) and New Game. App version
 * comes from Vite's `import.meta.env`.
 */
import { useState } from 'react';
import { useGameStore } from '@entities/game/model/gameStore';
import { useLocale } from '@shared/lib/useLocale';
import { Button } from '@shared/ui/Button/Button';
import { storage } from '@shared/lib/storage';
import { StatisticsModal } from './StatisticsModal';
import { SettingsModal } from './SettingsModal';
import { HowToPlayModal } from './HowToPlayModal';
import styles from './MainMenu.module.css';

interface Props {
  onStart: () => void;
}

const HAS_SAVE_KEY = 'gameState';
const TUTORIAL_SEEN_KEY = 'tutorialSeen';

export function MainMenu({ onStart }: Props) {
  const restore = useGameStore((s) => s.restoreSnapshot);
  const newGame = useGameStore((s) => s.newGame);
  const { t } = useLocale();
  const [showStats, setShowStats] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showHowToPlay, setShowHowToPlay] = useState(() => storage.get(TUTORIAL_SEEN_KEY) == null && !hasSave);

  const hasSave = storage.get(HAS_SAVE_KEY) != null;

  const closeHowToPlay = () => {
    storage.set(TUTORIAL_SEEN_KEY, true);
    setShowHowToPlay(false);
  };

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
        <h1 className={styles.title}>Myriades</h1>
        <p className={styles.subtitle}>{t.subtitle} v{__APP_VERSION__}</p>
      </header>

      <div className={styles.actions}>
        <Button variant="primary" onClick={handleNew}>{t.newGame}</Button>
        <Button variant="ghost" onClick={handleResume} disabled={!hasSave}>
          {hasSave ? t.resume : t.noSave}
        </Button>
        <Button variant="ghost" onClick={() => setShowStats(true)}>{t.statistics}</Button>
      </div>

      <footer className={styles.footer}>
        <Button variant="ghost" onClick={() => setShowHowToPlay(true)}>{t.howToPlayBtn}</Button>
        <Button variant="ghost" onClick={() => setShowSettings(true)}>{t.settings}</Button>
      </footer>
      {showStats && <StatisticsModal onClose={() => setShowStats(false)} />}
      {showSettings && <SettingsModal onClose={() => setShowSettings(false)} />}
      {showHowToPlay && <HowToPlayModal onClose={closeHowToPlay} />}
    </main>
  );
}
