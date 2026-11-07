// Builds the site-wide Organization / OpticalStore graph from src/data/store.json.
// Used by generate-seo.mjs; index.html carries the same graph for dev builds.
export function storeGraph(store) {
  const site = store.siteUrl.replace(/\/$/, '');
  const organizationId = `${site}/#organization`;
  const telephones = store.phones.map((phone) => phone.e164);

  const branches = store.branches.map((branch) => ({
    '@type': 'OpticalStore',
    '@id': `${site}/#store-${branch.slug}`,
    name: `${store.name} — ${branch.shortName.en}`,
    alternateName: [branch.shortName.hy, branch.shortName.ru].map((name) => `${store.name} ${name}`),
    url: `${site}/contact/${branch.slug}`,
    image: store.logo,
    telephone: telephones[0],
    address: {
      '@type': 'PostalAddress',
      streetAddress: branch.streetAddress,
      addressLocality: 'Yerevan',
      addressCountry: 'AM',
    },
    hasMap: branch.mapUrl,
    openingHoursSpecification: [{
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
      opens: branch.opens,
      closes: branch.closes,
    }],
    parentOrganization: { '@id': organizationId },
  }));

  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': organizationId,
        name: store.name,
        url: `${site}/`,
        logo: store.logo,
        telephone: telephones,
        sameAs: [store.instagram.url],
        subOrganization: branches.map((branch) => ({ '@id': branch['@id'] })),
      },
      ...branches,
      {
        '@type': 'WebSite',
        '@id': `${site}/#website`,
        url: `${site}/`,
        name: store.name,
        inLanguage: ['hy', 'ru', 'en'],
        publisher: { '@id': organizationId },
      },
    ],
  };
}
