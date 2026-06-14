/**
 * Board — 7×7 CSS-grid that renders Cells from gameStore.level.grid.
 *
 * Clicking anywhere on the grid calculates the target column from the click's
 * X position and calls `placeCellInColumn`, the web equivalent of `touchesBegan`.
 */
import React, { useLayoutEffect, useMemo, useRef } from 'react';
import { BOARD } from '@shared/config/constants';
import { useGameStore } from '@entities/game/model/gameStore';
import { placeCellInColumn, removeCellAtPosition, removeCellsOfSameType, removeColumnAtPosition, removeRowAtPosition } from '@entities/game/lib/gameLoop';
import { Cell } from './Cell';
import styles from './Board.module.css';

export function Board() {
  const level = useGameStore((s) => s.level);
  const removingIds = useGameStore((s) => s.removingIds);
  const isShiftingUp = useGameStore((s) => s.isShiftingUp);
  const isAnimating = useGameStore((s) => s.isAnimating);
  const isGameOver = useGameStore((s) => s.isGameOver);
  const isRemoveMode = useGameStore((s) => s.isRemoveMode);
  const isRemoveRowMode = useGameStore((s) => s.isRemoveRowMode);
  const isRemoveTypeMode = useGameStore((s) => s.isRemoveTypeMode);
  const isRemoveColMode = useGameStore((s) => s.isRemoveColMode);
  const nextType = useGameStore((s) => s.nextType);

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

  const handleGridClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isAnimating || isGameOver) return;
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const column = Math.min(
      BOARD.NUM_COLUMNS - 1,
      Math.floor(((e.clientX - left) / width) * BOARD.NUM_COLUMNS),
    );
    const row = Math.max(0, Math.min(
      BOARD.NUM_ROWS - 1,
      BOARD.NUM_ROWS - 1 - Math.floor(((e.clientY - top) / height) * BOARD.NUM_ROWS),
    ));
    if (isRemoveMode) {
      void removeCellAtPosition(column, row);
    } else if (isRemoveRowMode) {
      void removeRowAtPosition(row);
    } else if (isRemoveTypeMode) {
      void removeCellsOfSameType(column, row);
    } else if (isRemoveColMode) {
      void removeColumnAtPosition(column);
    } else {
      void placeCellInColumn(column);
    }
  };

  return (
    <div className={styles.boardWrap} aria-label="Game board">
      <div className={styles.nextRow}>
        <div className={styles.nextBlock}>
          <span className={styles.label}>Next</span>
          <div className={styles.nextPreview}>
            <Cell
              type={nextType}
              column={0}
              row={0}
              removing={false}
              shiftingUp={false}
              placed={false}
            />
          </div>
        </div>
      </div>
      <div
        className={styles.grid}
        onClick={handleGridClick}
        style={{ cursor: isAnimating || isGameOver ? 'default' : (isRemoveMode || isRemoveRowMode || isRemoveTypeMode || isRemoveColMode) ? 'crosshair' : 'pointer' }}
      >
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
      </div>
    </div>
  );
}
