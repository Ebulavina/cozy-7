/**
 * Grid — the TS equivalent of Source/Combination/Utilities/Array2D.swift.
 *
 * Storage layout matches iOS exactly: `array[row * columns + column]`. This is
 * important for serialization compatibility within the web build (and makes
 * porting Level.swift straightforward, line-by-line).
 *
 * Cells are stored as `Cell | null`. The grid does NOT own random generation,
 * matching, or gravity — that lives in `level.ts`. Pure data container only.
 */
import { BOARD } from '@shared/config/constants';
import type { Cell } from '../model/types';

export class Grid {
  readonly columns: number;
  readonly rows: number;
  private readonly cells: (Cell | null)[];

  constructor(
    columns: number = BOARD.NUM_COLUMNS,
    rows: number = BOARD.NUM_ROWS,
    cells?: (Cell | null)[],
  ) {
    this.columns = columns;
    this.rows = rows;
    this.cells = cells ?? new Array(columns * rows).fill(null);
  }

  get(column: number, row: number): Cell | null {
    return this.cells[row * this.columns + column] ?? null;
  }

  set(column: number, row: number, value: Cell | null): void {
    this.cells[row * this.columns + column] = value;
  }

  /** Serialize to a plain object — used by gameStore persistence. */
  toJSON(): { columns: number; rows: number; cells: (Cell | null)[] } {
    return { columns: this.columns, rows: this.rows, cells: [...this.cells] };
  }

  static fromJSON(data: {
    columns: number;
    rows: number;
    cells: (Cell | null)[];
  }): Grid {
    return new Grid(data.columns, data.rows, [...data.cells]);
  }

  /** Deep-ish clone (cells are shared by reference; safe because Cell ids are stable). */
  clone(): Grid {
    return new Grid(this.columns, this.rows, [...this.cells]);
  }
}
