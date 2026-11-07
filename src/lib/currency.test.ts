import { describe, expect, it } from 'vitest';
import { formatAmdByLanguage, formatAmdHint, getCurrencyByLanguage } from './currency';

const rates = { usd: 0.0026, rub: 0.23 };

describe('currency display', () => {
  it('shows AMD on Armenian and Russian pages, matching the Offer markup', () => {
    expect(getCurrencyByLanguage('hy')).toBe('AMD');
    expect(getCurrencyByLanguage('ru')).toBe('AMD');
    expect(formatAmdByLanguage(150000, 'ru', rates)).not.toContain('₽');
    expect(formatAmdByLanguage(150000, 'ru', rates)?.replace(/\D/g, '')).toBe('150000');
  });

  it('keeps USD as the main English price and adds a small AMD hint', () => {
    expect(getCurrencyByLanguage('en')).toBe('USD');
    expect(formatAmdByLanguage(150000, 'en', rates)).toContain('$');
    expect(formatAmdHint(150000, 'en', rates)?.replace(/\D/g, '')).toBe('150000');
    expect(formatAmdHint(150000, 'en', rates)).toContain('֏');
  });

  it('shows no AMD hint where the main price is already AMD or rates are missing', () => {
    expect(formatAmdHint(150000, 'hy', rates)).toBeNull();
    expect(formatAmdHint(150000, 'ru', rates)).toBeNull();
    expect(formatAmdHint(150000, 'en', undefined)).toBeNull();
  });
});
