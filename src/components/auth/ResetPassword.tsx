import { useEffect, useState } from 'react';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { getSupabaseClient } from '@/integrations/supabase/activeClient';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle2, AlertCircle, Shield } from 'lucide-react';

const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number')
  .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character')
  .max(128, 'Password is too long');

export default function ResetPassword() {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [recoveryReady, setRecoveryReady] = useState(false);
  const [isAdminUser, setIsAdminUser] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const passwordRequirements = [
    { label: 'At least 8 characters', met: password.length >= 8 },
    { label: 'One uppercase letter', met: /[A-Z]/.test(password) },
    { label: 'One number', met: /[0-9]/.test(password) },
    { label: 'One special character', met: /[^A-Za-z0-9]/.test(password) },
  ];

  useEffect(() => {
    const init = async () => {
      try {
        const client = getSupabaseClient();
        const currentPath = window.location.pathname;
        
        // 1) Check if we already have a recovery session
        let { data: { session } } = await client.auth.getSession();

        // 2) If not, try to establish one from URL params (handles both hash and query formats)
        if (!session) {
          const url = new URL(window.location.href);
          const search = url.searchParams;
          const hash = new URLSearchParams(window.location.hash.replace(/^#/, ''));

          const errorParam = search.get('error') || hash.get('error');
          const errorDesc = search.get('error_description') || hash.get('error_description');
          if (errorParam) {
            // Common case: otp_expired / invalid link
            toast({
              title: 'Reset link error',
              description: decodeURIComponent(errorDesc || errorParam || 'The link is invalid or has expired.'),
              variant: 'destructive',
            });
          }

          // Hash flow: access/refresh tokens present with type=recovery
          const type = hash.get('type') || search.get('type');
          const access_token = hash.get('access_token');
          const refresh_token = hash.get('refresh_token');
          if (!session && type === 'recovery' && access_token && refresh_token) {
            const { data, error } = await client.auth.setSession({ access_token, refresh_token });
            if (error) console.warn('[ResetPassword] setSession failed:', error);
            session = data?.session ?? null;
          }

          // Query flow: some environments send ?code=...; try exchangeCodeForSession when available
          const code = search.get('code');
          if (!session && code && !errorParam && typeof (client.auth as any).exchangeCodeForSession === 'function') {
            try {
              const { data, error } = await (client.auth as any).exchangeCodeForSession({ code });
              if (error) console.warn('[ResetPassword] exchangeCodeForSession failed:', error);
              session = data?.session ?? null;
            } catch (e) {
              console.warn('[ResetPassword] exchangeCodeForSession threw:', e);
            }
          }
        }

        const hasSession = !!session;
        
        if (hasSession && session!.user) {
          // Check if this is a team member
          const { data: teamProfile } = await client
            .from('team_profiles')
            .select('user_id')
            .eq('user_id', session!.user.id)
            .maybeSingle();
          
          const isAdmin = !!teamProfile;
          setIsAdminUser(isAdmin);
          
          // Redirect admin users to admin reset page if they're on the regular reset page
          if (isAdmin && currentPath === '/reset-password') {
            const fullUrl = window.location.href.replace('/reset-password', '/admin/reset-password');
            window.location.href = fullUrl;
            return; // Don't set recoveryReady yet, we're redirecting
          }
          
          // Redirect regular users to regular reset page if they're on the admin reset page
          if (!isAdmin && currentPath === '/admin/reset-password') {
            const fullUrl = window.location.href.replace('/admin/reset-password', '/reset-password');
            window.location.href = fullUrl;
            return; // Don't set recoveryReady yet, we're redirecting
          }
        }
        
        setRecoveryReady(hasSession);
        
        if (!hasSession) {
          // No session -> user likely opened an expired/invalid link
          toast({
            title: 'Recovery link required',
            description: 'This link looks invalid or expired. Request a new password reset link to continue.',
            variant: 'destructive',
          });
        }
      } catch (e) {
        console.error('[ResetPassword] Initialization error:', e);
        toast({
          title: 'Could not initialize reset',
          description: 'Please request a new reset link and try again.',
          variant: 'destructive',
        });
      }
    };

    init();
  }, [toast, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recoveryReady) return;

    // Validate
    const pwd = passwordSchema.safeParse(password);
    if (!pwd.success) {
      toast({ title: 'Invalid password', description: pwd.error.issues[0].message, variant: 'destructive' });
      return;
    }
    if (password !== confirm) {
      toast({ title: 'Passwords do not match', description: 'Please confirm the same password.', variant: 'destructive' });
      return;
    }

    setIsSubmitting(true);
    try {
      const client = getSupabaseClient();
      const { error } = await client.auth.updateUser({ password });
      if (error) throw error;

      toast({ title: 'Password updated', description: 'You can now sign in with your new password.' });
      navigate(isAdminUser ? '/admin/login' : '/');
    } catch (err: any) {
      toast({ title: 'Reset failed', description: err?.message || 'Please request a new reset link.', variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-lg bg-card border">
        <CardHeader className="text-center pb-6">
          {isAdminUser && (
            <div className="mx-auto mb-4 w-16 h-16 bg-primary rounded-2xl flex items-center justify-center">
              <Shield className="h-8 w-8 text-primary-foreground" />
            </div>
          )}
          <CardTitle className="text-2xl font-bold text-primary">
            {isAdminUser ? 'Set Your Admin Password' : 'Set a new password'}
          </CardTitle>
          <p className="text-muted-foreground">
            {isAdminUser 
              ? 'Admin Portal - Team Members Only' 
              : 'Enter and confirm your new password'
            }
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="password">New Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter new password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-12"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirm">Confirm Password</Label>
              <Input
                id="confirm"
                type="password"
                placeholder="Confirm new password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                className="h-12"
                required
              />
            </div>

            <Alert>
              <AlertDescription>
                <p className="font-medium mb-2">Password Requirements:</p>
                <ul className="space-y-1">
                  {passwordRequirements.map((req, index) => (
                    <li key={index} className="flex items-center gap-2">
                      {req.met ? (
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                      ) : (
                        <AlertCircle className="h-4 w-4 text-muted-foreground" />
                      )}
                      <span className={req.met ? 'text-green-600' : 'text-muted-foreground'}>
                        {req.label}
                      </span>
                    </li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>

            <Button type="submit" variant="mobile" size="mobile" className="w-full" disabled={isSubmitting || !recoveryReady}>
              {isSubmitting ? 'Updating…' : 'Update Password'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
