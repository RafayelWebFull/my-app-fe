import { Link } from 'react-router-dom';
import { ShoppingCart, Minus, Plus, Trash2, ArrowRight } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { useCart } from '@/contexts/CartContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { imageUrl } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { useSeo } from '@/lib/seo';

function getItemPrice(item: { price: number | string | null; discount?: number | null; quantity: number }) {
  const priceNum = item.price != null ? (typeof item.price === 'string' ? parseFloat(item.price) : item.price) : 0;
  if (isNaN(priceNum)) return 0;
  const discount = item.discount != null && item.discount > 0 ? item.discount : 0;
  return priceNum * (1 - discount / 100) * item.quantity;
}

export default function Cart() {
  const { t } = useLanguage();
  const { items, removeItem, updateQuantity, subtotal } = useCart();

  useSeo({
    title: 'Shopping Cart',
    description: 'Review selected products before checkout.',
    path: '/cart',
    robots: 'noindex, nofollow',
  });

  return (
    <Layout>
      <div className="container mx-auto px-4 py-24">
        <h1 className="font-heading text-3xl font-bold text-foreground mb-8 flex items-center gap-2">
          <ShoppingCart className="w-8 h-8" />
          {t('yourCart')}
        </h1>

        {items.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-muted-foreground mb-6">{t('cartEmpty')}</p>
            <Button asChild>
              <Link to="/products">{t('products')}</Link>
            </Button>
          </div>
        ) : (
          <div className="grid gap-8 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-4">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex gap-4 p-4 rounded-xl border bg-card"
                >
                  <div className="w-24 h-24 rounded-lg bg-secondary shrink-0 overflow-hidden">
                    {item.image_url ? (
                      <img src={imageUrl(item.image_url) || item.image_url || ''} alt="" loading="lazy" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground">—</div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold">{item.name}</p>
                    <p className="text-sm text-muted-foreground">{item.brand_name} · {item.style}</p>
                    <p className="text-sm font-medium mt-2">
                      ${(getItemPrice(item) / item.quantity).toFixed(2)} × {item.quantity} = $
                      {getItemPrice(item).toFixed(2)}
                    </p>
                  </div>
                  <div className="flex flex-col items-end justify-between">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive"
                      onClick={() => removeItem(item.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      >
                        <Minus className="w-3 h-3" />
                      </Button>
                      <span className="w-8 text-center">{item.quantity}</span>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      >
                        <Plus className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div>
              <div className="sticky top-24 p-6 rounded-xl border bg-card">
                <p className="flex justify-between text-lg font-semibold mb-6">
                  <span>{t('subtotal')}</span>
                  <span>${subtotal.toFixed(2)}</span>
                </p>
                <Button asChild className="w-full" size="lg">
                  <Link to="/checkout" className="gap-2">
                    {t('proceedToCheckout')}
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </Button>
                <Button asChild variant="outline" className="w-full mt-3">
                  <Link to="/products">{t('continueShopping') || 'Continue shopping'}</Link>
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
