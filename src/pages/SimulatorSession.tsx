import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { simulatorClient as supabase } from '@/integrations/supabase/simulatorClient';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, AlertCircle } from 'lucide-react';

// Helper to poll for session readiness
const waitForSession = async (maxTries = 15, delayMs = 200): Promise<boolean> => {
  for (let i = 0; i < maxTries; i++) {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      console.log('SimulatorSession - Session confirmed after', i + 1, 'attempts');
      return true;
    }
    await new Promise(resolve => setTimeout(resolve, delayMs));
  }
  return false;
};

export default function SimulatorSession() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [error, setError] = useState<string>('');
  const [isAuthenticating, setIsAuthenticating] = useState(true);

  useEffect(() => {
    const authenticateSimulator = async () => {
      try {
        const customToken = searchParams.get('custom_token');
        const stage = searchParams.get('stage');

        console.log('SimulatorSession - Received params:', {
          hasCustomToken: !!customToken,
          stage
        });

        if (!customToken || !stage) {
          throw new Error('Missing authentication parameters');
        }

        console.log('SimulatorSession - Decoding custom JWT...');

        // Decode JWT to get user info
        const payload = JSON.parse(atob(customToken.split('.')[1]));

        // Verify token is not expired
        const now = Math.floor(Date.now() / 1000);
        if (payload.exp < now) {
          throw new Error('Session token has expired');
        }

        console.log('SimulatorSession - Clearing old auth data...');
        
        // Clear any existing auth tokens to prevent stale session data
        localStorage.removeItem('looplly_auth_token');
        localStorage.removeItem('looplly_user');
        localStorage.removeItem('mockUser');

        console.log('SimulatorSession - Storing custom auth...');

        // Store custom auth in localStorage (same as production login)
        localStorage.setItem('looplly_auth_token', customToken);
        localStorage.setItem('looplly_user', JSON.stringify({
          id: payload.sub,
          mobile: payload.mobile
        }));

        console.log('SimulatorSession - Verifying test account...');

        // Verify this is a test account
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('is_test_account, user_type')
          .eq('user_id', payload.sub)
          .maybeSingle();

        console.log('SimulatorSession - Profile check:', {
          isTestAccount: profile?.is_test_account,
          userType: profile?.user_type,
          error: profileError?.message
        });

        if (!profile?.is_test_account) {
          throw new Error('Session is not for a test account');
        }

        console.log('SimulatorSession - Navigating to:', stage);

        // Route based on stage - all routes use /simulator/* paths
        const stageRoutes: Record<string, string> = {
          'fresh_signup': '/simulator/register',
          'otp_verified': '/simulator/dashboard',
          'basic_profile': '/simulator/dashboard',
          'full_profile': '/simulator/dashboard',
          'first_survey': '/simulator/dashboard',
          'established_user': '/simulator/dashboard'
        };

        const targetRoute = stageRoutes[stage] || '/simulator/dashboard';
        navigate(targetRoute, { replace: true });

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
