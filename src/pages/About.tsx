import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Award, HeartHandshake, Sparkles, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { useLanguage } from '@/contexts/LanguageContext';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { apiUrl, imageUrl } from '@/lib/api';
import { useSeo } from '@/lib/seo';

const ABOUT_SEO_COPY: Record<
  'en' | 'ru' | 'hy',
  { title: string; text: string; bullets: string[] }
> = {
  en: {
    title: 'Why customers choose our optical store in Armenia',
    text:
      'We work with customers in Yerevan and across Armenia, helping them choose eyeglasses, sunglasses, and contact lenses for vision and daily comfort.',
    bullets: [
      'Professional support for frame and lens selection.',
      'Popular global brands and modern collections.',
      'Service standards focused on long-term eye comfort.',
    ],
  },
  ru: {
    title: 'Почему выбирают нашу оптику в Армении',
    text:
      'Мы работаем с клиентами в Ереване и по всей Армении, помогая подобрать очки для зрения, солнцезащитные очки и контактные линзы для ежедневного комфорта.',
    bullets: [
      'Профессиональная помощь в подборе оправ и линз.',
      'Популярные мировые бренды и современные коллекции.',
      'Стандарты сервиса с фокусом на комфорт зрения.',
    ],
  },
  hy: {
    title: 'Ինչու են ընտրում մեր օպտիկան Հայաստանում',
    text:
      'Մենք սպասարկում ենք հաճախորդների Երևանում և Հայաստանի ամբողջ տարածքում՝ օգնելով ընտրել տեսողության ակնոցներ, արևային ակնոցներ և կոնտակտային լինզաներ ամենօրյա հարմարավետության համար։',
    bullets: [
      'Մասնագիտական աջակցություն շրջանակների և լինզաների ընտրության հարցում։',
      'Հայտնի միջազգային բրենդներ և ժամանակակից հավաքածուներ։',
      'Սպասարկման բարձր ստանդարտներ՝ տեսողության հարմարավետության համար։',
    ],
  },
};

const ABOUT_META: Record<'en' | 'ru' | 'hy', { title: string; description: string; keywords: string }> = {
  en: {
    title: 'About Optical Store in Yerevan, Armenia',
    description:
      'Learn about Optic Gallery, an optical store in Yerevan, Armenia, and our service standards for eyeglasses, sunglasses, and lenses.',
    keywords:
      'about optic yerevan, optical store yerevan, optical store armenia, eyeglasses yerevan, sunglasses armenia',
  },
  ru: {
    title: 'О нашей оптике в Ереване, Армения',
    description:
      'Узнайте об Optic Gallery - оптике в Ереване, наших стандартах и сервисе для подбора очков и линз в Армении.',
    keywords: 'о нас оптика ереван, оптика в ереване, оптика армения, очки ереван, линзы армения',
  },
  hy: {
    title: 'Մեր օպտիկայի մասին՝ Երևան, Հայաստան',
    description:
      'Ծանոթացեք Optic Gallery-ին՝ օպտիկա Երևանում, մեր սպասարկման չափանիշներին և ակնոցների ու լինզաների ընտրության մոտեցմանը։',
    keywords: 'մեր մասին օպտիկա երևան, օպտիկա երևանում, օպտիկա հայաստան, ակնոցներ երևան, լինզաներ հայաստան',
  },
};

const About = () => {
  const { t, language } = useLanguage();
  const seoCopy = ABOUT_SEO_COPY[language];
  const meta = ABOUT_META[language];
  const { data: settings = {} } = useQuery({
    queryKey: ['site-settings'],
    queryFn: async () => {
      const res = await fetch(apiUrl('/api/site-settings'));
      if (!res.ok) return {};
      return res.json();
    },
  });

  const aboutImages = useMemo(() => {
    if (!settings.about_images) return [] as string[];
    try {
      const parsed = JSON.parse(settings.about_images);
      return Array.isArray(parsed) ? parsed.filter(Boolean) : [];
    } catch {
      return [];
    }
  }, [settings.about_images]);

  useSeo({
    title: meta.title,
    description: meta.description,
    path: '/about',
    keywords: meta.keywords,
  });

  const values = [
    {
      icon: Award,
      title: t('premiumBrands'),
      description: t('qualityDesc'),
    },
    {
      icon: HeartHandshake,
      title: t('expertService'),
      description: t('serviceDesc'),
    },
    {
      icon: Sparkles,
      title: t('modernDesign'),
      description: t('styleDesc'),
    },
  ];

  return (
    <Layout>
      {/* Hero Section */}
      <section className="py-20 bg-secondary/50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="w-20 h-20 mx-auto mb-6 rounded-2xl gradient-hero flex items-center justify-center"
            >
              <Eye className="w-10 h-10 text-primary-foreground" />
            </motion.div>
            
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="font-heading text-4xl sm:text-5xl font-bold text-foreground mb-6"
            >
              {t('aboutTitle')}
            </motion.h1>
            
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-lg text-muted-foreground leading-relaxed"
            >
              {t('aboutText1')}
            </motion.p>
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              {aboutImages.length > 0 ? (
                <Carousel opts={{ loop: aboutImages.length > 1 }} className="w-full">
                  <CarouselContent>
                    {aboutImages.map((img: string, index: number) => (
                      <CarouselItem key={`${img}-${index}`}>
                        <div className="aspect-square rounded-3xl overflow-hidden">
                          <img
                            src={imageUrl(img) || img}
                            alt={`About gallery ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </CarouselItem>
                    ))}
                  </CarouselContent>
                  {aboutImages.length > 1 && (
                    <>
                      <CarouselPrevious className="left-3 top-1/2 -translate-y-1/2 bg-background/90" />
                      <CarouselNext className="right-3 top-1/2 -translate-y-1/2 bg-background/90" />
                    </>
                  )}
                </Carousel>
              ) : (
                <div className="aspect-square rounded-3xl bg-gradient-to-br from-primary/10 via-accent/10 to-primary/5 flex items-center justify-center relative overflow-hidden">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-48 h-24 border-8 border-primary/20 rounded-[100px] relative">
                      <div className="absolute left-1/2 top-1/2 w-12 h-2 bg-primary/20 -translate-y-1/2" />
                    </div>
                  </div>
                  <div className="absolute top-10 left-10 w-24 h-24 bg-accent/10 rounded-full blur-2xl" />
                  <div className="absolute bottom-10 right-10 w-32 h-32 bg-primary/10 rounded-full blur-2xl" />
                </div>
              )}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="font-heading text-3xl sm:text-4xl font-bold text-foreground mb-6">
                {t('aboutTitle')}
              </h2>
              <div className="space-y-4 text-muted-foreground">
                <p className="text-lg leading-relaxed">
                  {t('aboutText1')}
                </p>
                <p className="text-lg leading-relaxed">
                  {t('aboutText2')}
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-24 bg-secondary/50">
        <div className="container mx-auto px-4">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="font-heading text-3xl sm:text-4xl font-bold text-foreground text-center mb-16"
          >
            {t('aboutTitle')}
          </motion.h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {values.map((value, index) => (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="bg-card rounded-2xl p-8 shadow-card text-center"
              >
                <div className="w-16 h-16 mx-auto mb-6 rounded-2xl gradient-hero flex items-center justify-center">
                  <value.icon className="w-8 h-8 text-primary-foreground" />
                </div>
                <h3 className="font-heading text-xl font-semibold text-foreground mb-3">
                  {value.title}
                </h3>
                <p className="text-muted-foreground">
                  {value.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 border-t border-border">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="font-heading text-3xl sm:text-4xl font-bold text-foreground mb-4 text-center">
              {seoCopy.title}
            </h2>
            <p className="text-lg text-muted-foreground text-center max-w-3xl mx-auto">
              {seoCopy.text}
            </p>
            <ul className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
              {seoCopy.bullets.map((bullet) => (
                <li key={bullet} className="rounded-2xl border border-border bg-card p-5 text-muted-foreground">
                  {bullet}
                </li>
              ))}
            </ul>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link
                to="/products"
                className="inline-flex rounded-full border border-border px-4 py-2 text-sm text-foreground hover:bg-secondary transition-colors"
              >
                {language === 'ru' ? 'Смотреть продукцию' : language === 'hy' ? 'Դիտել արտադրանք' : 'Browse products'}
              </Link>
              <Link
                to="/contact"
                className="inline-flex rounded-full border border-border px-4 py-2 text-sm text-foreground hover:bg-secondary transition-colors"
              >
                {language === 'ru' ? 'Контакты оптики' : language === 'hy' ? 'Օպտիկայի կոնտակտներ' : 'Optical store contact'}
              </Link>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default About;
