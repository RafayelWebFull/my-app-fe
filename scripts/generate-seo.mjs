import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import store from '../src/data/store.json' with { type: 'json' };
import pageMeta from '../src/data/pageMeta.json' with { type: 'json' };
import { storeGraph } from './store-schema.mjs';

const SITE_URL = (process.env.SITE_URL || 'https://opticgallery.am').replace(/\/$/, '');
const API_URL = (process.env.API_BASE_URL || `${process.env.VITE_API_URL || 'https://api.opticgallery.am'}/api`).replace(/\/$/, '');
const DIST = process.env.SEO_DIST || 'dist';
const LANGS = ['hy', 'ru', 'en'];
const locales = { hy: 'hy_AM', ru: 'ru_RU', en: 'en_US' };

// Titles and descriptions are shared with the React pages (src/data/pageMeta.json)
// so the pre-rendered HTML and the hydrated page carry identical metadata.
const pageMetaFor = (key) => Object.fromEntries(LANGS.map((lang) => [lang, [pageMeta[key][lang].title, pageMeta[key][lang].description]]));
const pages = {
  home: { path: '/', priority: '1.0', changefreq: 'weekly', ...pageMetaFor('home') },
  products: { path: '/products', priority: '0.9', changefreq: 'daily', ...pageMetaFor('products') },
  brands: { path: '/brands', priority: '0.8', changefreq: 'weekly', ...pageMetaFor('brands') },
  about: { path: '/about', priority: '0.7', changefreq: 'monthly', ...pageMetaFor('about') },
  contact: { path: '/contact', priority: '0.7', changefreq: 'monthly', ...pageMetaFor('contact') },
  'repair-service': { path: '/repair-service', priority: '0.7', changefreq: 'monthly', ...pageMetaFor('repair') },
  blog: { path: '/blog', priority: '0.8', changefreq: 'weekly', ...pageMetaFor('blog') },
};

const repairDetails = {
  hy: {
    servicesTitle: 'Ի՞նչ ենք վերանորոգում',
    services: ['Շրջանակի զոդում', 'Ոսպնյակի փոխարինում', 'Պտուտակների և բռնիչների փոխարինում', 'Ակնոցի ձևի կարգավորում', 'Փայլեցում և ուլտրաձայնային մաքրում', 'Արևային ակնոցների վերանորոգում'],
    processTitle: 'Ինչպես է ընթանում վերանորոգումը',
    process: ['Բերեք ակնոցը կամ ուղարկեք լուսանկարը', 'Ստացեք անվճար ախտորոշում և ճշգրիտ գին', 'Վերանորոգման մեծ մասը կատարվում է 15–60 րոպեում', 'Ստուգում, կարգավորում և հանձնում'],
    benefitsTitle: 'Ինչո՞ւ Optic Gallery',
    benefits: ['Անհատական մոտեցում', 'Ազնիվ գին մինչև աշխատանքի սկիզբը', 'Որակյալ պահեստամասեր և ոսպնյակներ', 'Երաշխիք կատարված աշխատանքին'],
  },
  ru: {
    servicesTitle: 'Что мы ремонтируем',
    services: ['Пайка металлических оправ', 'Замена линз по рецепту', 'Замена винтов, шарниров и носоупоров', 'Регулировка формы и посадки очков', 'Полировка и ультразвуковая чистка', 'Ремонт солнцезащитных очков'],
    processTitle: 'Как проходит ремонт',
    process: ['Принесите очки или отправьте фотографию', 'Получите бесплатную диагностику и точную цену', 'Большинство ремонтов выполняется за 15–60 минут', 'Проверка, регулировка и выдача'],
    benefitsTitle: 'Почему Optic Gallery',
    benefits: ['Индивидуальный подход', 'Честная цена до начала работы', 'Качественные детали и линзы', 'Гарантия на выполненную работу'],
  },
  en: {
    servicesTitle: 'What we repair',
    services: ['Metal frame soldering', 'Prescription lens replacement', 'Screw, hinge and nose-pad replacement', 'Frame shape and fit adjustment', 'Polishing and ultrasonic cleaning', 'Sunglasses repair'],
    processTitle: 'How the repair works',
    process: ['Bring your glasses or send a photo', 'Receive a free diagnosis and exact price', 'Most repairs are completed within 15–60 minutes', 'Final inspection, adjustment and collection'],
    benefitsTitle: 'Why Optic Gallery',
    benefits: ['Personal approach', 'Honest pricing before work begins', 'Quality parts and lenses', 'Warranty on completed work'],
  },
};

const htmlEscape = (value) => String(value ?? '').replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
const xmlEscape = (value) => htmlEscape(value).replace(/&#39;/g, '&apos;');
const absoluteImage = (value) => !value ? `${SITE_URL}/logo.png` : /^https?:\/\//.test(value) ? value : `${SITE_URL}${value.startsWith('/') ? '' : '/'}${value}`;
const localizedDescription = (product, lang) => product.description_translations?.[lang] || product[`description_${lang}`] || product.description || '';
const productCategoryNames = {
  hy: { optic: 'օպտիկական ակնոցի շրջանակ', sunglasses: 'արևային ակնոց', lenses: 'կոնտակտային ոսպնյակ' },
  ru: { optic: 'оправа для очков', sunglasses: 'солнцезащитные очки', lenses: 'контактные линзы' },
  en: { optic: 'eyeglass frame', sunglasses: 'sunglasses', lenses: 'contact lenses' },
};
const normalized = (value) => String(value || '').trim();
const productDisplayName = (product) => {
  const name = normalized(product.name);
  const brand = normalized(product.brand_name);
  return brand && !name.toLocaleLowerCase().includes(brand.toLocaleLowerCase()) ? `${brand} ${name}` : name;
};
const productCategoryName = (product, lang) => productCategoryNames[lang][normalized(product.category_slug).toLowerCase()] || normalized(product.category_name);
const productSeoTitle = (product, lang) => {
  const name = productDisplayName(product);
  const category = productCategoryName(product, lang);
  return category ? `${name} — ${category}` : name;
};
const productSeoDescription = (product, lang) => {
  const stored = normalized(localizedDescription(product, lang))
    .replace(/\s+/g, ' ')
    .replace(/\\+$/, '')
    .trim()
    .replace(/[.!?՜։]\s?$/, '');
  const name = productDisplayName(product);
  const category = productCategoryName(product, lang);
  const hasPrice = Number.isFinite(Number(product.price)) && Number(product.price) > 0;
  const context = {
    hy: `${name}${category ? ` — ${category}` : ''} Optic Gallery-ում՝ Երևանում։ ${hasPrice ? 'Դիտեք գինը, լուսանկարները և առկայությունը' : 'Դիտեք լուսանկարները և ճշտեք գինն ու առկայությունը'}։`,
    ru: `${name}${category ? ` — ${category}` : ''} в Optic Gallery, Ереван. ${hasPrice ? 'Посмотрите цену, фотографии и наличие' : 'Посмотрите фотографии и уточните цену и наличие'}.`,
    en: `${name}${category ? ` — ${category}` : ''} at Optic Gallery in Yerevan. ${hasPrice ? 'View the price, photos and current availability' : 'View the photos and ask about the price and current availability'}.`,
  }[lang];
  return stored ? `${stored}. ${context}` : context;
};
const urlFor = (pathname, lang) => `${SITE_URL}${pathname === '/' ? '/' : pathname}${lang === 'hy' ? '' : `${pathname.includes('?') ? '&' : '?'}lang=${lang}`}`;
const linkFor = (pathname, lang, label) => `<a href="${htmlEscape(urlFor(pathname, lang))}">${htmlEscape(label)}</a>`;

const fill = (template, values) => template.replace(/\{(\w+)\}/g, (_, key) => String(values[key] ?? ''));
const branchHours = (branch) => `${branch.opens}–${branch.closes}`;
const branchHoursText = (branch, lang) => `${store.labels[lang].daily}: ${branchHours(branch)}`;
const branchValues = (branch, lang) => ({ name: branch.shortName[lang], address: branch.address[lang], hours: branchHours(branch) });
const externalLink = (href, label) => `<a href="${htmlEscape(href)}" rel="noopener">${htmlEscape(label)}</a>`;
const phoneLinks = () => store.phones.map((phone) => `<a href="tel:${phone.e164}">${htmlEscape(phone.display)}</a>`).join(', ');

function branchDetails(branch, lang, { heading = 'h3', withPageLink = true } = {}) {
  const labels = store.labels[lang];
  const title = withPageLink ? linkFor(`/contact/${branch.slug}`, lang, branch.address[lang]) : htmlEscape(branch.address[lang]);
  return `<section><${heading}>${title}</${heading}><ul>
        <li>${htmlEscape(branchHoursText(branch, lang))}</li>
        <li>${htmlEscape(labels.phones)}: ${phoneLinks()}</li>
        <li>${externalLink(branch.mapUrl, labels.directions)}</li>
      </ul></section>`;
}

// Static NAP footer present in every pre-rendered page, so non-JS crawlers always see it.
function storeFooter(lang) {
  const labels = store.labels[lang];
  return `<footer>
      <h2>${htmlEscape(labels.stores)}</h2>
      ${store.branches.map((branch) => branchDetails(branch, lang)).join('\n      ')}
      <p>Instagram: ${externalLink(store.instagram.url, `@${store.instagram.handle}`)}</p>
      <p>${htmlEscape(fill(labels.copyright, { year: new Date().getFullYear() }))}</p>
    </footer>`;
}

function fallbackShell(lang, title, content) {
  const navigation = [
    ['/', pages.home[lang][0]],
    ['/products', pages.products[lang][0]],
    ['/brands', pages.brands[lang][0]],
    ['/repair-service', pages['repair-service'][lang][0]],
    ['/blog', pages.blog[lang][0]],
    ['/about', pages.about[lang][0]],
    ['/contact', pages.contact[lang][0]],
  ].map(([pathname, label]) => linkFor(pathname, lang, label)).join(' ');

  return `<main data-seo-fallback lang="${lang}">
      <nav aria-label="Primary">${navigation}</nav>
      <h1>${htmlEscape(title)}</h1>
      ${content}
      ${storeFooter(lang)}
    </main>`;
}

function productLinks(products, lang, limit = products.length) {
  return `<ul>${products.slice(0, limit).map((product) => `<li>${linkFor(`/products/${Number(product.id)}`, lang, product.name)}</li>`).join('')}</ul>`;
}

function blogLinks(posts, lang) {
  return `<ul>${posts.map((post) => `<li>${linkFor(`/blog/${post.slug}`, lang, post[`title_${lang}`] || post.title_en)}</li>`).join('')}</ul>`;
}

const blogActions = {
  hy: {
    title: 'Հաջորդ քայլը',
    text: 'Դիտեք ակնոցների տեսականին, ծանոթացեք վերանորոգման ծառայությանը կամ կապվեք մեզ հետ։',
    products: 'Դիտել ակնոցները',
    repair: 'Ակնոցների վերանորոգում',
    contact: 'Կապվել մեզ հետ',
  },
  ru: {
    title: 'Следующий шаг',
    text: 'Посмотрите каталог очков, узнайте о ремонте очков или свяжитесь с нами.',
    products: 'Выбрать очки',
    repair: 'Ремонт очков',
    contact: 'Связаться с нами',
  },
  en: {
    title: 'Next step',
    text: 'Browse our eyewear, learn about eyeglass repair, or contact our optical store in Yerevan.',
    products: 'Browse eyewear',
    repair: 'Eyeglass repair',
    contact: 'Contact us',
  },
};

function blogActionLinks(lang) {
  const copy = blogActions[lang];
  return `<section><h2>${htmlEscape(copy.title)}</h2><p>${htmlEscape(copy.text)}</p><ul><li>${linkFor('/products', lang, copy.products)}</li><li>${linkFor('/repair-service', lang, copy.repair)}</li><li>${linkFor('/contact', lang, copy.contact)}</li></ul></section>`;
}

function repairFallback(lang, description) {
  const details = repairDetails[lang];
  const list = (items) => `<ul>${items.map((item) => `<li>${htmlEscape(item)}</li>`).join('')}</ul>`;
  return `<p>${htmlEscape(description)}</p>
      <section><h2>${htmlEscape(details.servicesTitle)}</h2>${list(details.services)}</section>
      <section><h2>${htmlEscape(details.processTitle)}</h2>${list(details.process)}</section>
      <section><h2>${htmlEscape(details.benefitsTitle)}</h2>${list(details.benefits)}</section>`;
}

async function fetchProducts() {
  var lastError;
  for (let attempt = 1; attempt <= 4; attempt += 1) {
    try {
      const response = await fetch(`${API_URL}/optics`);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      if (!Array.isArray(data)) throw new Error('response is not an array');
      return data.filter((item) =>
        Number.isInteger(Number(item.id)) &&
        Number(item.id) > 0 &&
        item.is_visible !== false &&
        Number(item.is_visible ?? 1) !== 0 &&
        typeof item.name === 'string' &&
        item.name.trim().length > 0
      );
    } catch (error) {
      lastError = error;
      if (attempt < 4) await new Promise((resolve) => setTimeout(resolve, attempt * 2000));
    }
  }
  throw new Error(`Cannot generate complete SEO output from ${API_URL}/optics after 4 attempts: ${lastError.message}`);
}

async function fetchBlogPosts() {
  var lastError;
  for (let attempt = 1; attempt <= 4; attempt += 1) {
    try {
      const response = await fetch(`${API_URL}/blog`);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      if (!Array.isArray(data)) throw new Error('response is not an array');
      return data.filter((post) => post.slug && post.published_at);
    } catch (error) {
      lastError = error;
      if (attempt < 4) await new Promise((resolve) => setTimeout(resolve, attempt * 2000));
    }
  }
  throw new Error(`Cannot generate blog SEO output from ${API_URL}/blog after 4 attempts: ${lastError.message}`);
}

async function fetchSiteSettings() {
  try {
    const response = await fetch(`${API_URL}/site-settings`);
    if (!response.ok) return {};
    return await response.json();
  } catch {
    return {};
  }
}

async function fetchOptional(pathname, fallback) {
  try {
    const response = await fetch(`${API_URL}${pathname}`);
    if (!response.ok) return fallback;
    return await response.json();
  } catch {
    return fallback;
  }
}

const fetchBrands = async () => {
  const data = await fetchOptional('/brands', []);
  return Array.isArray(data) ? data.filter((brand) => brand.id && normalized(brand.name)) : [];
};

const fetchTranslations = async () => Object.fromEntries(await Promise.all(LANGS.map(async (lang) => {
  const data = await fetchOptional(`/translations/${lang}`, {});
  return [lang, data.translations || data || {}];
})));

// Blog bodies come from our own CMS; drop anything executable before inlining them.
const safeArticleHtml = (value) => String(value || '')
  .replace(/<(script|style|iframe|object|embed)[\s\S]*?<\/\1>/gi, '')
  .replace(/\son\w+="[^"]*"/gi, '')
  .replace(/\son\w+='[^']*'/gi, '')
  .replace(/href="javascript:[^"]*"/gi, 'href="#"');

function optimizedUpload(value, width) {
  if (!value) return null;
  const apiOrigin = new URL(API_URL).origin;
  const pathname = new URL(value, apiOrigin).pathname;
  if (!pathname.startsWith('/uploads/')) return null;
  return `${apiOrigin}/api/image?src=${encodeURIComponent(pathname)}&w=${width}`;
}

function firstRepairImage(value) {
  if (typeof value !== 'string' || !value.trim()) return null;
  try {
    const images = JSON.parse(value);
    return Array.isArray(images) && typeof images[0] === 'string' ? images[0] : null;
  } catch {
    return null;
  }
}

function alternates(pathname) {
  return [...LANGS.map((lang) => `<link rel="alternate" hreflang="${lang}" href="${htmlEscape(urlFor(pathname, lang))}" data-seo-lang="${lang}" />`), `<link rel="alternate" hreflang="x-default" href="${htmlEscape(urlFor(pathname, 'hy'))}" data-seo-lang="x-default" />`].join('\n    ');
}

function render(template, { lang, pathname, title, description, image, type = 'website', robots = 'index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1', schema, schemaId, headLinks = '', bodyFallback = '' }) {
  const canonical = urlFor(pathname, lang);
  const fullTitle = /optic gallery/i.test(title) ? title : `${title} | Optic Gallery`;
  let html = template
    .replace(/<html lang="[^"]*">/, `<html lang="${lang}">`)
    .replace(/<title>[^<]*<\/title>/, `<title>${htmlEscape(fullTitle)}</title>`)
    .replace(/<meta name="title"[^>]*>/, `<meta name="title" content="${htmlEscape(fullTitle)}" />`)
    .replace(/<meta name="description"[^>]*>/, `<meta name="description" content="${htmlEscape(description)}" />`)
    .replace(/<meta name="robots"[^>]*>/, `<meta name="robots" content="${robots}" />`)
    .replace(/<meta property="og:type"[^>]*>/, `<meta property="og:type" content="${type}" />`)
    .replace(/<meta property="og:url"[^>]*>/, `<meta property="og:url" content="${htmlEscape(canonical)}" />`)
    .replace(/<meta property="og:title"[^>]*>/, `<meta property="og:title" content="${htmlEscape(fullTitle)}" />`)
    .replace(/<meta property="og:description"[^>]*>/, `<meta property="og:description" content="${htmlEscape(description)}" />`)
    .replace(/<meta property="og:image"[^>]*>/, `<meta property="og:image" content="${htmlEscape(image)}" />`)
    .replace(/<link rel="canonical"[^>]*>/, `<link rel="canonical" href="${htmlEscape(canonical)}" />`)
    .replace(/(?:\s*<link rel="alternate"[^>]*>){4}/, `\n    ${alternates(pathname)}`);
  const twitter = { card: 'summary_large_image', url: canonical, title: fullTitle, description, image };
  for (const [name, content] of Object.entries(twitter)) {
    html = html.replace(new RegExp(`<meta (?:name|property)="twitter:${name}"[^>]*>`), `<meta name="twitter:${name}" content="${htmlEscape(content)}" />`);
  }
  html = html.replace('</head>', `    <meta property="og:locale" content="${locales[lang]}" />\n  </head>`);
  if (headLinks) html = html.replace('</head>', `    ${headLinks}\n  </head>`);
  if (schema) html = html.replace('</head>', `    <script${schemaId ? ` id="${htmlEscape(schemaId)}"` : ''} type="application/ld+json">${JSON.stringify(schema).replace(/</g, '\\u003c')}</script>\n  </head>`);
  if (bodyFallback) html = html.replace('<div id="root"></div>', `<div id="root">${bodyFallback}</div>`);
  return html;
}

async function save(relative, content) {
  const target = path.join(DIST, relative);
  await mkdir(path.dirname(target), { recursive: true });
  await writeFile(target, content, 'utf8');
}

async function inlineCompiledStyles(html) {
  const stylesheetPattern = /<link rel="stylesheet"[^>]*href="(\/assets\/[^"]+\.css)"[^>]*>/;
  const match = html.match(stylesheetPattern);
  if (!match) throw new Error('Cannot find compiled stylesheet in dist/index.html');
  const css = await readFile(path.join(DIST, match[1].replace(/^\//, '')), 'utf8');
  return html.replace(stylesheetPattern, `<style data-compiled-css>${css.replace(/<\/style/gi, '<\\/style')}</style>`);
}

function sitemapDate(value) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString().slice(0, 10);
}

function sitemapEntry(pathname, changefreq, priority, lastmod) {
  return LANGS.map((lang) => {
    const links = [...LANGS.map((other) => `    <xhtml:link rel="alternate" hreflang="${other}" href="${xmlEscape(urlFor(pathname, other))}" />`), `    <xhtml:link rel="alternate" hreflang="x-default" href="${xmlEscape(urlFor(pathname, 'hy'))}" />`];
    const modified = sitemapDate(lastmod);
    return `  <url>\n    <loc>${xmlEscape(urlFor(pathname, lang))}</loc>${modified ? `\n    <lastmod>${modified}</lastmod>` : ''}\n${links.join('\n')}\n    <changefreq>${changefreq}</changefreq>\n    <priority>${priority}</priority>\n  </url>`;
  });
}

const storeJsonLd = `<script type="application/ld+json">${JSON.stringify(storeGraph(store)).replace(/</g, '\\u003c')}</script>`;
const builtIndex = await readFile(path.join(DIST, 'index.html'), 'utf8');
const jsonLdPattern = /<script type="application\/ld\+json">[\s\S]*?<\/script>/;
if (!jsonLdPattern.test(builtIndex)) throw new Error('Cannot find the site-wide JSON-LD block in dist/index.html');
const template = await inlineCompiledStyles(builtIndex.replace(jsonLdPattern, storeJsonLd));
await save('index.html', template);
const [products, blogPosts, siteSettings, brands, translations] = await Promise.all([fetchProducts(), fetchBlogPosts(), fetchSiteSettings(), fetchBrands(), fetchTranslations()]);
const tr = (lang, key) => normalized(translations[lang]?.[key]);
const sitemap = [];

const mobileHeroSource = siteSettings.hero_mobile_image || siteSettings.hero_image;
const desktopHeroSource = siteSettings.hero_image || siteSettings.hero_mobile_image;
const mobileHero = optimizedUpload(mobileHeroSource, 768);
const mobileHero480 = optimizedUpload(mobileHeroSource, 480);
const desktopHero = optimizedUpload(desktopHeroSource, 1920);
const desktopHero960 = optimizedUpload(desktopHeroSource, 960);
const desktopHero1440 = optimizedUpload(desktopHeroSource, 1440);
const heroPreloads = [
  mobileHero && `<link rel="preload" as="image" href="${htmlEscape(mobileHero)}" imagesrcset="${htmlEscape(`${mobileHero480} 480w, ${mobileHero} 768w`)}" imagesizes="100vw" media="(max-width: 767px)" fetchpriority="high" />`,
  desktopHero && `<link rel="preload" as="image" href="${htmlEscape(desktopHero)}" imagesrcset="${htmlEscape(`${desktopHero960} 960w, ${desktopHero1440} 1440w, ${desktopHero} 1920w`)}" imagesizes="100vw" media="(min-width: 768px)" fetchpriority="high" />`,
].filter(Boolean).join('\n    ');

const repairImageValue = firstRepairImage(siteSettings.repair_images) || '/uploads/hero-1771540352856.webp';
const repairImage = /^https?:\/\//.test(repairImageValue)
  ? repairImageValue
  : `${new URL(API_URL).origin}${repairImageValue.startsWith('/') ? '' : '/'}${repairImageValue}`;

for (const [slug, page] of Object.entries(pages)) {
  for (const lang of LANGS) {
    const [title, description] = page[lang];
    let links = '';
    if (slug === 'home') links = `<h2>${htmlEscape(pages.products[lang][0])}</h2>${productLinks(products, lang, 12)}<h2>${htmlEscape(pages.blog[lang][0])}</h2>${blogLinks(blogPosts.slice(0, 4), lang)}`;
    if (slug === 'products') links = productLinks(products, lang);
    if (slug === 'blog') links = blogLinks(blogPosts, lang);
    const repairSchema = slug === 'repair-service' ? {
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'Service', '@id': `${urlFor(page.path, lang)}#service`, name: title, description,
          url: urlFor(page.path, lang), image: [repairImage], provider: { '@id': `${SITE_URL}/#organization` },
          areaServed: { '@type': 'City', name: 'Yerevan' }, serviceType: repairDetails[lang].services,
        },
      ],
    } : undefined;
    if (slug === 'about') {
      const paragraphs = [tr(lang, 'aboutText1'), tr(lang, 'aboutText2')].filter(Boolean).map((text) => `<p>${htmlEscape(text)}</p>`).join('');
      const highlights = [['premiumBrands', 'qualityDesc'], ['expertService', 'serviceDesc'], ['modernDesign', 'styleDesc']]
        .filter(([heading, text]) => tr(lang, heading) && tr(lang, text))
        .map(([heading, text]) => `<section><h2>${htmlEscape(tr(lang, heading))}</h2><p>${htmlEscape(tr(lang, text))}</p></section>`).join('');
      links = `${paragraphs}${highlights}`;
    }
    if (slug === 'contact') {
      links = `<h2>${htmlEscape(store.labels[lang].stores)}</h2>${store.branches.map((branch) => branchDetails(branch, lang)).join('')}`;
    }
    if (slug === 'brands') {
      links = `<ul>${brands.map((brand) => `<li>${linkFor(`/products?brand=${Number(brand.id)}`, lang, brand.name)}</li>`).join('')}</ul>`;
    }
    const bodyContent = slug === 'repair-service' ? repairFallback(lang, description) : `<p>${htmlEscape(description)}</p>${links}`;
    const bodyFallback = fallbackShell(lang, title, bodyContent);
    await save(`seo/${lang}/${slug}/index.html`, render(template, {
      lang, pathname: page.path, title, description,
      image: slug === 'repair-service' ? repairImage : `${SITE_URL}/logo.png`,
      schema: repairSchema,
      schemaId: slug === 'repair-service' ? 'repair-service-json-ld' : undefined,
      headLinks: slug === 'home' ? heroPreloads : '',
      bodyFallback,
    }));
    if (slug === 'products') {
      await save(`seo/${lang}/products-filter/index.html`, render(template, {
        lang,
        pathname: page.path,
        title,
        description,
        image: `${SITE_URL}/logo.png`,
        robots: 'noindex,follow',
        bodyFallback,
      }));
    }
  }
  sitemap.push(...sitemapEntry(page.path, page.changefreq, page.priority));
}

for (const branch of store.branches) {
  const pathname = `/contact/${branch.slug}`;
  for (const lang of LANGS) {
    const labels = store.labels[lang];
    const values = branchValues(branch, lang);
    const title = fill(labels.branchTitle, values);
    const description = fill(labels.branchDescription, values);
    const otherBranches = store.branches.filter((other) => other.slug !== branch.slug)
      .map((other) => `<li>${linkFor(`/contact/${other.slug}`, lang, `Optic Gallery — ${other.shortName[lang]}`)}</li>`).join('');
    const content = `<p>${htmlEscape(fill(labels.branchIntro, values))}</p>
      ${branchDetails(branch, lang, { heading: 'h2', withPageLink: false })}
      <ul>${otherBranches}<li>${linkFor('/contact', lang, labels.allStores)}</li><li>${linkFor('/products', lang, pages.products[lang][0])}</li><li>${linkFor('/repair-service', lang, pages['repair-service'][lang][0])}</li></ul>`;
    await save(`seo/${lang}/contact/${branch.slug}/index.html`, render(template, {
      lang, pathname, title, description, image: store.logo, bodyFallback: fallbackShell(lang, title, content),
    }));
  }
  sitemap.push(...sitemapEntry(pathname, 'monthly', '0.7'));
}

const productSpecLabels = {
  hy: { brand: 'Բրենդ', category: 'Կատեգորիա', style: 'Ձև', gender: 'Ում համար', availability: 'Առկայություն', inStock: 'Առկա է', outOfStock: 'Առկա չէ', genders: { male: 'տղամարդկանց', female: 'կանանց', unisex: 'ունիսեքս' } },
  ru: { brand: 'Бренд', category: 'Категория', style: 'Форма', gender: 'Для кого', availability: 'Наличие', inStock: 'В наличии', outOfStock: 'Нет в наличии', genders: { male: 'мужские', female: 'женские', unisex: 'унисекс' } },
  en: { brand: 'Brand', category: 'Category', style: 'Shape', gender: 'For', availability: 'Availability', inStock: 'In stock', outOfStock: 'Out of stock', genders: { male: 'men', female: 'women', unisex: 'unisex' } },
};

function productSpecs(product, lang) {
  const labels = productSpecLabels[lang];
  const inStock = !(product.in_stock === false || Number(product.in_stock) === 0);
  const gender = normalized(product.gender).toLowerCase();
  const rows = [
    [labels.brand, normalized(product.brand_name)],
    [labels.category, productCategoryName(product, lang)],
    [labels.style, normalized(product.style)],
    [labels.gender, labels.genders[gender] || ''],
    [labels.availability, inStock ? labels.inStock : labels.outOfStock],
  ].filter(([, value]) => value);
  return `<dl>${rows.map(([label, value]) => `<dt>${htmlEscape(label)}</dt><dd>${htmlEscape(value)}</dd>`).join('')}</dl>`;
}

for (const [productIndex, product] of products.entries()) {
  const pathname = `/products/${Number(product.id)}`;
  for (const lang of LANGS) {
    const title = productSeoTitle(product, lang);
    const description = productSeoDescription(product, lang);
    const image = absoluteImage(product.image_urls?.[0] || product.image_url);
    const numericPrice = Number(product.price);
    const schema = numericPrice > 0 ? {
      '@context': 'https://schema.org', '@type': 'Product', name: product.name, description,
      image: (product.image_urls?.length ? product.image_urls : [product.image_url]).filter(Boolean).map(absoluteImage),
      brand: { '@type': 'Brand', name: product.brand_name }, category: product.category_name,
      url: urlFor(pathname, lang),
      offers: { '@type': 'Offer', priceCurrency: 'AMD', price: numericPrice, availability: product.in_stock === false || product.in_stock === 0 ? 'https://schema.org/OutOfStock' : 'https://schema.org/InStock', url: urlFor(pathname, lang) },
    } : undefined;
    const nearbyProducts = products
      .filter((_, index) => index !== productIndex)
      .sort((a, b) => Number(b.brand_id === product.brand_id) - Number(a.brand_id === product.brand_id) || Number(b.category_id === product.category_id) - Number(a.category_id === product.category_id))
      .slice(0, 6);
    const productImage = optimizedUpload(product.image_urls?.[0] || product.image_url, 720) || image;
    const productBody = `<img src="${htmlEscape(productImage)}" alt="${htmlEscape(productDisplayName(product))}" width="720" height="960" />
      <p>${htmlEscape(normalized(localizedDescription(product, lang)))}</p>
      ${productSpecs(product, lang)}
      <p>${linkFor('/products', lang, pages.products[lang][0])}</p><h2>${htmlEscape(pages.products[lang][0])}</h2>${productLinks(nearbyProducts, lang, 6)}`;
    const bodyFallback = fallbackShell(lang, productDisplayName(product), productBody);
    await save(`seo/${lang}/products/${product.id}/index.html`, render(template, { lang, pathname, title, description, image, type: 'product', schema, schemaId: 'product-json-ld', bodyFallback }));
  }
  sitemap.push(...sitemapEntry(pathname, 'weekly', '0.8', product.updated_at || product.created_at));
}

for (const post of blogPosts) {
  const pathname = `/blog/${post.slug}`;
  for (const lang of LANGS) {
    const title = post[`title_${lang}`] || post.title_en;
    const description = post[`excerpt_${lang}`] || post.excerpt_en;
    const image = post.cover_image_url
      ? `${new URL(API_URL).origin}${post.cover_image_url.startsWith('/') ? '' : '/'}${post.cover_image_url}`
      : `${SITE_URL}/logo.png`;
    const schema = {
      '@context': 'https://schema.org', '@type': 'BlogPosting', headline: title, description,
      image: [image], datePublished: post.published_at, dateModified: post.updated_at || post.published_at,
      inLanguage: lang, mainEntityOfPage: urlFor(pathname, lang), url: urlFor(pathname, lang),
      publisher: { '@type': 'Organization', name: 'Optic Gallery', logo: { '@type': 'ImageObject', url: `${SITE_URL}/logo.png` } },
    };
    const articleBody = safeArticleHtml(post[`content_${lang}`] || post.content_en);
    const coverAlt = post[`cover_image_alt_${lang}`] || title;
    const cover = post.cover_image_url ? `<img src="${htmlEscape(image)}" alt="${htmlEscape(coverAlt)}" />` : '';
    const bodyFallback = fallbackShell(lang, title, `<p>${htmlEscape(description)}</p>${cover}<article>${articleBody}</article>${blogActionLinks(lang)}<p>${linkFor('/blog', lang, pages.blog[lang][0])}</p>${blogLinks(blogPosts.filter((item) => item.slug !== post.slug).slice(0, 6), lang)}`);
    await save(`seo/${lang}/blog/${post.slug}/index.html`, render(template, { lang, pathname, title, description, image, type: 'article', schema, bodyFallback }));
  }
  sitemap.push(...sitemapEntry(pathname, 'monthly', '0.8', post.updated_at || post.published_at));
}

await save('seo/noindex/index.html', render(template, { lang: 'hy', pathname: '/', title: 'Private page', description: 'This page is not available in search results.', image: `${SITE_URL}/logo.png`, robots: 'noindex, nofollow' }));
const notFound = render(template, { lang: 'hy', pathname: '/', title: 'Page not found', description: 'The requested page does not exist.', image: `${SITE_URL}/logo.png`, robots: 'noindex, nofollow' });
await save('404.html', notFound);
await save('sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${sitemap.join('\n')}\n</urlset>\n`);
console.log(`Generated ${LANGS.length * (Object.keys(pages).length + store.branches.length + products.length + blogPosts.length)} SEO pages and ${sitemap.length} sitemap URLs for ${products.length} products and ${blogPosts.length} blog posts.`);
