import { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, Pencil, Trash2, Loader2, ImagePlus } from 'lucide-react';
import { toast } from 'sonner';

interface HomeCategoryCard {
  id: number;
  title: string;
  slug: string;
  background: string | null;
  image_url: string | null;
  icon: string;
  sort_order: number;
}

const API = '/api/home-category-cards';

const ICON_OPTIONS = [
  { value: 'glasses', label: 'Glasses' },
  { value: 'sun', label: 'Sun (Sunglasses)' },
  { value: 'eye', label: 'Eye (Lenses)' },
];


export default function AdminHomeCategoryCards() {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [editing, setEditing] = useState<HomeCategoryCard | null>(null);
  const [deleteCard, setDeleteCard] = useState<HomeCategoryCard | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [form, setForm] = useState({
    title: '',
    slug: '',
    icon: 'glasses',
    sort_order: '0',
  });

  const { data: cards = [], isLoading } = useQuery({
    queryKey: ['homeCategoryCards'],
    queryFn: async () => {
      const res = await fetch(API + '/all', { credentials: 'include' });
      if (!res.ok) throw new Error('Failed to fetch');
      return res.json();
    },
  });

  const createMu = useMutation({
    mutationFn: async ({ formData, fd }: { formData: typeof form; fd: FormData }) => {
      fd.append('title', formData.title);
      fd.append('slug', formData.slug);
      fd.append('icon', formData.icon);
      fd.append('sort_order', formData.sort_order);
      const res = await fetch(API, {
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
      queryClient.invalidateQueries({ queryKey: ['homeCategoryCards'] });
      resetForm();
      toast.success('Card added');
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const updateMu = useMutation({
    mutationFn: async ({ id, formData, fd, keepImageUrl }: { id: number; formData: typeof form; fd: FormData; keepImageUrl?: string }) => {
      fd.append('title', formData.title);
      fd.append('slug', formData.slug);
      fd.append('icon', formData.icon);
      fd.append('sort_order', formData.sort_order);
      if (keepImageUrl) fd.append('image_url', keepImageUrl);
      const res = await fetch(`${API}/${id}`, {
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
      queryClient.invalidateQueries({ queryKey: ['homeCategoryCards'] });
      resetForm();
      toast.success('Card updated');
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const deleteMu = useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`${API}/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Failed');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['homeCategoryCards'] });
      setDeleteCard(null);
      toast.success('Card deleted');
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const resetForm = () => {
    setIsOpen(false);
    setEditing(null);
    setImageFile(null);
    setImagePreview(null);
    setForm({ title: '', slug: '', icon: 'glasses', sort_order: '0' });
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
    if (!form.title.trim() || !form.slug.trim()) {
      toast.error('Title and slug are required');
      return;
    }
    const fd = new FormData();
    if (imageFile) fd.append('image', imageFile);
    if (editing) {
      updateMu.mutate({
        id: editing.id,
        formData: form,
        fd,
        keepImageUrl: !imageFile && editing.image_url ? editing.image_url : undefined,
      });
    } else {
      createMu.mutate({ formData: form, fd });
    }
  };

  const openCreate = () => {
    setEditing(null);
    setImageFile(null);
    setImagePreview(null);
    setForm({ title: '', slug: '', icon: 'glasses', sort_order: String(cards.length) });
    setIsOpen(true);
  };

  const openEdit = (c: HomeCategoryCard) => {
    setEditing(c);
    setImageFile(null);
    setImagePreview(c.image_url || null);
    setForm({
      title: c.title,
      slug: c.slug,
      icon: c.icon || 'glasses',
      sort_order: String(c.sort_order),
    });
    setIsOpen(true);
  };

  const isPending = createMu.isPending || updateMu.isPending;

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Manage the 3 category cards on the home page (grid below the product preview). Each card links to /products?category=slug.
      </p>
      <Button onClick={openCreate} className="gap-2">
        <Plus className="w-4 h-4" />
        Add Card
      </Button>

      <div className="rounded-xl border bg-card overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        ) : cards.length === 0 ? (
          <div className="py-12 text-center text-muted-foreground">No cards yet. Add cards to show on the home page.</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Preview</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Slug / Link</TableHead>
                <TableHead>Icon</TableHead>
                <TableHead>Order</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {cards.map((c: HomeCategoryCard) => (
                <TableRow key={c.id}>
                  <TableCell>
                    <div className="w-16 h-10 rounded-lg shrink-0 overflow-hidden bg-secondary">
                      {c.image_url ? (
                        <img src={c.image_url} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full" style={{ background: c.background || '#ccc' }} />
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">{c.title}</TableCell>
                  <TableCell className="text-muted-foreground">/products?category={c.slug}</TableCell>
                  <TableCell>{c.icon}</TableCell>
                  <TableCell>{c.sort_order}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => openEdit(c)}>
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive"
                      onClick={() => setDeleteCard(c)}
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
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit Card' : 'Add Card'}</DialogTitle>
            <DialogDescription>
              Card appears in the home page grid. Slug is used for the link: /products?category=slug
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Title *</Label>
              <Input
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                placeholder="Sunglasses"
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Slug * (URL part)</Label>
              <Input
                value={form.slug}
                onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') }))}
                placeholder="sunglasses"
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Image (from PC)</Label>
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
                  <div className="w-24 h-16 rounded border overflow-hidden shrink-0">
                    <img
                      src={imagePreview || editing?.image_url || ''}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
              </div>
              <p className="text-xs text-muted-foreground">Upload an image for the card background. Recommended: 4:5 aspect ratio.</p>
            </div>
            <div className="space-y-2">
              <Label>Icon</Label>
              <Select value={form.icon} onValueChange={(v) => setForm((f) => ({ ...f, icon: v }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ICON_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Sort order</Label>
              <Input
                type="number"
                min="0"
                value={form.sort_order}
                onChange={(e) => setForm((f) => ({ ...f, sort_order: e.target.value }))}
              />
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

      <AlertDialog open={!!deleteCard} onOpenChange={(o) => !o && setDeleteCard(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete card?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove &quot;{deleteCard?.title}&quot; from the home page.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive"
              onClick={() => deleteCard && deleteMu.mutate(deleteCard.id)}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
