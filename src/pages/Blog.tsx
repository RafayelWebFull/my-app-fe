import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { useLanguage, type Language } from '@/contexts/LanguageContext';
import { apiUrl, imageUrl } from '@/lib/api';
import { useSeo } from '@/lib/seo';

type Category = { id: number; slug: string; name_hy: string; name_ru: string; name_en: string };
export type BlogPostData = {
  id: number; slug: string; category_slug: string; is_featured: number; cover_image_url: string | null; published_at: string;
  title_hy: string; title_ru: string; title_en: string; excerpt_hy: string; excerpt_ru: string; excerpt_en: string;
  content_hy: string; content_ru: string; content_en: string; cover_image_alt_hy: string; cover_image_alt_ru: string; cover_image_alt_en: string;
  category_name_hy: string; category_name_ru: string; category_name_en: string;
};
const COPY = {
  hy: { title: 'Ակնոցների և տեսողության խնամքի բլոգ', description: 'Օգտակար խորհուրդներ Optic Gallery-ից։', featured: 'Ընտրված հոդված', read: 'Կարդալ հոդվածը', all: 'Բոլորը', guides: 'Օգտակար նյութեր', latest: 'Վերջին հոդվածները', loading: 'Բեռնում…', error: 'Հոդվածները չհաջողվեց բեռնել։', empty: 'Այս բաժնում հոդվածներ չկան։' },
  ru: { title: 'Блог об очках и уходе за зрением', description: 'Полезные материалы от Optic Gallery.', featured: 'Избранная статья', read: 'Читать статью', all: 'Все', guides: 'Полезные материалы', latest: 'Последние статьи', loading: 'Загрузка…', error: 'Не удалось загрузить статьи.', empty: 'В этом разделе пока нет статей.' },
  en: { title: 'Eyewear and Vision Care Blog', description: 'Helpful guides from Optic Gallery.', featured: 'Featured article', read: 'Read article', all: 'All', guides: 'Helpful guides', latest: 'Latest articles', loading: 'Loading…', error: 'Could not load the articles.', empty: 'There are no articles in this category yet.' },
};
const local = (item: object, field: string, lang: Language) => String((item as Record<string, unknown>)[`${field}_${lang}`] || (item as Record<string, unknown>)[`${field}_en`] || '');
const ARMENIAN_MONTHS = ['հունվարի', 'փետրվարի', 'մարտի', 'ապրիլի', 'մայիսի', 'հունիսի', 'հուլիսի', 'օգոստոսի', 'սեպտեմբերի', 'հոկտեմբերի', 'նոյեմբերի', 'դեկտեմբերի'];
const formatDate = (value: string, lang: Language) => {
  const parsed = new Date(value);
  if (lang === 'hy') return `${parsed.getDate()} ${ARMENIAN_MONTHS[parsed.getMonth()]}, ${parsed.getFullYear()} թ.`;
  return new Intl.DateTimeFormat(lang === 'ru' ? 'ru-RU' : 'en-US', { year: 'numeric', month: 'long', day: 'numeric' }).format(parsed);
};
const getJson = async <T,>(path: string): Promise<T> => { const response = await fetch(apiUrl(path)); if (!response.ok) throw new Error('Request failed'); return response.json(); };

export default function Blog() {
  const { language } = useLanguage(); const copy = COPY[language]; const [selected, setSelected] = useState('all');
  const postsQuery = useQuery({ queryKey: ['blog-posts'], queryFn: () => getJson<BlogPostData[]>('/api/blog') });
  const categoriesQuery = useQuery({ queryKey: ['blog-categories'], queryFn: () => getJson<Category[]>('/api/blog/categories') });
  const posts = postsQuery.data || []; const featured = posts.find((post) => post.is_featured) || posts[0];
  const visible = selected === 'all' ? posts : posts.filter((post) => post.category_slug === selected);
  useSeo({ title: copy.title, description: copy.description, path: '/blog', image: imageUrl(featured?.cover_image_url) || undefined, type: 'article' });
  return <Layout><div className="relative overflow-hidden bg-[radial-gradient(circle_at_15%_10%,hsl(var(--accent)/0.10),transparent_28%)]">
    {featured && <section className="px-4 pt-5 sm:px-7"><div className="mx-auto max-w-[1320px] rounded-2xl border bg-white/70 p-4 shadow-card sm:p-7"><div className="grid items-center gap-8 lg:grid-cols-2 lg:gap-14"><div className="relative overflow-hidden rounded-xl bg-secondary"><img src={imageUrl(featured.cover_image_url) || '/placeholder.svg'} alt={local(featured, 'cover_image_alt', language) || local(featured, 'title', language)} className="aspect-[4/3] w-full object-cover lg:aspect-square"/><span className="absolute left-4 top-4 rounded-md bg-primary/90 px-3 py-1.5 text-[10px] font-semibold uppercase text-primary-foreground">{copy.featured}</span></div><div><p className="mb-4 text-xs font-semibold uppercase text-accent">{local(featured, 'category_name', language)} · {formatDate(featured.published_at, language)}</p><h1 className="font-heading text-3xl font-semibold text-primary sm:text-5xl">{local(featured, 'title', language)}</h1><p className="mt-5 text-[15px] leading-7 text-muted-foreground">{local(featured, 'excerpt', language)}</p><Link to={`/blog/${featured.slug}`} className="mt-7 inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-3 text-sm text-primary-foreground">{copy.read}<ArrowRight className="size-4"/></Link></div></div></div></section>}
    <section className="mx-auto max-w-[1320px] px-4 pb-20 pt-14 sm:px-7"><div className="mb-7 flex flex-wrap items-end justify-between gap-6"><div><p className="mb-2 text-xs font-semibold uppercase text-accent">{copy.guides}</p><h2 className="font-heading text-3xl font-semibold text-primary">{copy.latest}</h2></div><div className="flex flex-wrap gap-2"><Filter active={selected === 'all'} onClick={() => setSelected('all')}>{copy.all}</Filter>{(categoriesQuery.data || []).map((category) => <Filter key={category.id} active={selected === category.slug} onClick={() => setSelected(category.slug)}>{local(category, 'name', language)}</Filter>)}</div></div>
      {postsQuery.isLoading ? <Status>{copy.loading}</Status> : postsQuery.isError ? <Status error>{copy.error}</Status> : !visible.length ? <Status>{copy.empty}</Status> : <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">{visible.map((post) => <Link to={`/blog/${post.slug}`} key={post.id} className="group flex flex-col overflow-hidden rounded-2xl border bg-white/75 p-4 shadow-soft"><div className="w-full overflow-hidden rounded-lg bg-secondary"><img src={imageUrl(post.cover_image_url) || '/placeholder.svg'} alt={local(post, 'cover_image_alt', language) || local(post, 'title', language)} className="aspect-[4/3] w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"/></div><div className="flex flex-1 flex-col px-1 pt-5"><div className="mb-2 text-[11px] font-semibold uppercase text-accent">{local(post, 'category_name', language)}</div><h3 className="font-heading text-xl font-semibold text-primary">{local(post, 'title', language)}</h3><p className="mt-3 flex-1 text-sm leading-6 text-muted-foreground">{local(post, 'excerpt', language)}</p><div className="mt-4 flex items-center justify-between gap-3 border-t pt-4 text-xs text-muted-foreground"><time>{formatDate(post.published_at, language)}</time><span className="inline-flex items-center gap-1 text-primary">{copy.read}<ArrowRight className="size-3.5"/></span></div></div></Link>)}</div>}
    </section></div></Layout>;
}
function Filter({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) { return <button type="button" onClick={onClick} aria-pressed={active} className={`rounded-md px-4 py-2.5 text-xs font-medium ${active ? 'bg-primary text-primary-foreground' : 'bg-card ring-1 ring-primary/10'}`}>{children}</button>; }
function Status({ children, error }: { children: React.ReactNode; error?: boolean }) { return <p role={error ? 'alert' : undefined} className={`py-16 text-center ${error ? 'text-destructive' : 'text-muted-foreground'}`}>{children}</p>; }
