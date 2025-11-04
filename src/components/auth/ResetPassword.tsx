import { useEffect, useState } from 'react';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(128, 'Password is too long');

export default function ResetPassword() {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [recoveryReady, setRecoveryReady] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Ensure we have a recovery session (from the email link)
    supabase.auth.getSession().then(async ({ data }) => {
      const hasSession = !!data.session;
      setRecoveryReady(hasSession);
      
      if (hasSession && data.session.user) {
        // Check if this is a team member - redirect to admin reset page if so
        const { data: teamProfile } = await supabase
          .from('team_profiles')
          .select('user_id')
          .eq('user_id', data.session.user.id)
          .maybeSingle();
        
        if (teamProfile) {
          // Redirect to admin reset page for team members
          navigate('/admin/reset-password');
          return;
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
          <CardTitle className="text-2xl font-bold text-primary">Set a new password</CardTitle>
          <p className="text-muted-foreground">Enter and confirm your new password</p>
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

            <Button type="submit" variant="mobile" size="mobile" className="w-full" disabled={isSubmitting || !recoveryReady}>
              {isSubmitting ? 'Updating…' : 'Update Password'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
