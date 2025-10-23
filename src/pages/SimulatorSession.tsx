import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, AlertCircle } from 'lucide-react';

export default function SimulatorSession() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [error, setError] = useState<string>('');
  const [isAuthenticating, setIsAuthenticating] = useState(true);

  useEffect(() => {
    const authenticateSimulator = async () => {
      try {
        const token = searchParams.get('token');
        const stage = searchParams.get('stage');

        if (!token || !stage) {
          throw new Error('Missing session token or stage parameter');
        }

        // Sign in with the provided token
        const { data: sessionData, error: authError } = await supabase.auth.setSession({
          access_token: token,
          refresh_token: ''
        });

        if (authError || !sessionData.session) {
          throw new Error('Failed to authenticate simulator session');
        }

        // Verify this is a test account (using type assertion until types regenerate)
        const { data: profile } = await supabase
          .from('profiles')
          .select('is_test_account, user_type')
          .eq('user_id', sessionData.session.user.id)
          .single() as any;

        if (!(profile as any)?.is_test_account) {
          throw new Error('Session is not for a test account');
        }

        // Route based on stage
        const stageRoutes: Record<string, string> = {
          'fresh_signup': '/register',
          'otp_verified': '/profile',
          'basic_profile': '/profile',
          'full_profile': '/dashboard',
          'first_survey': '/dashboard',
          'established_user': '/dashboard'
        };

        const targetRoute = stageRoutes[stage] || '/dashboard';
        
        setTimeout(() => {
          navigate(targetRoute, { replace: true });
        }, 500);

      } catch (error: any) {
        console.error('Simulator session error:', error);
        setError(error.message || 'Failed to initialize simulator session');
        setIsAuthenticating(false);
      }
    };

    authenticateSimulator();
  }, [searchParams, navigate]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Alert variant="destructive" className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>Simulator Error:</strong> {error}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center space-y-4">
        <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />
        <div className="space-y-2">
          <h2 className="text-xl font-semibold">Initializing Simulator</h2>
          <p className="text-sm text-muted-foreground">
            Setting up test user session...
          </p>
        </div>
      </div>
    </div>
  );
}
