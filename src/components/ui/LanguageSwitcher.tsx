import React from 'react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { GlobeIcon } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

const LanguageSwitcher: React.FC = () => {
  const { language, setLanguage, loading } = useLanguage();

  const getLanguageLabel = (lang: string) => {
    switch (lang) {
      case 'en': return 'English';
      case 'ru': return 'Русский';
      case 'hy': return 'Հայերեն';
      default: return 'English';
    }
  };

  const getLanguageFlag = (lang: string) => {
    switch (lang) {
      case 'en': return '🇺🇸';
      case 'ru': return '🇷🇺';
      case 'hy': return '🇦🇲';
      default: return '🌐';
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" disabled={loading} className="flex items-center gap-2">
          <GlobeIcon className="h-4 w-4" />
          <span>{getLanguageFlag(language)} {getLanguageLabel(language)}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setLanguage('en')} className="flex items-center gap-2">
          <span>🇺🇸</span>
          <span>English</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setLanguage('ru')} className="flex items-center gap-2">
          <span>🇷🇺</span>
          <span>Русский</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setLanguage('hy')} className="flex items-center gap-2">
          <span>🇦🇲</span>
          <span>Հայերեն</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default LanguageSwitcher;