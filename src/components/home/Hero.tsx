import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { ArrowRight, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { apiUrl, imageUrl } from '@/lib/api';

const HEX_COLOR_RE = /^#(?:[0-9a-fA-F]{3}){1,2}$/;

function toColorOrUndefined(raw: string | undefined): string | undefined {
  if (!raw) return undefined;
  return HEX_COLOR_RE.test(raw) ? raw : undefined;
}

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
  const heroTitle = t('heroTitle');
  const titleColor = toColorOrUndefined(settings.hero_title_color);
  const heroTitleWords = heroTitle.trim().split(/\s+/).filter(Boolean);
  const totalLen = heroTitleWords.join(' ').length;
  let accLen = 0;
  let splitIndex = 1;
  for (let i = 0; i < heroTitleWords.length; i += 1) {
    accLen += heroTitleWords[i].length + (i > 0 ? 1 : 0);
    if (accLen >= totalLen / 2) {
      splitIndex = i + 1;
      break;
    }
  }
  if (heroTitleWords[splitIndex] === '&') {
    splitIndex += 1;
  }
  const heroTitleLine1 = heroTitleWords.slice(0, splitIndex).join(' ');
  const heroTitleLine2 = heroTitleWords.slice(splitIndex).join(' ');

  return (
    <section className="relative min-h-[90vh] overflow-hidden">
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

      <div className="container mx-auto px-4 relative z-10 min-h-[90vh] pt-24 pb-8">
        <div className="max-w-3xl min-h-[calc(90vh-8rem)] flex flex-col">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="font-heading text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-foreground leading-tight mb-6"
            style={titleColor ? { color: titleColor } : undefined}
          >
            <span className="sm:hidden leading-[1.15]">
              <span className="block">{heroTitleLine1}</span>
              <span className="block">{heroTitleLine2}</span>
            </span>
            <span className="hidden sm:inline">{heroTitle}</span>
          </motion.h1>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 mt-auto pt-6"
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
