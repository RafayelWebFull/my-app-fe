import { useLocation, Link } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { useLanguage } from '@/contexts/LanguageContext';
import { useSeo } from '@/lib/seo';
import { Button } from '@/components/ui/button';

export default function OrderSuccess() {
  const { t } = useLanguage();

  useSeo({
    title: 'Order Confirmed',
    description: 'Your order has been received successfully.',
    path: '/order-success',
    robots: 'noindex, nofollow',
  });
  const location = useLocation();
  const orderNumber = (location.state as { orderNumber?: string })?.orderNumber;

  return (
    <Layout>
      <div className="container mx-auto px-4 py-24 text-center">
        <CheckCircle className="w-20 h-20 text-green-600 mx-auto mb-6" />
        <h1 className="font-heading text-3xl font-bold text-foreground mb-2">{t('orderSuccess')}</h1>
        {orderNumber && (
          <p className="text-muted-foreground mb-8">
            Order number: <span className="font-mono font-semibold">{orderNumber}</span>
          </p>
        )}
        <p className="text-muted-foreground mb-8 max-w-md mx-auto">
          We will contact you shortly to confirm delivery details.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Button asChild>
            <Link to="/products">{t('products')}</Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/">{t('home')}</Link>
          </Button>
        </div>
      </div>
    </Layout>
  );
}
