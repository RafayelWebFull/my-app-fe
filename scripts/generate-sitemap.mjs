import { writeFile } from 'node:fs/promises';

const siteUrl = (process.env.SITE_URL || 'https://opticgallery.am').replace(/\/$/, '');
const apiBaseUrl = (process.env.API_BASE_URL || `${siteUrl}/api`).replace(/\/$/, '');
const outputPath = process.env.SITEMAP_OUTPUT || 'public/sitemap.xml';

const staticPages = [
  { path: '/', changefreq: 'weekly', priority: '1.0' },
  { path: '/products', changefreq: 'daily', priority: '0.9' },
  { path: '/brands', changefreq: 'weekly', priority: '0.8' },
  { path: '/about', changefreq: 'monthly', priority: '0.7' },
  { path: '/contact', changefreq: 'monthly', priority: '0.7' },
  { path: '/repair-service', changefreq: 'monthly', priority: '0.7' },
];

function escapeXml(value) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

async function fetchProducts() {
  try {
    const response = await fetch(`${apiBaseUrl}/optics`);
    if (!response.ok) return [];
    const data = await response.json();
    if (!Array.isArray(data)) return [];
    return data
      .map((item) => Number(item?.id))
      .filter((id) => Number.isFinite(id) && id > 0);
  } catch {
    return [];
  }
}

function renderUrl(loc, changefreq, priority) {
  return [
    '  <url>',
    `    <loc>${escapeXml(loc)}</loc>`,
    `    <changefreq>${changefreq}</changefreq>`,
    `    <priority>${priority}</priority>`,
    '  </url>',
  ].join('\n');
}

async function main() {
  const productIds = await fetchProducts();
  const urls = [];

  for (const page of staticPages) {
    urls.push(renderUrl(`${siteUrl}${page.path}`, page.changefreq, page.priority));
  }

  for (const id of productIds) {
    urls.push(renderUrl(`${siteUrl}/products/${id}`, 'weekly', '0.8'));
  }

  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...urls,
    '</urlset>',
    '',
  ].join('\n');

  await writeFile(outputPath, xml, 'utf8');
  console.log(`Sitemap written to ${outputPath} with ${urls.length} URLs.`);
}

main().catch((error) => {
  console.error('Failed to generate sitemap:', error);
  process.exit(1);
});

