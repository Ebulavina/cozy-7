/**
 * Cell — a single grid square. Renders the type as a tinted square with
 * either a tabular numeral (1..7) or a quiet glyph for gray/black obstacles.
 *
 * The (column, row) lives in CSS-grid via gridColumn/gridRow inline style.
 * Position transitions (gravity, shiftUp) animate automatically because each
 * Cell keeps a stable React key (cell.id) and only its grid placement changes.
 */
import { memo } from 'react';
import type { CellType } from '@entities/board/model/types';
import { isColored } from '@entities/board/model/types';
import { BOARD } from '@shared/config/constants';
import styles from './Cell.module.css';

interface Props {
  type: CellType;
  column: number;
  row: number;
  removing: boolean;
  shiftingUp: boolean;
  placed: boolean;
}

function LockIcon() {
  return (
    <svg viewBox="0 0 24 24" className={styles.lockIcon} aria-hidden>
      <rect x="5" y="11" width="14" height="10" rx="2" fill="currentColor" />
      <path d="M8 11V7a4 4 0 1 1 8 0v4" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
    </svg>
  );
}

function CellInner({ type, column, row, removing, shiftingUp, placed }: Props) {
  // CSS-grid origin is top-left; iOS origin (and our model) is bottom-left.
  // Flip the row so row=0 appears at the bottom visually.
  const cssRow = BOARD.NUM_ROWS - row;
  const cssCol = column + 1;

  const className = [
    styles.cell,
    isColored(type) ? styles[`type${type}`] : styles[type],
    removing ? styles.removing : '',
    shiftingUp ? styles.shiftingUp : '',
    placed ? styles.placed : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div
      className={className}
      style={{ gridColumn: cssCol, gridRow: cssRow }}
      aria-label={typeof type === 'number' ? `Cell ${type}` : `Cell ${type}`}
    >
      {isColored(type)
        ? <span className={styles.glyph}>{type}</span>
        : <span className={styles.lock}>
            <LockIcon />
            {type === 'black' && <LockIcon />}
          </span>
      }
    </div>
  );
}

export const Cell = memo(CellInner);
