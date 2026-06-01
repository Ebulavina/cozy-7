/**
 * Board — 7×7 CSS-grid that renders Cells from gameStore.level.grid.
 *
 * Tapping a column (an invisible column-strip overlaying the grid) calls
 * `placeCellInColumn`, the web equivalent of `touchesBegan`.
 */
import { useLayoutEffect, useMemo, useRef } from 'react';
import { BOARD } from '@shared/config/constants';
import { useGameStore } from '@entities/game/model/gameStore';
import { placeCellInColumn } from '@entities/game/lib/gameLoop';
import { Cell } from './Cell';
import styles from './Board.module.css';

export function Board() {
  const level = useGameStore((s) => s.level);
  const removingIds = useGameStore((s) => s.removingIds);
  const isShiftingUp = useGameStore((s) => s.isShiftingUp);
  const isAnimating = useGameStore((s) => s.isAnimating);
  const isGameOver = useGameStore((s) => s.isGameOver);
  // boardVersion subscription forces re-render after mutations on Level
  useGameStore((s) => s.boardVersion);

  const prevCellIds = useRef<Set<string>>(new Set());

  // flatten the grid into a list of cells with their coordinates
  const cells = useMemo(() => {
    const out: { id: string; type: import('@entities/board/model/types').CellType; column: number; row: number }[] = [];
    for (let row = 0; row < BOARD.NUM_ROWS; row += 1) {
      for (let column = 0; column < BOARD.NUM_COLUMNS; column += 1) {
        const c = level.grid.get(column, row);
        if (c) out.push({ id: c.id, type: c.type, column, row });
      }
    }
    return out;
    // intentionally include boardVersion via the store hook above
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [level, useGameStore.getState().boardVersion]);

  // placedIds: newly appeared cells since last committed render.
  // initialized guard prevents animating the initial board load.
  const placedIds = useMemo(
    () => new Set(cells.filter(c => !prevCellIds.current.has(c.id)).map(c => c.id)),
    [cells],
  );

  // Update the "seen" set AFTER the DOM has committed (after Strict Mode double-invoke).
  useLayoutEffect(() => {
    cells.forEach(c => prevCellIds.current.add(c.id));
  }, [cells]);

  const handleColumnClick = (column: number) => {
    if (isAnimating || isGameOver) return;
    void placeCellInColumn(column);
  };

  return (
    <div className={styles.boardWrap} aria-label="Game board">
      <div className={styles.grid}>
        {/* background grid lines */}
        {Array.from({ length: BOARD.NUM_COLUMNS * BOARD.NUM_ROWS - cells.length }).map((_, i) => (
          <div key={`bg-${i}`} className={styles.slot} />
        ))}
        {cells.map((c) => (
          <Cell
            key={c.id}
            type={c.type}
            column={c.column}
            row={c.row}
            removing={removingIds.has(c.id)}
            shiftingUp={isShiftingUp}
            placed={placedIds.size === 1 && placedIds.has(c.id)}
          />
        ))}
        {/* invisible column-wide hit areas */}
        <div className={styles.columns}>
          {Array.from({ length: BOARD.NUM_COLUMNS }).map((_, c) => (
            <button
              key={`col-${c}`}
              className={styles.columnHit}
              onClick={() => handleColumnClick(c)}
              aria-label={`Drop into column ${c + 1}`}
              disabled={isAnimating || isGameOver}
              type="button"
            />
          ))}
        </div>
      </div>
    </div>
  );
}
