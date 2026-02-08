import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ShoppingBag, Loader2 } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { useCart } from '@/contexts/CartContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

function getItemPrice(item: { price: number | string | null; discount?: number | null; quantity: number }) {
  const priceNum = item.price != null ? (typeof item.price === 'string' ? parseFloat(item.price) : item.price) : 0;
  if (isNaN(priceNum)) return 0;
  const discount = item.discount != null && item.discount > 0 ? item.discount : 0;
  return priceNum * (1 - discount / 100) * item.quantity;
}

export default function Checkout() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { items, subtotal, clearCart } = useCart();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    customer_name: '',
    customer_email: '',
    customer_phone: '',
    delivery_address: '',
    notes: '',
  });

  if (items.length === 0 && !loading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-24 text-center">
          <p className="text-muted-foreground mb-6">{t('cartEmpty')}</p>
          <Button asChild>
            <Link to="/products">{t('products')}</Link>
          </Button>
        </div>
      </Layout>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.customer_name.trim() || !form.customer_email.trim() || !form.customer_phone.trim() || !form.delivery_address.trim()) {
      toast.error('Please fill all required fields');
      return;
    }
    setLoading(true);
    try {
      const orderItems = items.map((i) => ({
        id: i.id,
        name: i.name,
        brand_name: i.brand_name,
        quantity: i.quantity,
        price: i.price,
        discount: i.discount,
        total: getItemPrice(i),
      }));
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          customer_name: form.customer_name.trim(),
          customer_email: form.customer_email.trim(),
          customer_phone: form.customer_phone.trim(),
          delivery_address: form.delivery_address.trim(),
          notes: form.notes.trim() || null,
          items: orderItems,
          total_amount: subtotal,
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Failed to place order');
      }
      const data = await res.json();
      clearCart();
      toast.success(t('orderSuccess'));
      navigate('/order-success', { state: { orderNumber: data.order_number } });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed');
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-24">
        <h1 className="font-heading text-3xl font-bold text-foreground mb-8 flex items-center gap-2">
          <ShoppingBag className="w-8 h-8" />
          {t('checkout')}
        </h1>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-8 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-6">
              <div className="rounded-xl border bg-card p-6">
                <h2 className="font-semibold text-lg mb-6">{t('deliveryDetails')}</h2>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <Label htmlFor="customer_name">{t('fullName')} *</Label>
                    <Input
                      id="customer_name"
                      value={form.customer_name}
                      onChange={(e) => setForm((f) => ({ ...f, customer_name: e.target.value }))}
                      placeholder="John Doe"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="customer_email">{t('email')} *</Label>
                    <Input
                      id="customer_email"
                      type="email"
                      value={form.customer_email}
                      onChange={(e) => setForm((f) => ({ ...f, customer_email: e.target.value }))}
                      placeholder="john@example.com"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="customer_phone">{t('phone')} *</Label>
                    <Input
                      id="customer_phone"
                      type="tel"
                      value={form.customer_phone}
                      onChange={(e) => setForm((f) => ({ ...f, customer_phone: e.target.value }))}
                      placeholder="+374 XX XXX XXX"
                      required
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <Label htmlFor="delivery_address">{t('deliveryAddress')} *</Label>
                    <Textarea
                      id="delivery_address"
                      value={form.delivery_address}
                      onChange={(e) => setForm((f) => ({ ...f, delivery_address: e.target.value }))}
                      placeholder="Street, building, apartment, city"
                      rows={3}
                      required
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <Label htmlFor="notes">{t('notes')}</Label>
                    <Textarea
                      id="notes"
                      value={form.notes}
                      onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                      placeholder="Special instructions, delivery time preferences..."
                      rows={2}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div>
              <div className="sticky top-24 rounded-xl border bg-card p-6">
                <h2 className="font-semibold text-lg mb-4">{t('yourCart')}</h2>
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {items.map((item) => (
                    <div key={item.id} className="flex gap-3 text-sm">
                      <div className="w-12 h-12 rounded bg-secondary shrink-0 overflow-hidden">
                        {item.image_url ? (
                          <img src={item.image_url} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">—</div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{item.name}</p>
                        <p className="text-muted-foreground">× {item.quantity}</p>
                      </div>
                      <p className="font-medium">${getItemPrice(item).toFixed(2)}</p>
                    </div>
                  ))}
                </div>
                <div className="border-t pt-4 mt-4">
                  <p className="flex justify-between font-semibold text-lg">
                    <span>{t('subtotal')}</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </p>
                </div>
                <Button type="submit" className="w-full mt-6" size="lg" disabled={loading}>
                  {loading && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                  {t('placeOrder')}
                </Button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </Layout>
  );
}
