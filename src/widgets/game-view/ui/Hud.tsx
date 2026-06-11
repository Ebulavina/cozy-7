/**
 * HUD — top strip showing score, "next" piece preview, and the 10-step bar.
 * Replaces the SwiftUI VStack section above the SpriteView.
 */
import { useEffect, useRef, useState } from 'react';
import { useGameStore } from '@entities/game/model/gameStore';
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
  // const bestScore = useGameStore((s) => s.bestScore);
  // const bestComboScore = useGameStore((s) => s.bestComboScore);
  const { t, formatNumber } = useLocale();

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

  return (
    <header className={styles.hud}>
      <div className={styles.topRow}>
        <Button variant="icon" onClick={onBack} aria-label={t.backToMenuBtn}>
          ☰
        </Button>
        <div className={styles.scores}>
          {/* <div className={styles.scoreBlock}>
            <span className={styles.label}>{t.best}</span>
            <span className={styles.score}>{bestScore}</span>
          </div>
          <div className={styles.scoreBlock}>
            <span className={styles.label}>{t.bestComboScore}</span>
            <span className={styles.score}>{bestComboScore}</span>
          </div> */}
          <div className={styles.scoreBlock}>
            <span className={styles.label}>Score</span>
            <div className={styles.scoreWrap}>
              {deltas.map((d) => (
                <span key={d.id} className={styles.delta}>
                  +{formatNumber(d.value)}
                </span>
              ))}
              <span key={popKey} className={styles.score}>
                {formatNumber(score)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
