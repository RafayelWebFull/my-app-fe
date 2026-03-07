import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Layout } from '@/components/layout/Layout';
import { LogOut, FolderTree, Tag, Glasses, Settings, Languages, Megaphone, LayoutGrid, Instagram } from 'lucide-react';
import AdminCategories from '@/components/admin/AdminCategories';
import AdminBrands from '@/components/admin/AdminBrands';
import AdminOptics from '@/components/admin/AdminOptics';
import AdminSiteSettings from '@/components/admin/AdminSiteSettings';
import AdminTranslations from '@/components/admin/AdminTranslations';
import AdminBanners from '@/components/admin/AdminBanners';
import AdminHomeCategoryCards from '@/components/admin/AdminHomeCategoryCards';
import AdminInstagramImport from '@/components/admin/AdminInstagramImport';

const AdminDashboard = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/admin/login');
  };

  return (
    <ProtectedRoute>
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-8">
            <div>
              <h1 className="font-heading text-3xl font-bold text-foreground">Admin Dashboard</h1>
              <p className="text-muted-foreground mt-1">Manage categories, brands, and products</p>
            </div>
            <Button variant="outline" onClick={handleLogout} className="gap-2 w-fit">
              <LogOut className="w-4 h-4" />
              Logout
            </Button>
          </div>

          <Tabs defaultValue="optics" className="space-y-6">
            <TabsList className="flex flex-wrap gap-1 h-auto p-1">
              <TabsTrigger value="optics" className="gap-2">
                <Glasses className="w-4 h-4" />
                Products
              </TabsTrigger>
              <TabsTrigger value="categories" className="gap-2">
                <FolderTree className="w-4 h-4" />
                Categories
              </TabsTrigger>
              <TabsTrigger value="brands" className="gap-2">
                <Tag className="w-4 h-4" />
                Brands
              </TabsTrigger>
              <TabsTrigger value="banners" className="gap-2">
                <Megaphone className="w-4 h-4" />
                Banners
              </TabsTrigger>
              <TabsTrigger value="homeCards" className="gap-2">
                <LayoutGrid className="w-4 h-4" />
                Home Cards
              </TabsTrigger>
              <TabsTrigger value="instagramImport" className="gap-2">
                <Instagram className="w-4 h-4" />
                Instagram Import
              </TabsTrigger>
              <TabsTrigger value="settings" className="gap-2">
                <Settings className="w-4 h-4" />
                Site
              </TabsTrigger>
              <TabsTrigger value="translations" className="gap-2">
                <Languages className="w-4 h-4" />
                Translations
              </TabsTrigger>
            </TabsList>

            <TabsContent value="optics">
              <AdminOptics />
            </TabsContent>
            <TabsContent value="categories">
              <AdminCategories />
            </TabsContent>
            <TabsContent value="brands">
              <AdminBrands />
            </TabsContent>
            <TabsContent value="banners">
              <AdminBanners />
            </TabsContent>
            <TabsContent value="homeCards">
              <AdminHomeCategoryCards />
            </TabsContent>
            <TabsContent value="instagramImport">
              <AdminInstagramImport />
            </TabsContent>
            <TabsContent value="settings">
              <AdminSiteSettings />
            </TabsContent>
            <TabsContent value="translations">
              <AdminTranslations />
            </TabsContent>
          </Tabs>
        </div>
      </Layout>
    </ProtectedRoute>
  );
};

export default AdminDashboard;
