import { Layout } from '@/components/layout/Layout';
import { Hero } from '@/components/home/Hero';
import { PromoBanner } from '@/components/home/PromoBanner';
import { Features } from '@/components/home/Features';
import { ProductsPreview } from '@/components/home/ProductsPreview';
import { useSeo } from '@/lib/seo';

const Index = () => {
  useSeo({
    title: 'Premium Eyewear in Yerevan',
    description: 'Shop premium eyeglasses, sunglasses, and contact lenses at Optic Gallery in Yerevan.',
    path: '/',
    keywords: 'optical store yerevan, eyeglasses armenia, sunglasses yerevan, contact lenses yerevan',
  });

  return (
    <Layout>
      <Hero />
      <PromoBanner overlap={false} />
      <ProductsPreview />
      <Features />
    </Layout>
  );
};

export default Index;
