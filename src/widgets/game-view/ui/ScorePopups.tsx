/**
 * Floating "+N" / "+N*2" labels rising from removed cells.
 * Replaces `createScoreSprite` from GameScene.swift.
 *
 * Coordinates are relative to the Board's grid: we use percent positioning so
 * the popup tracks the grid regardless of viewport size.
 */
import { useGameStore } from '@entities/game/model/gameStore';
import { BOARD } from '@shared/config/constants';
import styles from './ScorePopups.module.css';

export function ScorePopups() {
  const popups = useGameStore((s) => s.popups);
  const pop = useGameStore((s) => s.popPopup);

  return (
    <div className={styles.layer} aria-hidden>
      {popups.map((p) => {
        // CSS-grid origin is top-left → convert (column, row).
        const left = ((p.column + 0.5) / BOARD.NUM_COLUMNS) * 100;
        const top = ((BOARD.NUM_ROWS - 0.5 - p.row) / BOARD.NUM_ROWS) * 100;
        return (
          <span
            key={p.id}
            className={styles.popup}
            style={{ left: `${left}%`, top: `${top}%` }}
            onAnimationEnd={() => pop(p.id)}
          >
            +{p.score}{p.x2 ? '·2' : ''}
          </span>
        );
      })}
    </div>
  );
}
