import { Layout } from '@/components/layout/Layout';
import { Hero } from '@/components/home/Hero';
import { LocalSeoContent } from '@/components/home/LocalSeoContent';
import { PromoBanner } from '@/components/home/PromoBanner';
import { Features } from '@/components/home/Features';
import { ProductsPreview } from '@/components/home/ProductsPreview';
import { useLanguage } from '@/contexts/LanguageContext';
import { useSeo } from '@/lib/seo';

const INDEX_META: Record<'en' | 'ru' | 'hy', { title: string; description: string; keywords: string }> = {
  en: {
    title: 'Optical Store in Armenia and Yerevan',
    description: 'Optic Gallery is an optical store in Yerevan, Armenia. Shop eyeglasses, sunglasses, and contact lenses.',
    keywords:
      'optical store armenia, optical store yerevan, optic yerevan, eyeglasses armenia, sunglasses yerevan, contact lenses armenia',
  },
  ru: {
    title: 'Оптика в Армении и Ереване',
    description:
      'Optic Gallery - оптика в Ереване, Армения. Очки для зрения, солнцезащитные очки и контактные линзы.',
    keywords:
      'оптика армения, оптика ереван, очки ереван, солнцезащитные очки армения, контактные линзы ереван',
  },
  hy: {
    title: 'Օպտիկա Հայաստանում և Երևանում',
    description:
      'Optic Gallery-ը օպտիկա է Երևանում, Հայաստանում։ Տեսողության ակնոցներ, արևային ակնոցներ և կոնտակտային լինզաներ։',
    keywords:
      'օպտիկա հայաստան, օպտիկա երևան, ակնոցներ երևան, արևային ակնոցներ հայաստան, կոնտակտային լինզաներ երևան',
  },
};

const Index = () => {
  const { language } = useLanguage();
  const meta = INDEX_META[language];

  useSeo({
    title: meta.title,
    description: meta.description,
    path: '/',
    keywords: meta.keywords,
  });

  return (
    <Layout>
      <Hero />
      <LocalSeoContent />
      <PromoBanner overlap={false} />
      <ProductsPreview />
      <Features />
    </Layout>
  );
};

export default Index;
