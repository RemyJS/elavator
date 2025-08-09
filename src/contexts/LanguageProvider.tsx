import React, { useState, useEffect, type ReactNode } from 'react';
import { translations } from '../locales/translations';
import { LanguageContext } from './LanguageContext';

// Определяем язык браузера
const getBrowserLanguage = (): string => {
  const browserLang = navigator.language || navigator.languages?.[0] || 'en';
  return browserLang.startsWith('ru') ? 'ru' : 'en';
};

// Получаем сохраненный язык или язык браузера
const getInitialLanguage = (): string => {
  const saved = localStorage.getItem('elevator-language');
  if (saved && (saved === 'ru' || saved === 'en')) {
    return saved;
  }
  return getBrowserLanguage();
};

interface LanguageProviderProps {
  children: ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const [language, setLanguage] = useState<string>(getInitialLanguage);

  // Сохраняем язык в localStorage при изменении
  useEffect(() => {
    localStorage.setItem('elevator-language', language);
  }, [language]);

  // Функция для смены языка
  const changeLanguage = (newLanguage: 'ru' | 'en') => {
    setLanguage(newLanguage);
  };

  // Получаем переводы для текущего языка
  const t = translations[language] || translations.en;

  const value = {
    language,
    changeLanguage,
    t,
  };

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
};
