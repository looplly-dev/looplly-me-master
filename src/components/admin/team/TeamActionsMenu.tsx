import { useState } from 'react';
import { MoreVertical, UserCog, Trash2 } from 'lucide-react';
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
