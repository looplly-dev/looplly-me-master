import { ReactNode, useEffect, useRef, useState } from 'react';
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
  const toastShownRef = useRef(false);
  const [showTimeout, setShowTimeout] = useState(false);

  // Show access denied toast only for non-team users trying to access admin
  useEffect(() => {
    if (!authState.isLoading && !roleLoading && !typeLoading && 
        requiredRole && (requiredRole === 'admin' || requiredRole === 'super_admin') &&
        userType !== 'looplly_team_user' &&
        !toastShownRef.current) {
      toast({
        title: 'Access Denied',
        description: 'Admin portal is restricted to Looplly team members only.',
        variant: 'destructive'
      });
      toastShownRef.current = true;
    }
  }, [authState.isLoading, roleLoading, typeLoading, requiredRole, userType, toast]);

  // Watchdog timeout: if loading for >3 seconds, show re-auth prompt
  useEffect(() => {
    const isLoading = authState.isLoading || roleLoading || typeLoading;
    
    if (import.meta.env.DEV) {
      console.info('[ProtectedRoute] Loading states:', { 
        authLoading: authState.isLoading, 
        roleLoading, 
        typeLoading 
      });
    }

    if (isLoading) {
      const timeoutId = setTimeout(() => {
        console.warn('[ProtectedRoute] Watchdog triggered: loading state timeout');
        setShowTimeout(true);
      }, 3000);

      return () => clearTimeout(timeoutId);
    } else {
      setShowTimeout(false);
    }
  }, [authState.isLoading, roleLoading, typeLoading]);

  // Show loading while checking authentication (with timeout fallback)
  if (authState.isLoading || roleLoading || typeLoading) {
    if (showTimeout) {
      // Timeout triggered - show re-auth prompt
      const isAdminRoute = requiredRole === 'admin' || requiredRole === 'super_admin';
      return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
          <Card className="max-w-md w-full">
            <CardContent className="pt-6 text-center">
              <Lock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">Authentication Timeout</h2>
              <p className="text-muted-foreground mb-6">
                Session initialization took too long. Please log in again.
              </p>
              <Button onClick={() => navigate(isAdminRoute ? '/admin/login' : '/')}>
                {isAdminRoute ? 'Admin Login' : 'Go to Login'}
              </Button>
            </CardContent>
          </Card>
        </div>
      );
    }
    
    // Still loading - show spinner
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Not authenticated
  if (!authState.isAuthenticated) {
    // If trying to access admin routes, redirect to admin login
    const isAdminRoute = requiredRole === 'admin' || requiredRole === 'super_admin';
    
    return fallback || (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center">
            <Lock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Authentication Required</h2>
            <p className="text-muted-foreground mb-6">
              {isAdminRoute 
                ? 'Please log in with your team account to access the admin portal.'
                : 'Please log in to access this content.'}
            </p>
            <Button onClick={() => navigate(isAdminRoute ? '/admin/login' : '/')}>
              {isAdminRoute ? 'Admin Login' : 'Go to Login'}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Check if user must change password and redirect (except if already on reset page)
  const mustChangePassword = authState.user?.mustChangePassword || 
                             (authState.user?.profile as any)?.must_change_password;
  
  if (mustChangePassword) {
    // Team members go to admin reset password page
    if (userType === 'looplly_team_user' && window.location.pathname !== '/admin/reset-password') {
      navigate('/admin/reset-password');
      return null;
    }
    // Regular users go to regular reset password page
    if (userType === 'looplly_user' && window.location.pathname !== '/reset-password-required') {
      navigate('/reset-password-required');
      return null;
    }
  }

  // Check if this is an admin route (being a team member is sufficient)
  // Individual admin pages can implement granular role checks if needed
  if (requiredRole && (requiredRole === 'admin' || requiredRole === 'super_admin')) {
    if (userType !== 'looplly_team_user') {
      return fallback || (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
          <Card className="max-w-md w-full">
            <CardContent className="pt-6 text-center">
              <Shield className="h-12 w-12 text-destructive mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">Team Members Only</h2>
              <p className="text-muted-foreground mb-6">
                The admin portal is restricted to Looplly team members. Please log in with your team account.
              </p>
              <Button onClick={() => navigate('/admin/login')}>
                Admin Login
              </Button>
            </CardContent>
          </Card>
        </div>
      );
    }
    // Team member verified - allow access to admin portal
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