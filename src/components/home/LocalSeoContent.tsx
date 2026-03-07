import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';

type Copy = {
  title: string;
  intro: string;
  points: string[];
  links: { label: string; to: string }[];
};

const COPY_BY_LANG: Record<'en' | 'ru' | 'hy', Copy> = {
  en: {
    title: 'Optical Store in Armenia and Yerevan',
    intro:
      'Optic Gallery is an optical store in Yerevan, Armenia. We offer prescription eyeglasses, sunglasses, and contact lenses for daily wear, style, and eye comfort.',
    points: [
      'Wide range of frames and lenses from trusted international brands.',
      'Selection support for men, women, and unisex models for different face shapes.',
      'Service for customers from Yerevan and all regions of Armenia.',
    ],
    links: [
      { label: 'Optical Store Yerevan Catalog', to: '/products' },
      { label: 'View brands', to: '/brands' },
      { label: 'Contact optical store', to: '/contact' },
    ],
  },
  ru: {
    title: 'Оптика в Армении и Ереване',
    intro:
      'Optic Gallery - оптика в Ереване, Армения. У нас можно подобрать очки для зрения, солнцезащитные очки и контактные линзы для повседневного комфорта и стиля.',
    points: [
      'Большой выбор оправ и линз от надежных международных брендов.',
      'Помощь в подборе мужских, женских и унисекс моделей под форму лица.',
      'Обслуживание клиентов из Еревана и всех регионов Армении.',
    ],
    links: [
      { label: 'Оптика в Ереване: каталог', to: '/products' },
      { label: 'Смотреть бренды', to: '/brands' },
      { label: 'Связаться с оптикой', to: '/contact' },
    ],
  },
  hy: {
    title: 'Օպտիկա Հայաստանում և Երևանում',
    intro:
      'Optic Gallery-ը օպտիկա է Երևանում, Հայաստանում։ Առաջարկում ենք տեսողության ակնոցներ, արևային ակնոցներ և կոնտակտային լինզաներ ամենօրյա հարմարավետության և ոճի համար։',
    points: [
      'Շրջանակների և լինզաների լայն ընտրանի վստահելի միջազգային բրենդներից։',
      'Օգնություն տղամարդկանց, կանանց և unisex մոդելների ընտրության հարցում՝ դեմքի ձևին համապատասխան։',
      'Սպասարկում Երևանի և Հայաստանի բոլոր մարզերից հաճախորդների համար։',
    ],
    links: [
      { label: 'Օպտիկա Երևանում՝ կատալոգ', to: '/products' },
      { label: 'Դիտել բրենդներ', to: '/brands' },
      { label: 'Կապ օպտիկայի հետ', to: '/contact' },
    ],
  },
};

export function LocalSeoContent() {
  const { language } = useLanguage();
  const copy = COPY_BY_LANG[language];

  return (
    <section className="py-16 border-y border-border bg-background">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="max-w-4xl mx-auto"
        >
          <h2 className="font-heading text-3xl sm:text-4xl font-bold text-foreground mb-4 text-center">
            {copy.title}
          </h2>
          <p className="text-muted-foreground text-lg leading-relaxed text-center mb-8">
            {copy.intro}
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {copy.points.map((point, index) => (
              <article
                key={`${index}-${point}`}
                className="rounded-2xl border border-border bg-card px-5 py-4 text-muted-foreground"
              >
                {point}
              </article>
            ))}
          </div>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            {copy.links.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className="inline-flex rounded-full border border-border px-4 py-2 text-sm text-foreground hover:bg-secondary transition-colors"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
