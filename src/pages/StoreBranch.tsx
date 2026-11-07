import { Link, useParams } from 'react-router-dom';
import { Clock, Instagram, MapPin, Phone } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { useLanguage } from '@/contexts/LanguageContext';
import { localizedPath } from '@/lib/localizedUrl';
import { useSeo } from '@/lib/seo';
import { STORE, branchHours, branchHoursText, fillTemplate, findBranch, storeLabels } from '@/lib/store';
import NotFound from './NotFound';

const LINKS = {
  hy: { products: 'Դիտել ակնոցները', repair: 'Ակնոցների վերանորոգում' },
  ru: { products: 'Каталог очков', repair: 'Ремонт очков' },
  en: { products: 'Browse eyewear', repair: 'Eyeglass repair' },
};

const StoreBranch = () => {
  const { branch: slug } = useParams();
  const { language } = useLanguage();
  const branch = findBranch(slug);
  const labels = storeLabels(language);

  const values = branch
    ? { name: branch.shortName[language], address: branch.address[language], hours: branchHours(branch) }
    : { name: '', address: '', hours: '' };

  useSeo({
    title: fillTemplate(labels.branchTitle, values),
    description: fillTemplate(labels.branchDescription, values),
    path: `/contact/${slug}`,
    robots: branch ? undefined : 'noindex, nofollow',
  });

  if (!branch) return <NotFound />;

  const otherBranches = STORE.branches.filter((other) => other.slug !== branch.slug);
  const mapEmbed = `https://www.google.com/maps?q=${encodeURIComponent(`Optic Gallery, ${branch.shortName.en}, Yerevan`)}&output=embed`;

  return (
    <Layout>
      <section className="py-16 bg-secondary/50">
        <div className="container mx-auto px-4 max-w-4xl">
          <h1 className="font-heading text-3xl sm:text-5xl font-bold text-foreground mb-4">
            {fillTemplate(labels.branchTitle, values)}
          </h1>
          <p className="text-lg text-muted-foreground">{fillTemplate(labels.branchIntro, values)}</p>
        </div>
      </section>

      <section className="py-12">
        <div className="container mx-auto px-4 max-w-4xl grid gap-8 md:grid-cols-2">
          <dl className="space-y-5">
            <div>
              <dt className="flex items-center gap-2 font-semibold text-foreground"><MapPin className="w-4 h-4" />{labels.address}</dt>
              <dd className="mt-1 text-muted-foreground">{branch.address[language]}</dd>
              <dd>
                <a href={branch.mapUrl} target="_blank" rel="noopener noreferrer" className="inline-block py-1 text-accent underline underline-offset-4">
                  {labels.directions}
                </a>
              </dd>
            </div>
            <div>
              <dt className="flex items-center gap-2 font-semibold text-foreground"><Clock className="w-4 h-4" />{labels.hours}</dt>
              <dd className="mt-1 text-muted-foreground">{branchHoursText(branch, language)}</dd>
            </div>
            <div>
              <dt className="flex items-center gap-2 font-semibold text-foreground"><Phone className="w-4 h-4" />{labels.phones}</dt>
              {STORE.phones.map((phone) => (
                <dd key={phone.e164}>
                  <a href={`tel:${phone.e164}`} className="inline-block py-1 text-accent hover:underline">{phone.display}</a>
                </dd>
              ))}
            </div>
            <div>
              <dt className="flex items-center gap-2 font-semibold text-foreground"><Instagram className="w-4 h-4" />Instagram</dt>
              <dd>
                <a href={STORE.instagram.url} target="_blank" rel="noopener noreferrer" className="inline-block py-1 text-accent hover:underline">
                  @{STORE.instagram.handle}
                </a>
              </dd>
            </div>
          </dl>

          <iframe
            src={mapEmbed}
            title={`Optic Gallery — ${branch.shortName[language]}`}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            className="w-full min-h-[320px] rounded-2xl border-0 shadow-card"
          />
        </div>
      </section>

      <section className="pb-16">
        <nav className="container mx-auto px-4 max-w-4xl flex flex-wrap gap-3" aria-label={labels.allStores}>
          <Link to={localizedPath('/products', language)} className="inline-flex rounded-full bg-primary px-5 py-3 text-sm text-primary-foreground">
            {LINKS[language].products}
          </Link>
          <Link to={localizedPath('/repair-service', language)} className="inline-flex rounded-full border border-border px-5 py-3 text-sm text-foreground">
            {LINKS[language].repair}
          </Link>
          {otherBranches.map((other) => (
            <Link key={other.slug} to={localizedPath(`/contact/${other.slug}`, language)} className="inline-flex rounded-full border border-border px-5 py-3 text-sm text-foreground">
              Optic Gallery — {other.shortName[language]}
            </Link>
          ))}
          <Link to={localizedPath('/contact', language)} className="inline-flex rounded-full border border-border px-5 py-3 text-sm text-foreground">
            {labels.allStores}
          </Link>
        </nav>
      </section>
    </Layout>
  );
};

export default StoreBranch;
