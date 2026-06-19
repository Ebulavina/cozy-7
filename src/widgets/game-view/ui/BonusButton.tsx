import type { CSSProperties, ReactNode } from 'react';
import styles from './BonusButton.module.css';

interface Props {
  icon: ReactNode;
  count: number;
  color: string;
  active?: boolean;
  disabled?: boolean;
  hint?: string;
  onClick: () => void;
  'aria-label': string;
}

export function BonusButton({ icon, count, color, active, disabled, hint, onClick, 'aria-label': label }: Props) {
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
      {active && hint && (
        <div className={styles.tooltip} role="tooltip">{hint}</div>
      )}
    </div>
  );
}
