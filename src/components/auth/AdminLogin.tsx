import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Eye, EyeOff, Shield, ArrowLeft } from 'lucide-react';
import { useRole } from '@/hooks/useRole';
import { useUserType } from '@/hooks/useUserType';
import { getSupabaseClient } from '@/integrations/supabase/activeClient';
import { checkSessionValidity, clearAllSessionMetadata, storeSessionMetadata } from '@/utils/sessionManager';

export default function AdminLogin() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login, authState, forgotPassword } = useAuth();
  const { toast } = useToast();
  const { isAdmin, isSuperAdmin } = useRole();
  const { userType } = useUserType();

  // Check for expired sessions on mount and redirect if already authenticated
  useEffect(() => {
    const checkSession = async () => {
      if (authState.isAuthenticated && authState.user?.id) {
        // Check if session is valid
        const { isValid, reason } = checkSessionValidity(authState.user.id);
        
        if (!isValid) {
          console.log('[AdminLogin] Session invalid:', reason);
          const supabase = getSupabaseClient();
          const { data } = await supabase.auth.getSession();
          const active = data.session;
          const sameUser = active?.user?.id === authState.user.id;

          if (sameUser) {
            // Refresh metadata instead of forcing logout
            try {
              storeSessionMetadata(authState.user.id, 'admin_auth', 'looplly_team_user');
              navigate('/admin');
              return;
            } catch (e) {
              console.warn('[AdminLogin] Failed to refresh session metadata after invalid check:', e);
            }
          }

          // No active session -> sign out & notify
          await supabase.auth.signOut();
          clearAllSessionMetadata();
          toast({
            title: 'Session Expired',
            description: reason === 'inactive' 
              ? 'You were logged out due to inactivity.'
              : 'Your session has expired. Please log in again.',
            variant: 'destructive'
          });
        } else if (userType === 'looplly_team_user') {
          // Valid session, redirect to admin
          navigate('/admin');
        }
      }
    };
    
    checkSession();
  }, [authState.isAuthenticated, authState.user, userType, navigate, toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.email || !formData.password) {
      toast({
        title: 'Error',
        description: 'Please fill in all fields',
        variant: 'destructive'
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Use path-aware client for admin context (will be adminClient)
      const supabase = getSupabaseClient();
      
      // Pre-login cleanup: eradicate all stale tokens and session metadata
      await supabase.auth.signOut(); // Sign out admin session if any
      
      // Clear ALL session metadata first
      clearAllSessionMetadata();
      
      // Clear localStorage tokens (admin, regular user, Looplly custom)
      localStorage.removeItem('admin_auth');
      localStorage.removeItem('auth');
      localStorage.removeItem('looplly_auth_token');
      localStorage.removeItem('looplly_user');
      
      // Clear sessionStorage tokens (simulator)
      sessionStorage.removeItem('simulator');
      sessionStorage.removeItem('simulator_auth_token');
      sessionStorage.removeItem('simulator_user');
      
      // Pass 'looplly_team_user' to enforce team member login
      const success = await login(formData.email, formData.password, 'looplly_team_user');
      
      if (success) {
        // Check if user needs to change password
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          const { data: team } = await supabase
            .from('team_profiles')
            .select('must_change_password, temp_password_expires_at')
            .eq('user_id', session.user.id)
            .maybeSingle();
          
          if (team?.must_change_password) {
            // Redirect to admin password reset page
            navigate('/admin/reset-password');
            return;
          }
        }
        
        // Wait a moment for auth state to update, then redirect
        setTimeout(() => {
          navigate('/admin');
        }, 500);
      } else {
        // Authentication failed - wrong email or password
        toast({
          title: 'Login Failed',
          description: 'Invalid email or password',
          variant: 'destructive'
        });
      }
    } catch (error: any) {
      console.error('Admin login error:', error);
      
      // User type mismatch or other permission errors
      const errorMessage = error?.message || 'Something went wrong. Please try again.';
      
      toast({
        title: 'Access Denied',
        description: errorMessage,
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-lg border">
        <CardHeader className="text-center pb-6">
          <div className="mx-auto mb-4 w-16 h-16 bg-amber-500 rounded-2xl flex items-center justify-center">
            <Shield className="h-8 w-8 text-white" />
          </div>
          <div className="mb-2">
            <span className="inline-block px-3 py-1 bg-amber-500/20 text-amber-700 dark:text-amber-400 text-xs font-semibold rounded-full">
              🛡️ ADMIN PORTAL
            </span>
          </div>
          <CardTitle className="text-3xl font-bold">
            Team Member Login
          </CardTitle>
          <p className="text-muted-foreground">Authorized Personnel Only</p>
          <p className="text-xs text-amber-600 dark:text-amber-400 mt-2">
            This portal is for Looplly team members only
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="admin-email">Email Address</Label>
              <Input
                id="admin-email"
                type="email"
                placeholder="team@looplly.com"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="h-12"
                autoComplete="email"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="admin-password">Password</Label>
              <div className="relative">
                <Input
                  id="admin-password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  className="h-12 pr-10"
                  autoComplete="current-password"
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-12 px-3"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full h-12"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Signing In...' : 'Sign In to Admin Portal'}
            </Button>

            <div className="text-center space-y-2">
              <Button
                type="button"
                variant="ghost"
                className="text-muted-foreground"
                disabled={isSubmitting}
                onClick={async () => {
                  if (!formData.email) {
                    toast({
                      title: 'Enter Email',
                      description: 'Please enter your admin email to reset your password',
                    });
                    return;
                  }
                  
                  // Prevent double submission
                  if (isSubmitting) return;
                  
                  setIsSubmitting(true);
                  try {
                    const ok = await forgotPassword(formData.email);
                    toast({
                      title: ok ? 'Reset email sent' : 'Reset failed',
                      description: ok ? 'Check your inbox for the reset link' : 'Could not send reset email',
                      variant: ok ? 'default' : 'destructive'
                    });
                  } finally {
                    setIsSubmitting(false);
                  }
                }}
              >
                Forgot password?
              </Button>
              <Button
                type="button"
                variant="ghost"
                className="text-muted-foreground"
                onClick={() => navigate('/')}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to User Portal
              </Button>
            </div>

            <div className="mt-4 pt-4 border-t text-center">
              <p className="text-xs text-muted-foreground mb-2">
                Not a team member?
              </p>
              <a 
                href="/" 
                className="text-sm text-primary hover:underline font-medium"
              >
                ← Back to User Portal
              </a>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
