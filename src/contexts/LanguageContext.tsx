import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Types for our languages and translations
export type Language = 'en' | 'ru' | 'hy';

interface BackendTranslations {
  [key: string]: string;
}

interface FrontendTranslations {
  [key: string]: {
    en: string;
    ru: string;
  };
}

// Default frontend translations (fallback)
const defaultTranslations: FrontendTranslations = {
  // Navigation
  home: { en: 'Home', ru: 'Главная' },
  products: { en: 'Products', ru: 'Продукция' },
  about: { en: 'About', ru: 'О нас' },
  contact: { en: 'Contact', ru: 'Контакты' },

  // Common UI
  welcome: { en: 'Welcome', ru: 'Добро пожаловать' },
  login: { en: 'Login', ru: 'Войти' },
  register: { en: 'Register', ru: 'Регистрация' },
  logout: { en: 'Logout', ru: 'Выйти' },
  dashboard: { en: 'Dashboard', ru: 'Панель управления' },
  settings: { en: 'Settings', ru: 'Настройки' },
  profile: { en: 'Profile', ru: 'Профиль' },
  username: { en: 'Username', ru: 'Имя пользователя' },
  password: { en: 'Password', ru: 'Пароль' },
  email: { en: 'Email', ru: 'Электронная почта' },
  submit: { en: 'Submit', ru: 'Отправить' },
  cancel: { en: 'Cancel', ru: 'Отмена' },
  save: { en: 'Save', ru: 'Сохранить' },
  delete: { en: 'Delete', ru: 'Удалить' },
  edit: { en: 'Edit', ru: 'Редактировать' },
  view: { en: 'View', ru: 'Просмотр' },
  search: { en: 'Search', ru: 'Поиск' },
  results: { en: 'Results', ru: 'Результаты' },
  no_results: { en: 'No results found', ru: 'Ничего не найдено' },
  loading: { en: 'Loading...', ru: 'Загрузка...' },
  error: { en: 'Error', ru: 'Ошибка' },
  success: { en: 'Success', ru: 'Успешно' },
  please_wait: { en: 'Please wait...', ru: 'Подождите...' },
  confirm_delete: { en: 'Are you sure you want to delete?', ru: 'Вы уверены, что хотите удалить?' },
  yes: { en: 'Yes', ru: 'Да' },
  no: { en: 'No', ru: 'Нет' },
  close: { en: 'Close', ru: 'Закрыть' },
  open: { en: 'Open', ru: 'Открыть' },

  // Owner Dashboard & Optics
  ownerDashboard: { en: 'Owner Dashboard', ru: 'Панель владельца' },
  manageOptics: { en: 'Manage optical products', ru: 'Управление оптикой' },
  addOptic: { en: 'Add product', ru: 'Добавить товар' },
  editOptic: { en: 'Edit product', ru: 'Редактировать товар' },
  filterCategory: { en: 'Category', ru: 'Категория' },
  all: { en: 'All', ru: 'Все' },
  category: { en: 'Category', ru: 'Категория' },
  name: { en: 'Name', ru: 'Название' },
  brand: { en: 'Brand', ru: 'Бренд' },
  style: { en: 'Style', ru: 'Стиль' },
  price: { en: 'Price', ru: 'Цена' },
  actions: { en: 'Actions', ru: 'Действия' },
  imageUrl: { en: 'Image URL', ru: 'URL изображения' },
  description: { en: 'Description', ru: 'Описание' },
  opticFormDescription: { en: 'Add or edit an optical product', ru: 'Добавить или изменить оптический товар' },
  deleteOpticConfirm: { en: 'This will permanently delete', ru: 'Будет удалено навсегда' },
  eyeglasses: { en: 'Eyeglasses', ru: 'Очки' },
  optic: { en: 'Optic / Eyeglasses', ru: 'Оптика / Очки' },
  sunglasses: { en: 'Sunglasses', ru: 'Солнцезащитные очки' },
  lenses: { en: 'Contact Lenses', ru: 'Контактные линзы' },
  newArrivals: { en: 'New Arrivals', ru: 'Новинки' },
  discountOff: { en: 'OFF', ru: 'СКИДКА', hy: 'ԶԻՆՉՈՒՄ' },
  bannerValidFrom: { en: 'Valid from', ru: 'Действует с', hy: 'Գործում է' },
  bannerValidTo: { en: 'to', ru: 'по', hy: 'մինչև' },
  // Cart & Checkout
  cart: { en: 'Cart', ru: 'Корзина', hy: 'Զամբյուղ' },
  cartEmpty: { en: 'Your cart is empty', ru: 'Корзина пуста', hy: 'Զամբյուղը դատարկ է' },
  addToCart: { en: 'Add to cart', ru: 'В корзину', hy: 'Ավելացնել զամբյուղ' },
  addedToCart: { en: 'Added to cart', ru: 'Добавлено в корзину', hy: 'Ավելացվել է զամբյուղ' },
  subtotal: { en: 'Subtotal', ru: 'Подытог', hy: 'Ենթագումար' },
  checkout: { en: 'Checkout', ru: 'Оформить', hy: 'Վճարել' },
  viewCart: { en: 'View cart', ru: 'Корзина', hy: 'Զամբյուղ' },
  yourCart: { en: 'Your cart', ru: 'Ваша корзина', hy: 'Ձեր զամբյուղը' },
  proceedToCheckout: { en: 'Proceed to checkout', ru: 'Перейти к оплате', hy: 'Անցնել վճարման' },
  deliveryDetails: { en: 'Delivery details', ru: 'Данные доставки', hy: 'Առաքման տվյալներ' },
  fullName: { en: 'Full name', ru: 'ФИО', hy: 'Ամբողջական անուն' },
  phone: { en: 'Phone', ru: 'Телефон', hy: 'Հեռախոս' },
  deliveryAddress: { en: 'Delivery address', ru: 'Адрес доставки', hy: 'Առաքման հասցե' },
  notes: { en: 'Notes (optional)', ru: 'Примечание (необязательно)', hy: 'Ծանոթագրություն (ընտրովի)' },
  placeOrder: { en: 'Place order', ru: 'Оформить заказ', hy: 'Կատարել պատվեր' },
  orderSuccess: { en: 'Order placed successfully!', ru: 'Заказ оформлен!', hy: 'Պատվերը կատարվել է!' },
  continueShopping: { en: 'Continue shopping', ru: 'Продолжить покупки', hy: 'Շարունակել գնումները' },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  loading: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>('ru');
  const [backendTranslations, setBackendTranslations] = useState<BackendTranslations>({});
  const [loading, setLoading] = useState<boolean>(true);

  // Load language from localStorage on initial render
  useEffect(() => {
    const savedLanguage = localStorage.getItem('language') as Language | null;
    if (savedLanguage && ['en', 'ru'].includes(savedLanguage)) {
      setLanguageState(savedLanguage);
    } else {
      // Try to detect browser language
      const browserLang = navigator.language.substring(0, 2) as Language;
      if (['en', 'ru'].includes(browserLang)) {
        setLanguageState(browserLang);
      }
    }
  }, []);

  // Fetch translations from backend when language changes
  useEffect(() => {
    const fetchTranslations = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/translations/${language}`);
        if (response.ok) {
          const data = await response.json();
          setBackendTranslations(data.translations || {});
        } else {
          console.warn(`Failed to fetch translations for ${language}, using defaults`);
          setBackendTranslations({});
        }
      } catch (error) {
        console.error('Error fetching translations:', error);
        setBackendTranslations({});
      } finally {
        setLoading(false);
      }
    };

    fetchTranslations();
    
    // Save language preference to localStorage
    localStorage.setItem('language', language);
  }, [language]);

  const setLanguage = (lang: Language) => {
    // Update language and trigger backend API call to persist the change
    setLanguageState(lang);
    
    // Optionally notify backend about language change
    fetch(`/lang/${lang}`, { 
      method: 'GET',
      credentials: 'same-origin'
    }).catch(console.error); // Don't block on this
  };

  const t = (key: string): string => {
    // First try to get translation from backend
    if (backendTranslations && backendTranslations[key]) {
      return backendTranslations[key];
    }
    
    // Fall back to frontend translations
    return defaultTranslations[key]?.[language] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, loading }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}