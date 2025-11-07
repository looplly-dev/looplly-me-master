import { useState } from 'react';
import { z } from 'zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { adminClient } from '@/integrations/supabase/adminClient';
import { Copy, AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

const formSchema = z.object({
  email: z.string().email({ message: 'Invalid email address' }),
  team_name: z.string().min(2, { message: 'Team name is required' }),
  role: z.enum(['super_admin', 'admin', 'tester']),
  job_title: z.string().optional()
});

interface AddTeamMemberModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

interface CreatedCredentials {
  email: string;
  tempPassword: string;
  expiresAt: string;
}

export function AddTeamMemberModal({ open, onOpenChange, onSuccess }: AddTeamMemberModalProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCredentials, setShowCredentials] = useState(false);
  const [credentials, setCredentials] = useState<CreatedCredentials | null>(null);
  const [formData, setFormData] = useState({
    email: '',
    team_name: '',
    role: 'admin' as 'super_admin' | 'admin' | 'tester',
    job_title: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form
    const validation = formSchema.safeParse(formData);
    if (!validation.success) {
      toast({
        title: 'Validation Error',
        description: validation.error.issues[0].message,
        variant: 'destructive'
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const { data, error } = await adminClient.functions.invoke('create-team-member', {
        body: formData
      });

      if (error) throw error;

      if (data.error) {
        throw new Error(data.error);
      }

      // Show credentials modal
      setCredentials({
        email: data.email,
        tempPassword: data.tempPassword,
        expiresAt: data.expiresAt
      });
      setShowCredentials(true);

      toast({
        title: 'Team Member Added',
        description: 'Team member account has been created successfully.'
      });

    } catch (error: any) {
      console.error('Error creating team member:', error);
      toast({
        title: 'Creation Failed',
        description: error.message || 'Failed to create team member',
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: 'Copied',
      description: `${label} copied to clipboard`
    });
  };

  const handleClose = () => {
    if (showCredentials) {
      // Reset form and close everything
      setFormData({
        email: '',
        team_name: '',
        role: 'admin',
        job_title: ''
      });
      setCredentials(null);
      setShowCredentials(false);
      onSuccess();
    }
    onOpenChange(false);
  };

  const expiryDays = credentials 
    ? Math.ceil((new Date(credentials.expiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        {!showCredentials ? (
          <>
            <DialogHeader>
              <DialogTitle>Add Team Member</DialogTitle>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="member@looplly.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="team_name">Team Name *</Label>
                <Input
                  id="team_name"
                  placeholder="Looplly Core Team"
                  value={formData.team_name}
                  onChange={(e) => setFormData({ ...formData, team_name: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="role">Role *</Label>
                <Select 
                  value={formData.role} 
                  onValueChange={(value: 'super_admin' | 'admin' | 'tester') => 
                    setFormData({ ...formData, role: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="super_admin">Super Admin</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="tester">Tester</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="job_title">Job Title (Optional)</Label>
                <Input
                  id="job_title"
                  placeholder="Product Manager"
                  value={formData.job_title}
                  onChange={(e) => setFormData({ ...formData, job_title: e.target.value })}
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Creating...' : 'Create Team Member'}
                </Button>
              </div>
            </form>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <span>🎉</span> Team Member Created Successfully
              </DialogTitle>
            </DialogHeader>

            <Alert variant="destructive" className="mb-4">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>IMPORTANT:</strong> Save these credentials now. They will not be shown again!
              </AlertDescription>
            </Alert>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Email</Label>
                <div className="flex gap-2">
                  <Input value={credentials?.email} readOnly />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => copyToClipboard(credentials?.email || '', 'Email')}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Temporary Password</Label>
                <div className="flex gap-2">
                  <Input value={credentials?.tempPassword} readOnly className="font-mono" />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => copyToClipboard(credentials?.tempPassword || '', 'Password')}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="bg-muted p-3 rounded-md text-sm">
                <p className="font-medium">Valid for: {expiryDays} days</p>
                <p className="text-muted-foreground mt-1">
                  Team member must reset password on first login
                </p>
              </div>

              <Button onClick={handleClose} className="w-full">
                ✓ I've Saved These Credentials
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
