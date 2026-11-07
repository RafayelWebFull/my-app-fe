import { Link } from 'react-router-dom';
import { Instagram, Phone, MapPin, Clock } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { localizedPath } from '@/lib/localizedUrl';
import { STORE, branchHoursText, fillTemplate, storeLabels } from '@/lib/store';

export function Footer() {
  const { t, language } = useLanguage();
  const labels = storeLabels(language);

  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Logo & Description */}
          <div>
            <Link to={localizedPath('/', language)} className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-full bg-white border border-white/70 shadow-sm flex items-center justify-center shrink-0">
                <img src="/logo-small.webp" alt="Optic Gallery" width="28" height="28" loading="lazy" className="w-7 h-7 object-contain" />
              </div>
              <span className="font-heading font-semibold text-xl uppercase">
                Optic Gallery
              </span>
            </Link>
            <p className="text-primary-foreground/70 max-w-md">
              {t('aboutText1')}
            </p>
          </div>

          {/* Stores */}
          <div>
            <h2 className="font-heading font-semibold text-lg mb-4">{labels.stores}</h2>
            <ul className="space-y-4 text-primary-foreground/70">
              {STORE.branches.map((branch) => (
                <li key={branch.slug} className="space-y-1">
                  <Link
                    to={localizedPath(`/contact/${branch.slug}`, language)}
                    className="flex items-start gap-2 text-primary-foreground hover:underline"
                  >
                    <MapPin className="w-4 h-4 mt-1 shrink-0" />
                    {branch.address[language]}
                  </Link>
                  <div className="flex items-center gap-2 pl-6 text-sm">
                    <Clock className="w-3.5 h-3.5 shrink-0" />
                    {branchHoursText(branch, language)}
                  </div>
                  <a
                    href={branch.mapUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block pl-6 py-1 text-sm underline underline-offset-4 hover:text-primary-foreground"
                  >
                    {labels.directions}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h2 className="font-heading font-semibold text-lg mb-4">{labels.contactUs}</h2>
            <ul className="space-y-1 text-primary-foreground/70">
              {STORE.phones.map((phone) => (
                <li key={phone.e164}>
                  <a href={`tel:${phone.e164}`} className="flex items-center gap-2 py-2 hover:text-primary-foreground">
                    <Phone className="w-4 h-4 shrink-0" />
                    {phone.display}
                  </a>
                </li>
              ))}
              <li>
                <a
                  href={STORE.instagram.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 py-2 hover:text-primary-foreground"
                >
                  <Instagram className="w-4 h-4 shrink-0" />
                  @{STORE.instagram.handle}
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-primary-foreground/20 mt-8 pt-8 text-center text-primary-foreground/75 text-sm">
          {fillTemplate(labels.copyright, { year: new Date().getFullYear() })}
        </div>
      </div>
    </footer>
  );
}
