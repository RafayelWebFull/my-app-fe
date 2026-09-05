import { useQuery } from '@tanstack/react-query';
import { ArrowLeft } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { useLanguage } from '@/contexts/LanguageContext';
import { apiUrl, imageUrl } from '@/lib/api';
import { useSeo } from '@/lib/seo';
import type { BlogPostData } from './Blog';
export default function BlogPost() {
  const { slug = '' } = useParams(); const { language } = useLanguage();
  const query = useQuery<BlogPostData>({ queryKey: ['blog-post', slug], queryFn: async () => { const response = await fetch(apiUrl(`/api/blog/${encodeURIComponent(slug)}`)); if (!response.ok) throw new Error(); return response.json(); } });
  const value = (field: string) => query.data ? String((query.data as unknown as Record<string, unknown>)[`${field}_${language}`] || (query.data as unknown as Record<string, unknown>)[`${field}_en`] || '') : '';
  useSeo({ title: value('title') || 'Blog', description: value('excerpt'), path: `/blog/${slug}`, image: imageUrl(query.data?.cover_image_url) || undefined, type: 'article' });
  return <Layout><main className="mx-auto min-h-[60vh] max-w-4xl px-4 py-10 sm:px-7 sm:py-16"><Link to="/blog" className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-primary"><ArrowLeft className="size-4"/>Blog</Link>{query.isLoading ? <p className="py-20 text-center">Loading…</p> : query.isError || !query.data ? <p role="alert" className="py-20 text-center text-destructive">Article not found.</p> : <article><p className="text-xs font-semibold uppercase text-accent">{value('category_name')}</p><h1 className="mt-3 font-heading text-4xl font-semibold text-primary sm:text-6xl">{value('title')}</h1><p className="mt-5 text-lg leading-8 text-muted-foreground">{value('excerpt')}</p>{query.data.cover_image_url && <img src={imageUrl(query.data.cover_image_url) || ''} alt={value('cover_image_alt') || value('title')} className="mt-9 aspect-[16/9] w-full rounded-2xl object-cover shadow-card"/>}<div className="prose prose-lg mt-10 max-w-none prose-headings:font-heading prose-headings:text-primary prose-a:text-accent" dangerouslySetInnerHTML={{ __html: value('content') }}/></article>}</main></Layout>;
}
