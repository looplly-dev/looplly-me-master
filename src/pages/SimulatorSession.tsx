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

        console.log('SimulatorSession - Force clearing ALL auth data...');
        
        // Force clear ALL possible auth keys to prevent any stale data
        const authKeys = [
          'simulator_auth_token',
          'simulator_user',
          'looplly_auth_token',
          'looplly_user',
          'mockUser',
          'admin_auth_token',
          'admin_user'
        ];
        
        authKeys.forEach(key => {
          sessionStorage.removeItem(key);
          localStorage.removeItem(key);
        });
        
        console.log('SimulatorSession - All auth storage cleared');

        console.log('SimulatorSession - Storing simulator auth in sessionStorage...');

        // Store simulator auth in sessionStorage (isolated to iframe/tab)
        sessionStorage.setItem('simulator_auth_token', customToken);

        console.log('SimulatorSession - Fetching test profile snapshot via function...');

        const { data: snapshot, error: fnError } = await supabase.functions.invoke('simulator-get-profile', {
          body: { custom_token: customToken }
        });

        if (fnError) {
          throw new Error(fnError.message || 'Failed to verify simulator token');
        }

        console.log('SimulatorSession - Function snapshot:', snapshot);

        if (!snapshot?.is_test_account) {
          throw new Error('Session is not for a test account');
        }

        console.log('SimulatorSession - Test user identity confirmed:', {
          user_id: snapshot.user_id,
          name: `${snapshot.first_name} ${snapshot.last_name}`,
          mobile: snapshot.mobile,
          country_code: snapshot.country_code
        });

        // Store snapshot for auth hook (used in simulator context)
        sessionStorage.setItem('simulator_user', JSON.stringify(snapshot));
        
        // Store stage for Register.tsx to detect fresh_signup
        sessionStorage.setItem('simulator_stage', stage);
        
        console.log('SimulatorSession - Stored in sessionStorage:', {
          simulator_auth_token: customToken.substring(0, 20) + '...',
          simulator_user_mobile: snapshot.mobile,
          simulator_stage: stage
        });

        // Check for show_ui parameter
        const showUI = searchParams.get('show_ui');

        console.log('SimulatorSession - Navigating to:', { stage, showUI });

        // Route based on show_ui flag or stage
        if (showUI === 'registration_form' || stage === 'fresh_signup') {
          // Show Level 1 registration form
          navigate('/simulator/register', { replace: true });
        } else {
          // Default: go to dashboard
          navigate('/simulator/dashboard', { replace: true });
        }

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
