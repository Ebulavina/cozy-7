import { useLocale } from '@shared/lib/useLocale';
import { Button } from '@shared/ui/Button/Button';
import { Modal } from '@shared/ui/Modal/Modal';
import styles from './HowToPlayModal.module.css';

interface Props {
  onClose: () => void;
}

export function HowToPlayModal({ onClose }: Props) {
  const { t } = useLocale();

  const rules = [t.htpIntro, t.htpMatch, t.htpDouble, t.htpObstacles, t.htpRows, t.htpGameOver];

  return (
    <Modal aria-label={t.howToPlayTitle} onClose={onClose}>
      <span className={styles.title}>{t.howToPlayTitle}</span>
      <ul className={styles.list}>
        {rules.map((rule) => (
          <li key={rule} className={styles.item}>{rule}</li>
        ))}
      </ul>
      <div className={styles.actions}>
        <Button variant="ghost" onClick={onClose}>{t.close}</Button>
      </div>
    </Modal>
  );
}
