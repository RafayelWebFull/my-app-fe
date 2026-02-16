import { useState, useRef, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ImagePlus, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { apiUrl, imageUrl } from '@/lib/api';

const API = () => apiUrl('/api/site-settings');

export default function AdminSiteSettings() {
  const queryClient = useQueryClient();
  const fileRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState<Record<string, string>>({});

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
    if (fileRef.current?.files?.[0]) {
      fd.append('hero_image', fileRef.current.files[0]);
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
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={() => {}} />
            <Button type="button" variant="outline" onClick={() => fileRef.current?.click()} className="gap-2 mt-2">
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
        </div>
      </div>

      <div>
        <h3 className="font-semibold text-lg mb-4">Contact Info</h3>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Phone</Label>
            <Input
              value={form.contact_phone || ''}
              onChange={(e) => setForm((f) => ({ ...f, contact_phone: e.target.value }))}
            />
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
          <div className="space-y-2">
            <Label>Map Link URL (Address Click)</Label>
            <Input
              value={form.contact_map_link || ''}
              onChange={(e) => setForm((f) => ({ ...f, contact_map_link: e.target.value }))}
              placeholder="https://maps.google.com/?q=Yerevan,Armenia"
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
