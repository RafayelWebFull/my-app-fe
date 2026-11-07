import type { Language } from '@/contexts/LanguageContext';
import store from '@/data/store.json';

export type StoreBranch = (typeof store.branches)[number];

export const STORE = store;

export const storeLabels = (language: Language) => store.labels[language];

export const branchHours = (branch: StoreBranch) => `${branch.opens}–${branch.closes}`;

export const branchHoursText = (branch: StoreBranch, language: Language) =>
  `${store.labels[language].daily}: ${branchHours(branch)}`;

export const findBranch = (slug: string | undefined) => store.branches.find((branch) => branch.slug === slug);

export const fillTemplate = (template: string, values: Record<string, string | number>) =>
  template.replace(/\{(\w+)\}/g, (_, key: string) => String(values[key] ?? ''));
