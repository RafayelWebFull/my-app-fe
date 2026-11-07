import type { Language } from '@/contexts/LanguageContext';
import { formatAmdHint, type ExchangeRates } from '@/lib/currency';

type Props = {
  amountAmd: number | string | null | undefined;
  language: Language;
  rates?: ExchangeRates;
};

/** Small "(150 000 ֏)" shown after a converted price on English pages. */
export function AmdPriceHint({ amountAmd, language, rates }: Props) {
  const hint = formatAmdHint(amountAmd, language, rates);
  if (!hint) return null;
  return <span className="ml-1 whitespace-nowrap text-xs font-normal text-muted-foreground">({hint})</span>;
}
