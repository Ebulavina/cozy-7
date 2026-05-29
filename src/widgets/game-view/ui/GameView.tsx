/**
 * GameView — replaces Source/Combination/Views/GameView.swift.
 *
 * Stacks the HUD over the Board and lets popups float upward over the grid.
 * GameOverOverlay appears when isGameOver flips true (Store.isGameOver).
 */
import { useGameStore } from '@entities/game/model/gameStore';
import { useLocale } from '@shared/lib/useLocale';
import { Board } from './Board';
import { Hud } from './Hud';
import { GameOverOverlay } from './GameOverOverlay';
import { ScorePopups } from './ScorePopups';
import { StepBar } from '@shared/ui/StepBar/StepBar';
import styles from './GameView.module.css';

interface Props {
  onBack: () => void;
}

export function GameView({ onBack }: Props) {
  const isGameOver = useGameStore((s) => s.isGameOver);
  const stepsSinceShift = useGameStore((s) => s.stepsSinceShift);
  const stepsPerShift = useGameStore((s) => s.stepsPerShift);
  const { t } = useLocale();
  return (
    <main className={styles.view}>
      <Hud onBack={onBack} />
      <div className={styles.boardArea}>
        <Board />
        <ScorePopups />
      </div>
      <StepBar
        value={stepsSinceShift}
        total={stepsPerShift}
        ariaLabel={t.movesAriaLabel}
      />
      {isGameOver ? <GameOverOverlay onBackToMenu={onBack} /> : null}
    </main>
  );
}
