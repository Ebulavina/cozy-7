/**
 * Game loop — direct async/await port of:
 *   - Source/Combination/Views/GameScene.swift::touchesBegan
 *   - Source/Combination/Views/GameScene.swift::startGameProcess
 *   - Source/Combination/Views/GameScene.swift::createNewLine
 *
 * The iOS implementation chained `DispatchQueue.main.asyncAfter` callbacks; we
 * use `await sleep()` for the same effect with deterministic ordering and a
 * single touchLock (`isAnimating` flag in the store).
 *
 * IMPORTANT: every mutation goes through Level / gameStore so animations and
 * scoring stay in sync. No DOM access here — pure orchestration.
 */
import { Level } from '@entities/board/lib/level';
import { randomCellType } from '@entities/board/lib/cellType';
import { TIMING } from '@shared/config/constants';
import { sleep } from '@shared/lib/sleep';
import { useGameStore } from '../model/gameStore';

/**
 * Called when the player taps a column.
 * Mirrors `touchesBegan` end-to-end, including the touchLock and the
 * post-process step counter / shift handling.
 */
export async function placeCellInColumn(column: number): Promise<void> {
  const store = useGameStore.getState();
  if (store.isAnimating || store.isGameOver) return;

  const cell = Level.makeCell(store.nextType);
  const row = store.level.addCell(cell, column);

  if (row < 0) {
    // Column is full. Game-over condition mirrors Swift: only if the entire
    // top line is full (the player can keep playing other columns otherwise).
    if (store.level.topLineIsFull()) {
      store.setIsGameOver(true);
      store.saveSnapshot();
    }
    return;
  }

  store.setAnimating(true);
  store.setNextType(randomCellType());
  store.resetCurrentComboScore();
  store.syncFromLevel();

  // Always increment immediately so StepBar fills on drop. On the last step
  // before a shift, this fills the bar to 100%; it clears only after removal
  // animations finish, right before the shift animation starts.
  const shouldShift = store.stepsSinceShift + 1 >= store.stepsPerShift;
  store.incrementStep();

  // Drop animation is handled in CSS via transform transition. We just wait
  // for the SHORT_MS so the rest of the loop runs after the cell lands.
  await sleep(TIMING.SHORT_MS);

  const scoreBefore1 = useGameStore.getState().score;
  const combo1 = await runGameProcess();
  const comboScore1 = useGameStore.getState().score - scoreBefore1;

  if (shouldShift) {
    store.resetStep();
    store.incrementShiftCount();
    await sleep(TIMING.LONG_MS);
    await runCreateNewLine();
    const scoreBefore2 = useGameStore.getState().score;
    const combo2 = await runGameProcess();
    const comboScore2 = useGameStore.getState().score - scoreBefore2;
    useGameStore.getState().updateBestCombo(Math.max(combo1, combo2));
    useGameStore.getState().updateBestComboScore(Math.max(comboScore1, comboScore2));
  } else {
    useGameStore.getState().updateBestCombo(combo1);
    useGameStore.getState().updateBestComboScore(comboScore1);
  }

  useGameStore.getState().setAnimating(false);
  useGameStore.getState().saveSnapshot();
}

/**
 * Port of `startGameProcess`. Recursively (here: iteratively) clears matches
 * until none remain, applying gravity between passes and growing the
 * iteration multiplier on each non-empty pass.
 */
async function runGameProcess(): Promise<number> {
  let iterationMultiplier = 1;
  let iterations = 0;

  for (;;) {
    const store = useGameStore.getState();
    const removed = store.level.checkMatches();

    if (removed.length === 0) {
      return iterations;
    }

    iterations += 1;
    store.applyMatchSideEffects(removed, iterationMultiplier);

    // Mark sprites as removing → CSS plays the explode animation for LONG_MS.
    const removingIds = new Set(removed.map((r) => r.cellId));
    store.setRemoving(removingIds);
    store.syncFromLevel();

    await sleep(TIMING.LONG_MS);

    store.clearRemoving();

    // Apply gravity then animate (SHORT_MS).
    const moves = store.level.applyGravity();
    store.applyGravityMoves(moves);
    await sleep(TIMING.SHORT_MS);

    if (store.level.isEmpty()) {
      useGameStore.getState().addBonusScore(777);
      useGameStore.getState().pushToast('clearBoard');
      return iterations;
    }

    iterationMultiplier *= 2;
  }
}

/**
 * Port of `createNewLine`. Shifts the board up by one row and inserts a new
 * bottom row, or triggers game-over if the top line wasn't empty.
 */
async function runCreateNewLine(): Promise<void> {
  const store = useGameStore.getState();
  if (!store.level.topLineIsEmpty()) {
    store.setIsGameOver(true);
    store.saveSnapshot();
    return;
  }

  store.level.shiftUp();
  store.pushToast('newLine');

  // beginShiftUp atomically bumps boardVersion + sets isShiftingUp so React
  // renders all cells at their new grid positions with the slide-up animation
  // already applied (FLIP: they appear at their old positions and animate up).
  store.beginShiftUp();

  await sleep(TIMING.SHORT_MS);
  store.clearShiftUp();
}
