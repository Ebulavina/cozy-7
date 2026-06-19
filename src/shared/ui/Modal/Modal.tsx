import type { ReactNode } from 'react';
import styles from './Modal.module.css';

interface Props {
  children: ReactNode;
  onClose?: () => void;
  role?: string;
  'aria-label'?: string;
}

export function Modal({ children, onClose, role = 'dialog', 'aria-label': ariaLabel }: Props) {
  return (
    <div className={styles.overlay} role={role} aria-label={ariaLabel} onClick={onClose}>
      <div className={styles.card} onClick={e => e.stopPropagation()}>{children}</div>
    </div>
  );
}
