import { Layout } from '@/components/layout/Layout';
import { Hero } from '@/components/home/Hero';
import { PromoBanner } from '@/components/home/PromoBanner';
import { Features } from '@/components/home/Features';
import { ProductsPreview } from '@/components/home/ProductsPreview';

const Index = () => {
  return (
    <Layout>
      <Hero />
      <PromoBanner />
      <Features />
      <ProductsPreview />
    </Layout>
  );
};

export default Index;
