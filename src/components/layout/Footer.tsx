import { Link } from 'react-router-dom';
import { Instagram, Phone, MapPin } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

export function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo & Description */}
          <div className="md:col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <img src="/logo.svg" alt="Optic Gallery" className="w-10 h-10" />
              <span className="font-heading font-semibold text-xl">
                Optic Gallery
              </span>
            </Link>
            <p className="text-primary-foreground/70 max-w-md">
              {t('aboutText1')}
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-heading font-semibold text-lg mb-4">
              {t('products')}
            </h4>
            <ul className="space-y-2 text-primary-foreground/70">
              <li>
                <Link to="/products" className="hover:text-primary-foreground transition-colors">
                  {t('eyeglasses')}
                </Link>
              </li>
              <li>
                <Link to="/products" className="hover:text-primary-foreground transition-colors">
                  {t('sunglasses')}
                </Link>
              </li>
              <li>
                <Link to="/products" className="hover:text-primary-foreground transition-colors">
                  {t('lenses')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="font-heading font-semibold text-lg mb-4">
              {t('contactUs')}
            </h4>
            <ul className="space-y-3 text-primary-foreground/70">
              <li className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                {t('addressValue')}
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4" />
                +374 XX XXX XXX
              </li>
              <li className="flex items-center gap-2">
                <Instagram className="w-4 h-4" />
                @opticgallery.am
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-primary-foreground/10 mt-8 pt-8 text-center text-primary-foreground/50 text-sm">
          {t('copyright')}
        </div>
      </div>
    </footer>
  );
}
