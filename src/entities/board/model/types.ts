/**
 * Domain types for the board.
 *
 * Ported from:
 *  - Source/Combination/Models/CombType.swift  → CellType
 *  - Source/Combination/Models/CombModel.swift → Cell
 *
 * `SKSpriteNode` is intentionally NOT carried over — React renders cells from
 * the model itself; identity is preserved via the `id` field.
 */

export type ColoredCellType = 1 | 2 | 3 | 4 | 5 | 6 | 7;
export type ObstacleCellType = 'gray' | 'black';
export type CellType = ColoredCellType | ObstacleCellType;

export interface Cell {
  /** Stable identifier — survives moves between matrix slots so React can
   * animate transitions via `key={cell.id}`. */
  readonly id: string;
  /** Mutable on board (e.g. when a black neighbour upgrades to gray). */
  type: CellType;
}

/** Result of a single match-detection sweep — passed to UI to trigger
 * removal animations and score popups. */
export interface RemovedCell {
  readonly cellId: string;
  readonly type: CellType;
  readonly row: number;
  readonly column: number;
  /** 1 for row-only or column-only match, 2 if the cell hits both axes. */
  scoreMultiplier: 1 | 2;
}

/** Result of `applyGravity` — describes cells that need a move animation. */
export interface CellMove {
  readonly cellId: string;
  readonly column: number;
  readonly fromRow: number;
  readonly toRow: number;
}

export const isColored = (t: CellType): t is ColoredCellType =>
  typeof t === 'number';

export const isObstacle = (t: CellType): t is ObstacleCellType =>
  t === 'gray' || t === 'black';
