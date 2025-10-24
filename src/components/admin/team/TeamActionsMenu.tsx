import { useState } from 'react';
import { MoreVertical, UserCog, Trash2, KeyRound, Copy, Eye, EyeOff } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { TeamMember } from '@/hooks/useAdminTeam';

interface TeamActionsMenuProps {
  member: TeamMember;
  onUpdate: () => void;
}

export function TeamActionsMenu({ member, onUpdate }: TeamActionsMenuProps) {
  const [showRoleDialog, setShowRoleDialog] = useState(false);
  const [showRemoveDialog, setShowRemoveDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showResetPasswordDialog, setShowResetPasswordDialog] = useState(false);
  const [showPasswordResultDialog, setShowPasswordResultDialog] = useState(false);
  const [tempPassword, setTempPassword] = useState<string>('');
  const [passwordExpiry, setPasswordExpiry] = useState<string>('');
  const [showPassword, setShowPassword] = useState(false);
  const [selectedRole, setSelectedRole] = useState<'super_admin' | 'admin'>(member.role);
  const [editFormData, setEditFormData] = useState({
    first_name: member.first_name || '',
    last_name: member.last_name || '',
    company_name: member.company_name || '',
    company_role: member.company_role || ''
  });
  const [isUpdating, setIsUpdating] = useState(false);

  const handleRoleChange = async () => {
    setIsUpdating(true);
    try {
      const { error } = await supabase
        .from('user_roles')
        .update({ role: selectedRole })
        .eq('user_id', member.user_id);

      if (error) throw error;

      toast.success('Team member role updated successfully');
      setShowRoleDialog(false);
      onUpdate();
    } catch (error) {
      console.error('Error updating role:', error);
      toast.error('Failed to update team member role');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleEditDetails = async () => {
    setIsUpdating(true);
    try {
      const { error } = await supabase
        .from('team_profiles')
        .update({
          first_name: editFormData.first_name,
          last_name: editFormData.last_name,
          company_name: editFormData.company_name,
          company_role: editFormData.company_role,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', member.user_id);

      if (error) throw error;

      toast.success('Team member details updated successfully');
      setShowEditDialog(false);
      onUpdate();
    } catch (error) {
      console.error('Error updating details:', error);
      toast.error('Failed to update team member details');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleRemove = async () => {
    setIsUpdating(true);
    try {
      const { error } = await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', member.user_id);

      if (error) throw error;

      toast.success('Team member removed successfully');
      setShowRemoveDialog(false);
      onUpdate();
    } catch (error) {
      console.error('Error removing team member:', error);
      toast.error('Failed to remove team member');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleResetPassword = async () => {
    setIsUpdating(true);
    try {
      const { data, error } = await supabase.functions.invoke('reset-team-member-password', {
        body: { email: member.email }
      });

      if (error) throw error;

      if (!data.success) {
        throw new Error(data.error || 'Failed to reset password');
      }

      setTempPassword(data.temporary_password);
      setPasswordExpiry(new Date(data.expires_at).toLocaleString());
      setShowResetPasswordDialog(false);
      setShowPasswordResultDialog(true);
      toast.success('Password reset successfully');
    } catch (error) {
      console.error('Error resetting password:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to reset password');
    } finally {
      setIsUpdating(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(tempPassword);
    toast.success('Password copied to clipboard');
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Open menu</span>
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-[200px] z-50 bg-background">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setShowEditDialog(true)}>
            <UserCog className="mr-2 h-4 w-4" />
            <span>Edit Details</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setShowResetPasswordDialog(true)}>
            <KeyRound className="mr-2 h-4 w-4" />
            <span>Reset Password</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setShowRoleDialog(true)}>
            <UserCog className="mr-2 h-4 w-4" />
            <span>Change Role</span>
          </DropdownMenuItem>
          <DropdownMenuItem 
            onClick={() => setShowRemoveDialog(true)}
            className="text-destructive focus:text-destructive"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            <span>Remove from Team</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Edit Details Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Team Member Details</DialogTitle>
            <DialogDescription>
              Update profile information for {member.email}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="first_name">First Name</Label>
                <Input
                  id="first_name"
                  value={editFormData.first_name}
                  onChange={(e) => setEditFormData({ ...editFormData, first_name: e.target.value })}
                  placeholder="First name"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="last_name">Last Name</Label>
                <Input
                  id="last_name"
                  value={editFormData.last_name}
                  onChange={(e) => setEditFormData({ ...editFormData, last_name: e.target.value })}
                  placeholder="Last name"
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="company_name">Team/Company Name</Label>
              <Input
                id="company_name"
                value={editFormData.company_name}
                onChange={(e) => setEditFormData({ ...editFormData, company_name: e.target.value })}
                placeholder="e.g., Looplly"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="company_role">Job Title</Label>
              <Input
                id="company_role"
                value={editFormData.company_role}
                onChange={(e) => setEditFormData({ ...editFormData, company_role: e.target.value })}
                placeholder="e.g., B2C Guru, Product Manager"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowEditDialog(false)}
              disabled={isUpdating}
            >
              Cancel
            </Button>
            <Button onClick={handleEditDetails} disabled={isUpdating}>
              {isUpdating ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Role Change Dialog */}
      <Dialog open={showRoleDialog} onOpenChange={setShowRoleDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Team Member Role</DialogTitle>
            <DialogDescription>
              Update the role for {member.first_name} {member.last_name}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="role">Role</Label>
              <Select 
                value={selectedRole} 
                onValueChange={(value) => setSelectedRole(value as 'super_admin' | 'admin')}
              >
                <SelectTrigger id="role">
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="super_admin">Super Admin</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground">
                Super Admins have full system access. Admins can manage users but cannot edit Level 1 questions or manage other admins.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowRoleDialog(false)}
              disabled={isUpdating}
            >
              Cancel
            </Button>
            <Button onClick={handleRoleChange} disabled={isUpdating}>
              {isUpdating ? 'Updating...' : 'Update Role'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reset Password Confirmation Dialog */}
      <AlertDialog open={showResetPasswordDialog} onOpenChange={setShowResetPasswordDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reset Team Member Password</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to reset the password for {member.email}?
              <br /><br />
              This will:
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Generate a new temporary password (expires in 7 days)</li>
                <li>Invalidate their current session</li>
                <li>Force them to change password on next login</li>
              </ul>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isUpdating}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleResetPassword} 
              disabled={isUpdating}
            >
              {isUpdating ? 'Resetting...' : 'Reset Password'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Password Result Dialog */}
      <Dialog open={showPasswordResultDialog} onOpenChange={setShowPasswordResultDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Password Reset Successful</DialogTitle>
            <DialogDescription>
              Share this temporary password securely with the team member.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="bg-muted/50 p-4 rounded-lg border border-border space-y-3">
              <div className="space-y-2">
                <Label className="text-sm font-semibold">Temporary Password</Label>
                <div className="flex items-center gap-2">
                  <div className="flex-1 font-mono text-sm bg-background px-3 py-2 rounded border border-border">
                    {showPassword ? tempPassword : '••••••••••••••••'}
                  </div>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={copyToClipboard}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="space-y-1">
                <Label className="text-sm font-semibold">Expires</Label>
                <p className="text-sm text-muted-foreground">{passwordExpiry}</p>
              </div>
            </div>
            <div className="bg-accent/50 p-3 rounded-lg border border-accent">
              <p className="text-sm text-foreground">
                <strong>Important:</strong> The team member must change this password on their first login. 
                The temporary password will expire in 7 days.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => {
              setShowPasswordResultDialog(false);
              setShowPassword(false);
            }}>
              Done
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Remove Confirmation Dialog */}
      <AlertDialog open={showRemoveDialog} onOpenChange={setShowRemoveDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Team Member</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove {member.first_name} {member.last_name} from the team? 
              They will lose all admin access to the platform.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isUpdating}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleRemove} 
              disabled={isUpdating}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isUpdating ? 'Removing...' : 'Remove'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
