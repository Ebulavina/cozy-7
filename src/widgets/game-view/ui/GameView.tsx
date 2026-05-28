/**
 * GameView — replaces Source/Combination/Views/GameView.swift.
 *
 * Stacks the HUD over the Board and lets popups float upward over the grid.
 * GameOverOverlay appears when isGameOver flips true (Store.isGameOver).
 */
import { useGameStore } from '@entities/game/model/gameStore';
import { useTheme } from '@shared/lib/useTheme';
import { Board } from './Board';
import { Hud } from './Hud';
import { GameOverOverlay } from './GameOverOverlay';
import { ScorePopups } from './ScorePopups';
import { Button } from '@shared/ui/Button/Button';
import { StepBar } from '@shared/ui/StepBar/StepBar';
import styles from './GameView.module.css';

interface Props {
  onBack: () => void;
}

export function GameView({ onBack }: Props) {
  const isGameOver = useGameStore((s) => s.isGameOver);
  const stepsSinceShift = useGameStore((s) => s.stepsSinceShift);
  const stepsPerShift = useGameStore((s) => s.stepsPerShift);
  const { theme, toggle } = useTheme();

  return (
    <main className={styles.view}>
      <nav className={styles.topNav}>
        <Button variant="ghost" onClick={onBack} aria-label="Back to menu">
          ← Menu
        </Button>
        <Button className={styles.buttonTheme} variant="ghost" onClick={toggle} aria-label="Toggle theme">
          {theme === 'dark' ? '☀' : '☾'}
        </Button>
      </nav>
      <Hud />
      <div className={styles.boardArea}>
        <Board />
        <ScorePopups />
      </div>
      <StepBar
        value={stepsSinceShift}
        total={stepsPerShift}
        ariaLabel="Moves until next bottom row"
      />
      {isGameOver ? <GameOverOverlay onBackToMenu={onBack} /> : null}
    </main>
  );
}
