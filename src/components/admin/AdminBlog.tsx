import { useEffect, useRef, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Bold, Edit, Heading2, Italic, Link as LinkIcon, List, ListOrdered, Plus, Quote, Trash2, Underline } from 'lucide-react';
import { toast } from 'sonner';
import { apiUrl, imageUrl } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

type Lang = 'hy' | 'ru' | 'en';
type Category = { id: number; slug: string; name_hy: string; name_ru: string; name_en: string };
type Post = Record<string, string | number | null> & { id: number; category_id: number; slug: string; status: 'draft' | 'published'; is_featured: number; cover_image_url: string | null; published_at: string | null };

const langs: Array<{ code: Lang; label: string }> = [{ code: 'hy', label: 'Հայերեն' }, { code: 'ru', label: 'Русский' }, { code: 'en', label: 'English' }];
const emptyForm = () => ({
  category_id: '', slug: '', status: 'draft', is_featured: false, published_at: '', cover_image_url: '', cover_image: null as File | null,
  title_hy: '', title_ru: '', title_en: '', excerpt_hy: '', excerpt_ru: '', excerpt_en: '', content_hy: '', content_ru: '', content_en: '', cover_image_alt_hy: '', cover_image_alt_ru: '', cover_image_alt_en: '',
});
type FormState = ReturnType<typeof emptyForm>;

function RichTextEditor({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  const editorRef = useRef<HTMLDivElement>(null);
  useEffect(() => { if (editorRef.current && editorRef.current.innerHTML !== value) editorRef.current.innerHTML = value; }, [value]);
  const command = (name: string, argument?: string) => {
    editorRef.current?.focus();
    document.execCommand(name, false, argument);
    onChange(editorRef.current?.innerHTML || '');
  };
  const addLink = () => {
    const url = window.prompt('Enter the link URL (https://...)');
    if (!url) return;
    command('createLink', url);
  };
  const tools = [
    { label: 'Bold', icon: Bold, action: () => command('bold') }, { label: 'Italic', icon: Italic, action: () => command('italic') },
    { label: 'Underline', icon: Underline, action: () => command('underline') }, { label: 'Heading', icon: Heading2, action: () => command('formatBlock', 'h2') },
    { label: 'Bullet list', icon: List, action: () => command('insertUnorderedList') }, { label: 'Numbered list', icon: ListOrdered, action: () => command('insertOrderedList') },
    { label: 'Quote', icon: Quote, action: () => command('formatBlock', 'blockquote') }, { label: 'Add link to selected text', icon: LinkIcon, action: addLink },
  ];
  return <div className="overflow-hidden rounded-md border bg-background">
    <div className="flex flex-wrap gap-1 border-b bg-muted/50 p-2">{tools.map(({ label, icon: Icon, action }) => <Button key={label} type="button" variant="ghost" size="icon" title={label} aria-label={label} onMouseDown={(event) => { event.preventDefault(); action(); }}><Icon className="size-4" /></Button>)}</div>
    <div ref={editorRef} contentEditable suppressContentEditableWarning onInput={(event) => onChange(event.currentTarget.innerHTML)} className="prose prose-sm min-h-64 max-w-none p-4 outline-none" data-placeholder="Write the article content…" />
  </div>;
}

async function responseJson(response: Response) {
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(body.error || 'Request failed');
  return body;
}

export default function AdminBlog() {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Post | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [categoryForm, setCategoryForm] = useState({ slug: '', name_hy: '', name_ru: '', name_en: '' });
  const { data: posts = [], isLoading } = useQuery<Post[]>({ queryKey: ['admin-blog-posts'], queryFn: async () => responseJson(await fetch(apiUrl('/api/blog/admin/posts'), { credentials: 'include' })) });
  const { data: categories = [] } = useQuery<Category[]>({ queryKey: ['blog-categories'], queryFn: async () => responseJson(await fetch(apiUrl('/api/blog/categories'))) });

  const savePost = useMutation({
    mutationFn: async () => {
      const data = new FormData();
      Object.entries(form).forEach(([key, value]) => { if (key !== 'cover_image' && value !== null) data.append(key, String(value)); });
      if (form.cover_image) data.append('cover_image', form.cover_image);
      const url = editing ? `/api/blog/admin/posts/${editing.id}` : '/api/blog/admin/posts';
      return responseJson(await fetch(apiUrl(url), { method: editing ? 'PUT' : 'POST', credentials: 'include', body: data }));
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin-blog-posts'] }); queryClient.invalidateQueries({ queryKey: ['blog-posts'] }); setOpen(false); toast.success(editing ? 'Blog post updated' : 'Blog post created'); },
    onError: (error: Error) => toast.error(error.message),
  });
  const deletePost = useMutation({ mutationFn: async (id: number) => { const response = await fetch(apiUrl(`/api/blog/admin/posts/${id}`), { method: 'DELETE', credentials: 'include' }); if (!response.ok) throw new Error('Could not delete post'); }, onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin-blog-posts'] }); toast.success('Blog post deleted'); }, onError: (error: Error) => toast.error(error.message) });
  const createCategory = useMutation({
    mutationFn: async () => responseJson(await fetch(apiUrl('/api/blog/categories'), { method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify(categoryForm) })),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['blog-categories'] }); setCategoryForm({ slug: '', name_hy: '', name_ru: '', name_en: '' }); toast.success('Category created'); },
    onError: (error: Error) => toast.error(error.message),
  });
  const deleteCategory = useMutation({ mutationFn: async (id: number) => { const response = await fetch(apiUrl(`/api/blog/categories/${id}`), { method: 'DELETE', credentials: 'include' }); if (!response.ok) throw new Error((await response.json().catch(() => ({}))).error || 'Could not delete category'); }, onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['blog-categories'] }); toast.success('Category deleted'); }, onError: (error: Error) => toast.error(error.message) });

  const update = <K extends keyof FormState>(key: K, value: FormState[K]) => setForm((current) => ({ ...current, [key]: value }));
  const openCreate = () => { setEditing(null); setForm(emptyForm()); setOpen(true); };
  const openEdit = (post: Post) => {
    setEditing(post);
    const next = emptyForm();
    Object.keys(next).forEach((key) => { if (key in post && key !== 'cover_image') (next as Record<string, unknown>)[key] = post[key]; });
    next.category_id = String(post.category_id); next.is_featured = Boolean(post.is_featured); next.status = post.status;
    next.published_at = post.published_at ? String(post.published_at).slice(0, 16) : '';
    setForm(next); setOpen(true);
  };

  return <div className="space-y-8">
    <section className="rounded-xl border bg-card p-5 shadow-soft">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3"><div><h2 className="text-xl font-semibold">Blog posts</h2><p className="text-sm text-muted-foreground">Create multilingual articles, drafts, and scheduled posts.</p></div><Button onClick={openCreate}><Plus className="mr-2 size-4" />New post</Button></div>
      {isLoading ? <p className="text-muted-foreground">Loading…</p> : posts.length === 0 ? <p className="rounded-lg bg-muted/50 p-8 text-center text-muted-foreground">No blog posts yet.</p> : <div className="space-y-3">{posts.map((post) => <div key={post.id} className="flex flex-col gap-3 rounded-lg border p-4 sm:flex-row sm:items-center sm:justify-between"><div className="flex items-center gap-4">{post.cover_image_url && <img src={imageUrl(post.cover_image_url) || ''} alt="" className="size-16 rounded-md object-cover" />}<div><div className="font-medium">{String(post.title_en)}</div><div className="mt-1 text-xs text-muted-foreground">/{post.slug} · {post.status}{post.is_featured ? ' · Featured' : ''}</div></div></div><div className="flex gap-2"><Button variant="outline" size="sm" onClick={() => openEdit(post)}><Edit className="mr-1 size-4" />Edit</Button><Button variant="destructive" size="sm" onClick={() => window.confirm('Delete this blog post?') && deletePost.mutate(post.id)}><Trash2 className="size-4" /></Button></div></div>)}</div>}
    </section>

    <section className="rounded-xl border bg-card p-5 shadow-soft">
      <h2 className="text-xl font-semibold">Blog categories</h2><p className="mb-4 text-sm text-muted-foreground">Categories are shared by all languages.</p>
      <div className="grid gap-3 md:grid-cols-4"><Input placeholder="slug" value={categoryForm.slug} onChange={(e) => setCategoryForm({ ...categoryForm, slug: e.target.value })} /><Input placeholder="Հայերեն" value={categoryForm.name_hy} onChange={(e) => setCategoryForm({ ...categoryForm, name_hy: e.target.value })} /><Input placeholder="Русский" value={categoryForm.name_ru} onChange={(e) => setCategoryForm({ ...categoryForm, name_ru: e.target.value })} /><Input placeholder="English" value={categoryForm.name_en} onChange={(e) => setCategoryForm({ ...categoryForm, name_en: e.target.value })} /></div>
      <Button className="mt-3" variant="outline" disabled={createCategory.isPending} onClick={() => createCategory.mutate()}><Plus className="mr-2 size-4" />Add category</Button>
      <div className="mt-5 flex flex-wrap gap-2">{categories.map((category) => <div key={category.id} className="flex items-center gap-2 rounded-full border bg-muted/40 py-1 pl-3 pr-1 text-sm"><span>{category.name_en} · {category.name_ru} · {category.name_hy}</span><Button type="button" variant="ghost" size="icon" className="size-7" onClick={() => window.confirm('Delete this category?') && deleteCategory.mutate(category.id)}><Trash2 className="size-3.5" /></Button></div>)}</div>
    </section>

    <Dialog open={open} onOpenChange={setOpen}><DialogContent className="max-h-[92vh] max-w-5xl overflow-y-auto"><DialogHeader><DialogTitle>{editing ? 'Edit blog post' : 'Create blog post'}</DialogTitle><DialogDescription>Complete all three languages before publishing.</DialogDescription></DialogHeader>
      <div className="grid gap-4 sm:grid-cols-2"><div className="space-y-2"><Label>Slug</Label><Input value={form.slug} onChange={(e) => update('slug', e.target.value)} placeholder="how-to-choose-frames" /></div><div className="space-y-2"><Label>Category</Label><Select value={form.category_id} onValueChange={(value) => update('category_id', value)}><SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger><SelectContent>{categories.map((category) => <SelectItem key={category.id} value={String(category.id)}>{category.name_en}</SelectItem>)}</SelectContent></Select></div><div className="space-y-2"><Label>Status</Label><Select value={form.status} onValueChange={(value) => update('status', value)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="draft">Draft</SelectItem><SelectItem value="published">Published</SelectItem></SelectContent></Select></div><div className="space-y-2"><Label>Publish date</Label><Input type="datetime-local" value={form.published_at} onChange={(e) => update('published_at', e.target.value)} /></div><div className="space-y-2"><Label>Cover image</Label><Input type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={(e) => update('cover_image', e.target.files?.[0] || null)} /></div><label className="flex items-center gap-2 pt-7 text-sm"><input type="checkbox" checked={form.is_featured} onChange={(e) => update('is_featured', e.target.checked)} />Featured article</label></div>
      <Tabs defaultValue="hy"><TabsList>{langs.map((lang) => <TabsTrigger key={lang.code} value={lang.code}>{lang.label}</TabsTrigger>)}</TabsList>{langs.map(({ code }) => <TabsContent key={code} value={code} className="space-y-4"><div className="space-y-2"><Label>Title</Label><Input value={form[`title_${code}`]} onChange={(e) => update(`title_${code}`, e.target.value)} /></div><div className="space-y-2"><Label>Summary</Label><Textarea rows={3} value={form[`excerpt_${code}`]} onChange={(e) => update(`excerpt_${code}`, e.target.value)} /></div><div className="space-y-2"><Label>Cover image alt text</Label><Input value={form[`cover_image_alt_${code}`]} onChange={(e) => update(`cover_image_alt_${code}`, e.target.value)} /></div><div className="space-y-2"><Label>Article</Label><RichTextEditor value={form[`content_${code}`]} onChange={(value) => update(`content_${code}`, value)} /></div></TabsContent>)}</Tabs>
      <DialogFooter><Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button><Button disabled={savePost.isPending} onClick={() => savePost.mutate()}>{savePost.isPending ? 'Saving…' : 'Save post'}</Button></DialogFooter>
    </DialogContent></Dialog>
  </div>;
}
