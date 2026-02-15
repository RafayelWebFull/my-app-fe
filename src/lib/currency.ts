import type { Language } from '@/contexts/LanguageContext';

export type CurrencyCode = 'AMD' | 'USD' | 'RUB';

export interface ExchangeRates {
  usd: number;
  rub: number;
  updated_at?: string | null;
  source?: string;
}

export function getCurrencyByLanguage(language: Language): CurrencyCode {
  if (language === 'hy') return 'AMD';
  if (language === 'ru') return 'RUB';
  return 'USD';
}

export function toAmdNumber(value: number | string | null | undefined): number | null {
  if (value == null) return null;
  var parsed = typeof value === 'string' ? parseFloat(value) : value;
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
  var factor = Math.pow(10, decimals);
  return Math.floor(value * factor) / factor;
}

export function formatCurrency(amount: number, currency: CurrencyCode): string {
  var locale = currency === 'USD' ? 'en-US' : currency === 'RUB' ? 'ru-RU' : 'hy-AM';
  var maximumFractionDigits = currency === 'AMD' ? 0 : 2;
  var safeAmount = currency === 'AMD' ? amount : floorToDecimals(amount, 2);
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
  var numeric = toAmdNumber(amountAmd);
  if (numeric == null) return null;
  var currency = getCurrencyByLanguage(language);
  var converted = convertFromAmd(numeric, currency, rates);
  if (converted == null) return null;
  return formatCurrency(converted, currency);
}
