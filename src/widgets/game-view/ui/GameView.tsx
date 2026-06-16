/**
 * GameView — replaces Source/Combination/Views/GameView.swift.
 *
 * Stacks the HUD over the Board and lets popups float upward over the grid.
 * GameOverOverlay appears when isGameOver flips true (Store.isGameOver).
 */
import { useGameStore } from '@entities/game/model/gameStore';
import { useLocale } from '@shared/lib/useLocale';
import { shuffleAllCells } from '@entities/game/lib/gameLoop';
import { Board } from './Board';
import { BonusButton } from './BonusButton';
import { RemoveCellIcon, RemoveRowIcon, RemoveColIcon, RemoveTypeIcon, ShuffleIcon } from './BonusIcons';
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
  const removeTypeBonusCount = useGameStore((s) => s.removeTypeBonusCount);
  const isRemoveTypeMode = useGameStore((s) => s.isRemoveTypeMode);
  const toggleRemoveTypeMode = useGameStore((s) => s.toggleRemoveTypeMode);
  const removeColBonusCount = useGameStore((s) => s.removeColBonusCount);
  const isRemoveColMode = useGameStore((s) => s.isRemoveColMode);
  const toggleRemoveColMode = useGameStore((s) => s.toggleRemoveColMode);
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
      <div className={styles.bonusRow}>
        <BonusButton icon={<RemoveCellIcon />} count={removeBonusCount} color="var(--cell-1)" active={isRemoveMode} disabled={removeBonusCount === 0 || isAnimating || isGameOver} onClick={toggleRemoveMode} aria-label={t.removeBonusBtn} />
        <BonusButton icon={<RemoveRowIcon />} count={removeRowBonusCount} color="var(--cell-3)" active={isRemoveRowMode} disabled={removeRowBonusCount === 0 || isAnimating || isGameOver} onClick={toggleRemoveRowMode} aria-label={t.removeRowBonusBtn} />
        <BonusButton icon={<RemoveColIcon />} count={removeColBonusCount} color="var(--cell-2)" active={isRemoveColMode} disabled={removeColBonusCount === 0 || isAnimating || isGameOver} onClick={toggleRemoveColMode} aria-label={t.removeColBonusBtn} />
        <BonusButton icon={<RemoveTypeIcon />} count={removeTypeBonusCount} color="var(--cell-4)" active={isRemoveTypeMode} disabled={removeTypeBonusCount === 0 || isAnimating || isGameOver} onClick={toggleRemoveTypeMode} aria-label={t.removeTypeBonusBtn} />
        <BonusButton icon={<ShuffleIcon />} count={shuffleBonusCount} color="var(--cell-7)" disabled={shuffleBonusCount === 0 || isAnimating || isGameOver} onClick={() => void shuffleAllCells()} aria-label={t.shuffleBonusBtn} />
      </div>
      <ToastBanner />
      {isGameOver ? <GameOverOverlay onBackToMenu={onBack} /> : null}
    </main>
  );
}
