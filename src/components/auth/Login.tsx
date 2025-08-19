import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Eye, EyeOff } from 'lucide-react';

interface LoginProps {
  onForgotPassword: () => void;
  onRegister: () => void;
}

export default function Login({ onForgotPassword, onRegister }: LoginProps) {
  
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = useAuth();
  const { toast } = useToast();

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
      console.log('Attempting login with:', formData.email);
      const success = await login(formData.email, formData.password);
      
      if (!success) {
        toast({
          title: 'Login Failed',
          description: 'Invalid email or password',
          variant: 'destructive'
        });
      }
    } catch (error: any) {
      console.error('Login component error:', error);
      toast({
        title: 'Error',
        description: error?.message || 'Something went wrong. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-2xl border-0 bg-card/95 backdrop-blur-sm">
        <CardHeader className="text-center pb-6">
          <div className="mx-auto mb-4 w-16 h-16 bg-primary rounded-2xl flex items-center justify-center">
            <span className="text-2xl font-bold text-white">L</span>
          </div>
          <CardTitle className="text-3xl font-bold text-primary">
            Welcome back
          </CardTitle>
          <p className="text-muted-foreground">Sign in to continue earning</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="h-12"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  className="h-12 pr-10"
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

            <div className="text-right">
              <Button
                type="button"
                variant="link"
                className="p-0 h-auto text-primary"
                onClick={onForgotPassword}
              >
                Forgot Password?
              </Button>
            </div>

            <Button 
              type="submit" 
              variant="mobile" 
              size="mobile" 
              className="w-full"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Signing In...' : 'Sign In'}
            </Button>

            {/* Mock Login Button for Testing */}
            <Button 
              type="button"
              variant="outline" 
              size="mobile" 
              className="w-full border-dashed"
              onClick={async () => {
                setIsSubmitting(true);
                try {
                  // Mock successful login
                  const mockUser = {
                    id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', // Valid UUID
                    email: 'demo@example.com',
                    user_metadata: {
                      name: 'Demo User',
                      avatar_url: null
                    }
                  };
                  
                  // Store mock user in localStorage for persistence
                  localStorage.setItem('mock_auth_user', JSON.stringify(mockUser));
                  localStorage.setItem('mock_auth_session', JSON.stringify({
                    access_token: 'mock-token',
                    user: mockUser
                  }));
                  
                  // Reload to trigger auth state change
                  window.location.reload();
                  
                  toast({
                    title: 'Success',
                    description: 'Logged in with mock data',
                  });
                } catch (error) {
                  console.error('Mock login error:', error);
                } finally {
                  setIsSubmitting(false);
                }
              }}
              disabled={isSubmitting}
            >
              🎭 Demo Login (Mock Data)
            </Button>

            <div className="text-center">
              <span className="text-muted-foreground">Don't have an account? </span>
              <Button
                type="button"
                variant="link"
                className="p-0 h-auto text-primary font-semibold"
                onClick={onRegister}
              >
                Create Account
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}