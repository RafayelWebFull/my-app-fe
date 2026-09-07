import { describe, expect, it } from 'vitest';
import { localizedPath } from './localizedUrl';

describe('localizedPath', () => {
  it('uses clean URLs for the default Armenian language', () => {
    expect(localizedPath('/products/42?lang=en', 'hy')).toBe('/products/42');
  });

  it('adds the selected language to public links', () => {
    expect(localizedPath('/products/42', 'en')).toBe('/products/42?lang=en');
  });

  it('preserves filters and fragments', () => {
    expect(localizedPath('/products?brand=7#catalog', 'ru')).toBe('/products?brand=7&lang=ru#catalog');
  });

  it('does not rewrite external links', () => {
    expect(localizedPath('https://example.com/products', 'en')).toBe('https://example.com/products');
  });
});
