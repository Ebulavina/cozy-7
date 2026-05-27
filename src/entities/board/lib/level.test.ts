/**
 * Comprehensive tests for Level — ported and expanded from
 * Source/CombinationTests/LevelTests.swift.
 *
 * The original Swift suite contained TODO-style placeholders; here we assert
 * every behavioural rule listed in MIGRATION_PLAN §10.
 */
import { describe, expect, it } from 'vitest';
import { BOARD } from '@shared/config/constants';
import { seededRng } from '@shared/lib/rng';
import { Level } from './level';
import type { Cell, CellType } from '../model/types';

const make = (type: CellType): Cell => Level.makeCell(type);



describe('Level.addCell', () => {
  it('adds to row 0 of an empty column', () => {
    const level = new Level();
    const row = level.addCell(make(1), 0);
    expect(row).toBe(0);
    expect(level.grid.get(0, 0)?.type).toBe(1);
  });

  it('stacks subsequent cells on top of each other', () => {
    const level = new Level();
    expect(level.addCell(make(1), 3)).toBe(0);
    expect(level.addCell(make(2), 3)).toBe(1);
    expect(level.addCell(make(3), 3)).toBe(2);
  });

  it('returns -1 when the column is full', () => {
    const level = new Level();
    for (let r = 0; r < BOARD.NUM_ROWS; r += 1) {
      level.addCell(make(1), 0);
    }
    expect(level.addCell(make(2), 0)).toBe(-1);
  });
});

describe('Level.checkMatches', () => {
  it('removes a run of 3 threes in a row (x1)', () => {
    const level = new Level();
    // A "run" is a contiguous non-null sequence — the trailing slots stay null.
    level.grid.set(0, 0, make(3));
    level.grid.set(1, 0, make(3));
    level.grid.set(2, 0, make(3));
    const removed = level.checkMatches();
    expect(removed.filter((r) => r.type === 3)).toHaveLength(3);
    expect(removed.every((r) => r.scoreMultiplier === 1)).toBe(true);
    expect(level.grid.get(0, 0)).toBeNull();
    expect(level.grid.get(1, 0)).toBeNull();
    expect(level.grid.get(2, 0)).toBeNull();
  });

  it('does NOT remove a run of length L when types !== L', () => {
    const level = new Level();
    // Four 2's in a row (run length = 4, but type = 2 — must not match).
    level.grid.set(0, 0, make(2));
    level.grid.set(1, 0, make(2));
    level.grid.set(2, 0, make(2));
    level.grid.set(3, 0, make(2));
    const removed = level.checkMatches();
    expect(removed.filter((r) => r.type === 2)).toHaveLength(0);
  });

  it('removes a column run of 5 fives (x1)', () => {
    const level = new Level();
    for (let r = 0; r < 5; r += 1) level.grid.set(2, r, make(5));
    const removed = level.checkMatches();
    expect(removed).toHaveLength(5);
    expect(removed.every((r) => r.scoreMultiplier === 1)).toBe(true);
  });

  it('promotes a cell that matches in both row and column to x2', () => {
    const level = new Level();
    // Horizontal run of three 3s in row 2 across columns 0,1,2 (rest is null).
    level.grid.set(0, 2, make(3));
    level.grid.set(1, 2, make(3));
    level.grid.set(2, 2, make(3));
    // Vertical run of three 3s in column 1 across rows 0,1,2 — (1,2) is shared.
    level.grid.set(1, 0, make(3));
    level.grid.set(1, 1, make(3));

    const removed = level.checkMatches();
    const cross = removed.find((r) => r.column === 1 && r.row === 2);
    expect(cross).toBeDefined();
    expect(cross!.scoreMultiplier).toBe(2);
  });
});

describe('Level.checkMatches — neighbour effects', () => {
  it('converts a gray 4-neighbour of a removed cell into a colored type', () => {
    const level = new Level(undefined, seededRng(42));
    // Run of three 1s at (0..2, 0); gray at (3, 0) is a neighbour of (2, 0).
    // Wait — that would make the run length 4, not 3. Place a null between
    // (2,0) and (3,0)? Impossible — they're adjacent. Solution: shorter run.
    // Use type=1 with a single isolated cell at (0,0) — that's a run of 1,
    // which matches (length 1 === type 1). Gray at (1, 0) is its neighbour.
    level.grid.set(0, 0, make(1));
    level.grid.set(1, 0, make('gray'));
    level.checkMatches();
    const neighbour = level.grid.get(1, 0);
    expect(neighbour).not.toBeNull();
    expect(typeof neighbour!.type).toBe('number'); // gray → colored
  });

  it('downgrades a black neighbour to gray (not directly to colored)', () => {
    const level = new Level(undefined, seededRng(7));
    // Isolated 1 at (0,0) (a run of length 1 with type 1 matches). Black at (1,0).
    level.grid.set(0, 0, make(1));
    level.grid.set(1, 0, make('black'));
    level.checkMatches();
    expect(level.grid.get(1, 0)?.type).toBe('gray');
  });
});

describe('Level.applyGravity', () => {
  it('drops a hanging cell into the empty slot below', () => {
    const level = new Level();
    level.grid.set(0, 2, make(5));
    const moves = level.applyGravity();
    expect(moves).toHaveLength(1);
    expect(moves[0]).toMatchObject({ column: 0, fromRow: 2, toRow: 0 });
    expect(level.grid.get(0, 0)?.type).toBe(5);
    expect(level.grid.get(0, 2)).toBeNull();
  });

  it('compacts multiple gaps preserving order', () => {
    const level = new Level();
    level.grid.set(0, 0, make(1));
    level.grid.set(0, 2, make(2));
    level.grid.set(0, 4, make(3));
    level.applyGravity();
    expect(level.grid.get(0, 0)?.type).toBe(1);
    expect(level.grid.get(0, 1)?.type).toBe(2);
    expect(level.grid.get(0, 2)?.type).toBe(3);
    expect(level.grid.get(0, 3)).toBeNull();
  });
});

describe('Level.topLineIsEmpty / topLineIsFull', () => {
  it('reports empty for a fresh board', () => {
    const level = new Level();
    expect(level.topLineIsEmpty()).toBe(true);
    expect(level.topLineIsFull()).toBe(false);
  });

  it('reports full when every top column has a cell', () => {
    const level = new Level();
    for (let c = 0; c < BOARD.NUM_COLUMNS; c += 1) {
      level.grid.set(c, BOARD.NUM_ROWS - 1, make(1));
    }
    expect(level.topLineIsFull()).toBe(true);
    expect(level.topLineIsEmpty()).toBe(false);
  });
});

describe('Level.shiftUp', () => {
  it('moves existing rows up and inserts a new bottom row with exactly one colored cell', () => {
    const level = new Level(undefined, seededRng(1));
    level.grid.set(0, 0, make(4));
    level.shiftUp();

    // Old (0,0)=4 now at (0,1)
    expect(level.grid.get(0, 1)?.type).toBe(4);

    // The new bottom row has BOARD.NUM_COLUMNS cells, exactly one colored
    let colored = 0;
    let obstacles = 0;
    for (let c = 0; c < BOARD.NUM_COLUMNS; c += 1) {
      const cell = level.grid.get(c, 0);
      expect(cell).not.toBeNull();
      if (typeof cell!.type === 'number') colored += 1;
      else obstacles += 1;
    }
    expect(colored).toBe(1);
    expect(obstacles).toBe(BOARD.NUM_COLUMNS - 1);
  });
});
