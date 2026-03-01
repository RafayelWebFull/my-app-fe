import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { ArrowRight, Loader2 } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { useLanguage } from '@/contexts/LanguageContext';
import { apiUrl } from '@/lib/api';
import { useSeo } from '@/lib/seo';

interface Brand {
  id: number;
  name: string;
}

interface OpticBrandRef {
  brand_id: number;
  category_slug: string;
}

const Brands = () => {
  const { t } = useLanguage();
  const brandsLabel = t('brands') === 'brands' ? 'Brands' : t('brands');

  useSeo({
    title: 'Browse Brands',
    description: 'View all eyewear brands available at Optic Gallery and open each brand collection.',
    path: '/brands',
    keywords: 'optic gallery brands, eyewear brands, sunglasses brands, glasses brands',
  });

  const { data: brands = [], isLoading } = useQuery({
    queryKey: ['brands'],
    queryFn: async () => {
      const res = await fetch(apiUrl('/api/brands'));
      if (!res.ok) return [] as Brand[];
      const data = await res.json();
      if (!Array.isArray(data)) return [] as Brand[];

      return data
        .filter((brand): brand is Brand => Boolean(brand && typeof brand.id === 'number' && typeof brand.name === 'string'))
        .sort((a, b) => a.name.localeCompare(b.name));
    },
  });

  const { data: optics = [], isLoading: isOpticsLoading } = useQuery({
    queryKey: ['optics', 'brands-page'],
    queryFn: async () => {
      const res = await fetch(apiUrl('/api/optics'));
      if (!res.ok) return [] as OpticBrandRef[];
      const data = await res.json();
      if (!Array.isArray(data)) return [] as OpticBrandRef[];

      return data.filter(
        (item): item is OpticBrandRef =>
          Boolean(
            item &&
            typeof item.brand_id === 'number' &&
            typeof item.category_slug === 'string'
          )
      );
    },
  });

  const visibleBrandIds = new Set(
    optics
      .filter((item) => item.category_slug !== 'lenses')
      .map((item) => item.brand_id)
  );

  const visibleBrands = brands.filter((brand) => visibleBrandIds.has(brand.id));

  return (
    <Layout>
      <section className="py-20 bg-secondary/50">
        <div className="container mx-auto px-4 text-center">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-heading text-4xl sm:text-5xl font-bold text-foreground mb-4"
          >
            {brandsLabel}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-lg text-muted-foreground max-w-2xl mx-auto"
          >
            Choose a brand to open its products.
          </motion.p>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4">
          {isLoading || isOpticsLoading ? (
            <div className="flex items-center justify-center py-24">
              <Loader2 className="w-10 h-10 animate-spin text-muted-foreground" />
            </div>
          ) : visibleBrands.length === 0 ? (
            <p className="text-center text-muted-foreground py-12">No brands found.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {visibleBrands.map((brand, index) => (
                <motion.div
                  key={brand.id}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.04 }}
                >
                  <Link
                    to={`/products?brand=${encodeURIComponent(String(brand.id))}`}
                    className="group flex items-center justify-between gap-4 rounded-2xl bg-card px-6 py-5 shadow-card hover:shadow-elevated transition-all"
                  >
                    <div>
                      <p className="font-heading text-xl font-semibold text-foreground">
                        {brand.name}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        View this brand
                      </p>
                    </div>
                    <span className="flex h-11 w-11 items-center justify-center rounded-full bg-secondary text-accent transition-colors group-hover:bg-accent group-hover:text-accent-foreground">
                      <ArrowRight className="w-5 h-5" />
                    </span>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
};

export default Brands;
