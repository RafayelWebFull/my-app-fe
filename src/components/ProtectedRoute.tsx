import { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

export function ProtectedRoute({ children, requireAdmin = true }: ProtectedRouteProps) {
  const { user, loading, checkAuth } = useAuth();
  const location = useLocation();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    let active = true;
    if (user) {
      setChecked(true);
      return () => {
        active = false;
      };
    }
    checkAuth().finally(() => {
      if (active) setChecked(true);
    });
    return () => {
      active = false;
    };
  }, [user, checkAuth]);

  if (loading || !checked) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/admin/login" state={{ from: location.pathname }} replace />;
  }

  if (requireAdmin && user.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
