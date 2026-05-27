/**
 * Replaces the inline "Game over / Retry" block from GameView.swift.
 * Quiet centered overlay with one action.
 */
import { useGameStore } from '@entities/game/model/gameStore';
import { Button } from '@shared/ui/Button/Button';
import styles from './GameOverOverlay.module.css';

interface Props {
  onBackToMenu: () => void;
}

export function GameOverOverlay({ onBackToMenu }: Props) {
  const score = useGameStore((s) => s.score);
  const newGame = useGameStore((s) => s.newGame);

  return (
    <div className={styles.overlay} role="alertdialog" aria-label="Game over">
      <div className={styles.card}>
        <span className={styles.label}>Game over</span>
        <span className={styles.score}>{score}</span>
        <div className={styles.actions}>
          <Button variant="primary" onClick={newGame}>Play again</Button>
          <Button variant="ghost" onClick={onBackToMenu}>Back to menu</Button>
        </div>
      </div>
    </div>
  );
}
