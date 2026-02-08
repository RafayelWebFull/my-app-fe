import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Eye, ShoppingCart } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useCart } from '@/contexts/CartContext';
import { Button } from '@/components/ui/button';
import { CartSheet } from '@/components/cart/CartSheet';

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const { totalItems } = useCart();
  const { language, setLanguage, t } = useLanguage();
  const location = useLocation();

  const navItems = [
    { key: 'home', path: '/' },
    { key: 'products', path: '/products' },
    { key: 'about', path: '/about' },
    { key: 'contact', path: '/contact' },
  ];

  const languages = [
    { code: 'en' as const, label: 'Eng' },
    { code: 'ru' as const, label: 'Рус' },
    { code: 'hy' as const, label: 'Հայ' },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-card/80 backdrop-blur-lg border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-full gradient-hero flex items-center justify-center">
              <Eye className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-heading font-semibold text-xl text-foreground">
              Optic Gallery
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            {navItems.map((item) => (
              <Link
                key={item.key}
                to={item.path}
                className={`relative font-medium transition-colors hover:text-accent ${
                  isActive(item.path) ? 'text-accent' : 'text-foreground'
                }`}
              >
                {t(item.key)}
                {isActive(item.path) && (
                  <motion.div
                    layoutId="activeNav"
                    className="absolute -bottom-1 left-0 right-0 h-0.5 bg-accent rounded-full"
                  />
                )}
              </Link>
            ))}
          </nav>

          {/* Cart & Language Switcher & Mobile Menu */}
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setCartOpen(true)}
              className="relative"
            >
              <ShoppingCart className="w-5 h-5" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-accent text-accent-foreground text-xs font-bold flex items-center justify-center">
                  {totalItems > 99 ? '99+' : totalItems}
                </span>
              )}
            </Button>
            <div className="hidden sm:flex items-center gap-1 bg-secondary rounded-full p-1">
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => setLanguage(lang.code)}
                  className={`px-3 py-1 text-sm font-medium rounded-full transition-all ${
                    language === lang.code
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {lang.label}
                </button>
              ))}
            </div>

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-card border-b border-border"
          >
            <nav className="container mx-auto px-4 py-4 flex flex-col gap-2">
              {navItems.map((item) => (
                <Link
                  key={item.key}
                  to={item.path}
                  onClick={() => setIsMenuOpen(false)}
                  className={`px-4 py-3 rounded-lg font-medium transition-colors ${
                    isActive(item.path)
                      ? 'bg-primary text-primary-foreground'
                      : 'text-foreground hover:bg-secondary'
                  }`}
                >
                  {t(item.key)}
                </Link>
              ))}
              
              <div className="flex items-center gap-1 mt-4 bg-secondary rounded-full p-1 w-fit">
                {languages.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => setLanguage(lang.code)}
                    className={`px-3 py-1 text-sm font-medium rounded-full transition-all ${
                      language === lang.code
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {lang.label}
                  </button>
                ))}
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>

      <CartSheet open={cartOpen} onOpenChange={setCartOpen} />
    </header>
  );
}
