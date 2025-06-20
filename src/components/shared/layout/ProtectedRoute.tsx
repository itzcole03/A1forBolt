import { Navigate, useLocation } from 'react-router-dom';
import { useStore } from '@/store';
import { authService } from '@/services/auth';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const location = useLocation();
  const { user } = useStore();

  if (!authService.isAuthenticated() || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
} 