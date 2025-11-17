import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

export default function AuthCallback() {
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    console.log('AuthCallback component mounted');
  }, []);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        
        // Check if there's an access_token in the URL hash (Supabase uses hash-based auth)
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const accessToken = hashParams.get('access_token');
        const refreshToken = hashParams.get('refresh_token');
        const type = hashParams.get('type');
        
        console.log('Auth callback - Type:', type, 'Has tokens:', !!accessToken);
        
        // If this is an email confirmation, Supabase will automatically exchange the tokens
        if (type === 'signup' && accessToken) {
          // Set the session using the tokens from the hash
          const { data, error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken || ''
          });
          
          if (error) {
            console.error('Session set error:', error);
            setStatus('error');
            setErrorMessage(error.message || 'Verification failed. The link may have expired.');
            return;
          }
          
          if (data.session) {
            console.log('Session established successfully');
            setStatus('success');
            
            // Redirect to dashboard after 2 seconds
            setTimeout(() => {
              navigate('/earn');
            }, 2000);
            return;
          }
        }
        
        // Fallback: Check if there's already a session
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

  // Fallback if component isn't rendering
  if (!mounted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-white text-xl">Loading callback...</div>
      </div>
    );
  }

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
