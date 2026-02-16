import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { apiUrl, imageUrl } from '@/lib/api';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from '@/components/ui/carousel';

interface Banner {
  id: number;
  image_url: string | null;
  title: string;
  description: string | null;
  start_date: string;
  end_date: string;
  discount_percent: number;
  target_type?: 'all' | 'brand' | 'optic';
  target_id?: number | null;
}

function formatDate(d: string) {
  if (!d) return '';
  return new Date(d).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
}

function BannerSlide({
  banner,
  t,
}: {
  banner: Banner;
  t: (key: string) => string;
}) {
  const productsUrl = `/products?banner=${encodeURIComponent(String(banner.id))}`;

  return (
    <Link
      to={productsUrl}
      className="block w-full group relative overflow-hidden"
    >
      {banner.image_url ? (
        <div className="relative h-[220px] sm:h-[260px] md:h-[320px] lg:h-[360px] max-h-[360px]">
          <img
            src={imageUrl(banner.image_url) || banner.image_url || ''}
            alt={banner.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent" />
        </div>
      ) : (
        <div className="relative h-[220px] sm:h-[260px] md:h-[320px] lg:h-[360px] max-h-[360px] bg-gradient-to-r from-accent via-primary to-accent/80" />
      )}

      <div className="absolute inset-0 flex flex-col p-6 md:p-10 lg:p-12">
        <div className="max-w-2xl">
          <span className="inline-block px-3 py-1 bg-amber-500 text-white text-sm font-bold rounded-full mb-3">
            {banner.discount_percent}% {t('discountOff')}
          </span>
          <h2 className="font-heading text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-2">
            {banner.title}
          </h2>
          {banner.description && (
            <p className="text-white/90 text-sm md:text-base mb-4">{banner.description}</p>
          )}
          <p className="text-white/80 text-xs md:text-sm">
            {t('bannerValidFrom')} {formatDate(banner.start_date)} {t('bannerValidTo')}{' '}
            {formatDate(banner.end_date)}
          </p>
        </div>
      </div>
    </Link>
  );
}

export function PromoBanner({ overlap = true }: { overlap?: boolean }) {
  const { t } = useLanguage();
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (!api) return;
    setCurrent(api.selectedScrollSnap());
    api.on('select', () => setCurrent(api.selectedScrollSnap()));
  }, [api]);

  const { data: banners = [] } = useQuery({
    queryKey: ['banners'],
    queryFn: async () => {
      const res = await fetch(apiUrl('/api/banners'));
      if (!res.ok) return [];
      return res.json();
    },
  });

  if (!banners.length) return null;

  const isSlider = banners.length > 1;

  return (
    <section className={`${overlap ? '-mt-24 md:-mt-32' : 'mt-0'} w-full pb-8 relative z-10`}>
      {isSlider ? (
        <Carousel
          setApi={setApi}
          opts={{ loop: true }}
          className="w-full"
        >
          <div className="relative">
            <CarouselContent className="-ml-0">
              {banners.map((banner: Banner, index: number) => (
                <CarouselItem key={banner.id} className="pl-0">
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <BannerSlide banner={banner} t={t} />
                  </motion.div>
                </CarouselItem>
              ))}
            </CarouselContent>
          </div>
          <div className="flex justify-center gap-2 mt-4">
            {banners.map((_, index) => (
              <button
                key={index}
                onClick={() => api?.scrollTo(index)}
                className={`h-2 rounded-full transition-all ${
                  current === index
                    ? 'w-6 bg-accent'
                    : 'w-2 bg-black hover:bg-black/80'
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </Carousel>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <BannerSlide banner={banners[0]} t={t} />
        </motion.div>
      )}
    </section>
  );
}
