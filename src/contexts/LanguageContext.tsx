import { createContext } from 'react';
import type { Translations } from '../locales/translations';

interface LanguageContextType {
  language: string;
  changeLanguage: (newLanguage: 'ru' | 'en') => void;
  t: Translations;
}

export const LanguageContext = createContext<LanguageContextType | undefined>(undefined);
