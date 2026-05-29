/**
 * Replaces the inline "Game over / Retry" block from GameView.swift.
 * Quiet centered overlay with one action.
 */
import { useGameStore } from '@entities/game/model/gameStore';
import { useLocale } from '@shared/lib/useLocale';
import { Button } from '@shared/ui/Button/Button';
import styles from './GameOverOverlay.module.css';

interface Props {
  onBackToMenu: () => void;
}

export function GameOverOverlay({ onBackToMenu }: Props) {
  const score = useGameStore((s) => s.score);
  const newGame = useGameStore((s) => s.newGame);
  const { t } = useLocale();

  return (
    <div className={styles.overlay} role="alertdialog" aria-label={t.gameOver}>
      <div className={styles.card}>
        <span className={styles.label}>{t.gameOver}</span>
        <span className={styles.score}>{score}</span>
        <div className={styles.actions}>
          <Button variant="primary" onClick={newGame}>{t.playAgain}</Button>
          <Button variant="ghost" onClick={onBackToMenu}>{t.backToMenuBtn}</Button>
        </div>
      </div>
    </div>
  );
}
