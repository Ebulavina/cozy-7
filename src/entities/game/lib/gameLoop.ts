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
  store.syncFromLevel();

  // Drop animation is handled in CSS via transform transition. We just wait
  // for the SHORT_MS so the rest of the loop runs after the cell lands.
  await sleep(TIMING.SHORT_MS);

  await runGameProcess();

  // Step bookkeeping — threshold is dynamic (decreases with shiftCount).
  const after = useGameStore.getState();
  if (after.stepsSinceShift + 1 >= after.stepsPerShift) {
    after.resetStep();
    after.incrementShiftCount();
    await sleep(TIMING.LONG_MS);
    await runCreateNewLine();
    await runGameProcess();
  } else {
    after.incrementStep();
  }

  useGameStore.getState().setAnimating(false);
  useGameStore.getState().saveSnapshot();
}

/**
 * Port of `startGameProcess`. Recursively (here: iteratively) clears matches
 * until none remain, applying gravity between passes and growing the
 * iteration multiplier on each non-empty pass.
 */
async function runGameProcess(): Promise<void> {
  let iterationMultiplier = 1;

  for (;;) {
    const store = useGameStore.getState();
    const removed = store.level.checkMatches();

    if (removed.length === 0) {
      // multiplier resets back to 1 between independent moves
      return;
    }

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

    iterationMultiplier += 1;
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
  store.syncFromLevel();

  // small wait so the shift animation completes
  await sleep(TIMING.SHORT_MS);
}
