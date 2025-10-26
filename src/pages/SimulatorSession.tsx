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
        const accessToken = searchParams.get('access_token');
        const refreshToken = searchParams.get('refresh_token');
        const stage = searchParams.get('stage');

        console.log('SimulatorSession - Received params:', {
          hasAccessToken: !!accessToken,
          hasRefreshToken: !!refreshToken,
          stage
        });

        if (!accessToken || !refreshToken || !stage) {
          throw new Error('Missing authentication parameters');
        }

        console.log('SimulatorSession - Setting session...');

        // Decode tokens and sign in
        const { data: sessionData, error: authError } = await supabase.auth.setSession({
          access_token: decodeURIComponent(accessToken),
          refresh_token: decodeURIComponent(refreshToken)
        });

        console.log('SimulatorSession - setSession result:', {
          hasSession: !!sessionData?.session,
          hasUser: !!sessionData?.user,
          error: authError?.message
        });

        if (authError || !sessionData.session) {
          throw new Error(`Authentication failed: ${authError?.message || 'No session returned'}`);
        }

        console.log('SimulatorSession - Verifying test account...');

        // Verify this is a test account
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('is_test_account, user_type')
          .eq('user_id', sessionData.session.user.id)
          .maybeSingle();

        console.log('SimulatorSession - Profile check:', {
          isTestAccount: profile?.is_test_account,
          userType: profile?.user_type,
          error: profileError?.message
        });

        if (!profile?.is_test_account) {
          throw new Error('Session is not for a test account');
        }

        console.log('SimulatorSession - Waiting for session to initialize...');

        // Wait for session to be available
        const sessionReady = await waitForSession();
        if (!sessionReady) {
          throw new Error('Authentication did not initialize in time. Please restart the simulation.');
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
