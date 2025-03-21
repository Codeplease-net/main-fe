import { useState, useCallback, useEffect } from 'react';
import { 
  LanguageCode, 
  SUPPORTED_LANGUAGES, 
  DEFAULT_LANGUAGE,
  isValidLanguage 
} from '../types/language';

interface UseLanguageReturn {
  currentLanguage: LanguageCode;
  availableLanguages: typeof SUPPORTED_LANGUAGES;
  switchLanguage: (code: LanguageCode) => void;
  getLanguageName: (code: LanguageCode) => string;
  isRTL: boolean;
}

export function useLanguage(initialLang?: LanguageCode): UseLanguageReturn {
  const [currentLanguage, setCurrentLanguage] = useState<LanguageCode>(
    () => {
      if (initialLang && isValidLanguage(initialLang)) {
        return initialLang;
      }
      return DEFAULT_LANGUAGE;
    }
  );

  const switchLanguage = useCallback((code: LanguageCode) => {
    if (isValidLanguage(code)) {
      setCurrentLanguage(code);
      localStorage.setItem('preferredLanguage', code);
    }
  }, []);

  const getLanguageName = useCallback((code: LanguageCode) => {
    return SUPPORTED_LANGUAGES[code].name;
  }, []);

  useEffect(() => {
    const storedLang = localStorage.getItem('preferredLanguage');
    if (storedLang && isValidLanguage(storedLang)) {
      setCurrentLanguage(storedLang);
    }
  }, []);

  return {
    currentLanguage,
    availableLanguages: SUPPORTED_LANGUAGES,
    switchLanguage,
    getLanguageName,
    isRTL: SUPPORTED_LANGUAGES[currentLanguage].direction === 'rtl'
  };
}

export function useMultiLanguageContent<T>(
  content: Record<LanguageCode, T>,
  language: LanguageCode
): T {
  return content[language];
}