import { useEffect, useMemo, useState } from 'react';
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
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { apiUrl } from '@/lib/api';
import { useLanguage } from '@/contexts/LanguageContext';

const LANGS = [
  { code: 'en', label: 'English' },
  { code: 'ru', label: 'Russian' },
  { code: 'hy', label: 'Armenian' },
] as const;

type LangCode = (typeof LANGS)[number]['code'];
type TranslationValues = Record<LangCode, string>;

const EMPTY_VALUES: TranslationValues = { en: '', ru: '', hy: '' };

export default function AdminTranslations() {
  const queryClient = useQueryClient();
  const { language: currentLang, refreshTranslations } = useLanguage();
  const [selectedKey, setSelectedKey] = useState<string>('');
  const [newKeyInput, setNewKeyInput] = useState('');
  const [values, setValues] = useState<TranslationValues>(EMPTY_VALUES);

  const { data: keys = [] as string[], isLoading: keysLoading } = useQuery({
    queryKey: ['translation-keys'],
    queryFn: async () => {
      const res = await fetch(apiUrl('/api/admin/translations/keys'), { credentials: 'include' });
      if (!res.ok) throw new Error('Failed');
      return res.json();
    },
  });

  const { data: enTranslations = {}, isLoading: enLoading } = useQuery({
    queryKey: ['admin-translations', 'en'],
    queryFn: async () => {
      const res = await fetch(apiUrl('/api/admin/translations/en'), { credentials: 'include' });
      if (!res.ok) throw new Error('Failed');
      return res.json();
    },
  });

  const { data: ruTranslations = {}, isLoading: ruLoading } = useQuery({
    queryKey: ['admin-translations', 'ru'],
    queryFn: async () => {
      const res = await fetch(apiUrl('/api/admin/translations/ru'), { credentials: 'include' });
      if (!res.ok) throw new Error('Failed');
      return res.json();
    },
  });

  const { data: hyTranslations = {}, isLoading: hyLoading } = useQuery({
    queryKey: ['admin-translations', 'hy'],
    queryFn: async () => {
      const res = await fetch(apiUrl('/api/admin/translations/hy'), { credentials: 'include' });
      if (!res.ok) throw new Error('Failed');
      return res.json();
    },
  });

  const translationsByLang = useMemo(
    () => ({ en: enTranslations, ru: ruTranslations, hy: hyTranslations }),
    [enTranslations, ruTranslations, hyTranslations]
  );

  const transLoading = enLoading || ruLoading || hyLoading;

  const updateMu = useMutation({
    mutationFn: async ({ key, values }: { key: string; values: TranslationValues }) => {
      const requests = LANGS.map(async ({ code }) => {
        const res = await fetch(apiUrl(`/api/admin/translations/${key}/${code}`), {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ value: values[code] ?? '' }),
        });
        if (!res.ok) throw new Error(`Failed ${code}`);
      });
      await Promise.all(requests);
    },
    onSuccess: async () => {
      await Promise.all(
        LANGS.map(({ code }) =>
          queryClient.invalidateQueries({ queryKey: ['admin-translations', code] })
        )
      );
      queryClient.invalidateQueries({ queryKey: ['optics'] });
      queryClient.invalidateQueries({ queryKey: ['translation-keys'] });
      await refreshTranslations(currentLang);
      toast.success('Translations saved for all languages');
    },
    onError: () => toast.error('Failed to save translations'),
  });

  const fillValuesForKey = (key: string): TranslationValues => ({
    en: translationsByLang.en[key] || '',
    ru: translationsByLang.ru[key] || '',
    hy: translationsByLang.hy[key] || '',
  });

  const handleKeySelect = (key: string) => {
    setSelectedKey(key);
    setNewKeyInput('');
    setValues(fillValuesForKey(key));
  };

  const handleNewKeyChange = (v: string) => {
    setNewKeyInput(v);
    if (v) {
      setSelectedKey('');
      setValues(EMPTY_VALUES);
      return;
    }
    if (selectedKey) setValues(fillValuesForKey(selectedKey));
  };

  const handleValueChange = (lang: LangCode, value: string) => {
    setValues((prev) => ({ ...prev, [lang]: value }));
  };

  const activeKey = newKeyInput.trim() || selectedKey;

  useEffect(() => {
    if (!selectedKey) return;
    setValues(fillValuesForKey(selectedKey));
  }, [selectedKey, translationsByLang]);

  const handleSave = () => {
    if (!activeKey) return;
    updateMu.mutate({ key: activeKey, values });
    if (newKeyInput.trim()) {
      setNewKeyInput('');
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
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

      {activeKey && (
        <div className="space-y-4">
          {LANGS.map((lang) => (
            <div key={lang.code} className="space-y-2">
              <Label>
                {lang.label} value for &quot;{activeKey}&quot;
              </Label>
              <Textarea
                value={values[lang.code]}
                onChange={(e) => handleValueChange(lang.code, e.target.value)}
                rows={3}
                placeholder={`Enter ${lang.label.toLowerCase()} translation`}
                disabled={transLoading}
              />
            </div>
          ))}

          <Button onClick={handleSave} disabled={updateMu.isPending || keysLoading}>
            {updateMu.isPending && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
            Save all languages
          </Button>
        </div>
      )}

      <p className="text-sm text-muted-foreground">
        Edit translations for brands, categories, and all site text. Changes apply to Home, About, Contact, and product pages.
      </p>
    </div>
  );
}
