import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Eye, EyeOff, UserPlus } from 'lucide-react';
import { analytics } from '@/utils/analytics';

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
  const [showSignupPrompt, setShowSignupPrompt] = useState(false);
  const { login } = useAuth();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setShowSignupPrompt(false);
    
    if (!formData.email || !formData.password) {
      toast({
        title: 'Error',
        description: 'Please fill in all fields',
        variant: 'destructive'
      });
      return;
    }

    // Track login attempt
    analytics.trackLoginAttempt('email');

    setIsSubmitting(true);
    
    try {
      console.log('Attempting login with:', formData.email);
      const success = await login(formData.email, formData.password);
      
      if (!success) {
        // Track login failure
        analytics.trackLogin('email', false);
        
        toast({
          title: 'Login Failed',
          description: 'Invalid email or password. Please try again or create an account.',
          variant: 'destructive'
        });
        setShowSignupPrompt(true);
      } else {
        // Track login success
        analytics.trackLogin('email', true);
      }
    } catch (error: any) {
      console.error('Login component error:', error);
      
      // Track login failure
      analytics.trackLogin('email', false);
      
      toast({
        title: 'Login Error',
        description: error?.message || 'Something went wrong. Please try again.',
        variant: 'destructive'
      });
      setShowSignupPrompt(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSignupRedirect = () => {
    // Track signup redirect
    analytics.trackButtonClick('create_account_click', 'authentication', 'from_login');
    
    // Pass the email to the register form for a seamless experience
    onRegister();
  };

  const handleMockLogin = async () => {
    setIsSubmitting(true);
    try {
      const success = await login('demo@looplly.com', 'demo123');
      if (success) {
        toast({
          title: 'Demo Login Successful',
          description: 'You are now logged in with mock data',
          variant: 'default'
        });
      }
    } catch (error) {
      console.error('Mock login error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-lg bg-card border">
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
            {showSignupPrompt && (
              <Alert className="border-primary/20 bg-primary/5">
                <UserPlus className="h-4 w-4 text-primary" />
                <AlertDescription className="ml-2">
                  <div className="space-y-3">
                    <p className="text-foreground font-medium">
                      Don't have an account yet?
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Join now and start earning rewards! It only takes a minute.
                    </p>
                    <Button
                      type="button"
                      variant="mobile"
                      size="mobile"
                      className="w-full"
                      onClick={handleSignupRedirect}
                    >
                      <UserPlus className="mr-2 h-4 w-4" />
                      Create Free Account
                    </Button>
                  </div>
                </AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={(e) => {
                  setFormData({...formData, email: e.target.value});
                  setShowSignupPrompt(false);
                }}
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
                  onChange={(e) => {
                    setFormData({...formData, password: e.target.value});
                    setShowSignupPrompt(false);
                  }}
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
                onClick={() => {
                  analytics.trackButtonClick('forgot_password_click', 'authentication');
                  onForgotPassword();
                }}
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

            <div className="text-center mt-4">
              <p className="text-sm text-muted-foreground">
                New here?{' '}
                <Button
                  type="button"
                  variant="link"
                  className="p-0 h-auto text-primary font-semibold"
                  onClick={handleSignupRedirect}
                >
                  Create an account
                </Button>
              </p>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}