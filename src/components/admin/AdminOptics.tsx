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
import { Plus, Pencil, Trash2, Loader2, ImagePlus, X } from 'lucide-react';
import { toast } from 'sonner';
import { apiUrl, imageUrl } from '@/lib/api';
import { useExchangeRates } from '@/hooks/useExchangeRates';
import { convertFromAmd, formatCurrency, toAmdNumber } from '@/lib/currency';

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
  gender?: 'male' | 'female' | 'unisex';
  category_id: number;
  category_name: string;
  category_slug: string;
  brand_id: number;
  brand_name: string;
  image_url: string | null;
  image_urls?: string[];
  price: number | string | null;
  description: string | null;
  description_en?: string | null;
  description_ru?: string | null;
  description_hy?: string | null;
  description_translations?: {
    en?: string | null;
    ru?: string | null;
    hy?: string | null;
  };
  in_stock: boolean | number;
  discount: number | null;
}

const OPTICS_API = () => apiUrl('/api/optics');
const CATEGORIES_API = () => apiUrl('/api/categories');
const BRANDS_API = () => apiUrl('/api/brands');

const emptyForm = {
  name: '',
  style: '',
  gender: 'unisex',
  category_id: '',
  brand_id: '',
  price: '',
  description_en: '',
  description_ru: '',
  description_hy: '',
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
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [existingImageUrls, setExistingImageUrls] = useState<string[]>([]);
  const [primaryImageSelection, setPrimaryImageSelection] = useState<string | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const { data: rates } = useExchangeRates();

  const { data: optics = [], isLoading } = useQuery({
    queryKey: ['optics', categoryFilter],
    queryFn: async () => {
      const url = categoryFilter !== 'all' ? `${OPTICS_API()}?category=${categoryFilter}` : OPTICS_API();
      const res = await fetch(url, { credentials: 'include' });
      if (!res.ok) throw new Error('Failed to fetch');
      return res.json();
    },
  });

  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const res = await fetch(CATEGORIES_API(), { credentials: 'include' });
      if (!res.ok) throw new Error('Failed');
      return res.json();
    },
  });

  const { data: brands = [] } = useQuery({
    queryKey: ['brands'],
    queryFn: async () => {
      const res = await fetch(BRANDS_API(), { credentials: 'include' });
      if (!res.ok) throw new Error('Failed');
      return res.json();
    },
  });

  const createMu = useMutation({
    mutationFn: async (fd: FormData) => {
      const res = await fetch(OPTICS_API(), {
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
      const res = await fetch(`${OPTICS_API()}/${id}`, {
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
      const res = await fetch(`${OPTICS_API()}/${id}`, {
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
    setImageFiles([]);
    setImagePreviews([]);
    setExistingImageUrls([]);
    setPrimaryImageSelection(null);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files || []);
    if (!selected.length) return;
    setImageFiles((prev) => prev.concat(selected));
    setImagePreviews((prev) => prev.concat(selected.map((f) => URL.createObjectURL(f))));
    e.target.value = '';
  };

  const resolvePrimarySelection = () => {
    if (primaryImageSelection?.startsWith('existing:')) {
      const url = primaryImageSelection.slice('existing:'.length);
      if (existingImageUrls.includes(url)) return { type: 'existing' as const, value: url };
    }
    if (primaryImageSelection?.startsWith('new:')) {
      const preview = primaryImageSelection.slice('new:'.length);
      const idx = imagePreviews.indexOf(preview);
      if (idx >= 0) return { type: 'new' as const, value: preview, index: idx };
    }
    if (existingImageUrls.length > 0) return { type: 'existing' as const, value: existingImageUrls[0] };
    if (imagePreviews.length > 0) return { type: 'new' as const, value: imagePreviews[0], index: 0 };
    return null;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.category_id || !form.brand_id) {
      toast.error('Name, category, and brand are required');
      return;
    }
    const effectiveCount = existingImageUrls.length + imageFiles.length;
    if (effectiveCount < 1) {
      toast.error('At least 1 image is required');
      return;
    }
    const fd = new FormData();
    fd.append('name', form.name.trim());
    fd.append('style', form.style.trim());
    fd.append('gender', form.gender);
    fd.append('category_id', form.category_id);
    fd.append('brand_id', form.brand_id);
    fd.append('price', form.price || '');
    fd.append('description_en', form.description_en || '');
    fd.append('description_ru', form.description_ru || '');
    fd.append('description_hy', form.description_hy || '');
    fd.append('in_stock', form.in_stock || 'true');
    if (form.discount) fd.append('discount', form.discount);
    const primary = resolvePrimarySelection();
    if (primary?.type === 'existing') {
      fd.append('primary_image_url', primary.value);
    } else if (primary?.type === 'new' && typeof primary.index === 'number') {
      fd.append('primary_upload_index', String(primary.index));
    }
    imageFiles.forEach((f) => fd.append('images', f));
    if (editing) {
      fd.append('image_urls', JSON.stringify(existingImageUrls));
    }

    if (editing) {
      updateMu.mutate({ id: editing.id, fd });
    } else {
      createMu.mutate(fd);
    }
  };

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setImageFiles([]);
    setImagePreviews([]);
    setExistingImageUrls([]);
    setPrimaryImageSelection(null);
    setIsOpen(true);
  };

  const openEdit = (o: Optic) => {
    setEditing(o);
    setForm({
      name: o.name,
      style: o.style,
      gender: o.gender || 'unisex',
      category_id: String(o.category_id),
      brand_id: String(o.brand_id),
      price: o.price != null ? String(o.price) : '',
      description_en: o.description_translations?.en || o.description_en || o.description || '',
      description_ru: o.description_translations?.ru || o.description_ru || '',
      description_hy: o.description_translations?.hy || o.description_hy || '',
      in_stock: o.in_stock ? 'true' : 'false',
      discount: o.discount != null ? String(o.discount) : '',
    });
    const urls = Array.isArray(o.image_urls) && o.image_urls.length > 0
      ? o.image_urls
      : (o.image_url ? [o.image_url] : []);
    setExistingImageUrls(urls);
    setImageFiles([]);
    setImagePreviews([]);
    setPrimaryImageSelection(urls[0] ? `existing:${urls[0]}` : null);
    setIsOpen(true);
  };

  const isPending = createMu.isPending || updateMu.isPending;
  const formPriceAmd = toAmdNumber(form.price);

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
          <>
            <div className="block lg:hidden divide-y">
              {optics.map((o: Optic) => (
                <div key={o.id} className="p-4 space-y-3">
                  <div className="flex gap-3">
                    <div className="w-14 h-14 rounded bg-secondary overflow-hidden shrink-0">
                      {o.image_url ? (
                        <img
                          src={imageUrl(o.image_url) || o.image_url || ''}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">
                          —
                        </div>
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium truncate">{o.name}</p>
                      <p className="text-sm text-muted-foreground truncate">
                        {o.brand_name}{o.style ? ` · ${o.style}` : ''}
                      </p>
                      <p className="text-xs text-muted-foreground capitalize">
                        {o.category_name} · {o.gender || 'unisex'}
                      </p>
                    </div>
                  </div>
                  <div className="text-sm">
                    {o.price != null ? (
                      <span>
                        {formatCurrency(Number(o.price), 'AMD')} / {rates ? formatCurrency(convertFromAmd(Number(o.price), 'USD', rates) || 0, 'USD') : '...'} / {rates ? formatCurrency(convertFromAmd(Number(o.price), 'RUB', rates) || 0, 'RUB') : '...'}
                      </span>
                    ) : '—'}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className={o.in_stock ? 'text-green-600 text-sm' : 'text-destructive text-sm'}>
                      {o.in_stock ? 'In Stock' : 'Out of Stock'}
                    </span>
                    <div className="flex items-center gap-1">
                      <Button variant="outline" size="sm" onClick={() => openEdit(o)}>
                        <Pencil className="w-4 h-4 mr-1" />
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-destructive"
                        onClick={() => setDeleteOptic(o)}
                      >
                        <Trash2 className="w-4 h-4 mr-1" />
                        Delete
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="hidden lg:block overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Image</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Brand</TableHead>
                    <TableHead>Style</TableHead>
                    <TableHead>For</TableHead>
                    <TableHead>Price (AMD / USD / RUB)</TableHead>
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
                              src={imageUrl(o.image_url) || o.image_url || ''}
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
                      <TableCell>{o.style || '—'}</TableCell>
                      <TableCell className="capitalize">{o.gender || 'unisex'}</TableCell>
                      <TableCell>
                        {o.price != null ? (
                          <span className="text-sm">
                            {formatCurrency(Number(o.price), 'AMD')} / {rates ? formatCurrency(convertFromAmd(Number(o.price), 'USD', rates) || 0, 'USD') : '...'} / {rates ? formatCurrency(convertFromAmd(Number(o.price), 'RUB', rates) || 0, 'RUB') : '...'}
                          </span>
                        ) : '—'}
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
            </div>
          </>
        )}
      </div>

      <Dialog open={isOpen} onOpenChange={(o) => !o && resetForm()}>
        <DialogContent className="w-[95vw] max-w-4xl max-h-[90vh] overflow-y-auto">
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

            <div className="grid grid-cols-3 gap-4">
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
                <Label>Style (optional)</Label>
                <Input
                  value={form.style}
                  onChange={(e) => setForm((f) => ({ ...f, style: e.target.value }))}
                  placeholder="Clubmaster"
                />
              </div>
              <div className="space-y-2">
                <Label>For *</Label>
                <Select
                  value={form.gender}
                  onValueChange={(v) => setForm((f) => ({ ...f, gender: v as 'male' | 'female' | 'unisex' }))}
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
            </div>

            <div className="space-y-2">
              <Label>Images (from PC, no limit)</Label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
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
                  {imageFiles.length > 0 ? `${imageFiles.length} selected` : 'Choose images'}
                </Button>
                {imageFiles.length > 0 && (
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => { setImageFiles([]); setImagePreviews([]); }}
                  >
                    Clear selected
                  </Button>
                )}
              </div>
              {(existingImageUrls.length > 0 || imagePreviews.length > 0) && (
                <div className="grid grid-cols-4 gap-2">
                  {existingImageUrls.map((src, idx) => {
                    const token = `existing:${src}`;
                    const isPrimary = resolvePrimarySelection()?.type === 'existing' && resolvePrimarySelection()?.value === src;
                    return (
                    <div key={`existing-${src}-${idx}`} className={`relative w-20 h-20 rounded border overflow-hidden ${isPrimary ? 'ring-2 ring-primary' : ''}`}>
                      <img
                        src={imageUrl(src) || src || ''}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        className="absolute left-1 top-1 bg-white/90 text-[10px] rounded px-1 py-0.5"
                        onClick={() => setPrimaryImageSelection(token)}
                      >
                        {isPrimary ? 'First' : 'Set first'}
                      </button>
                      <button
                        type="button"
                        className="absolute top-1 right-1 bg-black/60 text-white rounded p-0.5"
                        onClick={() => {
                          setExistingImageUrls((prev) => prev.filter((_, i) => i !== idx));
                          if (primaryImageSelection === token) setPrimaryImageSelection(null);
                        }}
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                    );
                  })}
                  {imagePreviews.map((src, idx) => {
                    const token = `new:${src}`;
                    const isPrimary = resolvePrimarySelection()?.type === 'new' && resolvePrimarySelection()?.value === src;
                    return (
                    <div key={`new-${src}-${idx}`} className={`relative w-20 h-20 rounded border overflow-hidden ${isPrimary ? 'ring-2 ring-primary' : ''}`}>
                      <img
                        src={src}
                        alt="New preview"
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        className="absolute left-1 top-1 bg-white/90 text-[10px] rounded px-1 py-0.5"
                        onClick={() => setPrimaryImageSelection(token)}
                      >
                        {isPrimary ? 'First' : 'Set first'}
                      </button>
                      <button
                        type="button"
                        className="absolute top-1 right-1 bg-black/60 text-white rounded p-0.5"
                        onClick={() => {
                          setImageFiles((prev) => prev.filter((_, i) => i !== idx));
                          setImagePreviews((prev) => prev.filter((_, i) => i !== idx));
                          if (primaryImageSelection === token) setPrimaryImageSelection(null);
                        }}
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                    );
                  })}
                </div>
              )}
              <p className="text-xs text-muted-foreground">
                {existingImageUrls.length} existing kept, {imageFiles.length} new selected. Delete manually if needed.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Price (AMD ֏)</Label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  value={form.price}
                  onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
                  placeholder="75000"
                />
                {formPriceAmd != null && (
                  <p className="text-xs text-muted-foreground">
                    Live conversion: {rates ? formatCurrency(convertFromAmd(formPriceAmd, 'USD', rates) || 0, 'USD') : '...'} / {rates ? formatCurrency(convertFromAmd(formPriceAmd, 'RUB', rates) || 0, 'RUB') : '...'}
                  </p>
                )}
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

            <div className="space-y-3">
              <Label>Descriptions (3 languages)</Label>
              <div className="grid gap-3 md:grid-cols-3">
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Description (EN)</Label>
                  <Textarea
                    value={form.description_en}
                    onChange={(e) => setForm((f) => ({ ...f, description_en: e.target.value }))}
                    rows={5}
                    placeholder="Product description in English"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Description (RU)</Label>
                  <Textarea
                    value={form.description_ru}
                    onChange={(e) => setForm((f) => ({ ...f, description_ru: e.target.value }))}
                    rows={5}
                    placeholder="Описание товара на русском"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Description (HY)</Label>
                  <Textarea
                    value={form.description_hy}
                    onChange={(e) => setForm((f) => ({ ...f, description_hy: e.target.value }))}
                    rows={5}
                    placeholder="Ապրանքի նկարագրություն հայերեն"
                  />
                </div>
              </div>
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
