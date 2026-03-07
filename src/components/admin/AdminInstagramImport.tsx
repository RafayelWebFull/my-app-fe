import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Loader2, RefreshCw, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { apiUrl } from '@/lib/api';

interface Category {
  id: number;
  name: string;
}

interface Brand {
  id: number;
  name: string;
}

interface PreviewMedia {
  order: number;
  id: string;
  media_type: string;
  download_url: string;
}

interface PreviewResponse {
  post: {
    id: string;
    permalink: string;
    media_type: string;
    timestamp: string | null;
  };
  caption_translations: {
    hy: string;
    ru: string;
    en: string;
  };
  media: PreviewMedia[];
}

interface SuggestionResponse {
  suggestion: {
    name: string;
    style: string;
    gender: 'female' | 'male' | 'unisex';
    category_id: number | null;
    brand_id: number | null;
    description_hy: string;
    description_ru: string;
    description_en: string;
  };
  meta?: {
    model?: string;
  };
}

const INSTAGRAM_API = () => apiUrl('/api/instagram');
const CATEGORIES_API = () => apiUrl('/api/categories');
const BRANDS_API = () => apiUrl('/api/brands');

const initialForm = {
  name: '',
  style: '',
  category_id: '',
  brand_id: '',
  gender: 'unisex',
  in_stock: true,
  discount: '',
  description_hy: '',
  description_ru: '',
  description_en: '',
};

export default function AdminInstagramImport() {
  const queryClient = useQueryClient();
  const [postLink, setPostLink] = useState('');
  const [preview, setPreview] = useState<PreviewResponse | null>(null);
  const [form, setForm] = useState(initialForm);

  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const res = await fetch(CATEGORIES_API(), { credentials: 'include' });
      if (!res.ok) throw new Error('Failed to fetch categories');
      return res.json();
    },
  });

  const { data: brands = [] } = useQuery({
    queryKey: ['brands'],
    queryFn: async () => {
      const res = await fetch(BRANDS_API(), { credentials: 'include' });
      if (!res.ok) throw new Error('Failed to fetch brands');
      return res.json();
    },
  });

  const previewMu = useMutation({
    mutationFn: async (link: string) => {
      const res = await fetch(`${INSTAGRAM_API()}/preview`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ post_link: link }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Failed to preview post');
      }
      return res.json() as Promise<PreviewResponse>;
    },
    onSuccess: (data) => {
      setPreview(data);
      setForm((prev) => ({
        ...prev,
        description_hy: data.caption_translations?.hy || '',
        description_ru: data.caption_translations?.ru || '',
        description_en: data.caption_translations?.en || '',
      }));
      toast.success('Instagram post loaded');
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const publishMu = useMutation({
    mutationFn: async () => {
      const res = await fetch(`${INSTAGRAM_API()}/publish`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          post_link: postLink.trim(),
          name: form.name.trim(),
          style: form.style.trim(),
          category_id: form.category_id,
          brand_id: form.brand_id,
          gender: form.gender,
          in_stock: form.in_stock,
          discount: form.discount.trim(),
          description_hy: form.description_hy,
          description_ru: form.description_ru,
          description_en: form.description_en,
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Failed to publish product');
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['optics'] });
      setPreview(null);
      setPostLink('');
      setForm(initialForm);
      toast.success('Product imported from Instagram');
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const suggestMu = useMutation({
    mutationFn: async () => {
      if (!preview) throw new Error('Load Instagram post first');
      const res = await fetch(`${INSTAGRAM_API()}/suggest-fields`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          post_link: postLink.trim(),
          preview,
          name: form.name.trim(),
          description_hy: form.description_hy,
          description_ru: form.description_ru,
          description_en: form.description_en,
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'AI suggestion failed');
      }
      return res.json() as Promise<SuggestionResponse>;
    },
    onSuccess: (data) => {
      const s = data.suggestion;
      setForm((prev) => ({
        ...prev,
        name: s.name || prev.name,
        style: s.style || prev.style,
        gender: s.gender || prev.gender,
        category_id: s.category_id ? String(s.category_id) : prev.category_id,
        brand_id: s.brand_id ? String(s.brand_id) : prev.brand_id,
        description_hy: s.description_hy || prev.description_hy,
        description_ru: s.description_ru || prev.description_ru,
        description_en: s.description_en || prev.description_en,
      }));
      toast.success(`AI suggestions applied${data.meta?.model ? ` (${data.meta.model})` : ''}`);
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const isPublishDisabled = useMemo(() => {
    if (!preview) return true;
    if (!form.name.trim()) return true;
    if (!form.category_id || !form.brand_id) return true;
    return false;
  }, [preview, form.name, form.category_id, form.brand_id]);

  return (
    <div className="space-y-5">
      <div className="rounded-xl border bg-card p-4 space-y-4">
        <div className="space-y-2">
          <Label>Instagram post link</Label>
          <div className="flex gap-2">
            <Input
              value={postLink}
              onChange={(e) => setPostLink(e.target.value)}
              placeholder="https://www.instagram.com/p/..."
            />
            <Button
              type="button"
              onClick={() => previewMu.mutate(postLink.trim())}
              disabled={!postLink.trim() || previewMu.isPending}
              className="gap-2"
            >
              {previewMu.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
              Load
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Loads caption and media from Instagram, preserves image order, and auto-translates Armenian caption to RU/EN.
          </p>
        </div>
      </div>

      {preview && (
        <div className="rounded-xl border bg-card p-4 space-y-5">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Post</p>
            <a
              href={preview.post.permalink}
              target="_blank"
              rel="noreferrer"
              className="text-sm underline break-all"
            >
              {preview.post.permalink}
            </a>
          </div>

          <div className="space-y-2">
            <Label>Instagram media order</Label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {preview.media.map((item) => (
                <div key={item.id} className="rounded border overflow-hidden">
                  <div className="aspect-square bg-muted">
                    <img src={item.download_url} alt="" className="w-full h-full object-cover" />
                  </div>
                  <div className="px-2 py-1 text-xs text-muted-foreground">
                    #{item.order} · {item.media_type}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-start">
            <Button
              type="button"
              variant="outline"
              className="gap-2"
              onClick={() => suggestMu.mutate()}
              disabled={suggestMu.isPending}
            >
              {suggestMu.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              Auto-fill with AI
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Name *</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                placeholder="Product name"
              />
            </div>
            <div className="space-y-2">
              <Label>Style (optional)</Label>
              <Input
                value={form.style}
                onChange={(e) => setForm((prev) => ({ ...prev, style: e.target.value }))}
                placeholder="Style"
              />
            </div>
            <div className="space-y-2">
              <Label>Category *</Label>
              <Select
                value={form.category_id}
                onValueChange={(v) => setForm((prev) => ({ ...prev, category_id: v }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((c: Category) => (
                    <SelectItem key={c.id} value={String(c.id)}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Brand *</Label>
              <Select
                value={form.brand_id}
                onValueChange={(v) => setForm((prev) => ({ ...prev, brand_id: v }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select brand" />
                </SelectTrigger>
                <SelectContent>
                  {brands.map((b: Brand) => (
                    <SelectItem key={b.id} value={String(b.id)}>
                      {b.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>For</Label>
              <Select
                value={form.gender}
                onValueChange={(v) => setForm((prev) => ({ ...prev, gender: v }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="unisex">Unisex</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Discount % (optional)</Label>
              <Input
                type="number"
                min="0"
                max="100"
                value={form.discount}
                onChange={(e) => setForm((prev) => ({ ...prev, discount: e.target.value }))}
              />
            </div>
          </div>

          <div className="space-y-3">
            <Label>Descriptions</Label>
            <div className="grid gap-3 md:grid-cols-3">
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">HY (original)</Label>
                <Textarea
                  rows={6}
                  value={form.description_hy}
                  onChange={(e) => setForm((prev) => ({ ...prev, description_hy: e.target.value }))}
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">RU (auto)</Label>
                <Textarea
                  rows={6}
                  value={form.description_ru}
                  onChange={(e) => setForm((prev) => ({ ...prev, description_ru: e.target.value }))}
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">EN (auto)</Label>
                <Textarea
                  rows={6}
                  value={form.description_en}
                  onChange={(e) => setForm((prev) => ({ ...prev, description_en: e.target.value }))}
                />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              id="ig-in-stock"
              type="checkbox"
              checked={form.in_stock}
              onChange={(e) => setForm((prev) => ({ ...prev, in_stock: e.target.checked }))}
              className="rounded border-input"
            />
            <Label htmlFor="ig-in-stock">In stock</Label>
          </div>

          <div className="flex justify-end">
            <Button
              type="button"
              onClick={() => publishMu.mutate()}
              disabled={isPublishDisabled || publishMu.isPending}
            >
              {publishMu.isPending && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
              Publish Product
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
