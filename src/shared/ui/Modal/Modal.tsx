import type { ReactNode } from 'react';
import styles from './Modal.module.css';

interface Props {
  children: ReactNode;
  role?: string;
  'aria-label'?: string;
}

export function Modal({ children, role = 'dialog', 'aria-label': ariaLabel }: Props) {
  return (
    <div className={styles.overlay} role={role} aria-label={ariaLabel}>
      <div className={styles.card}>{children}</div>
    </div>
  );
}
