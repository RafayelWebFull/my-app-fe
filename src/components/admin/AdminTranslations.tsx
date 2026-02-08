import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
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
import { Loader2, Languages } from 'lucide-react';
import { toast } from 'sonner';
import { apiUrl } from '@/lib/api';

const LANGS = [
  { code: 'en', label: 'English' },
  { code: 'ru', label: 'Russian' },
  { code: 'hy', label: 'Armenian' },
];

export default function AdminTranslations() {
  const queryClient = useQueryClient();
  const [lang, setLang] = useState('en');
  const [selectedKey, setSelectedKey] = useState<string>('');
  const [newKeyInput, setNewKeyInput] = useState('');
  const [value, setValue] = useState('');

  const { data: keys = [], isLoading: keysLoading } = useQuery({
    queryKey: ['translation-keys'],
    queryFn: async () => {
      const res = await fetch(apiUrl('/api/admin/translations/keys'), { credentials: 'include' });
      if (!res.ok) throw new Error('Failed');
      return res.json();
    },
  });

  const { data: translations = {}, isLoading: transLoading } = useQuery({
    queryKey: ['admin-translations', lang],
    queryFn: async () => {
      const res = await fetch(apiUrl(`/api/admin/translations/${lang}`), { credentials: 'include' });
      if (!res.ok) throw new Error('Failed');
      return res.json();
    },
  });

  const updateMu = useMutation({
    mutationFn: async ({ key, lang, value }: { key: string; lang: string; value: string }) => {
      const res = await fetch(apiUrl(`/api/admin/translations/${key}/${lang}`), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ value }),
      });
      if (!res.ok) throw new Error('Failed');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-translations', lang] });
      queryClient.invalidateQueries({ queryKey: ['optics'] });
      toast.success('Translation saved');
    },
    onError: () => toast.error('Failed to save'),
  });

  const handleKeySelect = (key: string) => {
    setSelectedKey(key);
    setNewKeyInput('');
    setValue(translations[key] || '');
  };

  const handleNewKeyChange = (v: string) => {
    setNewKeyInput(v);
    if (v) setSelectedKey('');
  };

  const activeKey = newKeyInput.trim() || selectedKey;

  const handleSave = () => {
    if (!activeKey) return;
    updateMu.mutate({ key: activeKey, lang, value });
    if (newKeyInput.trim()) {
      queryClient.invalidateQueries({ queryKey: ['translation-keys'] });
      setNewKeyInput('');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <Label>Language</Label>
          <Select value={lang} onValueChange={(v) => { setLang(v); setSelectedKey(''); setValue(''); }}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {LANGS.map((l) => (
                <SelectItem key={l.code} value={l.code}>
                  {l.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex-[2] space-y-2">
          <Label>Translation Key</Label>
          <Select value={selectedKey || undefined} onValueChange={handleKeySelect}>
            <SelectTrigger>
              <SelectValue placeholder="Select key..." />
            </SelectTrigger>
            <SelectContent>
              {keys.map((k) => (
                <SelectItem key={k} value={k}>
                  {k}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input
            placeholder="Or type new key (e.g. category_sport)"
            value={newKeyInput}
            onChange={(e) => handleNewKeyChange(e.target.value)}
            className="mt-1"
          />
        </div>
      </div>

      {activeKey && (
        <div className="space-y-2">
          <Label>Value for &quot;{activeKey}&quot;</Label>
          <Textarea
            value={value}
            onChange={(e) => setValue(e.target.value)}
            rows={3}
            placeholder="Enter translation"
          />
          <Button onClick={handleSave} disabled={updateMu.isPending}>
            {updateMu.isPending && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
            Save
          </Button>
        </div>
      )}

      <p className="text-sm text-muted-foreground">
        Edit translations for brands, categories, and all site text. Changes apply to Home, About, Contact, and product pages.
      </p>
    </div>
  );
}
