/**
 * HUD — top strip showing score, "next" piece preview, and the 10-step bar.
 * Replaces the SwiftUI VStack section above the SpriteView.
 */
import { useEffect, useRef, useState } from 'react';
import { useGameStore } from '@entities/game/model/gameStore';
import { isColored } from '@entities/board/model/types';
import { useLocale } from '@shared/lib/useLocale';
import { Button } from '@shared/ui/Button/Button';
import styles from './Hud.module.css';

interface Props {
  onBack: () => void;
}

interface Delta {
  id: number;
  value: number;
}

export function Hud({ onBack }: Props) {
  const score = useGameStore((s) => s.score);
  const nextType = useGameStore((s) => s.nextType);
  const { t } = useLocale();

  const prevScore = useRef(score);
  const [popKey, setPopKey] = useState(0);
  const [deltas, setDeltas] = useState<Delta[]>([]);
  const deltaId = useRef(0);

  useEffect(() => {
    const diff = score - prevScore.current;
    if (diff !== 0) {
      setPopKey((k) => k + 1);
      const id = ++deltaId.current;
      setDeltas((d) => [...d, { id, value: diff }]);
      setTimeout(() => setDeltas((d) => d.filter((x) => x.id !== id)), 900);
    }
    prevScore.current = score;
  }, [score]);

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
          <div className={styles.scoreWrap}>
            {deltas.map((d) => (
              <span key={d.id} className={styles.delta}>
                +{d.value}
              </span>
            ))}
            <span key={popKey} className={styles.score}>
              {score}
            </span>
          </div>
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
