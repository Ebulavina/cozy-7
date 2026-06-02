/**
 * Replaces the inline "Game over / Retry" block from GameView.swift.
 * Quiet centered overlay with one action.
 */
import { useGameStore } from '@entities/game/model/gameStore';
import { useLocale } from '@shared/lib/useLocale';
import { Button } from '@shared/ui/Button/Button';
import { Modal } from '@shared/ui/Modal/Modal';
import styles from './GameOverOverlay.module.css';

interface Props {
  onBackToMenu: () => void;
}

export function GameOverOverlay({ onBackToMenu }: Props) {
  const score = useGameStore((s) => s.score);
  const newGame = useGameStore((s) => s.newGame);
  const bestScore = useGameStore((s) => s.bestScore);
  const { t } = useLocale();

  return (
    <Modal role="alertdialog" aria-label={t.gameOver}>
      <span className={styles.label}>
        {bestScore < score ? t.newRecord : t.gameOver}
        {bestScore < score && <div className={styles.newRecord}>🎉</div>}
      </span>
      <span className={styles.score}>{score}</span>
      <div className={styles.actions}>
        <Button variant="primary" onClick={newGame}>{t.playAgain}</Button>
        <Button variant="ghost" onClick={onBackToMenu}>{t.backToMenuBtn}</Button>
      </div>
    </Modal>
  );
}
