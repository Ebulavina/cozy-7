/**
 * Minimal text button: thin border, fills on hover, no shadows.
 * Replaces SwiftUI's `.buttonStyle(.bordered)` with a calmer, flatter aesthetic.
 */
import type { ButtonHTMLAttributes, ReactNode } from 'react';
import styles from './Button.module.css';

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'ghost';
  children: ReactNode;
};

export function Button({ variant = 'primary', className, children, ...rest }: Props) {
  const cls = [styles.button, styles[variant], className].filter(Boolean).join(' ');
  return (
    <button {...rest} className={cls}>
      {children}
    </button>
  );
}
