import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Glasses, Sun, Eye, ArrowRight, Loader2, Search, ShoppingCart } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { useLanguage } from '@/contexts/LanguageContext';
import { useCart } from '@/contexts/CartContext';
import { apiUrl, imageUrl } from '@/lib/api';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';

export interface Optic {
  id: number;
  name: string;
  brand_name: string;
  style: string;
  category_slug: string;
  category_name: string;
  image_url: string | null;
  price: number | string | null;
  description: string | null;
  in_stock?: boolean | number;
  discount?: number | null;
}

const categoryIcons: Record<string, typeof Glasses> = {
  optic: Glasses,
  sunglasses: Sun,
  lenses: Eye,
};

const Products = () => {
  const { t } = useLanguage();
  const { addItem } = useCart();
  const [searchParams] = useSearchParams();
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [categoryFilter, setCategoryFilter] = useState<string>(
    searchParams.get('category') || 'all'
  );
  const [brandFilter, setBrandFilter] = useState<string>(
    searchParams.get('brand') || 'all'
  );

  useEffect(() => {
    setSearch(searchParams.get('search') || '');
    setCategoryFilter(searchParams.get('category') || 'all');
    setBrandFilter(searchParams.get('brand') || 'all');
  }, [searchParams]);

  const queryParams = new URLSearchParams();
  if (categoryFilter !== 'all') queryParams.set('category', categoryFilter);
  if (brandFilter !== 'all') queryParams.set('brand', brandFilter);
  if (search.trim()) queryParams.set('search', search.trim());

  const { data: optics = [], isLoading } = useQuery({
    queryKey: ['optics', categoryFilter, brandFilter, search],
    queryFn: async () => {
      const url = queryParams.toString() ? apiUrl(`/api/optics?${queryParams}`) : apiUrl('/api/optics');
      const res = await fetch(url);
      if (!res.ok) throw new Error('Failed to fetch optics');
      return res.json() as Promise<Optic[]>;
    },
  });

  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const res = await fetch(apiUrl('/api/categories'));
      if (!res.ok) return [];
      return res.json();
    },
  });

  const { data: brandsList = [] } = useQuery({
    queryKey: ['brands'],
    queryFn: async () => {
      const res = await fetch(apiUrl('/api/brands'));
      if (!res.ok) return [];
      return res.json();
    },
  });

  const hasFilters = categoryFilter !== 'all' || brandFilter !== 'all' || search.trim();
  const opticsByCategory = hasFilters
    ? { filtered: optics }
    : {
        optic: optics.filter((o) => o.category_slug === 'optic'),
        sunglasses: optics.filter((o) => o.category_slug === 'sunglasses'),
        lenses: optics.filter((o) => o.category_slug === 'lenses'),
      };

  const getPriceDisplay = (product: Optic) => {
    const priceNum = product.price != null ? (typeof product.price === 'string' ? parseFloat(product.price) : product.price) : null;
    if (priceNum == null || isNaN(priceNum)) return null;
    const hasDiscount = product.discount != null && product.discount > 0;
    if (hasDiscount) {
      const discounted = priceNum * (1 - product.discount! / 100);
      return { original: `$${priceNum.toFixed(2)}`, discounted: `$${discounted.toFixed(2)}` };
    }
    return { original: `$${priceNum.toFixed(2)}`, discounted: null };
  };

  const ProductCard = ({ product, index }: { product: Optic; index: number }) => {
    const Icon = categoryIcons[product.category_slug] || Glasses;
    const priceDisplay = getPriceDisplay(product);
    const inStock = product.in_stock !== false && product.in_stock !== 0;
    return (
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: index * 0.1 }}
        className="group bg-card rounded-2xl p-6 shadow-card hover:shadow-elevated transition-all cursor-pointer"
      >
        <div className="aspect-square rounded-xl bg-secondary mb-4 flex items-center justify-center overflow-hidden relative">
          {product.discount != null && product.discount > 0 && (
            <span className="absolute top-2 right-2 z-10 bg-amber-500 text-white text-xs font-bold px-2 py-0.5 rounded-md">
              {product.discount}% {t('discountOff')}
            </span>
          )}
          {product.image_url ? (
            <img
              src={imageUrl(product.image_url) || product.image_url || ''}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
            />
          ) : (
            <div className="w-24 h-12 border-4 border-muted-foreground/20 rounded-[80px] relative group-hover:border-accent/40 transition-colors">
              <div className="absolute left-1/2 top-1/2 w-4 h-1 bg-muted-foreground/20 -translate-y-1/2 group-hover:bg-accent/40 transition-colors" />
            </div>
          )}
        </div>
        <div>
          <p className="text-sm text-accent font-medium mb-1">{product.brand_name}</p>
          <h3 className="font-heading font-semibold text-foreground mb-1">{product.name}</h3>
          <p className="text-sm text-muted-foreground">{product.style}</p>
          {priceDisplay && (
            <p className="text-sm font-medium text-foreground mt-1">
              {priceDisplay.discounted ? (
                <span className="flex flex-wrap items-center gap-2">
                  <span className="line-through text-muted-foreground/70">{priceDisplay.original}</span>
                  <span className="font-semibold">{priceDisplay.discounted}</span>
                </span>
              ) : (
                priceDisplay.original
              )}
            </p>
          )}
          {product.in_stock === false || product.in_stock === 0 ? (
            <span className="inline-block mt-2 text-xs font-medium text-destructive">{t('outOfStock')}</span>
          ) : (
            <span className="inline-block mt-2 text-xs font-medium text-green-600">{t('inStock')}</span>
          )}
        </div>
        <div className="mt-4 flex items-center gap-3 text-accent text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
          <span className="flex items-center gap-1">{t('viewCollection')}<ArrowRight className="w-4 h-4" /></span>
          {inStock && (
            <Button
              size="sm"
              variant="secondary"
              className="gap-1"
              onClick={(e) => {
                e.preventDefault();
                addItem({
                  id: product.id,
                  name: product.name,
                  brand_name: product.brand_name,
                  style: product.style || '',
                  image_url: product.image_url,
                  price: product.price,
                  discount: product.discount,
                });
                toast.success(t('addedToCart'));
              }}
            >
              <ShoppingCart className="w-4 h-4" />
              {t('addToCart')}
            </Button>
          )}
        </div>
      </motion.div>
    );
  };

  const CategorySection = ({
    icon: Icon,
    title,
    products,
  }: {
    icon: typeof Glasses;
    title: string;
    products: Optic[];
  }) => (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex items-center gap-4 mb-8"
        >
          <div className="w-12 h-12 rounded-xl gradient-hero flex items-center justify-center">
            <Icon className="w-6 h-6 text-primary-foreground" />
          </div>
          <h2 className="font-heading text-2xl sm:text-3xl font-bold text-foreground">{title}</h2>
        </motion.div>

        {products.length === 0 ? (
          <p className="text-muted-foreground py-8">{t('no_results')}</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((product, index) => (
              <ProductCard key={product.id} product={product} index={index} />
            ))}
          </div>
        )}
      </div>
    </section>
  );

  return (
    <Layout>
      <section className="py-20 bg-secondary/50">
        <div className="container mx-auto px-4 text-center">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-heading text-4xl sm:text-5xl font-bold text-foreground mb-4"
          >
            {t('ourProducts')}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-lg text-muted-foreground max-w-2xl mx-auto"
          >
            {t('productsSubtitle')}
          </motion.p>
        </div>
      </section>

      <div className="container mx-auto px-4 py-6 border-b border-border">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder={t('search')}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder={t('category')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('all')}</SelectItem>
              {categories.map((c: { id: number; name: string; slug: string }) => (
                <SelectItem key={c.id} value={c.slug}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={brandFilter} onValueChange={setBrandFilter}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder={t('brand')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('all')}</SelectItem>
              {brandsList.map((b: { id: number; name: string }) => (
                <SelectItem key={b.id} value={String(b.id)}>
                  {b.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 className="w-10 h-10 animate-spin text-muted-foreground" />
        </div>
      ) : hasFilters ? (
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {optics.map((product, index) => (
                <ProductCard key={product.id} product={product} index={index} />
              ))}
            </div>
            {optics.length === 0 && (
              <p className="text-muted-foreground py-12 text-center">{t('no_results')}</p>
            )}
          </div>
        </section>
      ) : (
        <>
          <CategorySection
            icon={Glasses}
            title={t('optic')}
            products={opticsByCategory.optic}
          />
          <div className="border-t border-border" />
          <CategorySection
            icon={Sun}
            title={t('sunglasses')}
            products={opticsByCategory.sunglasses}
          />
          <div className="border-t border-border" />
          <CategorySection icon={Eye} title={t('lenses')} products={opticsByCategory.lenses} />
        </>
      )}
    </Layout>
  );
};

export default Products;
