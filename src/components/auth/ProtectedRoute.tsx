import { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useRole, UserRole } from '@/hooks/useRole';
import { useUserType } from '@/hooks/useUserType';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Shield, Lock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole?: UserRole;
  fallback?: ReactNode;
}

export default function ProtectedRoute({ 
  children, 
  requiredRole = 'user',
  fallback 
}: ProtectedRouteProps) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { authState } = useAuth();
  const { hasRole, isLoading: roleLoading, isAdmin, isSuperAdmin } = useRole();
  const { userType, isLoading: typeLoading } = useUserType();

  // Show loading while checking authentication
  if (authState.isLoading || roleLoading || typeLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Not authenticated
  if (!authState.isAuthenticated) {
    return fallback || (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center">
            <Lock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Authentication Required</h2>
            <p className="text-muted-foreground mb-6">
              Please log in to access this content.
            </p>
            <Button onClick={() => navigate('/')}>
              Go to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Check if user must change password and redirect (except if already on reset page)
  if (authState.user?.profile && 
      (authState.user.profile as any).must_change_password && 
      window.location.pathname !== '/reset-password-required') {
    navigate('/reset-password-required');
    return null;
  }

  // Check if this is an admin route (requires both team member status AND admin role)
  if (requiredRole && (requiredRole === 'admin' || requiredRole === 'super_admin')) {
    if (userType !== 'looplly_team_user' || (!isAdmin() && !isSuperAdmin())) {
      toast({
        title: 'Access Denied',
        description: 'Admin portal is restricted to Looplly team members only.',
        variant: 'destructive'
      });
      return fallback || (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
          <Card className="max-w-md w-full">
            <CardContent className="pt-6 text-center">
              <Shield className="h-12 w-12 text-destructive mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">Team Members Only</h2>
              <p className="text-muted-foreground mb-6">
                The admin portal is restricted to Looplly team members.
              </p>
              <Button variant="secondary" onClick={() => navigate('/dashboard')}>
                Go to Dashboard
              </Button>
            </CardContent>
          </Card>
        </div>
      );
    }
  }

  // Insufficient permissions (using hierarchical role check)
  if (requiredRole && !hasRole(requiredRole)) {
    return fallback || (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center">
            <Shield className="h-12 w-12 text-destructive mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
            <p className="text-muted-foreground mb-2">
              You don't have permission to access this content.
            </p>
            <p className="text-sm text-muted-foreground mb-6">
              Required role: <span className="font-mono">{requiredRole}</span>
            </p>
            <Button variant="secondary" onClick={() => navigate('/dashboard')}>
              Go to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
}