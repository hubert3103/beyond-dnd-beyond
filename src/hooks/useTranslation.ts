
import { useLanguage } from '../contexts/LanguageContext';
import { translations, TranslationKey } from '../data/translations';

export const useTranslation = () => {
  const { language } = useLanguage();
  
  const t = (key: TranslationKey): string => {
    return translations[language]?.[key] || translations.en[key] || key;
  };
  
  return { t, language };
};
