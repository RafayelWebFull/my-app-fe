import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Glasses, Sun, Eye, ArrowRight, Loader2, Search, SlidersHorizontal } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { useLanguage } from '@/contexts/LanguageContext';
import { PromoBanner } from '@/components/home/PromoBanner';
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
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { useSeo } from '@/lib/seo';

export interface Optic {
  id: number;
  name: string;
  brand_name: string;
  style: string;
  gender?: 'male' | 'female' | 'unisex';
  category_slug: string;
  category_name: string;
  image_url: string | null;
  price: number | string | null;
  description: string | null;
  description_translations?: { en?: string | null; ru?: string | null; hy?: string | null };
  in_stock?: boolean | number;
  discount?: number | null;
}

const categoryIcons: Record<string, typeof Glasses> = {
  optic: Glasses,
  sunglasses: Sun,
  lenses: Eye,
};

const PRODUCTS_META: Record<'en' | 'ru' | 'hy', { title: string; description: string; keywords: string }> = {
  en: {
    title: 'Eyeglasses, Sunglasses and Contact Lenses',
    description: 'Browse eyeglasses, sunglasses, and contact lenses from top brands at Optic Gallery in Armenia.',
    keywords: 'buy glasses yerevan, sunglasses armenia, contact lenses armenia, optic gallery products',
  },
  ru: {
    title: 'Очки, солнцезащитные очки и линзы',
    description: 'Каталог очков, солнцезащитных очков и контактных линз Optic Gallery в Армении.',
    keywords: 'купить очки ереван, солнцезащитные очки армения, контактные линзы армения, оптика каталог',
  },
  hy: {
    title: 'Ակնոցներ, արևային ակնոցներ և լինզաներ',
    description: 'Դիտեք տեսողության ակնոցների, արևային ակնոցների և կոնտակտային լինզաների տեսականին Հայաստանում:',
    keywords: 'գնել ակնոց երևան, արևային ակնոցներ հայաստան, կոնտակտային լինզաներ հայաստան, օպտիկայի կատալոգ',
  },
};

const Products = () => {
  const { t, language } = useLanguage();
  const meta = PRODUCTS_META[language];

  useSeo({
    title: meta.title,
    description: meta.description,
    path: '/products',
    keywords: meta.keywords,
  });
  const [searchParams] = useSearchParams();
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [categoryFilter, setCategoryFilter] = useState<string>(
    searchParams.get('category') || 'all'
  );
  const [brandFilter, setBrandFilter] = useState<string>(
    searchParams.get('brand') || 'all'
  );
  const [genderFilter, setGenderFilter] = useState<string>(
    searchParams.get('gender') || 'all'
  );
  const [stockFilter, setStockFilter] = useState<string>(
    searchParams.get('stock') || 'all'
  );
  const [discountFilter, setDiscountFilter] = useState<string>(
    searchParams.get('discounted') || 'all'
  );
  const [bannerFilter, setBannerFilter] = useState<string>(
    searchParams.get('banner') || 'all'
  );
  const [filtersOpen, setFiltersOpen] = useState(false);

  useEffect(() => {
    setSearch(searchParams.get('search') || '');
    setCategoryFilter(searchParams.get('category') || 'all');
    setBrandFilter(searchParams.get('brand') || 'all');
    setGenderFilter(searchParams.get('gender') || 'all');
    setStockFilter(searchParams.get('stock') || 'all');
    setDiscountFilter(searchParams.get('discounted') || 'all');
    setBannerFilter(searchParams.get('banner') || 'all');
  }, [searchParams]);

  const queryParams = new URLSearchParams();
  if (categoryFilter !== 'all') queryParams.set('category', categoryFilter);
  if (brandFilter !== 'all') queryParams.set('brand', brandFilter);
  if (genderFilter !== 'all') queryParams.set('gender', genderFilter);
  if (stockFilter !== 'all') queryParams.set('stock', stockFilter);
  if (discountFilter !== 'all') queryParams.set('discounted', discountFilter);
  if (bannerFilter !== 'all') queryParams.set('banner', bannerFilter);
  if (search.trim()) queryParams.set('search', search.trim());

  const { data: optics = [], isLoading } = useQuery({
    queryKey: ['optics', categoryFilter, brandFilter, genderFilter, stockFilter, discountFilter, bannerFilter, search],
    queryFn: async () => {
      const url = queryParams.toString() ? apiUrl(`/api/optics?${queryParams}`) : apiUrl('/api/optics');
      const res = await fetch(url);
      if (!res.ok) {
        let detail = '';
        try {
          const ct = res.headers.get('content-type') || '';
          if (ct.includes('application/json')) {
            const err = await res.json().catch(() => ({}));
            detail = err?.error || err?.message || JSON.stringify(err);
          } else {
            detail = await res.text();
          }
        } catch {
          // ignore parse errors
        }
        const status = `${res.status}${res.statusText ? ` ${res.statusText}` : ''}`;
        throw new Error(`Failed to fetch optics (${status})${detail ? `: ${detail}` : ''}`);
      }
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

  const hasFilters =
    categoryFilter !== 'all' ||
    brandFilter !== 'all' ||
    genderFilter !== 'all' ||
    stockFilter !== 'all' ||
    discountFilter !== 'all' ||
    bannerFilter !== 'all' ||
    search.trim();
  const opticsByCategory = hasFilters
    ? { filtered: optics }
    : {
        optic: optics.filter((o) => o.category_slug === 'optic'),
        sunglasses: optics.filter((o) => o.category_slug === 'sunglasses'),
        lenses: optics.filter((o) => o.category_slug === 'lenses'),
      };

  const ProductCard = ({ product, index }: { product: Optic; index: number }) => {
    const Icon = categoryIcons[product.category_slug] || Glasses;
    return (
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: index * 0.1 }}
        className="group rounded-2xl"
      >
        <Link to={`/products/${product.id}`} className="block bg-card rounded-2xl p-6 shadow-card hover:shadow-elevated transition-all">
          <div className="aspect-square rounded-xl bg-secondary/60 mb-4 flex items-center justify-center overflow-hidden relative">
            {product.discount != null && product.discount > 0 && (
              <span className="absolute top-2 right-2 z-10 bg-amber-500 text-white text-xs font-bold px-2 py-0.5 rounded-md">
                {product.discount}%
              </span>
            )}
            {product.image_url ? (
              <img
                src={imageUrl(product.image_url) || product.image_url || ''}
                alt={product.name}
                loading="lazy"
                className="w-full h-full object-contain object-center scale-110 mix-blend-multiply group-hover:scale-115 transition-transform"
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
          {product.style ? <p className="text-sm text-muted-foreground">{product.style}</p> : null}
          <p className="text-xs text-muted-foreground capitalize">{product.gender || 'unisex'}</p>
            {product.in_stock === false || product.in_stock === 0 ? (
              <span className="inline-block mt-2 text-xs font-medium text-destructive">{t('outOfStock')}</span>
            ) : (
              <span className="inline-block mt-2 text-xs font-medium text-green-600">{t('inStock')}</span>
            )}
          </div>
          <div className="mt-4 flex items-center gap-3 text-accent text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
            <span className="flex items-center gap-1">{t('viewCollection')}<ArrowRight className="w-4 h-4" /></span>
          </div>
        </Link>
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

      <PromoBanner overlap={false} />

      <div className="container mx-auto px-4 py-6 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder={t('search')}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Button type="button" variant="outline" size="icon" onClick={() => setFiltersOpen(true)}>
            <SlidersHorizontal className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <Sheet open={filtersOpen} onOpenChange={setFiltersOpen}>
        <SheetContent side="right" className="w-full sm:max-w-md">
          <SheetHeader>
            <SheetTitle>Filters</SheetTitle>
          </SheetHeader>
          <div className="space-y-4 mt-6">
            <div className="space-y-2">
              <p className="text-sm font-medium">{t('category')}</p>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger>
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
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium">{t('brand')}</p>
              <Select value={brandFilter} onValueChange={setBrandFilter}>
                <SelectTrigger>
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
            <div className="space-y-2">
              <p className="text-sm font-medium">Gender</p>
              <Select value={genderFilter} onValueChange={setGenderFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="unisex">Unisex</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium">Stock</p>
              <Select value={stockFilter} onValueChange={setStockFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Stock" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="in">In stock</SelectItem>
                  <SelectItem value="out">Out of stock</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium">Discount</p>
              <Select value={discountFilter} onValueChange={setDiscountFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Discount" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="true">Discounted</SelectItem>
                  <SelectItem value="false">No discount</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={() => {
                setCategoryFilter('all');
                setBrandFilter('all');
                setGenderFilter('all');
                setStockFilter('all');
                setDiscountFilter('all');
                setBannerFilter('all');
              }}
            >
              Reset filters
            </Button>
          </div>
        </SheetContent>
      </Sheet>

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
