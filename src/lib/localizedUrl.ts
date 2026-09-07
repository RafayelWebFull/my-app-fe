import type { Language } from '@/contexts/LanguageContext';

const SITE_ORIGIN = 'https://opticgallery.am';

/** Build a crawlable site URL that keeps the selected language explicit. */
export function localizedPath(target: string, language: Language): string {
  const url = new URL(target, SITE_ORIGIN);

  if (url.origin !== SITE_ORIGIN) return target;

  if (language === 'hy') {
    url.searchParams.delete('lang');
  } else {
    url.searchParams.set('lang', language);
  }

  return `${url.pathname}${url.search}${url.hash}`;
}
