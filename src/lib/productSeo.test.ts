import { describe, expect, it } from 'vitest';
import { productSeoDescription, productSeoTitle } from './productSeo';

const product = {
  name: 'Model 101',
  brand_name: 'Ray-Ban',
  category_slug: 'sunglasses',
  price: 45000,
  description_ru: 'Лёгкая модель.',
};

describe('product SEO copy', () => {
  it('builds a localized title with brand and category', () => {
    expect(productSeoTitle(product, 'ru')).toBe('Ray-Ban Model 101 — солнцезащитные очки');
  });

  it('does not repeat a brand already present in the product name', () => {
    expect(productSeoTitle({ ...product, name: 'Ray-Ban Aviator' }, 'en')).toBe('Ray-Ban Aviator — sunglasses');
  });

  it('keeps stored copy and adds truthful purchase context', () => {
    const description = productSeoDescription(product, 'ru');
    expect(description).toContain('Лёгкая модель.');
    expect(description).toContain('Посмотрите цену');
  });

  it('asks for a price when no price is available', () => {
    expect(productSeoDescription({ ...product, price: null }, 'en')).toContain('ask about the price');
  });

  it('removes accidental trailing slashes and line breaks from stored copy', () => {
    expect(productSeoDescription({ ...product, description_ru: 'Очки VERSACE.\r\n\\' }, 'ru')).toContain('Очки VERSACE. Ray-Ban');
    expect(productSeoDescription({ ...product, description_ru: 'Очки VERSACE.\r\n\\' }, 'ru')).not.toContain('\\');
  });
});
