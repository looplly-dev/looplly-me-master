import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Mail, CheckCircle, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { getSupabaseClient } from '@/integrations/supabase/activeClient';

export default function EmailVerification() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [email, setEmail] = useState<string>('');
  const [resending, setResending] = useState(false);

  useEffect(() => {
    // Get the email from sessionStorage
    const pendingEmail = sessionStorage.getItem('pending_email_verification');
    if (pendingEmail) {
      setEmail(pendingEmail);
    } else {
      // If no email found, redirect to register
      navigate('/register');
    }
  }, [navigate]);

  const handleResendEmail = async () => {
    if (!email) return;

    setResending(true);
    try {
      const supabase = getSupabaseClient();
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email,
      });

      if (error) {
        toast({
          title: 'Error',
          description: error.message,
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Email sent!',
          description: 'Check your inbox for the verification link.',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to resend verification email. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setResending(false);
    }
  };

  const handleGoToLogin = () => {
    sessionStorage.removeItem('pending_email_verification');
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-lg bg-card border">
        <CardHeader className="text-center pb-6">
          <div className="mx-auto mb-4 w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center">
            <Mail className="h-10 w-10 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold text-primary">
            Check Your Email
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center space-y-4">
            <p className="text-muted-foreground">
              We've sent a verification link to:
            </p>
            <p className="font-semibold text-lg break-all">{email}</p>
          </div>

          <div className="bg-muted/50 rounded-lg p-4 space-y-3">
            <div className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
              <div className="text-sm">
                <p className="font-medium">Click the verification link</p>
                <p className="text-muted-foreground">
                  Open your email and click the link to verify your account
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
              <div className="text-sm">
                <p className="font-medium">Return to login</p>
                <p className="text-muted-foreground">
                  After verification, you can log in with your credentials
                </p>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-blue-900 dark:text-blue-100">
                <p className="font-medium mb-1">Didn't receive the email?</p>
                <ul className="list-disc list-inside space-y-1 text-blue-800 dark:text-blue-200">
                  <li>Check your spam or junk folder</li>
                  <li>Make sure you entered the correct email</li>
                  <li>Wait a few minutes and try resending</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <Button
              onClick={handleResendEmail}
              variant="outline"
              className="w-full"
              disabled={resending}
            >
              {resending ? 'Sending...' : 'Resend Verification Email'}
            </Button>
            <Button
              onClick={handleGoToLogin}
              variant="default"
              className="w-full"
            >
              Go to Login
            </Button>
          </div>

          <p className="text-xs text-center text-muted-foreground">
            Need help? Contact us at{' '}
            <a href="mailto:support@looplly.com" className="text-primary hover:underline">
              support@looplly.com
            </a>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
