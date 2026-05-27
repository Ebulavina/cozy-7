/**
 * Port of Source/Combination/Views/ProgressBar/ProgressBar.swift.
 * Visual replaces capsules with thin rectangles for a more typographic feel.
 *
 * `value` is in [0, total]. Each segment fills fully or stays empty — no
 * partial fills, matching the iOS DashBarItemView behaviour.
 */
import styles from './StepBar.module.css';

interface Props {
  value: number; // 0..total
  total: number;
  ariaLabel?: string;
}

export function StepBar({ value, total, ariaLabel }: Props) {
  return (
    <div
      className={styles.bar}
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={total}
      aria-valuenow={value}
      aria-label={ariaLabel ?? 'Steps until new row'}
    >
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className={`${styles.segment} ${i < value ? styles.filled : ''}`}
        />
      ))}
    </div>
  );
}
