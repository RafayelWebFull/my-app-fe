import { lazy, Suspense, useEffect, useRef, useState, type ReactNode } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Hero } from '@/components/home/Hero';
import { LocalSeoContent } from '@/components/home/LocalSeoContent';
import { useLanguage } from '@/contexts/LanguageContext';
import { useSeo } from '@/lib/seo';
import pageMeta from '@/data/pageMeta.json';

const PromoBanner = lazy(() => import('@/components/home/PromoBanner').then((module) => ({ default: module.PromoBanner })));
const ProductsPreview = lazy(() => import('@/components/home/ProductsPreview').then((module) => ({ default: module.ProductsPreview })));
const BlogPreview = lazy(() => import('@/components/home/BlogPreview').then((module) => ({ default: module.BlogPreview })));
const Features = lazy(() => import('@/components/home/Features').then((module) => ({ default: module.Features })));

function DeferredSection({ children, minHeight }: { children: ReactNode; minHeight: number }) {
  const markerRef = useRef<HTMLDivElement>(null);
  const [isNearViewport, setIsNearViewport] = useState(false);

  useEffect(() => {
    const marker = markerRef.current;
    if (!marker || isNearViewport) return;
    if (!('IntersectionObserver' in window)) {
      setIsNearViewport(true);
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsNearViewport(true);
          observer.disconnect();
        }
      },
      { rootMargin: '100px 0px' },
    );
    observer.observe(marker);
    return () => observer.disconnect();
  }, [isNearViewport]);

  return (
    <div ref={markerRef} style={isNearViewport ? undefined : { minHeight }}>
      {isNearViewport ? <Suspense fallback={<div style={{ minHeight }} aria-hidden="true" />}>{children}</Suspense> : null}
    </div>
  );
}

const INDEX_META: Record<'en' | 'ru' | 'hy', { title: string; description: string; keywords: string }> = pageMeta.home;

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
      <DeferredSection minHeight={400}>
        <PromoBanner overlap={false} />
      </DeferredSection>
      <DeferredSection minHeight={1400}>
        <ProductsPreview />
      </DeferredSection>
      <DeferredSection minHeight={620}>
        <BlogPreview />
      </DeferredSection>
      <DeferredSection minHeight={400}>
        <Features />
      </DeferredSection>
    </Layout>
  );
};

export default Index;
