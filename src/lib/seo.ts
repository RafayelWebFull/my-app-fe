import { useEffect } from 'react';

const SITE_NAME = 'Optic Gallery';
const BASE_URL = 'https://opticgallery.am';
const DEFAULT_OG_IMAGE = `${BASE_URL}/placeholder.svg`;

type SeoOptions = {
  title: string;
  description: string;
  path?: string;
  keywords?: string;
  robots?: string;
  image?: string;
  type?: 'website' | 'article';
};

function upsertMetaByName(name: string, content: string) {
  let element = document.head.querySelector(`meta[name="${name}"]`) as HTMLMetaElement | null;
  if (!element) {
    element = document.createElement('meta');
    element.setAttribute('name', name);
    document.head.appendChild(element);
  }
  element.setAttribute('content', content);
}

function upsertMetaByProperty(property: string, content: string) {
  let element = document.head.querySelector(`meta[property="${property}"]`) as HTMLMetaElement | null;
  if (!element) {
    element = document.createElement('meta');
    element.setAttribute('property', property);
    document.head.appendChild(element);
  }
  element.setAttribute('content', content);
}

function upsertCanonical(href: string) {
  let link = document.head.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
  if (!link) {
    link = document.createElement('link');
    link.setAttribute('rel', 'canonical');
    document.head.appendChild(link);
  }
  link.setAttribute('href', href);
}

export function useSeo({ title, description, path = '/', keywords, robots, image, type = 'website' }: SeoOptions) {
  useEffect(() => {
    const canonical = new URL(path, BASE_URL).toString();
    const fullTitle = `${title} | ${SITE_NAME}`;
    const shareImage = image || DEFAULT_OG_IMAGE;

    document.title = fullTitle;
    upsertMetaByName('description', description);
    upsertMetaByName('title', fullTitle);
    if (keywords) upsertMetaByName('keywords', keywords);
    if (robots) upsertMetaByName('robots', robots);

    upsertCanonical(canonical);

    upsertMetaByProperty('og:type', type);
    upsertMetaByProperty('og:url', canonical);
    upsertMetaByProperty('og:title', fullTitle);
    upsertMetaByProperty('og:description', description);
    upsertMetaByProperty('og:image', shareImage);
    upsertMetaByProperty('og:site_name', SITE_NAME);

    upsertMetaByProperty('twitter:card', 'summary_large_image');
    upsertMetaByProperty('twitter:url', canonical);
    upsertMetaByProperty('twitter:title', fullTitle);
    upsertMetaByProperty('twitter:description', description);
    upsertMetaByProperty('twitter:image', shareImage);
  }, [description, image, keywords, path, robots, title, type]);
}
