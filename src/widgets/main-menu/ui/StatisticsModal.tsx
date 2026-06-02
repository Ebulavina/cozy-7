import { useGameStore } from '@entities/game/model/gameStore';
import { useLocale } from '@shared/lib/useLocale';
import { Button } from '@shared/ui/Button/Button';
import { Modal } from '@shared/ui/Modal/Modal';
import styles from './StatisticsModal.module.css';

interface Props {
  onClose: () => void;
}

export function StatisticsModal({ onClose }: Props) {
  const bestScore = useGameStore((s) => s.bestScore);
  const bestCombo = useGameStore((s) => s.bestCombo);
  const bestComboScore = useGameStore((s) => s.bestComboScore);
  const { t } = useLocale();

  return (
    <Modal aria-label={t.statistics}>
      <span className={styles.title}>{t.statistics}</span>
      <div className={styles.rows}>
        <div className={styles.row}>
          <span className={styles.title}>{t.statBestScore}</span>
          <span className={styles.rowValue}>{bestScore}</span>
        </div>
        <div className={styles.row}>
          <span className={styles.title}>{t.statBestComboScore}</span>
          <span className={styles.rowValue}>{bestComboScore}</span>
        </div>
        <div className={styles.row}>
          <span className={styles.title}>{t.statBestCombo}</span>
          <span className={styles.rowValue}>{bestCombo}</span>
        </div>
      </div>
      <div className={styles.actions}>
        <Button variant="ghost" onClick={onClose}>{t.close}</Button>
      </div>
    </Modal>
  );
}
