/**
 * Level — direct 1:1 port of Source/Combination/Models/Level.swift.
 *
 * The Swift implementation owned both data (combMatrix) and mutation logic.
 * Here the same is true, but every method is a pure-ish function on `Grid` —
 * no rendering, no animations, no timers. The game loop in `entities/game`
 * orchestrates calls and feeds results into the UI store.
 *
 * Behaviour preserved (see MIGRATION_PLAN §2 and §10):
 *   - 7×7 grid, gravity-stack from the bottom.
 *   - Match = continuous run of length L where each cell's type === L.
 *   - Row-match + column-match on the same cell ⇒ x2 multiplier.
 *   - On every removal: gray 4-neighbours → random colored;
 *                       black 4-neighbours → gray.
 *     Order matters (gray first, black second) — preserved from Swift.
 *   - `shiftUp` inserts a row of gray/black at the bottom with exactly one
 *     colored cell in a random column.
 */
import { BOARD } from '@shared/config/constants';
import type { RNG } from '@shared/lib/rng';
import { defaultRng } from '@shared/lib/rng';
import { uid } from '@shared/lib/uid';
import type { Cell, CellMove, CellType, RemovedCell } from '../model/types';
import { isColored } from '../model/types';
import { randomColored, randomObstacle } from './cellType';
import { Grid } from './grid';

export class Level {
  grid: Grid;
  private readonly rng: RNG;

  constructor(grid: Grid = new Grid(), rng: RNG = defaultRng) {
    this.grid = grid;
    this.rng = rng;
  }

  /** Helper: build a fresh cell with a stable id. */
  static makeCell(type: CellType): Cell {
    return { id: uid(), type };
  }

  /**
   * Port of `addComb(model:column:) -> Int`.
   * Places the cell at the lowest empty row of the given column.
   * Returns the row, or -1 if the column is full.
   */
  addCell(cell: Cell, column: number): number {
    for (let row = 0; row < BOARD.NUM_ROWS; row += 1) {
      if (this.grid.get(column, row) == null) {
        this.grid.set(column, row, cell);
        return row;
      }
    }
    return -1;
  }

  /**
   * Port of `checkCombinationsInMatrix() -> [RemovedSpriteNodeWithScoreMultiplier]`.
   *
   * Sweeps rows first, then columns. Returns the list of cells removed in this
   * pass with their final score multipliers. The matrix is mutated in-place.
   */
  checkMatches(): RemovedCell[] {
    const removed: RemovedCell[] = [];

    interface Run {
      row: number;
      column: number;
      cells: { cell: Cell; column: number; row: number }[];
    }

    // --- horizontal runs ---
    const rowRuns: Run[] = [];
    for (let row = 0; row < BOARD.NUM_ROWS; row += 1) {
      let run: Run = { row, column: -1, cells: [] };
      for (let column = 0; column < BOARD.NUM_COLUMNS; column += 1) {
        const cell = this.grid.get(column, row);
        if (cell) {
          if (run.column === -1) run.column = column;
          run.cells.push({ cell, column, row });
        } else if (run.cells.length > 0) {
          rowRuns.push(run);
          run = { row, column: -1, cells: [] };
        }
      }
      if (run.cells.length > 0) rowRuns.push(run);
    }

    // --- vertical runs ---
    const colRuns: Run[] = [];
    for (let column = 0; column < BOARD.NUM_COLUMNS; column += 1) {
      let run: Run = { row: -1, column, cells: [] };
      for (let row = 0; row < BOARD.NUM_ROWS; row += 1) {
        const cell = this.grid.get(column, row);
        if (cell) {
          if (run.row === -1) run.row = row;
          run.cells.push({ cell, column, row });
        } else if (run.cells.length > 0) {
          colRuns.push(run);
          run = { row: -1, column, cells: [] };
        }
      }
      if (run.cells.length > 0) colRuns.push(run);
    }

    // --- evaluate horizontal matches (multiplier x1) ---
    for (const run of rowRuns) {
      const len = run.cells.length;
      for (const { cell, column, row } of run.cells) {
        if (isColored(cell.type) && cell.type === len) {
          removed.push({
            cellId: cell.id,
            type: cell.type,
            row,
            column,
            scoreMultiplier: 1,
          });
          this.grid.set(column, row, null);
          this.applyNeighbourEffects(column, row);
        }
      }
    }

    // --- evaluate vertical matches; promote to x2 on overlap ---
    for (const run of colRuns) {
      const len = run.cells.length;
      for (const { cell, column, row } of run.cells) {
        if (isColored(cell.type) && cell.type === len) {
          const existing = removed.find((r) => r.cellId === cell.id);
          if (existing) {
            existing.scoreMultiplier = 2;
          } else {
            removed.push({
              cellId: cell.id,
              type: cell.type,
              row,
              column,
              scoreMultiplier: 1,
            });
          }
          this.grid.set(column, row, null);
          this.applyNeighbourEffects(column, row);
        }
      }
    }

    return removed;
  }

  /**
   * Port of `checkGrayElement(column:row:)`.
   *
   * IMPORTANT: order matters — gray → colored happens FIRST, then black → gray.
   * Otherwise a black neighbour would jump straight to colored in a single pass.
   */
  private applyNeighbourEffects(column: number, row: number): void {
    const tryUpgradeGray = (c: number, r: number): void => {
      const cell = this.grid.get(c, r);
      if (cell?.type === 'gray') cell.type = randomColored(this.rng);
    };
    const tryDowngradeBlack = (c: number, r: number): void => {
      const cell = this.grid.get(c, r);
      if (cell?.type === 'black') cell.type = 'gray';
    };

    // gray → colored
    if (column < BOARD.NUM_COLUMNS - 1) tryUpgradeGray(column + 1, row);
    if (column > 0) tryUpgradeGray(column - 1, row);
    if (row < BOARD.NUM_ROWS - 1) tryUpgradeGray(column, row + 1);
    if (row > 0) tryUpgradeGray(column, row - 1);

    // black → gray
    if (column < BOARD.NUM_COLUMNS - 1) tryDowngradeBlack(column + 1, row);
    if (column > 0) tryDowngradeBlack(column - 1, row);
    if (row < BOARD.NUM_ROWS - 1) tryDowngradeBlack(column, row + 1);
    if (row > 0) tryDowngradeBlack(column, row - 1);
  }

  /**
   * Port of `elementsCheckToMoveDown() -> [SpriteWithNewPosition]`.
   * Compacts each column downward into empty slots and returns the moves.
   */
  applyGravity(): CellMove[] {
    const moves: CellMove[] = [];

    for (let column = 0; column < BOARD.NUM_COLUMNS; column += 1) {
      let empty = 0;
      for (let row = 0; row < BOARD.NUM_ROWS; row += 1) {
        const cell = this.grid.get(column, row);
        if (cell) {
          if (empty !== 0) {
            const toRow = row - empty;
            this.grid.set(column, toRow, cell);
            this.grid.set(column, row, null);
            moves.push({ cellId: cell.id, column, fromRow: row, toRow });
          }
        } else {
          empty += 1;
        }
      }
    }

    return moves;
  }

  /** Returns true when every cell in the grid is empty. */
  isEmpty(): boolean {
    for (let row = 0; row < BOARD.NUM_ROWS; row += 1) {
      for (let column = 0; column < BOARD.NUM_COLUMNS; column += 1) {
        if (this.grid.get(column, row) != null) return false;
      }
    }
    return true;
  }

  /** Port of `topLineIsEmpty()`. */
  topLineIsEmpty(): boolean {
    for (let column = 0; column < BOARD.NUM_COLUMNS; column += 1) {
      if (this.grid.get(column, BOARD.NUM_ROWS - 1) != null) return false;
    }
    return true;
  }

  /** Port of `topLineIsFull()`. */
  topLineIsFull(): boolean {
    for (let column = 0; column < BOARD.NUM_COLUMNS; column += 1) {
      if (this.grid.get(column, BOARD.NUM_ROWS - 1) == null) return false;
    }
    return true;
  }

  /**
   * Port of `shiftUp()`. Shifts the entire board up by one row and inserts a
   * new bottom row: gray/black everywhere except one random column with a
   * colored cell.
   */
  shiftUp(): void {
    const insertColored = this.rng.nextInt(0, BOARD.NUM_COLUMNS - 1);

    for (let column = 0; column < BOARD.NUM_COLUMNS; column += 1) {
      for (let row = BOARD.NUM_ROWS - 1; row >= 1; row -= 1) {
        this.grid.set(column, row, this.grid.get(column, row - 1));
      }
      const type =
        column === insertColored
          ? randomColored(this.rng)
          : randomObstacle(this.rng);
      this.grid.set(column, 0, Level.makeCell(type));
    }
  }

  /** Reset to empty board. */
  clean(): void {
    this.grid = new Grid();
  }
}
