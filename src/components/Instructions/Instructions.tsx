import styles from './Instructions.module.css';
import { useLanguage } from '../../hooks/useLanguage';
import LanguageSwitcher from '../LanguageSwitcher';

const Instructions: React.FC = () => {
  const { t } = useLanguage();
  return (
    <div className={styles.instructions}>
      <LanguageSwitcher />
      <h3>{t.instructions.title}</h3>
      <div
        className={styles.instructionsContent}
        dangerouslySetInnerHTML={{ __html: t.instructions.content }}
      />
    </div>
  );
};

export default Instructions;
