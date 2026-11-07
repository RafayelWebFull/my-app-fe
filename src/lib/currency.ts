import type { Language } from '@/contexts/LanguageContext';

export type CurrencyCode = 'AMD' | 'USD' | 'RUB';

export interface ExchangeRates {
  usd: number;
  rub: number;
  updated_at?: string | null;
  source?: string;
}

export function getCurrencyByLanguage(language: Language): CurrencyCode {
  // Prices are set in AMD; Russian pages show AMD too so the visible price matches the Offer markup.
  if (language === 'hy' || language === 'ru') return 'AMD';
  return 'USD';
}

export function toAmdNumber(value: number | string | null | undefined): number | null {
  if (value == null) return null;
  const parsed = typeof value === 'string' ? parseFloat(value) : value;
  if (Number.isNaN(parsed) || !Number.isFinite(parsed)) return null;
  return parsed;
}

export function convertFromAmd(amountAmd: number, currency: CurrencyCode, rates?: ExchangeRates): number | null {
  if (currency === 'AMD') return amountAmd;
  if (!rates) return null;
  if (currency === 'USD') return amountAmd * rates.usd;
  return amountAmd * rates.rub;
}

function floorToDecimals(value: number, decimals: number): number {
  const factor = Math.pow(10, decimals);
  return Math.floor(value * factor) / factor;
}

export function formatCurrency(amount: number, currency: CurrencyCode): string {
  const locale = currency === 'USD' ? 'en-US' : currency === 'RUB' ? 'ru-RU' : 'hy-AM';
  const maximumFractionDigits = currency === 'AMD' ? 0 : 2;
  const safeAmount = currency === 'AMD' ? amount : floorToDecimals(amount, 2);
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    maximumFractionDigits,
    minimumFractionDigits: currency === 'AMD' ? 0 : 2,
  }).format(safeAmount);
}

export function formatAmdByLanguage(
  amountAmd: number | string | null | undefined,
  language: Language,
  rates?: ExchangeRates
): string | null {
  const numeric = toAmdNumber(amountAmd);
  if (numeric == null) return null;
  const currency = getCurrencyByLanguage(language);
  const converted = convertFromAmd(numeric, currency, rates);
  // If rates are not loaded yet (EN/RU), still show AMD so the price is visible.
  if (converted == null) return formatCurrency(numeric, 'AMD');
  return formatCurrency(converted, currency);
}

/**
 * Secondary AMD price shown next to a converted price, e.g. "$385.00 (150 000 ֏)".
 * Returns null when the main price is already AMD or the rates are not loaded yet
 * (in that case the main price falls back to AMD itself).
 */
export function formatAmdHint(
  amountAmd: number | string | null | undefined,
  language: Language,
  rates?: ExchangeRates
): string | null {
  const numeric = toAmdNumber(amountAmd);
  if (numeric == null || getCurrencyByLanguage(language) === 'AMD' || !rates) return null;
  return formatCurrency(numeric, 'AMD');
}
