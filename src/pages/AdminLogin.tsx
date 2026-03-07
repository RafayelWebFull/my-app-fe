import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Eye, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useSeo } from '@/lib/seo';

const AdminLogin = () => {
  useSeo({
    title: 'Admin Login',
    description: 'Admin login page.',
    path: '/admin/login',
    robots: 'noindex, nofollow',
  });

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: string })?.from || '/admin';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password) {
      toast.error('Enter username and password');
      return;
    }
    setLoading(true);
    try {
      await login(username, password);
      navigate(from, { replace: true });
      toast.success('Welcome back!');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-secondary/30 px-4">
      <div className="w-full max-w-md">
        <div className="bg-card rounded-2xl shadow-elevated p-8 border">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 rounded-full gradient-hero flex items-center justify-center">
              <Eye className="w-8 h-8 text-primary-foreground" />
            </div>
          </div>
          <h1 className="font-heading text-2xl font-bold text-center text-foreground mb-2">
            Admin Login
          </h1>
          <p className="text-muted-foreground text-center text-sm mb-6">
            Sign in to manage your store
          </p>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="admin"
                autoComplete="username"
                autoFocus
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="current-password"
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
              Sign In
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
