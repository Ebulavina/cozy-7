import { useGameStore } from '@entities/game/model/gameStore';
import { useLocale } from '@shared/lib/useLocale';
import styles from './ToastBanner.module.css';

export function ToastBanner() {
  const toasts = useGameStore((s) => s.toasts);
  const popToast = useGameStore((s) => s.popToast);
  const { t } = useLocale();

  const toast = toasts[0];

  return (
    <div className={styles.layer} aria-live="polite" aria-atomic="true">
      {toast && (
        <span
          key={toast.id}
          className={styles.toast}
          data-variant={toast.variant}
          onAnimationEnd={() => popToast(toast.id)}
        >
          {t[toast.key]}{toast.value !== undefined ? ` +${toast.value}` : ''}
        </span>
      )}
    </div>
  );
}
