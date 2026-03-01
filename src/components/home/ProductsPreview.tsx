import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { ArrowRight, Glasses, Sun, Eye, Loader2, Search, SlidersHorizontal } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { apiUrl, imageUrl } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';

export interface Optic {
  id: number;
  name: string;
  brand_name: string;
  style: string;
  gender?: 'male' | 'female' | 'unisex';
  category_slug: string;
  image_url: string | null;
  price: number | string | null;
  in_stock?: boolean | number;
  discount?: number | null;
}

const categoryIcons: Record<string, typeof Glasses> = {
  optic: Glasses,
  sunglasses: Sun,
  lenses: Eye,
};

export function ProductsPreview() {
  const { t, language } = useLanguage();
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [brandFilter, setBrandFilter] = useState<string>('all');
  const [genderFilter, setGenderFilter] = useState<string>('all');
  const [stockFilter, setStockFilter] = useState<string>('all');
  const [discountFilter, setDiscountFilter] = useState<string>('all');
  const [filtersOpen, setFiltersOpen] = useState(false);

  const queryParams = new URLSearchParams();
  if (categoryFilter !== 'all') queryParams.set('category', categoryFilter);
  if (brandFilter !== 'all') queryParams.set('brand', brandFilter);
  if (genderFilter !== 'all') queryParams.set('gender', genderFilter);
  if (stockFilter !== 'all') queryParams.set('stock', stockFilter);
  if (discountFilter !== 'all') queryParams.set('discounted', discountFilter);
  if (search.trim()) queryParams.set('search', search.trim());

  const { data: opticsRaw = [], isLoading } = useQuery({
    queryKey: ['optics', 'preview', categoryFilter, brandFilter, genderFilter, stockFilter, discountFilter, search],
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
      const data = await res.json();
      return Array.isArray(data) ? data : [];
    },
  });
  const optics = (opticsRaw as Optic[])
    .filter((product) => product.category_slug !== 'lenses')
    .slice(0, 6);

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

  const { data: homeCards = [] } = useQuery({
    queryKey: ['homeCategoryCards', language],
    queryFn: async () => {
      const res = await fetch(apiUrl(`/api/home-category-cards?lang=${encodeURIComponent(language)}`));
      if (!res.ok) return [];
      return res.json();
    },
  });

  const slugToIcon: Record<string, typeof Glasses> = { optic: Glasses, sunglasses: Sun, lenses: Eye, glasses: Glasses, sun: Sun, eye: Eye };
  const slugToGradient: Record<string, string> = {
    optic: 'linear-gradient(135deg, hsl(215 50% 23%) 0%, hsl(200 45% 35%) 100%)',
    sunglasses: 'linear-gradient(135deg, hsl(185 70% 38%) 0%, hsl(190 60% 50%) 100%)',
    lenses: 'linear-gradient(135deg, hsl(200 45% 30%) 0%, hsl(185 70% 45%) 100%)',
  };
  const defaultCards = [
    { icon: Glasses, title: t('optic'), slug: 'optic', image: slugToGradient.optic },
    { icon: Sun, title: t('sunglasses'), slug: 'sunglasses', image: slugToGradient.sunglasses },
    { icon: Eye, title: t('lenses'), slug: 'lenses', image: slugToGradient.lenses },
  ];
  const categoryCardsFromApi = homeCards.length > 0
    ? homeCards.map((c: { title: string; slug: string; background?: string | null; image_url?: string | null; icon?: string }) => ({
        icon: slugToIcon[c.icon || c.slug] || Glasses,
        title: c.title || t(c.slug),
        slug: c.slug,
        image: imageUrl(c.image_url) || c.background || slugToGradient[c.slug] || slugToGradient.optic,
        imageUrl: imageUrl(c.image_url) || null,
      }))
    : null;
  const categoryCardsFromCategories = categories.length > 0
    ? categories.map((c: { id: number; name: string; slug: string }) => ({
        icon: slugToIcon[c.slug] || Glasses,
        title: t(c.slug) || c.name,
        slug: c.slug,
        image: slugToGradient[c.slug] || slugToGradient.optic,
        imageUrl: null,
      }))
    : defaultCards.map((d) => ({ ...d, imageUrl: null as string | null }));
  const rawCategoryCards = categoryCardsFromApi ?? categoryCardsFromCategories;
  const categoryCards = rawCategoryCards.filter((card, index, arr) => {
    return arr.findIndex((x) => x.slug === card.slug) === index;
  });

  return (
    <section className="py-24">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-10"
        >
          <h2 className="font-heading text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-4">
            {t('ourProducts')}
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
            {t('productsSubtitle')}
          </p>
          <div className="flex items-center gap-3 justify-center max-w-2xl mx-auto">
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
        </motion.div>

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
                }}
              >
                Reset filters
              </Button>
            </div>
          </SheetContent>
        </Sheet>

        {optics.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-16"
          >
            <h3 className="font-heading text-2xl font-bold text-foreground mb-6">
              {t('newArrivals')}
            </h3>
            {isLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
                {optics.map((product, index) => {
                  const Icon = categoryIcons[product.category_slug] || Glasses;
                  return (
                    <motion.div
                      key={product.id}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <Link
                        to={`/products/${product.id}`}
                        className="block group bg-card rounded-2xl p-4 shadow-card hover:shadow-elevated transition-all h-full"
                      >
                        <div className="aspect-square rounded-xl bg-secondary/60 mb-3 flex items-center justify-center overflow-hidden relative">
                          {product.discount != null && product.discount > 0 && (
                            <span className="absolute top-2 right-2 z-10 bg-amber-500 text-white text-xs font-bold px-2 py-0.5 rounded-md">
                              {product.discount}%
                            </span>
                          )}
                          {product.image_url ? (
                            <img
                              src={imageUrl(product.image_url) || product.image_url || ''}
                              alt={product.name}
                              className="w-full h-full object-contain object-center scale-110 mix-blend-multiply group-hover:scale-115 transition-transform"
                            />
                          ) : (
                            <Icon className="w-12 h-12 text-muted-foreground/40" />
                          )}
                        </div>
                        <p className="text-xs text-accent font-medium">{product.brand_name}</p>
                        <h4 className="font-heading font-semibold text-foreground truncate">
                          {product.name}
                        </h4>
                        {product.style ? <p className="text-xs text-muted-foreground truncate">{product.style}</p> : null}
                        <p className="text-xs text-muted-foreground capitalize">{product.gender || 'unisex'}</p>
                        {product.in_stock === false || product.in_stock === 0 ? (
                          <span className="text-xs text-destructive">{t('outOfStock')}</span>
                        ) : (
                          <span className="text-xs text-green-600">{t('inStock')}</span>
                        )}
                      </Link>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </motion.div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {categoryCards.map((category, index) => (
            <Link key={`${category.slug}-${index}`} to={`/products?category=${category.slug}`}>
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="group relative overflow-hidden rounded-3xl aspect-[4/5] cursor-pointer"
              >
              <div className="absolute inset-0 transition-transform duration-500 group-hover:scale-110">
                {category.imageUrl ? (
                  <img
                    src={imageUrl(category.imageUrl) || category.imageUrl}
                    alt={category.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div
                    className="w-full h-full"
                    style={{ background: category.image } as React.CSSProperties}
                  />
                )}
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

              <div className="absolute bottom-0 left-0 right-0 p-8">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center">
                    <category.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-heading text-2xl font-semibold text-white">
                    {category.title}
                  </h3>
                </div>

                <div className="flex items-center text-white/80 group-hover:text-white transition-colors">
                  <span className="text-sm font-medium">{t('viewCollection')}</span>
                  <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
                </div>
              </div>
              </motion.div>
            </Link>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="text-center mt-12"
        >
          <Button asChild size="lg" variant="outline" className="border-2">
            <Link to="/products">
              {t('viewCollection')}
              <ArrowRight className="w-5 h-5 ml-2" />
            </Link>
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
