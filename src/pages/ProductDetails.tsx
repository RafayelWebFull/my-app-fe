import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { useLanguage } from '@/contexts/LanguageContext';
import { apiUrl, imageUrl } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { useSeo } from '@/lib/seo';
import { useExchangeRates } from '@/hooks/useExchangeRates';
import { formatAmdByLanguage } from '@/lib/currency';

type OpticDetails = {
  id: number;
  name: string;
  brand_name: string;
  style: string;
  gender?: 'male' | 'female' | 'unisex';
  category_name: string;
  image_url: string | null;
  image_urls?: string[];
  price: number | string | null;
  description: string | null;
  description_en?: string | null;
  description_ru?: string | null;
  description_hy?: string | null;
  description_translations?: {
    en?: string | null;
    ru?: string | null;
    hy?: string | null;
  };
  in_stock?: boolean | number;
  discount?: number | null;
};

export default function ProductDetails() {
  const { id } = useParams<{ id: string }>();
  const { t, language } = useLanguage();
  const { data: rates } = useExchangeRates();
  const baseUrl = 'https://opticgallery.am';
  const fallbackTitle = language === 'ru' ? 'Товар' : language === 'hy' ? 'Ապրանք' : 'Product';
  const fallbackDescription =
    language === 'ru'
      ? 'Детали товара в Optic Gallery.'
      : language === 'hy'
        ? 'Ապրանքի մանրամասները Optic Gallery-ում։'
        : 'Product details at Optic Gallery.';

  const { data: product, isLoading, isError } = useQuery({
    queryKey: ['optic-details', id],
    queryFn: async () => {
      const res = await fetch(apiUrl(`/api/optics/${id}`));
      if (!res.ok) throw new Error('Failed to fetch product');
      return res.json() as Promise<OpticDetails>;
    },
    enabled: Boolean(id),
  });
  const [activeImage, setActiveImage] = useState<string | null>(null);

  useSeo({
    title: product?.name || fallbackTitle,
    description:
      product?.description_translations?.[language] ||
      product?.description ||
      fallbackDescription,
    path: `/products/${id || ''}`,
  });

  const allImages =
    Array.isArray(product?.image_urls) && product.image_urls.length > 0
      ? product.image_urls
      : product?.image_url
        ? [product.image_url]
        : [];
  const imagesKey = allImages.join('|');
  const activeIndex = allImages.findIndex((img) => img === activeImage);
  const hasMultipleImages = allImages.length > 1;

  useEffect(() => {
    setActiveImage((prev) => {
      if (!allImages.length) return null;
      if (prev && allImages.includes(prev)) return prev;
      return allImages[0];
    });
  }, [id, imagesKey]);
  const localizedDescription = product
    ? product.description_translations?.[language] ||
      (language === 'en' ? product.description_en : language === 'ru' ? product.description_ru : product.description_hy) ||
      product.description ||
      fallbackDescription
    : null;

  useEffect(() => {
    const scriptId = 'product-json-ld';
    const oldScript = document.getElementById(scriptId);
    if (oldScript) oldScript.remove();

    if (!product) return;

    const productSchema: Record<string, unknown> = {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: product.name,
      description: localizedDescription || 'Product details at Optic Gallery.',
      brand: {
        '@type': 'Brand',
        name: product.brand_name,
      },
      category: product.category_name,
      image: allImages.map((img) => imageUrl(img) || img).filter(Boolean),
      url: `${baseUrl}/products/${product.id}`,
    };

    const numericPrice =
      typeof product.price === 'number'
        ? product.price
        : typeof product.price === 'string'
          ? Number(product.price)
          : NaN;

    if (Number.isFinite(numericPrice) && numericPrice > 0) {
      productSchema.offers = {
        '@type': 'Offer',
        priceCurrency: 'AMD',
        price: numericPrice,
        availability:
          product.in_stock === false || product.in_stock === 0
            ? 'https://schema.org/OutOfStock'
            : 'https://schema.org/InStock',
        url: `${baseUrl}/products/${product.id}`,
      };
    }

    const script = document.createElement('script');
    script.id = scriptId;
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify(productSchema);
    document.head.appendChild(script);

    return () => {
      const mountedScript = document.getElementById(scriptId);
      if (mountedScript) mountedScript.remove();
    };
  }, [allImages, baseUrl, localizedDescription, product]);

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center py-24">
          <Loader2 className="w-10 h-10 animate-spin text-muted-foreground" />
        </div>
      </Layout>
    );
  }

  if (isError || !product) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-20 text-center">
          <p className="text-muted-foreground mb-6">Product not found.</p>
          <Button asChild variant="outline">
            <Link to="/products">Back to products</Link>
          </Button>
        </div>
      </Layout>
    );
  }

  const goPrevImage = () => {
    if (!hasMultipleImages) return;
    const current = activeIndex >= 0 ? activeIndex : 0;
    const next = (current - 1 + allImages.length) % allImages.length;
    setActiveImage(allImages[next]);
  };

  const goNextImage = () => {
    if (!hasMultipleImages) return;
    const current = activeIndex >= 0 ? activeIndex : 0;
    const next = (current + 1) % allImages.length;
    setActiveImage(allImages[next]);
  };

  const priceNum =
    product.price != null
      ? typeof product.price === 'string'
        ? parseFloat(product.price)
        : product.price
      : null;
  const hasDiscount = product.discount != null && product.discount > 0;
  const originalPrice =
    priceNum != null && !isNaN(priceNum) ? formatAmdByLanguage(priceNum, language, rates) : null;
  const discountedPrice =
    hasDiscount && priceNum != null && !isNaN(priceNum)
      ? formatAmdByLanguage(priceNum * (1 - product.discount! / 100), language, rates)
      : null;

  return (
    <Layout>
      <section className="py-14">
        <div className="container mx-auto px-4">
          <Button asChild variant="ghost" className="mb-6 gap-2">
            <Link to="/products">
              <ArrowLeft className="w-4 h-4" />
              {t('products')}
            </Link>
          </Button>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-3">
              <div className="relative w-full rounded-2xl overflow-hidden bg-white h-[320px] sm:h-[460px] lg:h-[560px] p-4 sm:p-6 flex items-center justify-center">
                {activeImage ? (
                  <img
                    src={imageUrl(activeImage) || activeImage || ''}
                    alt={product.name}
                    className="block w-full h-full object-contain object-center bg-white"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                    No image
                  </div>
                )}

                {hasMultipleImages && (
                  <>
                    <button
                      type="button"
                      onClick={goPrevImage}
                      className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/45 hover:bg-black/65 text-white rounded-full p-2 transition-colors"
                      aria-label="Previous image"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                      type="button"
                      onClick={goNextImage}
                      className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/45 hover:bg-black/65 text-white rounded-full p-2 transition-colors"
                      aria-label="Next image"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </>
                )}
              </div>

              {hasMultipleImages && (
                <div className="flex items-center justify-center gap-2">
                  {allImages.map((img, idx) => (
                    <button
                      key={`${img}-${idx}`}
                      type="button"
                      onClick={() => setActiveImage(img)}
                      className={`h-2.5 rounded-full transition-all ${activeImage === img ? 'w-8 bg-primary' : 'w-2.5 bg-muted-foreground/40'}`}
                      aria-label={`Go to image ${idx + 1}`}
                    />
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-4">
              <p className="text-sm text-accent font-medium">{product.brand_name}</p>
              <h1 className="font-heading text-3xl sm:text-4xl font-bold text-foreground">{product.name}</h1>
              <p className="text-muted-foreground">
                {product.category_name}{product.style ? ` - ${product.style}` : ''}
              </p>
              <p className="text-sm text-muted-foreground capitalize">For: {product.gender || 'unisex'}</p>

              {originalPrice && (
                <div className="text-lg font-semibold">
                  {discountedPrice ? (
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="line-through text-muted-foreground">{originalPrice}</span>
                      <span>{discountedPrice}</span>
                      <span className="text-xs px-2 py-1 rounded bg-amber-100 text-amber-700">
                        -{product.discount}%
                      </span>
                    </div>
                  ) : (
                    <span>{originalPrice}</span>
                  )}
                </div>
              )}

              <p className={product.in_stock === false || product.in_stock === 0 ? 'text-destructive text-sm' : 'text-green-600 text-sm'}>
                {product.in_stock === false || product.in_stock === 0 ? t('outOfStock') : t('inStock')}
              </p>

              <div className="pt-2">
                <h2 className="font-semibold mb-2">{t('description')}</h2>
                <p className="text-muted-foreground leading-relaxed">
                  {localizedDescription || 'No description yet.'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
