import React, { createContext, useCallback, useContext, useState, useEffect, ReactNode } from 'react';
import { apiUrl } from '@/lib/api';

// Types for our languages and translations
export type Language = 'en' | 'ru' | 'hy';

interface BackendTranslations {
  [key: string]: string;
}

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  loading: boolean;
  refreshTranslations: (lang?: Language) => Promise<void>;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

function getInitialLanguage(): Language {
  const urlLanguage = new URLSearchParams(window.location.search).get('lang');
  if (urlLanguage && ['en', 'ru', 'hy'].includes(urlLanguage)) return urlLanguage as Language;

  const savedLanguage = localStorage.getItem('language');
  return savedLanguage && ['en', 'ru', 'hy'].includes(savedLanguage)
    ? savedLanguage as Language
    : 'hy';
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(getInitialLanguage);
  const [backendTranslations, setBackendTranslations] = useState<BackendTranslations>({});
  const [loading, setLoading] = useState<boolean>(true);

  const fetchTranslationsFor = useCallback(async (lang: Language) => {
    setLoading(true);
    try {
      const response = await fetch(apiUrl(`/api/translations/${lang}`));
      if (response.ok) {
        const data = await response.json();
        if (lang === language) {
          setBackendTranslations(data.translations || {});
        }
      } else {
        if (lang === language) setBackendTranslations({});
      }
    } catch {
      if (lang === language) setBackendTranslations({});
    } finally {
      if (lang === language) setLoading(false);
    }
  }, [language]);

  const refreshTranslations = useCallback(async (lang?: Language) => {
    const target = lang || language;
    if (target !== language) return;
    await fetchTranslationsFor(target);
  }, [fetchTranslationsFor, language]);

  // Fetch translations from backend when language changes
  useEffect(() => {
    fetchTranslationsFor(language);
    
    // Save language preference to localStorage
    localStorage.setItem('language', language);

    // Keep language in URL for SEO/shareable links.
    const url = new URL(window.location.href);
    if (language === 'hy') {
      url.searchParams.delete('lang');
    } else {
      url.searchParams.set('lang', language);
    }
    window.history.replaceState({}, '', `${url.pathname}${url.search}${url.hash}`);
  }, [fetchTranslationsFor, language]);

  const setLanguage = (lang: Language) => {
    // Update language and trigger backend API call to persist the change
    setLanguageState(lang);
  };

  const t = (key: string): string => {
    // First try to get translation from backend
    if (backendTranslations && backendTranslations[key]) {
      return backendTranslations[key];
    }
    
    // No local fallback; return key if missing
    return key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, loading, refreshTranslations }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
