import { access, readFile } from 'node:fs/promises';

const dist = process.env.SEO_DIST || 'dist';
const failures = [];
const assert = (condition, message) => { if (!condition) failures.push(message); };

const sitemap = await readFile(`${dist}/sitemap.xml`, 'utf8');
const entries = [...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map((match) => match[1].replace(/&amp;/g, '&'));
assert(entries.length > 18, `sitemap has only ${entries.length} entries`);
assert(entries.some((url) => url.includes('/products/') && url.endsWith('?lang=en')), 'sitemap lacks English product URLs');
assert(entries.some((url) => url === 'https://opticgallery.am/'), 'sitemap lacks canonical Armenian homepage URL');
assert(!entries.some((url) => url.includes('?lang=hy')), 'default Armenian URLs must not contain a language parameter');
assert(sitemap.includes('xmlns:xhtml="http://www.w3.org/1999/xhtml"'), 'sitemap lacks xhtml namespace');
assert(sitemap.includes('hreflang="x-default"'), 'sitemap lacks x-default alternates');

for (const relative of ['seo/hy/home/index.html', 'seo/en/products/index.html', 'seo/ru/about/index.html', 'seo/noindex/index.html', '404.html']) {
  try { await access(`${dist}/${relative}`); } catch { failures.push(`missing ${relative}`); }
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
assert(htaccess.includes('https://opticgallery.am%{REQUEST_URI}'), 'canonical host redirect is missing');
assert(htaccess.includes('ErrorDocument 404 /404.html'), 'HTTP 404 handling is missing');
assert(htaccess.includes('RewriteCond %{REQUEST_FILENAME} -f [OR]'), 'static-file rewrite bypass is missing');
assert(htaccess.indexOf('RewriteRule ^$ /seo/%2/home/index.html') < htaccess.indexOf('RewriteCond %{REQUEST_FILENAME} -f [OR]'), 'homepage language rewrite must run before the directory bypass');

if (failures.length) {
  console.error(`SEO validation failed:\n- ${failures.join('\n- ')}`);
  process.exit(1);
}

console.log(`SEO validation passed for ${entries.length} sitemap URLs.`);
