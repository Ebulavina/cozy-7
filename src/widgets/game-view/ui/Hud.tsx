/**
 * HUD — top strip showing score, "next" piece preview, and the 10-step bar.
 * Replaces the SwiftUI VStack section above the SpriteView.
 */
import { useGameStore } from '@entities/game/model/gameStore';
import { isColored } from '@entities/board/model/types';
import { useLocale } from '@shared/lib/useLocale';
import { Button } from '@shared/ui/Button/Button';
import styles from './Hud.module.css';

interface Props {
  onBack: () => void;
}

export function Hud({ onBack }: Props) {
  const score = useGameStore((s) => s.score);
  const nextType = useGameStore((s) => s.nextType);
  const { t } = useLocale();

  const nextLabel = isColored(nextType) ? String(nextType) : '';
  const nextClass = isColored(nextType) ? `type${nextType}` : nextType;

  return (
    <header className={styles.hud}>
      <div className={styles.topRow}>
        <Button variant="icon" onClick={onBack} aria-label={t.backToMenuBtn}>
          ☰
        </Button>
        <div className={styles.scoreBlock}>
          <span className={styles.label}>Score</span>
          <span className={styles.score}>{score}</span>
        </div>
      </div>
      <div className={styles.nextRow}>
        <div className={styles.nextBlock}>
          <span className={styles.label}>Next</span>
          <div
            className={`${styles.next} ${styles[nextClass]}`}
            aria-label={`Next piece: ${String(nextType)}`}
          >
            {nextLabel}
          </div>
        </div>
      </div>
    </header>
  );
}
