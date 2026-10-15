import { useQuery } from '@tanstack/react-query';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { apiUrl, imageUrl, optimizedImageUrl } from '@/lib/api';
import { localizedPath } from '@/lib/localizedUrl';
import { useLanguage, type Language } from '@/contexts/LanguageContext';
import type { BlogPostData } from '@/pages/Blog';

const COPY = {
  hy: { eyebrow: 'Օգտակար նյութեր', title: 'Վերջին հոդվածները', read: 'Կարդալ', all: 'Բոլոր հոդվածները' },
  ru: { eyebrow: 'Полезные материалы', title: 'Новые статьи', read: 'Читать', all: 'Все статьи' },
  en: { eyebrow: 'Helpful guides', title: 'Latest articles', read: 'Read article', all: 'View all articles' },
};

const local = (post: BlogPostData, field: string, language: Language) =>
  String((post as unknown as Record<string, unknown>)[`${field}_${language}`] || (post as unknown as Record<string, unknown>)[`${field}_en`] || '');

export function BlogPreview() {
  const { language } = useLanguage();
  const copy = COPY[language];
  const { data: posts = [] } = useQuery({
    queryKey: ['blog-posts'],
    queryFn: async () => {
      const response = await fetch(apiUrl('/api/blog'));
      if (!response.ok) throw new Error('Failed to fetch blog posts');
      return response.json() as Promise<BlogPostData[]>;
    },
  });

  if (!posts.length) return null;

  return (
    <section className="py-16 sm:py-20 bg-secondary/25">
      <div className="container mx-auto px-4">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-accent">{copy.eyebrow}</p>
            <h2 className="font-heading text-3xl font-bold text-foreground sm:text-4xl">{copy.title}</h2>
          </div>
          <Link to={localizedPath('/blog', language)} className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:text-accent">
            {copy.all}<ArrowRight className="size-4" />
          </Link>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {posts.slice(0, 3).map((post) => (
            <Link key={post.id} to={localizedPath(`/blog/${post.slug}`, language)} className="group overflow-hidden rounded-2xl border bg-card shadow-soft transition-shadow hover:shadow-elevated">
              <div className="aspect-[16/10] overflow-hidden bg-secondary">
                <img
                  src={optimizedImageUrl(post.cover_image_url, 720) || imageUrl(post.cover_image_url) || '/placeholder.svg'}
                  alt={local(post, 'cover_image_alt', language) || local(post, 'title', language)}
                  loading="lazy"
                  decoding="async"
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                />
              </div>
              <div className="p-5">
                <p className="mb-2 text-xs font-semibold uppercase text-accent">{local(post, 'category_name', language)}</p>
                <h3 className="font-heading text-xl font-semibold text-foreground">{local(post, 'title', language)}</h3>
                <p className="mt-3 line-clamp-2 text-sm leading-6 text-muted-foreground">{local(post, 'excerpt', language)}</p>
                <span className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-primary">{copy.read}<ArrowRight className="size-4" /></span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
