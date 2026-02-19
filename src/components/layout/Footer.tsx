import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Instagram, Phone, MapPin } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { apiUrl } from '@/lib/api';
import { parseMultiValue } from '@/lib/contactInfo';

export function Footer() {
  const { t } = useLanguage();
  const { data: settings = {} } = useQuery({
    queryKey: ['site-settings'],
    queryFn: async () => {
      const res = await fetch(apiUrl('/api/site-settings'));
      if (!res.ok) return {};
      return res.json();
    },
  });

  const phoneRaw = settings.contact_phone || '+374 XX XXX XXX';
  const instagram = settings.contact_instagram || '@opticgallery.am';
  const addresses = parseMultiValue(t('addressValue'));
  const phones = parseMultiValue(phoneRaw);

  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Logo & Description */}
          <div className="md:col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-full bg-white border border-white/70 shadow-sm flex items-center justify-center shrink-0">
                <img src="/logo.png" alt="Optic Gallery" className="w-7 h-7 object-contain" />
              </div>
              <span className="font-heading font-semibold text-xl uppercase">
                Optic Gallery
              </span>
            </Link>
            <p className="text-primary-foreground/70 max-w-md">
              {t('aboutText1')}
            </p>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="font-heading font-semibold text-lg mb-4">
              {t('contactUs')}
            </h4>
            <ul className="space-y-3 text-primary-foreground/70">
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4" />
                <div className="space-y-1">
                  {(addresses.length ? addresses : [t('addressValue')]).map((address) => (
                    <div key={address}>{address}</div>
                  ))}
                </div>
              </li>
              <li className="flex items-start gap-2">
                <Phone className="w-4 h-4" />
                <div className="space-y-1">
                  {(phones.length ? phones : [phoneRaw]).map((phone) => (
                    <div key={phone}>{phone}</div>
                  ))}
                </div>
              </li>
              <li className="flex items-center gap-2">
                <Instagram className="w-4 h-4" />
                {instagram}
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
