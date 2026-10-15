import type { Language } from '@/contexts/LanguageContext';

export type ProductSeoInput = {
  name: string;
  brand_name?: string | null;
  category_name?: string | null;
  category_slug?: string | null;
  style?: string | null;
  gender?: string | null;
  price?: number | string | null;
  description?: string | null;
  description_en?: string | null;
  description_ru?: string | null;
  description_hy?: string | null;
  description_translations?: Partial<Record<Language, string | null>>;
};

const CATEGORY_NAMES: Record<Language, Record<string, string>> = {
  hy: { optic: 'օպտիկական ակնոցի շրջանակ', sunglasses: 'արևային ակնոց', lenses: 'կոնտակտային ոսպնյակ' },
  ru: { optic: 'оправа для очков', sunglasses: 'солнцезащитные очки', lenses: 'контактные линзы' },
  en: { optic: 'eyeglass frame', sunglasses: 'sunglasses', lenses: 'contact lenses' },
};

const normalize = (value?: string | null) => String(value || '').trim();

const displayName = (product: ProductSeoInput) => {
  const name = normalize(product.name);
  const brand = normalize(product.brand_name);
  return brand && !name.toLocaleLowerCase().includes(brand.toLocaleLowerCase()) ? `${brand} ${name}` : name;
};

const categoryName = (product: ProductSeoInput, language: Language) =>
  CATEGORY_NAMES[language][normalize(product.category_slug).toLowerCase()] || normalize(product.category_name);

export function productSeoTitle(product: ProductSeoInput, language: Language) {
  const name = displayName(product);
  const category = categoryName(product, language);
  return category ? `${name} — ${category}` : name;
}

export function productSeoDescription(product: ProductSeoInput, language: Language) {
  const stored = normalize(
    product.description_translations?.[language] ||
      product[`description_${language}`] ||
      product.description,
  )
    .replace(/\s+/g, ' ')
    .replace(/\\+$/, '')
    .trim()
    .replace(/[.!?՜։]\s?$/, '');
  const name = displayName(product);
  const category = categoryName(product, language);
  const numericPrice = Number(product.price);
  const hasPrice = Number.isFinite(numericPrice) && numericPrice > 0;

  const context = {
    hy: `${name}${category ? ` — ${category}` : ''} Optic Gallery-ում՝ Երևանում։ ${hasPrice ? 'Դիտեք գինը, լուսանկարները և առկայությունը' : 'Դիտեք լուսանկարները և ճշտեք գինն ու առկայությունը'}։`,
    ru: `${name}${category ? ` — ${category}` : ''} в Optic Gallery, Ереван. ${hasPrice ? 'Посмотрите цену, фотографии и наличие' : 'Посмотрите фотографии и уточните цену и наличие'}.`,
    en: `${name}${category ? ` — ${category}` : ''} at Optic Gallery in Yerevan. ${hasPrice ? 'View the price, photos and current availability' : 'View the photos and ask about the price and current availability'}.`,
  }[language];

  return stored ? `${stored}. ${context}` : context;
}
