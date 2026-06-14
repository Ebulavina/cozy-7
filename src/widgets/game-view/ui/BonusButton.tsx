import type { CSSProperties } from 'react';
import styles from './BonusButton.module.css';

interface Props {
  icon: string;
  count: number;
  color: string;
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
  'aria-label': string;
}

export function BonusButton({ icon, count, color, active, disabled, onClick, 'aria-label': label }: Props) {
  return (
    <div className={`${styles.wrap} ${disabled ? styles.disabled : ''}`}>
      <button
        className={`${styles.btn} ${active ? styles.active : ''}`}
        style={{ '--btn-color': color } as CSSProperties}
        onClick={onClick}
        disabled={disabled}
        aria-label={label}
        aria-pressed={active}
      >
        <span className={styles.icon}>{icon}</span>
      </button>
      <span className={styles.badge}>{count}</span>
    </div>
  );
}
