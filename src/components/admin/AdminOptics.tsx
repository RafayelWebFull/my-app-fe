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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, Pencil, Trash2, Loader2, ImagePlus } from 'lucide-react';
import { toast } from 'sonner';

interface Category {
  id: number;
  name: string;
  slug: string;
}

interface Brand {
  id: number;
  name: string;
}

interface Optic {
  id: number;
  name: string;
  style: string;
  category_id: number;
  category_name: string;
  category_slug: string;
  brand_id: number;
  brand_name: string;
  image_url: string | null;
  price: number | string | null;
  description: string | null;
  in_stock: boolean | number;
  discount: number | null;
}

const OPTICS_API = '/api/optics';
const CATEGORIES_API = '/api/categories';
const BRANDS_API = '/api/brands';

const emptyForm = {
  name: '',
  style: '',
  category_id: '',
  brand_id: '',
  price: '',
  description: '',
  image_url: '',
  in_stock: 'true',
  discount: '',
};

export default function AdminOptics() {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [editing, setEditing] = useState<Optic | null>(null);
  const [deleteOptic, setDeleteOptic] = useState<Optic | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  const { data: optics = [], isLoading } = useQuery({
    queryKey: ['optics', categoryFilter],
    queryFn: async () => {
      const url = categoryFilter !== 'all' ? `${OPTICS_API}?category=${categoryFilter}` : OPTICS_API;
      const res = await fetch(url, { credentials: 'include' });
      if (!res.ok) throw new Error('Failed to fetch');
      return res.json();
    },
  });

  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const res = await fetch(CATEGORIES_API, { credentials: 'include' });
      if (!res.ok) throw new Error('Failed');
      return res.json();
    },
  });

  const { data: brands = [] } = useQuery({
    queryKey: ['brands'],
    queryFn: async () => {
      const res = await fetch(BRANDS_API, { credentials: 'include' });
      if (!res.ok) throw new Error('Failed');
      return res.json();
    },
  });

  const createMu = useMutation({
    mutationFn: async (fd: FormData) => {
      const res = await fetch(OPTICS_API, {
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
      queryClient.invalidateQueries({ queryKey: ['optics'] });
      resetForm();
      toast.success('Product added');
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const updateMu = useMutation({
    mutationFn: async ({ id, fd }: { id: number; fd: FormData }) => {
      const res = await fetch(`${OPTICS_API}/${id}`, {
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
      queryClient.invalidateQueries({ queryKey: ['optics'] });
      resetForm();
      toast.success('Product updated');
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const deleteMu = useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`${OPTICS_API}/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Failed');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['optics'] });
      setDeleteOptic(null);
      toast.success('Product deleted');
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
      const url = URL.createObjectURL(f);
      setImagePreview(url);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.style.trim() || !form.category_id || !form.brand_id) {
      toast.error('Name, style, category, and brand are required');
      return;
    }
    const fd = new FormData();
    fd.append('name', form.name.trim());
    fd.append('style', form.style.trim());
    fd.append('category_id', form.category_id);
    fd.append('brand_id', form.brand_id);
    fd.append('price', form.price || '');
    fd.append('description', form.description || '');
    fd.append('in_stock', form.in_stock || 'true');
    if (form.discount) fd.append('discount', form.discount);
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
    setForm(emptyForm);
    setImageFile(null);
    setImagePreview(null);
    setIsOpen(true);
  };

  const openEdit = (o: Optic) => {
    setEditing(o);
    setForm({
      name: o.name,
      style: o.style,
      category_id: String(o.category_id),
      brand_id: String(o.brand_id),
      price: o.price != null ? String(o.price) : '',
      description: o.description || '',
      image_url: o.image_url || '',
      in_stock: o.in_stock ? 'true' : 'false',
      discount: o.discount != null ? String(o.discount) : '',
    });
    setImageFile(null);
    setImagePreview(o.image_url || null);
    setIsOpen(true);
  };

  const isPending = createMu.isPending || updateMu.isPending;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Label>Category:</Label>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-[160px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              {categories.map((c: Category) => (
                <SelectItem key={c.id} value={c.slug}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button onClick={openCreate} className="gap-2">
          <Plus className="w-4 h-4" />
          Add Product
        </Button>
      </div>

      <div className="rounded-xl border bg-card overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        ) : optics.length === 0 ? (
          <div className="py-12 text-center text-muted-foreground">No products yet</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Image</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Brand</TableHead>
                <TableHead>Style</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Discount</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {optics.map((o: Optic) => (
                <TableRow key={o.id}>
                  <TableCell>
                    <div className="w-12 h-12 rounded bg-secondary overflow-hidden">
                      {o.image_url ? (
                        <img
                          src={o.image_url}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">
                          —
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">{o.name}</TableCell>
                  <TableCell>{o.category_name}</TableCell>
                  <TableCell>{o.brand_name}</TableCell>
                  <TableCell>{o.style}</TableCell>
                  <TableCell>
                    {o.price != null ? `$${Number(o.price).toFixed(2)}` : '—'}
                  </TableCell>
                  <TableCell>
                    {o.discount != null ? (
                      <span className="text-amber-600 font-medium">{o.discount}%</span>
                    ) : (
                      '—'
                    )}
                  </TableCell>
                  <TableCell>
                    <span className={o.in_stock ? 'text-green-600' : 'text-destructive'}>
                      {o.in_stock ? 'In Stock' : 'Out of Stock'}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => openEdit(o)}>
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive"
                      onClick={() => setDeleteOptic(o)}
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
            <DialogTitle>{editing ? 'Edit Product' : 'Add Product'}</DialogTitle>
            <DialogDescription>
              Select category and brand, then add image from your PC
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Category *</Label>
                <Select
                  value={form.category_id}
                  onValueChange={(v) => setForm((f) => ({ ...f, category_id: v }))}
                  required
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
                  onValueChange={(v) => setForm((f) => ({ ...f, brand_id: v }))}
                  required
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
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Name *</Label>
                <Input
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  placeholder="Ray-Ban RB5154"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Style *</Label>
                <Input
                  value={form.style}
                  onChange={(e) => setForm((f) => ({ ...f, style: e.target.value }))}
                  placeholder="Clubmaster"
                  required
                />
              </div>
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
                  <div className="w-20 h-20 rounded border overflow-hidden">
                    <img
                      src={imagePreview || editing?.image_url || ''}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Price</Label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  value={form.price}
                  onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
                  placeholder="199.99"
                />
              </div>
              <div className="space-y-2">
                <Label>Discount % (optional)</Label>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  value={form.discount}
                  onChange={(e) => setForm((f) => ({ ...f, discount: e.target.value }))}
                  placeholder="50"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                rows={3}
                placeholder="Product description"
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="in_stock"
                checked={form.in_stock === 'true'}
                onChange={(e) => setForm((f) => ({ ...f, in_stock: e.target.checked ? 'true' : 'false' }))}
                className="rounded border-input"
              />
              <Label htmlFor="in_stock">In Stock</Label>
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

      <AlertDialog open={!!deleteOptic} onOpenChange={(o) => !o && setDeleteOptic(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete product?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete {deleteOptic?.name} ({deleteOptic?.brand_name}).
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive"
              onClick={() => deleteOptic && deleteMu.mutate(deleteOptic.id)}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
