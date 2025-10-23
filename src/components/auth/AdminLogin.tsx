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

export default function AdminLogin() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login, authState } = useAuth();
  const { toast } = useToast();
  const { isAdmin, isSuperAdmin } = useRole();
  const { userType } = useUserType();

  // Redirect if already logged in as team member
  useEffect(() => {
    if (authState.isAuthenticated && 
        userType === 'looplly_team_user' && 
        (isAdmin() || isSuperAdmin())) {
      navigate('/admin');
    }
  }, [authState.isAuthenticated, userType, isAdmin, isSuperAdmin, navigate]);

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
      const success = await login(formData.email, formData.password);
      
      if (success) {
        // Wait a moment for auth state to update, then redirect
        setTimeout(() => {
          navigate('/admin');
        }, 500);
      } else {
        toast({
          title: 'Access Denied',
          description: 'Invalid credentials or insufficient permissions',
          variant: 'destructive'
        });
      }
    } catch (error: any) {
      console.error('Admin login error:', error);
      
      toast({
        title: 'Login Error',
        description: error?.message || 'Something went wrong. Please try again.',
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
          <div className="mx-auto mb-4 w-16 h-16 bg-primary rounded-2xl flex items-center justify-center">
            <Shield className="h-8 w-8 text-primary-foreground" />
          </div>
          <CardTitle className="text-3xl font-bold">
            Admin Portal
          </CardTitle>
          <p className="text-muted-foreground">Team Members Only</p>
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

            <div className="text-center">
              <Button
                type="button"
                variant="ghost"
                className="text-muted-foreground"
                onClick={() => navigate('/')}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Main Site
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
