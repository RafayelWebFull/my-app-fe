import { Link } from 'react-router-dom';
import { ShoppingCart, Minus, Plus, Trash2 } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { imageUrl } from '@/lib/api';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { useExchangeRates } from '@/hooks/useExchangeRates';
import { formatAmdByLanguage } from '@/lib/currency';

function getItemPrice(item: { price: number | string | null; discount?: number | null; quantity: number }) {
  const priceNum = item.price != null ? (typeof item.price === 'string' ? parseFloat(item.price) : item.price) : 0;
  if (isNaN(priceNum)) return 0;
  const discount = item.discount != null && item.discount > 0 ? item.discount : 0;
  return priceNum * (1 - discount / 100) * item.quantity;
}

interface CartSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CartSheet({ open, onOpenChange }: CartSheetProps) {
  const { t, language } = useLanguage();
  const { items, removeItem, updateQuantity, totalItems, subtotal } = useCart();
  const { data: rates } = useExchangeRates();
  const formatMoney = (amountAmd: number) => formatAmdByLanguage(amountAmd, language, rates) || '—';

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex flex-col w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <ShoppingCart className="w-5 h-5" />
            {t('cart')} ({totalItems})
          </SheetTitle>
        </SheetHeader>
        <div className="flex-1 overflow-y-auto py-6">
          {items.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">{t('cartEmpty')}</p>
          ) : (
            <div className="space-y-4">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex gap-4 p-3 rounded-lg border bg-card"
                >
                  <div className="w-16 h-16 rounded-lg bg-secondary shrink-0 overflow-hidden">
                    {item.image_url ? (
                      <img src={imageUrl(item.image_url) || item.image_url || ''} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">
                        —
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{item.name}</p>
                    <p className="text-xs text-muted-foreground">{item.brand_name}</p>
                    <p className="text-sm font-semibold mt-1">
                      {formatMoney(getItemPrice(item) / item.quantity)} × {item.quantity} = {formatMoney(getItemPrice(item))}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <div className="flex items-center gap-1">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      >
                        <Minus className="w-3 h-3" />
                      </Button>
                      <span className="w-6 text-center text-sm">{item.quantity}</span>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      >
                        <Plus className="w-3 h-3" />
                      </Button>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-destructive"
                      onClick={() => removeItem(item.id)}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        {items.length > 0 && (
          <div className="border-t pt-4 space-y-4">
            <p className="flex justify-between font-semibold">
              <span>{t('subtotal')}</span>
              <span>{formatMoney(subtotal)}</span>
            </p>
            <Button asChild className="w-full" onClick={() => onOpenChange(false)}>
              <Link to="/checkout">{t('checkout')}</Link>
            </Button>
            <Button asChild variant="outline" className="w-full" onClick={() => onOpenChange(false)}>
              <Link to="/cart">{t('viewCart')}</Link>
            </Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
