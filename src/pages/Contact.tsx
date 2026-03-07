import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { MapPin, Phone, Clock, Instagram } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { useLanguage } from '@/contexts/LanguageContext';
import { apiUrl } from '@/lib/api';
import { parseMultiValue } from '@/lib/contactInfo';
import { useSeo } from '@/lib/seo';

const CONTACT_SEO_COPY: Record<'en' | 'ru' | 'hy', { title: string; text: string }> = {
  en: {
    title: 'Visit our optical store in Yerevan, Armenia',
    text:
      'If you are searching for an optical store in Armenia, visit Optic Gallery in Yerevan. Contact us for eyeglasses, sunglasses, and contact lens consultation.',
  },
  ru: {
    title: 'Посетите нашу оптику в Ереване, Армения',
    text:
      'Если вы ищете оптику в Армении, посетите Optic Gallery в Ереване. Свяжитесь с нами для подбора очков, солнцезащитных очков и контактных линз.',
  },
  hy: {
    title: 'Այցելեք մեր օպտիկան Երևանում, Հայաստանում',
    text:
      'Եթե փնտրում եք օպտիկա Հայաստանում, այցելեք Optic Gallery-ը Երևանում։ Կապվեք մեզ հետ տեսողության ակնոցների, արևային ակնոցների և կոնտակտային լինզաների խորհրդատվության համար։',
  },
};

const CONTACT_META: Record<'en' | 'ru' | 'hy', { title: string; description: string; keywords: string }> = {
  en: {
    title: 'Contact Optical Store in Armenia',
    description: 'Visit Optic Gallery in Yerevan, Armenia. Get phone numbers, address, working hours, and map directions.',
    keywords: 'optic contact yerevan, optical store armenia address, optical store yerevan phone, optica armenia location',
  },
  ru: {
    title: 'Контакты оптики в Армении',
    description: 'Посетите Optic Gallery в Ереване, Армения. Адрес, телефоны, часы работы и карта.',
    keywords: 'контакты оптики ереван, адрес оптики армения, телефон оптики ереван, оптика локация',
  },
  hy: {
    title: 'Օպտիկայի կոնտակտներ Հայաստանում',
    description: 'Այցելեք Optic Gallery-ը Երևանում, Հայաստանում։ Հասցե, հեռախոս, աշխատանքային ժամեր և քարտեզ:',
    keywords: 'օպտիկայի կոնտակտներ երևան, օպտիկայի հասցե հայաստան, օպտիկայի հեռախոս երևան, օպտիկայի տեղակայություն',
  },
};

const Contact = () => {
  const { t, language } = useLanguage();
  const seoCopy = CONTACT_SEO_COPY[language];
  const meta = CONTACT_META[language];
  const baseUrl = 'https://opticgallery.am';

  useSeo({
    title: meta.title,
    description: meta.description,
    path: '/contact',
    keywords: meta.keywords,
  });

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
  const mapEmbed = settings.contact_map_embed || 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d97459.36117797645!2d44.43373!3d40.17712!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x406abd2ad0420d43%3A0x5c7825e2d8e72100!2sYerevan%2C%20Armenia!5e0!3m2!1sen!2s!4v1704067200000!5m2!1sen!2s';
  const addresses = parseMultiValue(t('addressValue'));
  const phones = parseMultiValue(phoneRaw);
  const workingHours = parseMultiValue(t('workingHoursValue'));
  const primaryAddress = (addresses[0] || t('addressValue') || '').trim();
  const primaryPhone = (phones[0] || phoneRaw || '').trim();
  const openingHours = (workingHours[0] || '').trim();

  useEffect(() => {
    const scriptId = 'contact-localbusiness-json-ld';
    const oldScript = document.getElementById(scriptId);
    if (oldScript) oldScript.remove();

    const schema: Record<string, unknown> = {
      '@context': 'https://schema.org',
      '@type': 'OpticalStore',
      name: 'Optic Gallery',
      url: `${baseUrl}/contact`,
      image: `${baseUrl}/logo.png`,
      address: {
        '@type': 'PostalAddress',
        streetAddress: primaryAddress || undefined,
        addressLocality: 'Yerevan',
        addressCountry: 'AM',
      },
      telephone: primaryPhone || undefined,
      openingHours: openingHours || undefined,
      sameAs: [`https://instagram.com/${instagram.replace('@', '')}`],
    };

    const script = document.createElement('script');
    script.id = scriptId;
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify(schema);
    document.head.appendChild(script);

    return () => {
      const mountedScript = document.getElementById(scriptId);
      if (mountedScript) mountedScript.remove();
    };
  }, [baseUrl, instagram, openingHours, primaryAddress, primaryPhone]);

  const contactInfo = [
    {
      icon: MapPin,
      title: t('address'),
      values: addresses.length ? addresses : [t('addressValue')],
    },
    {
      icon: Phone,
      title: t('phone'),
      values: phones.length ? phones : [phoneRaw],
      linkForValue: (value: string) => `tel:${value.replace(/\s/g, '')}`,
      valueIcon: Phone,
    },
    {
      icon: Clock,
      title: t('workingHours'),
      values: workingHours.length ? workingHours : [t('workingHoursValue')],
    },
    {
      icon: Instagram,
      title: 'Instagram',
      values: [instagram],
      linkForValue: () => `https://instagram.com/${instagram.replace('@', '')}`,
    },
  ];

  return (
    <Layout>
      <section className="py-20 bg-secondary/50">
        <div className="container mx-auto px-4 text-center">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-heading text-4xl sm:text-5xl font-bold text-foreground mb-4"
          >
            {t('contactTitle')}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-lg text-muted-foreground max-w-2xl mx-auto"
          >
            {t('visitStore')}
          </motion.p>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            {contactInfo.map((info, index) => (
              <motion.div
                key={info.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-card rounded-2xl p-6 shadow-card hover:shadow-elevated transition-shadow"
              >
                <div className="w-12 h-12 rounded-xl gradient-hero flex items-center justify-center mb-4">
                  <info.icon className="w-6 h-6 text-primary-foreground" />
                </div>
                <h3 className="font-heading font-semibold text-foreground mb-2">
                  {info.title}
                </h3>
                <div className="space-y-1">
                  {info.values.map((value, valueIndex) => {
                    const link = info.linkForValue ? info.linkForValue(value) : '';
                    const isExternal = link.startsWith('http');
                    const ValueIcon = info.valueIcon;
                    if (link) {
                      return (
                        <a
                          key={`${info.title}-${value}-${valueIndex}`}
                          href={link}
                          target={isExternal ? '_blank' : undefined}
                          rel={isExternal ? 'noopener noreferrer' : undefined}
                          className="flex items-center gap-2 text-accent hover:underline break-all"
                        >
                          {ValueIcon && <ValueIcon className="w-4 h-4 shrink-0" />}
                          {value}
                        </a>
                      );
                    }
                    return (
                      <p key={`${info.title}-${value}-${valueIndex}`} className="flex items-center gap-2 text-muted-foreground">
                        {ValueIcon && <ValueIcon className="w-4 h-4 shrink-0" />}
                        {value}
                      </p>
                    );
                  })}
                </div>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="rounded-3xl overflow-hidden shadow-elevated"
          >
            <iframe
              src={mapEmbed}
              width="100%"
              height="450"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Optic Gallery Location"
              className="grayscale hover:grayscale-0 transition-all duration-500 w-full min-h-[300px] md:min-h-[450px]"
            />
          </motion.div>
        </div>
      </section>

      <section className="py-24 gradient-hero">
        <div className="container mx-auto px-4 text-center">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="font-heading text-3xl sm:text-4xl font-bold text-primary-foreground mb-6"
          >
            {t('visitStore')}
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-primary-foreground/80 text-lg max-w-2xl mx-auto mb-8"
          >
            {t('aboutText1')}
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <a
              href={`tel:${(phones[0] || phoneRaw).replace(/\s/g, '')}`}
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-primary rounded-xl font-medium hover:bg-white/90 transition-colors"
            >
              <Phone className="w-5 h-5" />
              {phones[0] || phoneRaw}
            </a>
            <a
              href={`https://instagram.com/${instagram.replace('@', '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white/10 text-primary-foreground rounded-xl font-medium hover:bg-white/20 transition-colors border border-white/20"
            >
              <Instagram className="w-5 h-5" />
              Instagram
            </a>
          </motion.div>
        </div>
      </section>

      <section className="py-16 border-t border-border">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="font-heading text-3xl sm:text-4xl font-bold text-foreground mb-4">
              {seoCopy.title}
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              {seoCopy.text}
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link
                to="/products"
                className="inline-flex rounded-full border border-border px-4 py-2 text-sm text-foreground hover:bg-secondary transition-colors"
              >
                {language === 'ru' ? 'Каталог оптики' : language === 'hy' ? 'Օպտիկայի կատալոգ' : 'Optical catalog'}
              </Link>
              <Link
                to="/about"
                className="inline-flex rounded-full border border-border px-4 py-2 text-sm text-foreground hover:bg-secondary transition-colors"
              >
                {language === 'ru' ? 'О нашей оптике' : language === 'hy' ? 'Մեր օպտիկայի մասին' : 'About our optical store'}
              </Link>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Contact;
