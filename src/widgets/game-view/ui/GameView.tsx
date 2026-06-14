/**
 * GameView — replaces Source/Combination/Views/GameView.swift.
 *
 * Stacks the HUD over the Board and lets popups float upward over the grid.
 * GameOverOverlay appears when isGameOver flips true (Store.isGameOver).
 */
import { useGameStore } from '@entities/game/model/gameStore';
import { useLocale } from '@shared/lib/useLocale';
import { shuffleAllCells } from '@entities/game/lib/gameLoop';
import { Button } from '@shared/ui/Button/Button';
import { Board } from './Board';
import { Hud } from './Hud';
import { GameOverOverlay } from './GameOverOverlay';
import { ScorePopups } from './ScorePopups';
import { ToastBanner } from './ToastBanner';
import { StepBar } from '@shared/ui/StepBar/StepBar';
import styles from './GameView.module.css';

interface Props {
  onBack: () => void;
}

export function GameView({ onBack }: Props) {
  const isGameOver = useGameStore((s) => s.isGameOver);
  const isAnimating = useGameStore((s) => s.isAnimating);
  const stepsSinceShift = useGameStore((s) => s.stepsSinceShift);
  const stepsPerShift = useGameStore((s) => s.stepsPerShift);
  const removeBonusCount = useGameStore((s) => s.removeBonusCount);
  const isRemoveMode = useGameStore((s) => s.isRemoveMode);
  const toggleRemoveMode = useGameStore((s) => s.toggleRemoveMode);
  const removeRowBonusCount = useGameStore((s) => s.removeRowBonusCount);
  const isRemoveRowMode = useGameStore((s) => s.isRemoveRowMode);
  const toggleRemoveRowMode = useGameStore((s) => s.toggleRemoveRowMode);
  const shuffleBonusCount = useGameStore((s) => s.shuffleBonusCount);
  const { t } = useLocale();
  return (
    <main className={styles.view}>
      <Hud onBack={onBack} />
      <div className={styles.boardArea}>
        <Board />
        <ScorePopups />
      </div>
      <div className={styles.bonusRow}>
        <Button
          variant="ghost"
          className={isRemoveMode ? styles.bonusBtnActive : undefined}
          onClick={toggleRemoveMode}
          disabled={removeBonusCount === 0 || isAnimating || isGameOver}
          aria-label={t.removeBonusBtn}
        >
          ✂ {removeBonusCount}
        </Button>
        <Button
          variant="ghost"
          className={isRemoveRowMode ? styles.bonusBtnActive : undefined}
          onClick={toggleRemoveRowMode}
          disabled={removeRowBonusCount === 0 || isAnimating || isGameOver}
          aria-label={t.removeRowBonusBtn}
        >
          ▬ {removeRowBonusCount}
        </Button>
        <Button
          variant="ghost"
          onClick={() => void shuffleAllCells()}
          disabled={shuffleBonusCount === 0 || isAnimating || isGameOver}
          aria-label={t.shuffleBonusBtn}
        >
          ⟳ {shuffleBonusCount}
        </Button>
      </div>
      <StepBar
        value={stepsSinceShift}
        total={stepsPerShift}
        ariaLabel={t.movesAriaLabel}
      />
      <ToastBanner />
      {isGameOver ? <GameOverOverlay onBackToMenu={onBack} /> : null}
    </main>
  );
}
