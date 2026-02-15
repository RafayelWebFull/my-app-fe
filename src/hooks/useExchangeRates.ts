import { useQuery } from '@tanstack/react-query';
import { apiUrl } from '@/lib/api';
import { type ExchangeRates } from '@/lib/currency';

export function useExchangeRates() {
  return useQuery({
    queryKey: ['exchange-rates'],
    queryFn: async (): Promise<ExchangeRates> => {
      const res = await fetch(apiUrl('/api/exchange-rates'));
      if (!res.ok) throw new Error('Failed to fetch exchange rates');
      const data = await res.json();
      if (typeof data?.usd !== 'number' || typeof data?.rub !== 'number') {
        throw new Error('Invalid exchange rates payload');
      }
      return data;
    },
    staleTime: 60 * 1000,
    refetchInterval: 60 * 1000,
    refetchOnWindowFocus: true,
  });
}
