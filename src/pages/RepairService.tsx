import { useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Phone, Check } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { useLanguage, type Language } from '@/contexts/LanguageContext';
import { useSeo } from '@/lib/seo';
import { apiUrl, imageUrl } from '@/lib/api';
import { parseMultiValue } from '@/lib/contactInfo';

const REPAIR_META: Record<Language, { title: string; description: string }> = {
  en: {
    title: 'Eyewear Repair Service in Yerevan',
    description: 'Professional eyeglass repair in Yerevan: frame soldering, lens replacement, adjustment, cleaning and restoration.',
  },
  ru: {
    title: 'Ремонт очков в Ереване',
    description: 'Профессиональный ремонт очков в Ереване: пайка оправ, замена линз, регулировка, чистка и восстановление.',
  },
  hy: {
    title: 'Ակնոցների վերանորոգում Երևանում',
    description: 'Ակնոցների պրոֆեսիոնալ վերանորոգում Երևանում՝ շրջանակի զոդում, ոսպնյակի փոխարինում, կարգավորում և մաքրում։',
  },
};

const REPAIR_COPY: Record<Language, {
  eyebrow: string;
  title: string;
  intro: string;
  call: string;
  viewServices: string;
  experienceValue: string;
  experienceLabel: string;
  experienceText: string;
  repairsValue: string;
  repairsLabel: string;
  repairsText: string;
  servicesTitle: string;
  servicesIntro: string;
  services: Array<{ title: string; text: string }>;
  processTitle: string;
  process: Array<{ title: string; text: string }>;
  whyTitle: string;
  benefits: Array<{ title: string; text: string }>;
  ctaTitle: string;
  ctaText: string;
  callNow: string;
  messageUs: string;
  heroAlt: string;
  workshopAlt: string;
}> = {
  hy: {
    eyebrow: 'Optic Gallery · Սերվիս',
    title: 'Ձեր սիրելի ակնոցը արժանի է երկրորդ կյանքի',
    intro: 'Կարիք չկա դեն նետել ակնոցը փոքր վնասի պատճառով։ Մենք արագ կշտկենք թերությունը, կփոխարինենք կոտրված դետալները և ոսպնյակները՝ մատչելի գնով։',
    call: 'Զանգահարել',
    viewServices: 'Տեսնել ծառայությունները',
    experienceValue: '5+',
    experienceLabel: 'տարվա փորձ',
    experienceText: 'Ակնոցների վերանորոգման մասնագիտացված փորձ',
    repairsValue: '5 000+',
    repairsLabel: 'վերանորոգված ակնոց',
    repairsText: 'Վերադարձրել ենք կյանք հազարավոր ակնոցների',
    servicesTitle: 'Ի՞նչ ենք վերանորոգում',
    servicesIntro: 'Անհատական մոտեցում յուրաքանչյուր դեպքին․ մեր մասնագետների թիմը գտնում է լուծում նույնիսկ բարդ վնասների դեպքում։',
    services: [
      { title: 'Շրջանակի զոդում', text: 'Կոտրված մետաղական շրջանակներ, կամրջակ և տաճարներ՝ վերականգնված ճշգրիտ զոդմամբ։' },
      { title: 'Ոսպնյակի փոխարինում', text: 'Քերծված կամ ճաքած ոսպնյակները փոխարինում ենք նորով՝ Ձեր դեղատոմսով։' },
      { title: 'Պտուտակ և բռնիչ', text: 'Կորած պտուտակներ, թուլացած ծխնիներ, քթի հենարաններ՝ նույն օրը։' },
      { title: 'Ձևի կարգավորում', text: 'Ակնոցը նորից նստում է դեմքին՝ առանց սեղմելու և առանց սահելու։' },
      { title: 'Փայլեցում և մաքրում', text: 'Ուլտրաձայնային մաքրում և փայլեցում՝ ակնոցը կրկին նոր տեսք է ստանում։' },
      { title: 'Արևային ակնոցներ', text: 'Բրենդային արևային ակնոցների վերանորոգում՝ որակյալ դետալներով։' },
    ],
    processTitle: 'Ինչպես է ընթանում',
    process: [
      { title: 'Բերեք ակնոցը', text: 'Այցելեք սրահ կամ ուղարկեք լուսանկարը՝ նախնական գնահատման համար։' },
      { title: 'Անվճար ախտորոշում', text: 'Մասնագետը որոշում է վնասը և առաջարկում լուծում՝ ճշգրիտ գնով։' },
      { title: 'Վերանորոգում', text: 'Աշխատանքի մեծ մասը կատարվում է 15–60 րոպեում։' },
      { title: 'Ստուգում և հանձնում', text: 'Ստուգում ենք ամրությունը և կարգավորում ակնոցը Ձեր դեմքին։' },
    ],
    whyTitle: 'Ինչո՞ւ Optic Gallery',
    benefits: [
      { title: 'Անհատական մոտեցում', text: 'Յուրաքանչյուր իրավիճակ եզակի է՝ առաջարկում ենք Ձեզ հարմար լուծում։' },
      { title: 'Ազնիվ գին', text: 'Ախտորոշումն անվճար է, գինը հայտնում ենք աշխատանքից առաջ։' },
      { title: 'Որակյալ դետալներ', text: 'Օգտագործում ենք որակյալ պահեստամասեր և ոսպնյակներ։' },
      { title: 'Երաշխիք', text: 'Կատարված աշխատանքին տրվում է երաշխիք։' },
    ],
    ctaTitle: 'Շարունակեք վայելել կյանքի պայծառ պահերն առանց խոչընդոտների',
    ctaText: 'Կապվեք մեզ հետ ակնոցների պրոֆեսիոնալ և հուսալի վերանորոգման համար։',
    callNow: 'Զանգահարել հիմա',
    messageUs: 'Գրել մեզ',
    heroAlt: 'Ակնոցների վերանորոգման աշխատանք Optic Gallery սրահում',
    workshopAlt: 'Optic Gallery-ի մասնագետը վերանորոգում է ակնոց',
  },
  ru: {
    eyebrow: 'Optic Gallery · Сервис',
    title: 'Ваши любимые очки заслуживают второй жизни',
    intro: 'Не выбрасывайте очки из-за небольшой поломки. Мы быстро устраним повреждение, заменим сломанные детали или линзы по доступной цене.',
    call: 'Позвонить',
    viewServices: 'Посмотреть услуги',
    experienceValue: '5+',
    experienceLabel: 'лет опыта',
    experienceText: 'Специализированный опыт ремонта очков',
    repairsValue: '5 000+',
    repairsLabel: 'отремонтированных очков',
    repairsText: 'Вернули к жизни тысячи любимых оправ',
    servicesTitle: 'Что мы ремонтируем',
    servicesIntro: 'Индивидуальный подход к каждому случаю: наши специалисты находят решение даже при сложных повреждениях.',
    services: [
      { title: 'Пайка оправы', text: 'Восстанавливаем сломанные металлические оправы, мосты и заушники точной пайкой.' },
      { title: 'Замена линз', text: 'Меняем поцарапанные или треснувшие линзы на новые с учётом вашего рецепта.' },
      { title: 'Винты и крепления', text: 'Устанавливаем потерянные винты, укрепляем шарниры и меняем носоупоры в тот же день.' },
      { title: 'Регулировка формы', text: 'Очки снова удобно сидят на лице — не давят и не сползают.' },
      { title: 'Полировка и чистка', text: 'Ультразвуковая чистка и полировка возвращают очкам аккуратный вид.' },
      { title: 'Солнцезащитные очки', text: 'Ремонтируем брендовые солнцезащитные очки с использованием качественных деталей.' },
    ],
    processTitle: 'Как проходит ремонт',
    process: [
      { title: 'Принесите очки', text: 'Посетите салон или отправьте фотографию для предварительной оценки.' },
      { title: 'Бесплатная диагностика', text: 'Специалист определит повреждение и предложит решение с точной ценой.' },
      { title: 'Ремонт', text: 'Большинство работ выполняется за 15–60 минут.' },
      { title: 'Проверка и выдача', text: 'Проверяем прочность и регулируем посадку очков на вашем лице.' },
    ],
    whyTitle: 'Почему Optic Gallery',
    benefits: [
      { title: 'Индивидуальный подход', text: 'Каждый случай уникален — мы предложим подходящее именно вам решение.' },
      { title: 'Честная цена', text: 'Диагностика бесплатна, а стоимость сообщается до начала работы.' },
      { title: 'Качественные детали', text: 'Используем качественные запчасти и линзы.' },
      { title: 'Гарантия', text: 'На выполненную работу предоставляется гарантия.' },
    ],
    ctaTitle: 'Продолжайте наслаждаться яркими моментами жизни без помех',
    ctaText: 'Свяжитесь с нами для профессионального и надёжного ремонта очков.',
    callNow: 'Позвонить сейчас',
    messageUs: 'Написать нам',
    heroAlt: 'Ремонт очков в салоне Optic Gallery',
    workshopAlt: 'Специалист Optic Gallery ремонтирует очки',
  },
  en: {
    eyebrow: 'Optic Gallery · Service',
    title: 'Your favorite glasses deserve a second life',
    intro: 'Do not throw away your glasses because of minor damage. We quickly repair faults and replace broken parts or lenses at an affordable price.',
    call: 'Call us',
    viewServices: 'View services',
    experienceValue: '5+',
    experienceLabel: 'years of experience',
    experienceText: 'Specialized experience in eyewear repair',
    repairsValue: '5,000+',
    repairsLabel: 'glasses repaired',
    repairsText: 'We have brought thousands of favorite frames back to life',
    servicesTitle: 'What we repair',
    servicesIntro: 'A personal approach to every case: our specialists find a solution even for complex damage.',
    services: [
      { title: 'Frame soldering', text: 'Broken metal frames, bridges and temples restored with precise soldering.' },
      { title: 'Lens replacement', text: 'Scratched or cracked lenses replaced with new ones made to your prescription.' },
      { title: 'Screws and fittings', text: 'Missing screws, loose hinges and nose pads repaired the same day.' },
      { title: 'Frame adjustment', text: 'Your glasses fit comfortably again without pinching or slipping.' },
      { title: 'Polishing and cleaning', text: 'Ultrasonic cleaning and polishing restore a fresh, clean appearance.' },
      { title: 'Sunglasses', text: 'Designer sunglasses repaired using quality replacement parts.' },
    ],
    processTitle: 'How it works',
    process: [
      { title: 'Bring your glasses', text: 'Visit our store or send us a photo for an initial assessment.' },
      { title: 'Free diagnosis', text: 'A specialist identifies the damage and offers a solution with an exact price.' },
      { title: 'Repair', text: 'Most repairs are completed within 15–60 minutes.' },
      { title: 'Check and collection', text: 'We test the repair and adjust the glasses to fit your face.' },
    ],
    whyTitle: 'Why Optic Gallery',
    benefits: [
      { title: 'Personal approach', text: 'Every case is different, so we recommend the solution that suits you.' },
      { title: 'Honest pricing', text: 'Diagnosis is free and you approve the price before work begins.' },
      { title: 'Quality parts', text: 'We use dependable replacement parts and lenses.' },
      { title: 'Warranty', text: 'Our completed repair work is covered by a warranty.' },
    ],
    ctaTitle: 'Keep enjoying life’s bright moments without interruption',
    ctaText: 'Contact us for professional and reliable eyewear repair.',
    callNow: 'Call now',
    messageUs: 'Message us',
    heroAlt: 'Eyewear repair at Optic Gallery',
    workshopAlt: 'Optic Gallery specialist repairing eyeglasses',
  },
};

const DEFAULT_REPAIR_IMAGES = [
  'https://api.opticgallery.am/uploads/hero-1771540352856.webp',
  'https://api.opticgallery.am/uploads/hero-1771540352861.JPG',
];

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.15 },
};

export default function RepairService() {
  const { language } = useLanguage();
  const copy = REPAIR_COPY[language];
  const meta = REPAIR_META[language];
  const { data: settings = {} } = useQuery({
    queryKey: ['site-settings'],
    queryFn: async () => {
      const res = await fetch(apiUrl('/api/site-settings'));
      if (!res.ok) return {};
      return res.json();
    },
  });

  const photos = useMemo(() => {
    const result: string[] = [];
    const raw = settings.repair_images;
    if (typeof raw === 'string' && raw.trim()) {
      try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          parsed.forEach((img) => {
            if (typeof img === 'string' && img.trim()) result.push(imageUrl(img) || img);
          });
        }
      } catch {
        // Fall back to the current Optic Gallery repair imagery.
      }
    }
    return [result[0] || DEFAULT_REPAIR_IMAGES[0], result[1] || result[0] || DEFAULT_REPAIR_IMAGES[1]];
  }, [settings]);

  const phones = parseMultiValue(settings.contact_phone || '');
  const phone = phones[0] || '+37411000000';
  const phoneHref = `tel:${phone.replace(/[^+\d]/g, '')}`;
  const instagram = String(settings.contact_instagram || '@opticgallery.am').replace(/^@/, '');

  useSeo({
    title: meta.title,
    description: meta.description,
    path: '/repair-service',
    image: photos[0],
  });

  useEffect(() => {
    const scriptId = 'repair-service-json-ld';
    const canonical = `https://opticgallery.am/repair-service${language === 'hy' ? '' : `?lang=${language}`}`;
    const schema = {
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'OpticalStore',
          '@id': 'https://opticgallery.am/#store',
          name: 'Optic Gallery',
          url: 'https://opticgallery.am/',
          telephone: phone,
          image: photos[0],
          sameAs: [`https://instagram.com/${instagram}`],
        },
        {
          '@type': 'Service',
          '@id': `${canonical}#service`,
          name: meta.title,
          description: meta.description,
          url: canonical,
          image: photos,
          provider: { '@id': 'https://opticgallery.am/#store' },
          areaServed: { '@type': 'City', name: 'Yerevan' },
          serviceType: copy.services.map((service) => service.title),
        },
      ],
    };

    let script = document.getElementById(scriptId) as HTMLScriptElement | null;
    if (!script) {
      script = document.createElement('script');
      script.id = scriptId;
      script.type = 'application/ld+json';
      document.head.appendChild(script);
    }
    script.textContent = JSON.stringify(schema);

    return () => document.getElementById(scriptId)?.remove();
  }, [copy.services, instagram, language, meta.description, meta.title, phone, photos]);

  return (
    <Layout>
      <div className="bg-[#f8faf7] text-[#253249]">
        <section className="relative overflow-hidden bg-[linear-gradient(140deg,#26364f_0%,#265568_48%,#356b58_100%)]">
          <div aria-hidden="true" className="pointer-events-none absolute -right-32 -top-32 h-[28rem] w-[28rem] rounded-full bg-[#e7b954]/20 blur-3xl" />
          <div className="relative mx-auto grid max-w-6xl gap-12 px-6 py-20 md:grid-cols-2 md:items-center md:py-28">
            <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
              <span className="inline-flex rounded-full border border-white/25 bg-white/10 px-4 py-1.5 text-sm text-white/90">{copy.eyebrow}</span>
              <h1 className="mt-6 text-4xl font-semibold leading-tight text-white md:text-6xl">{copy.title}</h1>
              <p className="mt-6 max-w-xl text-lg leading-relaxed text-white/80">{copy.intro}</p>
              <div className="mt-8 flex flex-wrap gap-3">
                <a href={phoneHref} className="inline-flex items-center justify-center gap-2 rounded-full bg-[#e7b954] px-7 py-3 font-semibold text-[#253249] shadow-elevated transition-transform hover:-translate-y-0.5"><Phone className="h-4 w-4" /> {copy.call}</a>
                <a href="#repair-services" className="inline-flex items-center justify-center rounded-full border border-white/30 px-7 py-3 font-medium text-white transition-colors hover:bg-white/10">{copy.viewServices}</a>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }} className="relative">
              <div className="aspect-[4/3] overflow-hidden rounded-3xl border border-white/15 shadow-elevated">
                <img src={photos[0]} alt={copy.heroAlt} className="h-full w-full object-cover" loading="eager" />
              </div>
            </motion.div>
          </div>
        </section>

        <section className="border-b border-[#dfe7e1] bg-[linear-gradient(180deg,#fafcf9_0%,#eef5f0_100%)]">
          <div className="mx-auto grid max-w-6xl gap-5 px-6 py-10 sm:grid-cols-2">
            {[[copy.experienceValue, copy.experienceLabel, copy.experienceText], [copy.repairsValue, copy.repairsLabel, copy.repairsText]].map(([value, label, text]) => (
              <motion.div key={label} {...fadeUp} className="rounded-2xl border border-[#dfe7e1] bg-white p-6 text-center shadow-card">
                <p className="font-heading text-4xl font-semibold text-[#356b58] md:text-5xl">{value}</p>
                <p className="mt-1 font-medium text-[#253249]">{label}</p>
                <p className="mx-auto mt-2 max-w-xs text-sm text-[#667085]">{text}</p>
              </motion.div>
            ))}
          </div>
        </section>

        <section id="repair-services" className="mx-auto max-w-6xl scroll-mt-24 px-6 py-20">
          <motion.div {...fadeUp}>
            <h2 className="text-3xl font-semibold md:text-4xl">{copy.servicesTitle}</h2>
            <p className="mt-3 max-w-2xl leading-relaxed text-[#667085]">{copy.servicesIntro}</p>
          </motion.div>
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {copy.services.map((service, index) => (
              <motion.article key={service.title} {...fadeUp} transition={{ duration: 0.45, delay: index * 0.05 }} className="group rounded-2xl border border-[#dfe7e1] bg-white p-6 shadow-card transition-all hover:-translate-y-1 hover:shadow-elevated">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#e8f1eb] font-heading font-semibold text-[#356b58]">{index + 1}</div>
                <h3 className="mt-5 text-xl font-semibold">{service.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-[#667085]">{service.text}</p>
              </motion.article>
            ))}
          </div>
        </section>

        <section className="bg-[linear-gradient(180deg,#fafcf9_0%,#eef5f0_100%)]">
          <div className="mx-auto max-w-6xl px-6 py-20">
            <motion.h2 {...fadeUp} className="text-3xl font-semibold md:text-4xl">{copy.processTitle}</motion.h2>
            <div className="mt-10 grid gap-6 md:grid-cols-4">
              {copy.process.map((step, index) => (
                <motion.div key={step.title} {...fadeUp} transition={{ duration: 0.45, delay: index * 0.07 }} className="rounded-2xl bg-white p-6 shadow-card">
                  <span className="font-heading text-4xl font-semibold text-[#d1a13c]">{String(index + 1).padStart(2, '0')}</span>
                  <h3 className="mt-3 text-lg font-semibold">{step.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-[#667085]">{step.text}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto grid max-w-6xl gap-12 px-6 py-20 md:grid-cols-2 md:items-center">
          <motion.div {...fadeUp} className="aspect-[4/3] overflow-hidden rounded-3xl shadow-elevated">
            <img src={photos[1]} alt={copy.workshopAlt} className="h-full w-full object-cover" loading="lazy" />
          </motion.div>
          <motion.div {...fadeUp}>
            <h2 className="text-3xl font-semibold md:text-4xl">{copy.whyTitle}</h2>
            <ul className="mt-6 space-y-5">
              {copy.benefits.map((benefit) => (
                <li key={benefit.title} className="flex gap-4">
                  <span className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#356b58] text-white"><Check className="h-3.5 w-3.5" /></span>
                  <div><p className="font-semibold">{benefit.title}</p><p className="mt-1 text-sm leading-relaxed text-[#667085]">{benefit.text}</p></div>
                </li>
              ))}
            </ul>
          </motion.div>
        </section>

        <section className="px-6 pb-20">
          <motion.div {...fadeUp} className="mx-auto max-w-6xl overflow-hidden rounded-3xl bg-[linear-gradient(140deg,#26364f_0%,#265568_48%,#356b58_100%)] px-8 py-14 text-center shadow-elevated">
            <h2 className="text-3xl font-semibold text-white md:text-4xl">{copy.ctaTitle}</h2>
            <p className="mx-auto mt-4 max-w-2xl text-white/80">{copy.ctaText}</p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <a href={phoneHref} className="inline-flex items-center justify-center gap-2 rounded-full bg-[#e7b954] px-8 py-3 font-semibold text-[#253249] transition-transform hover:-translate-y-0.5"><Phone className="h-4 w-4" /> {copy.callNow}</a>
              <a href={`https://instagram.com/${instagram}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center rounded-full border border-white/30 px-8 py-3 font-medium text-white transition-colors hover:bg-white/10">{copy.messageUs}</a>
            </div>
          </motion.div>
        </section>
      </div>
    </Layout>
  );
}
