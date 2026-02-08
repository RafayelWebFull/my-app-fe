import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Layout } from '@/components/layout/Layout';
import { useLanguage } from '@/contexts/LanguageContext';
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
import { Plus, Pencil, Trash2, Glasses, Sun, Eye, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const API_BASE = '/api/optics';

export type OpticCategory = 'eyeglasses' | 'sunglasses' | 'lenses';

export interface Optic {
  id: number;
  name: string;
  brand: string;
  style: string;
  category: OpticCategory;
  image_url: string | null;
  price: number | null;
  description: string | null;
  created_at: string;
  updated_at: string;
}

interface OpticFormData {
  name: string;
  brand: string;
  style: string;
  category: OpticCategory;
  image_url: string;
  price: string;
  description: string;
}

const emptyForm: OpticFormData = {
  name: '',
  brand: '',
  style: '',
  category: 'eyeglasses',
  image_url: '',
  price: '',
  description: '',
};

const categoryIcons: Record<OpticCategory, typeof Glasses> = {
  eyeglasses: Glasses,
  sunglasses: Sun,
  lenses: Eye,
};

function opticToForm(optic: Optic): OpticFormData {
  return {
    name: optic.name,
    brand: optic.brand,
    style: optic.style,
    category: optic.category,
    image_url: optic.image_url || '',
    price: optic.price != null ? String(optic.price) : '',
    description: optic.description || '',
  };
}

const OwnerDashboard = () => {
  const { t } = useLanguage();
  const queryClient = useQueryClient();
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingOptic, setEditingOptic] = useState<Optic | null>(null);
  const [formData, setFormData] = useState<OpticFormData>(emptyForm);
  const [deleteOptic, setDeleteOptic] = useState<Optic | null>(null);

  const queryParams = categoryFilter !== 'all' ? `?category=${categoryFilter}` : '';
  const { data: optics = [], isLoading } = useQuery({
    queryKey: ['optics', categoryFilter],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}${queryParams}`);
      if (!res.ok) throw new Error('Failed to fetch optics');
      return res.json() as Promise<Optic[]>;
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: OpticFormData) => {
      const res = await fetch(API_BASE, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: data.name,
          brand: data.brand,
          style: data.style,
          category: data.category,
          image_url: data.image_url || null,
          price: data.price ? parseFloat(data.price) : null,
          description: data.description || null,
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Failed to create');
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['optics'] });
      setIsFormOpen(false);
      setFormData(emptyForm);
      toast.success(t('success'));
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: OpticFormData }) => {
      const res = await fetch(`${API_BASE}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: data.name,
          brand: data.brand,
          style: data.style,
          category: data.category,
          image_url: data.image_url || null,
          price: data.price ? parseFloat(data.price) : null,
          description: data.description || null,
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Failed to update');
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['optics'] });
      setIsFormOpen(false);
      setEditingOptic(null);
      setFormData(emptyForm);
      toast.success(t('success'));
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`${API_BASE}/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['optics'] });
      setDeleteOptic(null);
      toast.success(t('success'));
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.brand.trim() || !formData.style.trim()) {
      toast.error(t('error'));
      return;
    }
    if (editingOptic) {
      updateMutation.mutate({ id: editingOptic.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const openCreate = () => {
    setEditingOptic(null);
    setFormData(emptyForm);
    setIsFormOpen(true);
  };

  const openEdit = (optic: Optic) => {
    setEditingOptic(optic);
    setFormData(opticToForm(optic));
    setIsFormOpen(true);
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between mb-8">
          <div>
            <h1 className="font-heading text-3xl font-bold text-foreground">{t('ownerDashboard')}</h1>
            <p className="text-muted-foreground mt-1">{t('manageOptics')}</p>
          </div>
          <Button onClick={openCreate} className="gap-2 w-fit">
            <Plus className="w-4 h-4" />
            {t('addOptic')}
          </Button>
        </div>

        <div className="flex flex-wrap items-center gap-4 mb-6">
          <Label className="text-muted-foreground">{t('filterCategory')}:</Label>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('all')}</SelectItem>
              <SelectItem value="eyeglasses">{t('eyeglasses')}</SelectItem>
              <SelectItem value="sunglasses">{t('sunglasses')}</SelectItem>
              <SelectItem value="lenses">{t('lenses')}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="rounded-xl border bg-card shadow-card overflow-hidden">
          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            </div>
          ) : optics.length === 0 ? (
            <div className="py-16 text-center text-muted-foreground">
              <Glasses className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>{t('no_results')}</p>
              <Button variant="outline" className="mt-4" onClick={openCreate}>
                {t('addOptic')}
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('category')}</TableHead>
                  <TableHead>{t('name')}</TableHead>
                  <TableHead>{t('brand')}</TableHead>
                  <TableHead>{t('style')}</TableHead>
                  <TableHead>{t('price')}</TableHead>
                  <TableHead className="text-right">{t('actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {optics.map((optic) => {
                  const Icon = categoryIcons[optic.category];
                  return (
                    <TableRow key={optic.id}>
                      <TableCell>
                        <span className="inline-flex items-center gap-2">
                          <Icon className="w-4 h-4 text-accent" />
                          {t(optic.category)}
                        </span>
                      </TableCell>
                      <TableCell className="font-medium">{optic.name}</TableCell>
                      <TableCell>{optic.brand}</TableCell>
                      <TableCell>{optic.style}</TableCell>
                      <TableCell>
                        {optic.price != null ? `$${Number(optic.price).toFixed(2)}` : '—'}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openEdit(optic)}
                            aria-label={t('edit')}
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
                            onClick={() => setDeleteOptic(optic)}
                            aria-label={t('delete')}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </div>
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={isFormOpen} onOpenChange={(open) => !open && (setIsFormOpen(false), setEditingOptic(null), setFormData(emptyForm))}>
        <DialogContent className="max-w-md sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingOptic ? t('editOptic') : t('addOptic')}</DialogTitle>
            <DialogDescription>{t('opticFormDescription')}</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">{t('name')} *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData((f) => ({ ...f, name: e.target.value }))}
                  placeholder="Ray-Ban RB5154"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="brand">{t('brand')} *</Label>
                <Input
                  id="brand"
                  value={formData.brand}
                  onChange={(e) => setFormData((f) => ({ ...f, brand: e.target.value }))}
                  placeholder="Ray-Ban"
                  required
                />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="style">{t('style')} *</Label>
                <Input
                  id="style"
                  value={formData.style}
                  onChange={(e) => setFormData((f) => ({ ...f, style: e.target.value }))}
                  placeholder="Clubmaster"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">{t('category')} *</Label>
                <Select
                  value={formData.category}
                  onValueChange={(v) => setFormData((f) => ({ ...f, category: v as OpticCategory }))}
                >
                  <SelectTrigger id="category">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="eyeglasses">{t('eyeglasses')}</SelectItem>
                    <SelectItem value="sunglasses">{t('sunglasses')}</SelectItem>
                    <SelectItem value="lenses">{t('lenses')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="image_url">{t('imageUrl')}</Label>
              <Input
                id="image_url"
                type="url"
                value={formData.image_url}
                onChange={(e) => setFormData((f) => ({ ...f, image_url: e.target.value }))}
                placeholder="https://..."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="price">{t('price')}</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                min="0"
                value={formData.price}
                onChange={(e) => setFormData((f) => ({ ...f, price: e.target.value }))}
                placeholder="199.99"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">{t('description')}</Label>
              <Textarea
                id="description"
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData((f) => ({ ...f, description: e.target.value }))}
                placeholder={t('description')}
              />
            </div>
            <DialogFooter className="gap-2 sm:gap-0">
              <Button type="button" variant="outline" onClick={() => setIsFormOpen(false)}>
                {t('cancel')}
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                {editingOptic ? t('save') : t('addOptic')}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <AlertDialog open={!!deleteOptic} onOpenChange={(open) => !open && setDeleteOptic(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('confirm_delete')}</AlertDialogTitle>
            <AlertDialogDescription>
              {deleteOptic && (
                <>
                  {t('deleteOpticConfirm')} <strong>{deleteOptic.name}</strong> ({deleteOptic.brand})?
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('cancel')}</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => deleteOptic && deleteMutation.mutate(deleteOptic.id)}
            >
              {t('delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Layout>
  );
};

export default OwnerDashboard;
