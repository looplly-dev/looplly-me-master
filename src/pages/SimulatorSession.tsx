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

        console.log('[SimulatorSession] Received params:', {
          hasCustomToken: !!customToken,
          stage
        });

        if (!customToken || !stage) {
          throw new Error('Missing authentication parameters');
        }

        console.log('[SimulatorSession] Decoding and storing JWT FIRST...');

        // Decode JWT to get user info
        const payload = JSON.parse(atob(customToken.split('.')[1]));

        // Verify token is not expired
        const now = Math.floor(Date.now() / 1000);
        if (payload.exp < now) {
          throw new Error('Session token has expired');
        }

        // CRITICAL: Store auth IMMEDIATELY to prevent CORS errors
        // This must happen BEFORE any other requests (including manifest.json)
        console.log('[SimulatorSession] Clearing stale auth...');
        const authKeys = [
          'simulator_auth_token',
          'simulator_user',
          'looplly_auth_token',
          'looplly_user',
          'mockUser',
          'admin_auth_token',
          'admin_user',
          'simulator' // Clear Supabase session storage key
        ];
        
        authKeys.forEach(key => {
          sessionStorage.removeItem(key);
          localStorage.removeItem(key);
        });

        // Store simulator auth SYNCHRONOUSLY
        sessionStorage.setItem('simulator_auth_token', customToken);
        sessionStorage.setItem('simulator_stage', stage);
        
        console.log('[SimulatorSession] ✅ Auth stored, fetching profile...');

        // Now fetch profile snapshot using the stored token
        const { data: snapshot, error: fnError } = await supabase.functions.invoke('simulator-get-profile', {
          body: { custom_token: customToken }
        });

        if (fnError) {
          console.error('[SimulatorSession] Profile fetch error:', fnError);
          throw new Error(fnError.message || 'Failed to verify simulator token');
        }

        if (!snapshot?.is_test_account) {
          throw new Error('Session is not for a test account');
        }

        console.log('[SimulatorSession] ✅ Profile confirmed:', {
          user_id: snapshot.user_id,
          name: `${snapshot.first_name || ''} ${snapshot.last_name || ''}`.trim(),
          mobile: snapshot.mobile
        });

        // Store user snapshot
        sessionStorage.setItem('simulator_user', JSON.stringify(snapshot));
        
        console.log('[SimulatorSession] ✅ Session ready, navigating...');

        // Check for show_ui parameter
        const showUI = searchParams.get('show_ui');

        // Route based on show_ui flag or stage
        if (showUI === 'registration_form' || stage === 'fresh_signup') {
          navigate('/simulator/register', { replace: true });
        } else {
          navigate('/simulator/dashboard', { replace: true });
        }

      } catch (error: any) {
        console.error('[SimulatorSession] ❌ Error:', error);
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
