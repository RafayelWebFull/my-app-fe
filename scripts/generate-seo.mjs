import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const SITE_URL = (process.env.SITE_URL || 'https://opticgallery.am').replace(/\/$/, '');
const API_URL = (process.env.API_BASE_URL || `${process.env.VITE_API_URL || 'https://api.opticgallery.am'}/api`).replace(/\/$/, '');
const DIST = process.env.SEO_DIST || 'dist';
const LANGS = ['hy', 'ru', 'en'];
const locales = { hy: 'hy_AM', ru: 'ru_RU', en: 'en_US' };

const pages = {
  home: {
    path: '/', priority: '1.0', changefreq: 'weekly',
    hy: ['Optic Gallery — Օպտիկա Երևանում', 'Ակնոցներ, արևային ակնոցներ և կոնտակտային լինզաներ Երևանում՝ Optic Gallery-ում։'],
    ru: ['Optic Gallery — оптика в Ереване', 'Очки, солнцезащитные очки и контактные линзы в Optic Gallery, Ереван.'],
    en: ['Optic Gallery — Optical Store in Yerevan', 'Eyeglasses, sunglasses and contact lenses at Optic Gallery in Yerevan, Armenia.'],
  },
  products: {
    path: '/products', priority: '0.9', changefreq: 'daily',
    hy: ['Ակնոցներ և արևային ակնոցներ Երևանում', 'Բացահայտեք ակնոցներ, արևային ակնոցներ և օպտիկական շրջանակներ Optic Gallery-ում՝ Երևան։'],
    ru: ['Очки и солнцезащитные очки в Ереване', 'Выберите очки, солнцезащитные очки и оправы в Optic Gallery, Ереван.'],
    en: ['Eyeglasses and Sunglasses in Yerevan', 'Browse eyeglasses, sunglasses and optical frames at Optic Gallery in Yerevan.'],
  },
  brands: {
    path: '/brands', priority: '0.8', changefreq: 'weekly',
    hy: ['Ակնոցների ապրանքանիշեր', 'Բացահայտեք Optic Gallery-ում ներկայացված ակնոցների ապրանքանիշերը։'],
    ru: ['Бренды очков', 'Откройте для себя бренды очков, представленные в Optic Gallery.'],
    en: ['Eyewear Brands', 'Discover eyewear brands available at Optic Gallery.'],
  },
  about: {
    path: '/about', priority: '0.7', changefreq: 'monthly',
    hy: ['Optic Gallery-ի մասին', 'Իմացեք Optic Gallery օպտիկայի և Երևանում մեր ծառայությունների մասին։'],
    ru: ['Об Optic Gallery', 'Узнайте об оптике Optic Gallery и наших услугах в Ереване.'],
    en: ['About Optic Gallery', 'Learn about Optic Gallery and our optical services in Yerevan.'],
  },
  contact: {
    path: '/contact', priority: '0.7', changefreq: 'monthly',
    hy: ['Կապ Optic Gallery-ի հետ', 'Optic Gallery-ի հասցեն, հեռախոսահամարները, աշխատանքային ժամերը և քարտեզը։'],
    ru: ['Контакты Optic Gallery', 'Адрес, телефоны, часы работы и карта Optic Gallery в Ереване.'],
    en: ['Contact Optic Gallery', 'Address, phone numbers, opening hours and directions for Optic Gallery in Yerevan.'],
  },
  'repair-service': {
    path: '/repair-service', priority: '0.7', changefreq: 'monthly',
    hy: ['Ակնոցների վերանորոգում Երևանում', 'Ակնոցների ախտորոշում, կարգավորում և մասնագիտական վերանորոգում Երևանում։'],
    ru: ['Ремонт очков в Ереване', 'Диагностика, регулировка и профессиональный ремонт очков в Ереване.'],
    en: ['Eyeglass Repair in Yerevan', 'Diagnostics, adjustments and professional eyeglass repair in Yerevan.'],
  },
  blog: {
    path: '/blog', priority: '0.8', changefreq: 'weekly',
    hy: ['Ակնոցների և տեսողության խնամքի բլոգ', 'Օգտակար խորհուրդներ ակնոցների, ոսպնյակների, տեսողության խնամքի և նոր բրենդների մասին։'],
    ru: ['Блог об очках и уходе за зрением', 'Полезные материалы об очках, линзах, уходе за зрением и новых коллекциях.'],
    en: ['Eyewear and Vision Care Blog', 'Helpful guides about eyewear, lenses, vision care and new collections from Optic Gallery.'],
  },
};

const htmlEscape = (value) => String(value ?? '').replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
const xmlEscape = (value) => htmlEscape(value).replace(/&#39;/g, '&apos;');
const absoluteImage = (value) => !value ? `${SITE_URL}/logo.png` : /^https?:\/\//.test(value) ? value : `${SITE_URL}${value.startsWith('/') ? '' : '/'}${value}`;
const localizedDescription = (product, lang) => product.description_translations?.[lang] || product[`description_${lang}`] || product.description || '';
const urlFor = (pathname, lang) => `${SITE_URL}${pathname === '/' ? '/' : pathname}${lang === 'hy' ? '' : `?lang=${lang}`}`;

async function fetchProducts() {
  var lastError;
  for (let attempt = 1; attempt <= 4; attempt += 1) {
    try {
      const response = await fetch(`${API_URL}/optics`);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      if (!Array.isArray(data)) throw new Error('response is not an array');
      return data.filter((item) => Number.isInteger(Number(item.id)) && Number(item.id) > 0);
    } catch (error) {
      lastError = error;
      if (attempt < 4) await new Promise((resolve) => setTimeout(resolve, attempt * 2000));
    }
  }
  throw new Error(`Cannot generate complete SEO output from ${API_URL}/optics after 4 attempts: ${lastError.message}`);
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

function optimizedUpload(value, width) {
  if (!value) return null;
  const apiOrigin = new URL(API_URL).origin;
  const pathname = new URL(value, apiOrigin).pathname;
  if (!pathname.startsWith('/uploads/')) return null;
  return `${apiOrigin}/api/image?src=${encodeURIComponent(pathname)}&w=${width}`;
}

function alternates(pathname) {
  return [...LANGS.map((lang) => `<link rel="alternate" hreflang="${lang}" href="${htmlEscape(urlFor(pathname, lang))}" data-seo-lang="${lang}" />`), `<link rel="alternate" hreflang="x-default" href="${htmlEscape(urlFor(pathname, 'hy'))}" data-seo-lang="x-default" />`].join('\n    ');
}

function render(template, { lang, pathname, title, description, image, type = 'website', robots = 'index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1', schema, headLinks = '' }) {
  const canonical = urlFor(pathname, lang);
  const fullTitle = `${title} | Optic Gallery`;
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
  if (schema) html = html.replace('</head>', `    <script type="application/ld+json">${JSON.stringify(schema).replace(/</g, '\\u003c')}</script>\n  </head>`);
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

function sitemapEntry(pathname, changefreq, priority) {
  return LANGS.map((lang) => {
    const links = [...LANGS.map((other) => `    <xhtml:link rel="alternate" hreflang="${other}" href="${xmlEscape(urlFor(pathname, other))}" />`), `    <xhtml:link rel="alternate" hreflang="x-default" href="${xmlEscape(urlFor(pathname, 'hy'))}" />`];
    return `  <url>\n    <loc>${xmlEscape(urlFor(pathname, lang))}</loc>\n${links.join('\n')}\n    <changefreq>${changefreq}</changefreq>\n    <priority>${priority}</priority>\n  </url>`;
  });
}

const template = await inlineCompiledStyles(await readFile(path.join(DIST, 'index.html'), 'utf8'));
await save('index.html', template);
const [products, siteSettings] = await Promise.all([fetchProducts(), fetchSiteSettings()]);
const sitemap = [];

const mobileHero = optimizedUpload(siteSettings.hero_mobile_image || siteSettings.hero_image, 768);
const desktopHero = optimizedUpload(siteSettings.hero_image || siteSettings.hero_mobile_image, 1920);
const heroPreloads = [
  mobileHero && `<link rel="preload" as="image" href="${htmlEscape(mobileHero)}" media="(max-width: 767px)" fetchpriority="high" />`,
  desktopHero && `<link rel="preload" as="image" href="${htmlEscape(desktopHero)}" media="(min-width: 768px)" fetchpriority="high" />`,
].filter(Boolean).join('\n    ');

for (const [slug, page] of Object.entries(pages)) {
  for (const lang of LANGS) {
    const [title, description] = page[lang];
    await save(`seo/${lang}/${slug}/index.html`, render(template, { lang, pathname: page.path, title, description, image: `${SITE_URL}/logo.png`, headLinks: slug === 'home' ? heroPreloads : '' }));
  }
  sitemap.push(...sitemapEntry(page.path, page.changefreq, page.priority));
}

for (const product of products) {
  const pathname = `/products/${Number(product.id)}`;
  for (const lang of LANGS) {
    const description = localizedDescription(product, lang) || pages.products[lang][1];
    const image = absoluteImage(product.image_urls?.[0] || product.image_url);
    const numericPrice = Number(product.price);
    const schema = numericPrice > 0 ? {
      '@context': 'https://schema.org', '@type': 'Product', name: product.name, description,
      image: (product.image_urls?.length ? product.image_urls : [product.image_url]).filter(Boolean).map(absoluteImage),
      brand: { '@type': 'Brand', name: product.brand_name }, category: product.category_name,
      url: urlFor(pathname, lang),
      offers: { '@type': 'Offer', priceCurrency: 'AMD', price: numericPrice, availability: product.in_stock === false || product.in_stock === 0 ? 'https://schema.org/OutOfStock' : 'https://schema.org/InStock', url: urlFor(pathname, lang) },
    } : undefined;
    await save(`seo/${lang}/products/${product.id}/index.html`, render(template, { lang, pathname, title: product.name, description, image, type: 'product', schema }));
  }
  sitemap.push(...sitemapEntry(pathname, 'weekly', '0.8'));
}

await save('seo/noindex/index.html', render(template, { lang: 'hy', pathname: '/', title: 'Private page', description: 'This page is not available in search results.', image: `${SITE_URL}/logo.png`, robots: 'noindex, nofollow' }));
const notFound = render(template, { lang: 'hy', pathname: '/', title: 'Page not found', description: 'The requested page does not exist.', image: `${SITE_URL}/logo.png`, robots: 'noindex, nofollow' });
await save('404.html', notFound);
await save('sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${sitemap.join('\n')}\n</urlset>\n`);
console.log(`Generated ${LANGS.length * (Object.keys(pages).length + products.length)} SEO pages and ${sitemap.length} sitemap URLs for ${products.length} products.`);
