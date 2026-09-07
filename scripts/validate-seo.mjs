import { access, readFile } from 'node:fs/promises';

const dist = process.env.SEO_DIST || 'dist';
const failures = [];
const assert = (condition, message) => { if (!condition) failures.push(message); };

const sitemap = await readFile(`${dist}/sitemap.xml`, 'utf8');
const entries = [...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map((match) => match[1].replace(/&amp;/g, '&'));
assert(entries.length > 18, `sitemap has only ${entries.length} entries`);
assert(new Set(entries).size === entries.length, 'sitemap contains duplicate URLs');
assert(entries.every((url) => new URL(url).origin === 'https://opticgallery.am'), 'sitemap contains a non-canonical host');
assert(entries.every((url) => [...new URL(url).searchParams.keys()].every((key) => key === 'lang')), 'sitemap contains filtered or tracking URLs');
assert(entries.every((url) => !new URL(url).searchParams.has('lang') || ['en', 'ru'].includes(new URL(url).searchParams.get('lang'))), 'sitemap contains an unsupported or redundant language parameter');
assert(entries.some((url) => url.includes('/products/') && url.endsWith('?lang=en')), 'sitemap lacks English product URLs');
assert(entries.some((url) => url === 'https://opticgallery.am/'), 'sitemap lacks canonical Armenian homepage URL');
assert(entries.some((url) => /\/blog\/[^?]+\?lang=en$/.test(url)), 'sitemap lacks English blog article URLs');
assert(!entries.some((url) => url.includes('?lang=hy')), 'default Armenian URLs must not contain a language parameter');
assert(sitemap.includes('xmlns:xhtml="http://www.w3.org/1999/xhtml"'), 'sitemap lacks xhtml namespace');
assert(sitemap.includes('hreflang="x-default"'), 'sitemap lacks x-default alternates');

function outputPathFor(urlValue) {
  const url = new URL(urlValue);
  const lang = url.searchParams.get('lang') || 'hy';
  const parts = url.pathname.split('/').filter(Boolean);
  if (!parts.length) return `seo/${lang}/home/index.html`;
  return `seo/${lang}/${parts.join('/')}/index.html`;
}

for (const entry of entries) {
  const relative = outputPathFor(entry);
  try {
    const html = await readFile(`${dist}/${relative}`, 'utf8');
    assert(html.includes(`<link rel="canonical" href="${entry.replace(/&/g, '&amp;')}"`), `${entry} is not self-canonical`);
    assert(html.includes('content="index,follow,'), `${entry} is not indexable`);
    for (const lang of ['hy', 'ru', 'en', 'x-default']) {
      assert(html.includes(`hreflang="${lang}"`), `${entry} lacks ${lang} alternate`);
    }
  } catch {
    failures.push(`missing generated page for ${entry}: ${relative}`);
  }
}

for (const relative of ['seo/hy/home/index.html', 'seo/en/products/index.html', 'seo/ru/about/index.html', 'seo/noindex/index.html', '404.html']) {
  try { await access(`${dist}/${relative}`); } catch { failures.push(`missing ${relative}`); }
}

for (const lang of ['hy', 'ru', 'en']) {
  const filtered = await readFile(`${dist}/seo/${lang}/products-filter/index.html`, 'utf8');
  assert(filtered.includes('content="noindex,follow"'), `${lang} filtered catalog is indexable`);
  const canonical = `https://opticgallery.am/products${lang === 'hy' ? '' : `?lang=${lang}`}`;
  assert(filtered.includes(`<link rel="canonical" href="${canonical}"`), `${lang} filtered catalog canonical is incorrect`);
}

const productIds = [...new Set(entries.map((url) => new URL(url).pathname.match(/^\/products\/(\d+)$/)?.[1]).filter(Boolean))];
for (const lang of ['hy', 'ru', 'en']) {
  const catalogHtml = await readFile(`${dist}/seo/${lang}/products/index.html`, 'utf8');
  for (const id of productIds) {
    const href = `https://opticgallery.am/products/${id}${lang === 'hy' ? '' : `?lang=${lang}`}`.replace(/&/g, '&amp;');
    assert(catalogHtml.includes(`href="${href}"`), `${lang} catalog does not link to product ${id}`);
  }
}

const blogEntry = entries.find((url) => /\/blog\/[^?]+\?lang=en$/.test(url));
if (blogEntry) {
  const slug = blogEntry.match(/\/blog\/([^?]+)/)?.[1];
  const blogHtml = await readFile(`${dist}/seo/en/blog/${slug}/index.html`, 'utf8');
  assert(blogHtml.includes('<meta property="og:type" content="article"'), 'blog page lacks article Open Graph type');
  assert(blogHtml.includes('"@type":"BlogPosting"'), 'blog page lacks BlogPosting JSON-LD');
  assert(blogHtml.includes(`<link rel="canonical" href="https://opticgallery.am/blog/${slug}?lang=en"`), 'blog canonical is incorrect');
}

const productEntry = entries.find((url) => /\/products\/\d+\?lang=en$/.test(url));
if (productEntry) {
  const id = productEntry.match(/\/products\/(\d+)/)?.[1];
  const productHtml = await readFile(`${dist}/seo/en/products/${id}/index.html`, 'utf8');
  assert(productHtml.includes('<meta property="og:type" content="product"'), 'product page lacks product Open Graph type');
  if (productHtml.includes('"@type":"Product"')) {
    assert(productHtml.includes('"offers":{"@type":"Offer"'), 'Product JSON-LD lacks a valid offer');
  }
  assert(productHtml.includes(`<link rel="canonical" href="https://opticgallery.am/products/${id}?lang=en"`), 'product canonical is incorrect');
  assert(productHtml.includes('name="twitter:image"'), 'Twitter image must use the name attribute');
}

const noindex = await readFile(`${dist}/seo/noindex/index.html`, 'utf8');
const notFound = await readFile(`${dist}/404.html`, 'utf8');
assert(noindex.includes('content="noindex, nofollow"'), 'private shell is indexable');
assert(notFound.includes('content="noindex, nofollow"'), '404 page is indexable');

const htaccess = await readFile(`${dist}/.htaccess`, 'utf8');
const robots = await readFile(`${dist}/robots.txt`, 'utf8');
assert(htaccess.includes('https://opticgallery.am%{REQUEST_URI}'), 'canonical host redirect is missing');
assert(htaccess.includes('ErrorDocument 404 /404.html'), 'HTTP 404 handling is missing');
assert(htaccess.includes('R=301,L,NE,QSD'), 'redundant default-language redirect is missing');
assert(htaccess.includes('products-filter/index.html'), 'filtered product URLs are not routed to noindex metadata');
assert(htaccess.includes('RewriteCond %{REQUEST_FILENAME} -f [OR]'), 'static-file rewrite bypass is missing');
assert(htaccess.indexOf('RewriteRule ^$ /seo/%2/home/index.html') < htaccess.indexOf('RewriteCond %{REQUEST_FILENAME} -f [OR]'), 'homepage language rewrite must run before the directory bypass');
assert(robots.includes('Allow: /'), 'robots.txt does not allow public crawling');
assert(robots.includes('Sitemap: https://opticgallery.am/sitemap.xml'), 'robots.txt does not advertise the canonical sitemap');

if (failures.length) {
  console.error(`SEO validation failed:\n- ${failures.join('\n- ')}`);
  process.exit(1);
}

console.log(`SEO validation passed for ${entries.length} sitemap URLs.`);
