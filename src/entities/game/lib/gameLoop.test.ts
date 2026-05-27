/**
 * Integration tests for the game loop. Uses fake timers so the async/await
 * sleeps resolve instantly.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useGameStore } from '../model/gameStore';
import { placeCellInColumn } from './gameLoop';
import { Level } from '@entities/board/lib/level';
import { STEPS_PER_SHIFT } from '@shared/config/constants';

const advance = async (): Promise<void> => {
  await vi.runAllTimersAsync();
};

beforeEach(() => {
  vi.useFakeTimers();
  useGameStore.getState().newGame();
});

afterEach(() => {
  vi.useRealTimers();
});

describe('placeCellInColumn', () => {
  it('drops a cell into the lowest empty row of the chosen column', async () => {
    // Use type=3 — a single cell forms a run of length 1, which does not match
    // (3 ≠ 1), so the cell stays on the board after the loop runs.
    useGameStore.setState({ nextType: 3 });
    const p = placeCellInColumn(3);
    await advance();
    await p;
    expect(useGameStore.getState().level.grid.get(3, 0)?.type).toBe(3);
  });

  it('does nothing while another animation is in progress', async () => {
    useGameStore.setState({ isAnimating: true });
    const before = useGameStore.getState().level.grid.get(0, 0);
    const p = placeCellInColumn(0);
    await advance();
    await p;
    expect(useGameStore.getState().level.grid.get(0, 0)).toBe(before);
  });

  it('detects game over when the entire top line is full', async () => {
    const store = useGameStore.getState();
    // Fill all 7 columns completely from bottom to top with 1s.
    for (let c = 0; c < 7; c += 1) {
      for (let r = 0; r < 7; r += 1) {
        store.level.grid.set(c, r, Level.makeCell('gray')); // gray ensures no match
      }
    }
    store.syncFromLevel();
    const p = placeCellInColumn(0);
    await advance();
    await p;
    expect(useGameStore.getState().isGameOver).toBe(true);
  });

  it('triggers shiftUp after STEPS_PER_SHIFT moves', async () => {
    // Pre-arrange: gray bottom row so nothing matches and the board stays sparse.
    useGameStore.setState({ nextType: 'gray' });
    for (let i = 0; i < STEPS_PER_SHIFT; i += 1) {
      const p = placeCellInColumn(i % 7);
      await advance();
      await p;
    }
    // After STEPS_PER_SHIFT placements, step counter resets.
    expect(useGameStore.getState().stepsSinceShift).toBe(0);
  });
});
