import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { ArrowRight, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { apiUrl, imageUrl } from '@/lib/api';

export function Hero() {
  const { t } = useLanguage();

  const { data: settings = {} } = useQuery({
    queryKey: ['site-settings'],
    queryFn: async () => {
      const res = await fetch(apiUrl('/api/site-settings'));
      if (!res.ok) return {};
      return res.json();
    },
  });

  const heroImage = settings.hero_image;
  const heroTitle = settings.hero_title || t('heroTitle');
  const heroSubtitle = settings.hero_subtitle || t('heroSubtitle');

  return (
    <section className="relative min-h-[90vh] flex items-center overflow-hidden">
      {heroImage ? (
        <div className="absolute inset-0">
          <img
            src={imageUrl(heroImage) || heroImage}
            alt=""
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/40" />
        </div>
      ) : (
        <>
          <div className="absolute inset-0 gradient-hero opacity-5" />
          <div className="absolute top-20 right-10 w-72 h-72 bg-accent/10 rounded-full blur-3xl" />
          <div className="absolute bottom-20 left-10 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        </>
      )}

      {/* Floating Glasses Shapes */}
      <div className="absolute top-1/4 right-[15%] hidden lg:block">
        <motion.div
          animate={{ y: [0, -20, 0], rotate: [0, 5, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          className="w-32 h-16 border-4 border-accent/30 rounded-[100px] relative"
        >
          <div className="absolute left-1/2 top-1/2 w-8 h-1 bg-accent/30 -translate-y-1/2" />
        </motion.div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-3xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <span className="inline-flex items-center gap-2 px-4 py-2 bg-accent/10 text-accent rounded-full text-sm font-medium mb-6">
              <MapPin className="w-4 h-4" />
              {t('addressValue')}
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="font-heading text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-foreground leading-tight mb-6"
          >
            {heroTitle}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-lg sm:text-xl text-muted-foreground max-w-2xl mb-8"
          >
            {heroSubtitle}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4"
          >
            <Button asChild size="lg" className="gradient-hero border-0 text-lg px-8 py-6 shadow-elevated hover:opacity-90 transition-opacity">
              <Link to="/contact">
                <MapPin className="w-5 h-5 mr-2" />
                {t('visitStore')}
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="text-lg px-8 py-6 border-2 hover:bg-secondary">
              <Link to="/contact">
                {t('contactUs')}
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
            </Button>
          </motion.div>
        </div>
      </div>

      {!heroImage && (
        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1/2 h-full hidden xl:block">
          <div className="relative w-full h-full">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, delay: 0.4 }}
              className="absolute inset-0 flex items-center justify-center"
            >
              <div className="w-[500px] h-[500px] rounded-full bg-gradient-to-br from-accent/20 to-primary/20 blur-2xl" />
            </motion.div>
          </div>
        </div>
      )}
    </section>
  );
}
