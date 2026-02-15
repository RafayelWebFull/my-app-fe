import { Link } from 'react-router-dom';
import { ArrowRight, ShoppingCart, Image as ImageIcon } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { useCart } from '@/contexts/CartContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { imageUrl } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { useSeo } from '@/lib/seo';

type PreviewCard = {
  id: number;
  name: string;
  brand_name: string;
  style: string;
  image_url: string | null;
};

function toPreviewCards(items: PreviewCard[]): Array<PreviewCard | null> {
  const picked = items.slice(0, 4);
  while (picked.length < 4) picked.push(null);
  return picked;
}

export default function CartPreview() {
  const { t } = useLanguage();
  const { items, totalItems } = useCart();
  const cards = toPreviewCards(items as PreviewCard[]);

  useSeo({
    title: 'Cart Preview',
    description: 'Preview selected eyewear before opening your full cart.',
    path: '/cart-preview',
    robots: 'noindex, nofollow',
  });

  return (
    <Layout>
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-10">
            <h1 className="font-heading text-3xl sm:text-4xl font-bold text-foreground mb-3 flex items-center justify-center gap-2">
              <ShoppingCart className="w-8 h-8" />
              {t('cart')} ({totalItems})
            </h1>
            <p className="text-muted-foreground">
              Quick preview with 4 photos and descriptions before opening full cart.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {cards.map((item, idx) => (
              <article key={item?.id ?? `empty-${idx}`} className="rounded-2xl border bg-card overflow-hidden">
                <div className="aspect-square bg-secondary flex items-center justify-center overflow-hidden">
                  {item?.image_url ? (
                    <img
                      src={imageUrl(item.image_url) || item.image_url || ''}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <ImageIcon className="w-10 h-10 text-muted-foreground/50" />
                  )}
                </div>
                <div className="p-4">
                  <h2 className="font-semibold text-foreground truncate">
                    {item?.name || 'Empty slot'}
                  </h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    {item ? `${item.brand_name} - ${item.style}` : 'Add products to see preview here.'}
                  </p>
                </div>
              </article>
            ))}
          </div>

          <div className="max-w-sm mx-auto mt-10 space-y-3">
            <Button asChild className="w-full" size="lg">
              <Link to="/cart" className="gap-2">
                {t('viewCart')}
                <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full">
              <Link to="/products">{t('continueShopping') || 'Continue shopping'}</Link>
            </Button>
          </div>
        </div>
      </section>
    </Layout>
  );
}

