import { useState, useRef, useEffect, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ImagePlus, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { apiUrl, imageUrl } from '@/lib/api';

const API = () => apiUrl('/api/site-settings');
const HEX_COLOR_RE = /^#(?:[0-9a-fA-F]{3}){1,2}$/;

function getColorValue(raw: string | undefined, fallback: string): string {
  return raw && HEX_COLOR_RE.test(raw) ? raw : fallback;
}

export default function AdminSiteSettings() {
  const queryClient = useQueryClient();
  const heroFileRef = useRef<HTMLInputElement>(null);
  const aboutFilesRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState<Record<string, string>>({});
  const [aboutFileCount, setAboutFileCount] = useState(0);

  const { data: settings = {}, isLoading } = useQuery({
    queryKey: ['site-settings'],
    queryFn: async () => {
      const res = await fetch(API(), { credentials: 'include' });
      if (!res.ok) throw new Error('Failed');
      return res.json();
    },
  });

  useEffect(() => {
    if (Object.keys(settings).length) setForm(settings);
  }, [settings]);

  const aboutImages = useMemo(() => {
    const raw = form.about_images;
    if (!raw) return [] as string[];
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed.filter(Boolean);
      return [];
    } catch {
      return [];
    }
  }, [form.about_images]);

  const updateMu = useMutation({
    mutationFn: async (fd: FormData) => {
      const res = await fetch(API(), {
        method: 'PUT',
        credentials: 'include',
        body: fd,
      });
      if (!res.ok) throw new Error('Failed');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['site-settings'] });
      toast.success('Saved');
    },
    onError: () => toast.error('Failed to save'),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => {
      if (k === 'hero_title' || k === 'hero_subtitle') return;
      fd.append(k, v || '');
    });
    if (heroFileRef.current?.files?.[0]) {
      fd.append('hero_image', heroFileRef.current.files[0]);
    }
    if (aboutFilesRef.current?.files?.length) {
      Array.from(aboutFilesRef.current.files).forEach((file) => fd.append('about_images', file));
    }
    updateMu.mutate(fd);
  };

  if (isLoading) return <div className="py-12 text-center">Loading...</div>;

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-2xl">
      <div>
        <h3 className="font-semibold text-lg mb-4">Hero Section (Home Main Picture)</h3>
        <div className="space-y-4">
          <div>
            <Label>Hero Image</Label>
            <input ref={heroFileRef} type="file" accept="image/*" className="hidden" onChange={() => {}} />
            <Button type="button" variant="outline" onClick={() => heroFileRef.current?.click()} className="gap-2 mt-2">
              <ImagePlus className="w-4 h-4" />
              Upload new image
            </Button>
            {form.hero_image && (
              <div className="mt-2">
                <img src={imageUrl(form.hero_image) || form.hero_image || ''} alt="Hero" className="w-48 h-32 object-cover rounded-lg border" />
              </div>
            )}
          </div>
          <div className="rounded-md border bg-muted/30 p-3 text-sm text-muted-foreground">
            Hero title and subtitle are managed in Admin Translations using keys:
            {' '}
            <code>heroTitle</code>
            {' '}
            and
            {' '}
            <code>heroSubtitle</code>.
          </div>
          <div className="space-y-4 rounded-md border p-4">
            <h4 className="font-medium">Hero Text Colors</h4>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Address Badge Text</Label>
                <Input
                  type="color"
                  value={getColorValue(form.hero_badge_text_color, '#1d9db5')}
                  onChange={(e) => setForm((f) => ({ ...f, hero_badge_text_color: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Hero Title Text</Label>
                <Input
                  type="color"
                  value={getColorValue(form.hero_title_color, '#0f1e3b')}
                  onChange={(e) => setForm((f) => ({ ...f, hero_title_color: e.target.value }))}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Hero Subtitle Text</Label>
              <Input
                type="color"
                value={getColorValue(form.hero_subtitle_color, '#5a7899')}
                onChange={(e) => setForm((f) => ({ ...f, hero_subtitle_color: e.target.value }))}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              These colors are applied on the home hero texts.
            </p>
          </div>
        </div>
      </div>

      <div>
        <h3 className="font-semibold text-lg mb-4">About Page Gallery</h3>
        <div className="space-y-4">
          <div>
            <Label>About Images (Multiple)</Label>
            <input
              ref={aboutFilesRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => setAboutFileCount(e.currentTarget.files?.length || 0)}
            />
            <Button type="button" variant="outline" onClick={() => aboutFilesRef.current?.click()} className="gap-2 mt-2">
              <ImagePlus className="w-4 h-4" />
              Upload gallery images
            </Button>
            {aboutFileCount > 0 && (
              <p className="text-xs text-muted-foreground mt-2">
                {aboutFileCount}
                {' '}
                new image(s) selected. Saving will add them to current gallery.
              </p>
            )}
          </div>
          {aboutImages.length > 0 && (
            <div>
              <Label>Current About Gallery</Label>
              <div className="mt-2 grid grid-cols-2 sm:grid-cols-3 gap-3">
                {aboutImages.map((img, i) => (
                  <img
                    key={`${img}-${i}`}
                    src={imageUrl(img) || img}
                    alt={`About ${i + 1}`}
                    className="w-full h-24 object-cover rounded-md border"
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div>
        <h3 className="font-semibold text-lg mb-4">Contact Info</h3>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Phone</Label>
            <Textarea
              value={form.contact_phone || ''}
              onChange={(e) => setForm((f) => ({ ...f, contact_phone: e.target.value }))}
              rows={3}
              placeholder={'+374 XX XXX XXX\n+374 YY YYY YYY'}
            />
            <p className="text-xs text-muted-foreground">Add one phone per line.</p>
          </div>
          <div className="space-y-2">
            <Label>Instagram</Label>
            <Input
              value={form.contact_instagram || ''}
              onChange={(e) => setForm((f) => ({ ...f, contact_instagram: e.target.value }))}
            />
          </div>
          <div className="space-y-2">
            <Label>Map Embed URL</Label>
            <Textarea
              value={form.contact_map_embed || ''}
              onChange={(e) => setForm((f) => ({ ...f, contact_map_embed: e.target.value }))}
              rows={3}
              placeholder="Google Maps embed URL"
            />
          </div>
        </div>
      </div>

      <Button type="submit" disabled={updateMu.isPending}>
        {updateMu.isPending && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
        Save Settings
      </Button>
    </form>
  );
}
