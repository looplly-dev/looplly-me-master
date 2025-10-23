import { useState } from 'react';
import { z } from 'zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Copy, AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

const formSchema = z.object({
  email: z.string().email({ message: 'Invalid email address' }),
  company_name: z.string().min(2, { message: 'Company name is required' }),
  role: z.enum(['office_user', 'tester', 'admin']),
  company_role: z.string().optional()
});

interface AddB2BUserModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

interface CreatedCredentials {
  email: string;
  tempPassword: string;
  expiresAt: string;
}

export function AddB2BUserModal({ open, onOpenChange, onSuccess }: AddB2BUserModalProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCredentials, setShowCredentials] = useState(false);
  const [credentials, setCredentials] = useState<CreatedCredentials | null>(null);
  const [formData, setFormData] = useState({
    email: '',
    company_name: '',
    role: 'office_user' as 'office_user' | 'tester' | 'admin',
    company_role: ''
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
      const { data, error } = await supabase.functions.invoke('create-b2b-user', {
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
        title: 'B2B User Created',
        description: 'User account has been created successfully.'
      });

    } catch (error: any) {
      console.error('Error creating B2B user:', error);
      toast({
        title: 'Creation Failed',
        description: error.message || 'Failed to create B2B user',
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
        company_name: '',
        role: 'office_user',
        company_role: ''
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
              <DialogTitle>Add B2B Team Member</DialogTitle>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="user@company.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="company_name">Company Name *</Label>
                <Input
                  id="company_name"
                  placeholder="Acme Inc."
                  value={formData.company_name}
                  onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="role">Access Level *</Label>
                <Select 
                  value={formData.role} 
                  onValueChange={(value: 'office_user' | 'tester' | 'admin') => 
                    setFormData({ ...formData, role: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="office_user">Office User</SelectItem>
                    <SelectItem value="tester">Tester</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="company_role">Job Title (Optional)</Label>
                <Input
                  id="company_role"
                  placeholder="Marketing Manager"
                  value={formData.company_role}
                  onChange={(e) => setFormData({ ...formData, company_role: e.target.value })}
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Creating...' : 'Create User'}
                </Button>
              </div>
            </form>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <span>🎉</span> B2B User Created Successfully
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
                  User must reset password on first login
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
