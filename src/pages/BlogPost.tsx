import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { useLanguage } from '@/contexts/LanguageContext';
import { apiUrl, imageUrl } from '@/lib/api';
import { useSeo } from '@/lib/seo';
import { localizedPath } from '@/lib/localizedUrl';
import type { BlogPostData } from './Blog';

const ACTIONS = {
  hy: {
    title: 'Կարիք ունե՞ք ակնոց ընտրելու կամ վերանորոգելու',
    text: 'Դիտեք տեսականին, ծանոթացեք վերանորոգման ծառայությանը կամ դիմեք մեր թիմին։',
    products: 'Դիտել ակնոցները',
    repair: 'Ակնոցների վերանորոգում',
    contact: 'Կապվել մեզ հետ',
  },
  ru: {
    title: 'Нужна помощь с выбором или ремонтом очков?',
    text: 'Посмотрите каталог, узнайте о ремонте очков или свяжитесь с нашей оптикой в Ереване.',
    products: 'Выбрать очки',
    repair: 'Ремонт очков',
    contact: 'Связаться',
  },
  en: {
    title: 'Need help choosing or repairing your glasses?',
    text: 'Browse our eyewear, learn about eyeglass repair, or contact our optical store in Yerevan.',
    products: 'Browse eyewear',
    repair: 'Eyeglass repair',
    contact: 'Contact us',
  },
} as const;

export default function BlogPost() {
  const { slug = '' } = useParams(); const { language } = useLanguage();
  const actions = ACTIONS[language];
  const query = useQuery<BlogPostData>({ queryKey: ['blog-post', slug], queryFn: async () => { const response = await fetch(apiUrl(`/api/blog/${encodeURIComponent(slug)}`)); if (!response.ok) throw new Error(); return response.json(); } });
  const value = (field: string) => query.data ? String((query.data as unknown as Record<string, unknown>)[`${field}_${language}`] || (query.data as unknown as Record<string, unknown>)[`${field}_en`] || '') : '';
  useSeo({ title: value('title') || 'Blog', description: value('excerpt'), path: `/blog/${slug}`, image: imageUrl(query.data?.cover_image_url) || undefined, type: 'article' });
  return <Layout><main className="mx-auto min-h-[60vh] max-w-4xl px-4 py-10 sm:px-7 sm:py-16"><Link to={localizedPath('/blog', language)} className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-primary"><ArrowLeft className="size-4"/>Blog</Link>{query.isLoading ? <p className="py-20 text-center">Loading…</p> : query.isError || !query.data ? <p role="alert" className="py-20 text-center text-destructive">Article not found.</p> : <article><p className="text-xs font-bold uppercase tracking-[0.12em] text-accent">{value('category_name')}</p><h1 className="mt-3 font-heading text-3xl font-semibold leading-[1.18] text-primary sm:text-4xl lg:text-5xl">{value('title')}</h1><p className="mt-6 max-w-3xl text-base font-medium leading-7 text-muted-foreground sm:text-lg sm:leading-8">{value('excerpt')}</p>{query.data.cover_image_url && <img src={imageUrl(query.data.cover_image_url) || ''} alt={value('cover_image_alt') || value('title')} className="mt-10 aspect-[16/9] w-full rounded-2xl object-cover shadow-card"/>}<div className="prose mt-12 max-w-none text-[17px] leading-8 prose-headings:font-heading prose-headings:font-semibold prose-headings:leading-tight prose-headings:text-primary prose-h2:mb-5 prose-h2:mt-14 prose-h2:border-b prose-h2:border-border/70 prose-h2:pb-3 prose-h2:text-2xl sm:prose-h2:text-3xl prose-p:my-6 prose-p:text-foreground/80 prose-strong:font-bold prose-strong:text-primary [&_a]:font-bold [&_a]:text-accent [&_a]:underline [&_a]:decoration-2 [&_a]:underline-offset-4 [&_a]:transition-colors [&_a:hover]:text-primary [&>p:first-of-type]:text-lg [&>p:first-of-type]:font-medium [&>p:first-of-type]:leading-8" dangerouslySetInnerHTML={{ __html: value('content') }}/><aside className="mt-14 rounded-2xl border border-primary/10 bg-secondary/55 p-6 sm:p-8" aria-labelledby="blog-next-step"><h2 id="blog-next-step" className="font-heading text-2xl font-semibold text-primary">{actions.title}</h2><p className="mt-3 text-base leading-7 text-muted-foreground">{actions.text}</p><nav className="mt-6 flex flex-wrap gap-3" aria-label={actions.title}><Link to={localizedPath('/products', language)} className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-3 text-sm font-medium text-primary-foreground">{actions.products}<ArrowRight className="size-4"/></Link><Link to={localizedPath('/repair-service', language)} className="inline-flex items-center gap-2 rounded-lg border border-primary/15 bg-background px-5 py-3 text-sm font-medium text-primary">{actions.repair}</Link><Link to={localizedPath('/contact', language)} className="inline-flex items-center gap-2 rounded-lg border border-primary/15 bg-background px-5 py-3 text-sm font-medium text-primary">{actions.contact}</Link></nav></aside></article>}</main></Layout>;
}
