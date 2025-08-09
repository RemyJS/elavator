import React from 'react';
import styles from './LanguageSwitcher.module.css';
import { useLanguage } from '../../contexts/LanguageContext';

const LanguageSwitcher: React.FC = () => {
  const { language, changeLanguage } = useLanguage();
  return (
    <div className={styles.languageSwitcher}>
      <button
        className={`${styles.languageButton} ${language === 'ru' ? styles.active : ''}`}
        onClick={() => changeLanguage('ru')}
        title="Русский"
      >
        RU
      </button>
      <button
        className={`${styles.languageButton} ${language === 'en' ? styles.active : ''}`}
        onClick={() => changeLanguage('en')}
        title="English"
      >
        EN
      </button>
    </div>
  );
};

export default LanguageSwitcher;
