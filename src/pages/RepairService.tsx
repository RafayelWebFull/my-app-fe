import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Layout } from '@/components/layout/Layout';
import { useLanguage } from '@/contexts/LanguageContext';
import { useSeo } from '@/lib/seo';
import { apiUrl, imageUrl } from '@/lib/api';

export default function RepairService() {
  const { t } = useLanguage();
  const { data: settings = {} } = useQuery({
    queryKey: ['site-settings'],
    queryFn: async () => {
      const res = await fetch(apiUrl('/api/site-settings'));
      if (!res.ok) return {};
      return res.json();
    },
  });

  const photos = useMemo(() => {
    const result: string[] = [];
    const raw = settings.repair_images;
    if (typeof raw === 'string' && raw.trim()) {
      try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          parsed.forEach((img) => {
            if (typeof img === 'string' && img.trim()) {
              result.push(imageUrl(img) || img);
            }
          });
        }
      } catch {
        // ignore bad JSON
      }
    }
    if (result.length === 0) {
      result.push('/logo.png', '/logo.png');
    }
    if (result.length === 1) {
      result.push(result[0]);
    }
    return result.slice(0, 2);
  }, [settings]);

  useSeo({
    title: 'Repair Service Center',
    description: 'Request eyewear repair service at Optic Gallery.',
    path: '/repair-service',
  });

  return (
    <Layout>
      <section className="pt-20 pb-0 bg-secondary/50">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl">
            <h1 className="font-heading text-4xl sm:text-5xl font-bold text-foreground">
              {t('repairServiceCenter')}
            </h1>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl rounded-2xl border bg-card p-6 sm:p-8 shadow-card">
            <h2 className="font-heading text-2xl font-semibold text-foreground mb-6">
              {t('repairServiceCenter')}
            </h2>

            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                <div className="rounded-xl overflow-hidden border bg-secondary/40">
                  <img
                    src={photos[0]}
                    alt={`${t('repairServiceCenter')} 1`}
                    className="w-full h-64 object-cover"
                  />
                </div>
                <div>
                  <p className="text-muted-foreground whitespace-pre-line leading-relaxed">
                    {t('repairServiceDescriptionTop')}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                <div className="order-2 md:order-1">
                  <p className="text-muted-foreground whitespace-pre-line leading-relaxed">
                    {t('repairServiceDescriptionBottom')}
                  </p>
                </div>
                <div className="order-1 md:order-2 rounded-xl overflow-hidden border bg-secondary/40">
                  <img
                    src={photos[1]}
                    alt={`${t('repairServiceCenter')} 2`}
                    className="w-full h-64 object-cover"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
