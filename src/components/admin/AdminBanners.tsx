import { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Plus, Pencil, Trash2, Loader2, ImagePlus } from 'lucide-react';
import { toast } from 'sonner';

interface Banner {
  id: number;
  image_url: string | null;
  title: string;
  description: string | null;
  start_date: string;
  end_date: string;
  discount_percent: number;
  created_at: string;
}

const BANNERS_API = '/api/banners';

const emptyForm = {
  title: '',
  description: '',
  start_date: '',
  end_date: '',
  discount_percent: '50',
  image_url: '',
};

function formatDate(d: string) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

function isActive(b: Banner) {
  const today = new Date().toISOString().slice(0, 10);
  return today >= b.start_date && today <= b.end_date;
}

export default function AdminBanners() {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [editing, setEditing] = useState<Banner | null>(null);
  const [deleteBanner, setDeleteBanner] = useState<Banner | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const { data: banners = [], isLoading } = useQuery({
    queryKey: ['banners', 'all'],
    queryFn: async () => {
      const res = await fetch(BANNERS_API + '/all', { credentials: 'include' });
      if (!res.ok) throw new Error('Failed to fetch');
      return res.json();
    },
  });

  const createMu = useMutation({
    mutationFn: async (fd: FormData) => {
      const res = await fetch(BANNERS_API, {
        method: 'POST',
        credentials: 'include',
        body: fd,
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Failed');
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['banners'] });
      resetForm();
      toast.success('Banner added');
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const updateMu = useMutation({
    mutationFn: async ({ id, fd }: { id: number; fd: FormData }) => {
      const res = await fetch(`${BANNERS_API}/${id}`, {
        method: 'PUT',
        credentials: 'include',
        body: fd,
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Failed');
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['banners'] });
      resetForm();
      toast.success('Banner updated');
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const deleteMu = useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`${BANNERS_API}/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Failed');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['banners'] });
      setDeleteBanner(null);
      toast.success('Banner deleted');
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const resetForm = () => {
    setIsOpen(false);
    setEditing(null);
    setForm(emptyForm);
    setImageFile(null);
    setImagePreview(null);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) {
      setImageFile(f);
      setImagePreview(URL.createObjectURL(f));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.start_date || !form.end_date) {
      toast.error('Title, start date, and end date are required');
      return;
    }
    if (form.start_date > form.end_date) {
      toast.error('End date must be after start date');
      return;
    }
    const fd = new FormData();
    fd.append('title', form.title.trim());
    fd.append('description', form.description);
    fd.append('start_date', form.start_date);
    fd.append('end_date', form.end_date);
    fd.append('discount_percent', form.discount_percent || '0');
    if (imageFile) fd.append('image', imageFile);
    if (editing && !imageFile && form.image_url) fd.append('image_url', form.image_url);

    if (editing) {
      updateMu.mutate({ id: editing.id, fd });
    } else {
      createMu.mutate(fd);
    }
  };

  const openCreate = () => {
    setEditing(null);
    const today = new Date().toISOString().slice(0, 10);
    setForm({ ...emptyForm, start_date: today, end_date: today });
    setImageFile(null);
    setImagePreview(null);
    setIsOpen(true);
  };

  const openEdit = (b: Banner) => {
    setEditing(b);
    setForm({
      title: b.title,
      description: b.description || '',
      start_date: b.start_date,
      end_date: b.end_date,
      discount_percent: String(b.discount_percent),
      image_url: b.image_url || '',
    });
    setImageFile(null);
    setImagePreview(b.image_url || null);
    setIsOpen(true);
  };

  const isPending = createMu.isPending || updateMu.isPending;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <p className="text-sm text-muted-foreground">
          Create promotional banners. Active banners (today between start and end date) are shown on the home page.
        </p>
        <Button onClick={openCreate} className="gap-2">
          <Plus className="w-4 h-4" />
          Add Banner
        </Button>
      </div>

      <div className="rounded-xl border bg-card overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        ) : banners.length === 0 ? (
          <div className="py-12 text-center text-muted-foreground">No banners yet</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Image</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Dates</TableHead>
                <TableHead>Discount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {banners.map((b: Banner) => (
                <TableRow key={b.id}>
                  <TableCell>
                    <div className="w-16 h-10 rounded bg-secondary overflow-hidden">
                      {b.image_url ? (
                        <img src={b.image_url} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">—</div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="font-medium max-w-[200px] truncate">{b.title}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {formatDate(b.start_date)} – {formatDate(b.end_date)}
                  </TableCell>
                  <TableCell>
                    <span className="text-amber-600 font-medium">{b.discount_percent}%</span>
                  </TableCell>
                  <TableCell>
                    <span
                      className={
                        isActive(b)
                          ? 'text-green-600 text-sm font-medium'
                          : 'text-muted-foreground text-sm'
                      }
                    >
                      {isActive(b) ? 'Active' : 'Scheduled/Ended'}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => openEdit(b)}>
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive"
                      onClick={() => setDeleteBanner(b)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      <Dialog open={isOpen} onOpenChange={(o) => !o && resetForm()}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit Banner' : 'Add Banner'}</DialogTitle>
            <DialogDescription>
              Create a promotional banner. It will be shown on the home page when today is between the start and end dates.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Title *</Label>
              <Input
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                placeholder="50% discount for March 8"
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                rows={2}
                placeholder="Celebrate Women's Day with special offers on eyewear"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Start date *</Label>
                <Input
                  type="date"
                  value={form.start_date}
                  onChange={(e) => setForm((f) => ({ ...f, start_date: e.target.value }))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>End date *</Label>
                <Input
                  type="date"
                  value={form.end_date}
                  onChange={(e) => setForm((f) => ({ ...f, end_date: e.target.value }))}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Discount %</Label>
              <Input
                type="number"
                min="0"
                max="100"
                value={form.discount_percent}
                onChange={(e) => setForm((f) => ({ ...f, discount_percent: e.target.value }))}
                placeholder="50"
              />
            </div>

            <div className="space-y-2">
              <Label>Image</Label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageChange}
              />
              <div className="flex items-center gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  className="gap-2"
                >
                  <ImagePlus className="w-4 h-4" />
                  {imageFile ? imageFile.name : 'Choose image'}
                </Button>
                {(imagePreview || (editing?.image_url && !imageFile)) && (
                  <div className="w-24 h-14 rounded border overflow-hidden">
                    <img
                      src={imagePreview || editing?.image_url || ''}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={resetForm}>
                Cancel
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                {editing ? 'Save' : 'Add'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteBanner} onOpenChange={(o) => !o && setDeleteBanner(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete banner?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete &quot;{deleteBanner?.title}&quot;.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive"
              onClick={() => deleteBanner && deleteMu.mutate(deleteBanner.id)}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
