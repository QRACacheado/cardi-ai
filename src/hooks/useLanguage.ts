'use client';

import { useState, useEffect } from 'react';
import { Language, detectBrowserLanguage, getTranslations } from '@/lib/i18n';

export const useLanguage = () => {
  const [language, setLanguage] = useState<Language>('pt');
  const [t, setT] = useState(getTranslations('pt'));

  useEffect(() => {
    // Tentar carregar idioma salvo
    const savedLanguage = localStorage.getItem('cardio-ai-language') as Language;
    
    if (savedLanguage && ['pt', 'en', 'nl', 'fr', 'de'].includes(savedLanguage)) {
      setLanguage(savedLanguage);
      setT(getTranslations(savedLanguage));
    } else {
      // Detectar idioma do navegador
      const detectedLanguage = detectBrowserLanguage();
      setLanguage(detectedLanguage);
      setT(getTranslations(detectedLanguage));
      localStorage.setItem('cardio-ai-language', detectedLanguage);
    }
  }, []);

  const changeLanguage = (newLanguage: Language) => {
    setLanguage(newLanguage);
    setT(getTranslations(newLanguage));
    localStorage.setItem('cardio-ai-language', newLanguage);
  };

  return { language, t, changeLanguage };
};
