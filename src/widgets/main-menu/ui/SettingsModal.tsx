import { useTheme } from '@shared/lib/useTheme';
import { useLocale } from '@shared/lib/useLocale';
import { Button } from '@shared/ui/Button/Button';
import { Modal } from '@shared/ui/Modal/Modal';
import styles from './SettingsModal.module.css';

interface Props {
  onClose: () => void;
}

export function SettingsModal({ onClose }: Props) {
  const { theme, toggle } = useTheme();
  const { t, toggleLocale } = useLocale();

  return (
    <Modal aria-label={t.settings} onClose={onClose}>
      <span className={styles.title}>{t.settings}</span>
      <div className={styles.rows}>
        <div className={styles.row}>
          <span className={styles.label}>{t.settingsTheme}</span>
          <Button className={styles.themeBtn} variant="ghost" onClick={toggle}>
            {theme === 'dark' ? t.themeDark : theme === 'neon' ? t.themeNeon : t.themeLight}
            <span>{theme === 'dark' ? '☾' : theme === 'neon' ? '⚡' : '☀'}</span>
          </Button>
        </div>
        <div className={styles.row}>
          <span className={styles.label}>{t.settingsLanguage}</span>
          <Button variant="ghost" onClick={toggleLocale}>{t.toggleLocale}</Button>
        </div>
      </div>
      <div className={styles.actions}>
        <Button variant="ghost" onClick={onClose}>{t.close}</Button>
      </div>
    </Modal>
  );
}
