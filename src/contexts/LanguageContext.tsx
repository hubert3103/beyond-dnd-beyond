
import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'en' | 'nl' | 'pl';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  hasSelectedLanguage: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>('en');
  const [hasSelectedLanguage, setHasSelectedLanguage] = useState(false);

  useEffect(() => {
    const savedLanguage = localStorage.getItem('dnd-language') as Language;
    const hasSelected = localStorage.getItem('dnd-language-selected') === 'true';
    
    if (savedLanguage) {
      setLanguageState(savedLanguage);
    }
    setHasSelectedLanguage(hasSelected);
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('dnd-language', lang);
    localStorage.setItem('dnd-language-selected', 'true');
    setHasSelectedLanguage(true);
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, hasSelectedLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};
