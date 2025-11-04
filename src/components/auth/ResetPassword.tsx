import { useEffect, useState } from 'react';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
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
    // Ensure we have a recovery session (from the email link)
    supabase.auth.getSession().then(async ({ data }) => {
      const hasSession = !!data.session;
      setRecoveryReady(hasSession);
      
      if (hasSession && data.session.user) {
        // Check if this is a team member
        const { data: teamProfile } = await supabase
          .from('team_profiles')
          .select('user_id')
          .eq('user_id', data.session.user.id)
          .maybeSingle();
        
        if (teamProfile) {
          // Mark as admin user for branding
          setIsAdminUser(true);
        }
      }
      
      if (!hasSession) {
        toast({
          title: 'Recovery link required',
          description: 'Open this page from the password reset email link to set a new password.',
          variant: 'destructive',
        });
      }
    });
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
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;

      toast({ title: 'Password updated', description: 'You can now sign in with your new password.' });
      navigate('/');
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
