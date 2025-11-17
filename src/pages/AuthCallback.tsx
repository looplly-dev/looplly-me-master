import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { getSupabaseClient } from '@/integrations/supabase/activeClient';

export default function AuthCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState<string>('');

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const supabase = getSupabaseClient();
        
        // Supabase handles the token exchange automatically
        // We just need to check if there's a session
        const { data: { session }, error } = await supabase.auth.getSession();

        if (error) {
          console.error('Session error:', error);
          setStatus('error');
          setErrorMessage(error.message || 'Verification failed. The link may have expired.');
          return;
        }

        if (session) {
          // User is verified and logged in
          setStatus('success');
          
          // Redirect to dashboard/profile after 2 seconds
          setTimeout(() => {
            navigate('/earn');
          }, 2000);
        } else {
          // No session means verification didn't work
          setStatus('error');
          setErrorMessage('Verification failed. The link may have expired or is invalid.');
        }
      } catch (error: any) {
        console.error('Callback error:', error);
        setStatus('error');
        setErrorMessage('An unexpected error occurred. Please try again.');
      }
    };

    handleCallback();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-lg bg-card border">
        <CardHeader className="text-center pb-6">
          {status === 'loading' && (
            <div className="mx-auto mb-4 w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center">
              <Loader2 className="h-10 w-10 text-primary animate-spin" />
            </div>
          )}
          {status === 'success' && (
            <div className="mx-auto mb-4 w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center">
              <CheckCircle className="h-10 w-10 text-green-500" />
            </div>
          )}
          {status === 'error' && (
            <div className="mx-auto mb-4 w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center">
              <XCircle className="h-10 w-10 text-red-500" />
            </div>
          )}
          
          <CardTitle className="text-2xl font-bold text-primary">
            {status === 'loading' && 'Verifying Your Email...'}
            {status === 'success' && 'Email Verified!'}
            {status === 'error' && 'Verification Failed'}
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {status === 'loading' && (
            <div className="text-center">
              <p className="text-muted-foreground">
                Please wait while we verify your email address...
              </p>
            </div>
          )}

          {status === 'success' && (
            <div className="space-y-4">
              <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900 rounded-lg p-4">
                <p className="text-green-900 dark:text-green-100 text-center">
                  Your email has been successfully verified! Welcome to Looplly.
                </p>
              </div>
              
              <p className="text-sm text-center text-muted-foreground">
                Redirecting you to your dashboard in 2 seconds...
              </p>
              
              <Button
                onClick={() => navigate('/earn')}
                className="w-full"
              >
                Go to Dashboard Now
              </Button>
            </div>
          )}

          {status === 'error' && (
            <div className="space-y-4">
              <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 rounded-lg p-4">
                <p className="text-red-900 dark:text-red-100 text-sm">
                  {errorMessage}
                </p>
              </div>
              
              <div className="space-y-3">
                <Button
                  onClick={() => navigate('/verify-email')}
                  variant="default"
                  className="w-full"
                >
                  Resend Verification Email
                </Button>
                <Button
                  onClick={() => navigate('/register')}
                  variant="outline"
                  className="w-full"
                >
                  Back to Registration
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
