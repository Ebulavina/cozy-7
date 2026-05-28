/**
 * HUD — top strip showing score, "next" piece preview, and the 10-step bar.
 * Replaces the SwiftUI VStack section above the SpriteView.
 */
import { useGameStore } from '@entities/game/model/gameStore';
import { isColored } from '@entities/board/model/types';
import styles from './Hud.module.css';

export function Hud() {
  const score = useGameStore((s) => s.score);
  const nextType = useGameStore((s) => s.nextType);

  const nextLabel = isColored(nextType) ? String(nextType) : '';
  const nextClass = isColored(nextType) ? `type${nextType}` : nextType;

  return (
    <header className={styles.hud}>
      <div className={styles.row}>
        <div className={styles.nextBlock}>
          <span className={styles.label}>Next</span>
          <div
            className={`${styles.next} ${styles[nextClass]}`}
            aria-label={`Next piece: ${String(nextType)}`}
          >
            {nextLabel}
          </div>
        </div>
        <div className={styles.scoreBlock}>
          <span className={styles.label}>Score</span>
          <span className={styles.score}>{score}</span>
        </div>
      </div>
    </header>
  );
}
