import { useState } from 'react';
import { MoreVertical, UserCog, Ban, Shield } from 'lucide-react';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { AdminUser } from '@/hooks/useAdminUsers';
import { useRole } from '@/hooks/useRole';

interface UserActionsMenuProps {
  user: AdminUser;
  onUpdate: () => void;
}

export function UserActionsMenu({ user, onUpdate }: UserActionsMenuProps) {
  const { isSuperAdmin } = useRole();
  const [showRoleDialog, setShowRoleDialog] = useState(false);
  const [showSuspendDialog, setShowSuspendDialog] = useState(false);
  const [selectedRole, setSelectedRole] = useState<'super_admin' | 'admin' | 'user'>(
    (user.role as 'super_admin' | 'admin' | 'user') || 'user'
  );
  const [isUpdating, setIsUpdating] = useState(false);

  const handleRoleChange = async () => {
    setIsUpdating(true);
    try {
      // Check if role exists
      const { data: existingRole } = await supabase
        .from('user_roles')
        .select('id')
        .eq('user_id', user.user_id)
        .single();

      if (existingRole) {
        // Update existing role
        const { error } = await supabase
          .from('user_roles')
          .update({ role: selectedRole })
          .eq('user_id', user.user_id);

        if (error) throw error;
      } else {
        // Insert new role
        const { error } = await supabase
          .from('user_roles')
          .insert({ user_id: user.user_id, role: selectedRole });

        if (error) throw error;
      }

      toast.success('User role updated successfully');
      setShowRoleDialog(false);
      onUpdate();
    } catch (error) {
      console.error('Error updating role:', error);
      toast.error('Failed to update user role');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleSuspend = async () => {
    setIsUpdating(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ is_suspended: !user.is_suspended })
        .eq('user_id', user.user_id);

      if (error) throw error;

      toast.success(
        user.is_suspended
          ? 'User unsuspended successfully'
          : 'User suspended successfully'
      );
      setShowSuspendDialog(false);
      onUpdate();
    } catch (error) {
      console.error('Error suspending user:', error);
      toast.error('Failed to update user suspension status');
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
          <DropdownMenuItem onClick={() => setShowRoleDialog(true)}>
            <UserCog className="mr-2 h-4 w-4" />
            <span>Change Role</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setShowSuspendDialog(true)}>
            {user.is_suspended ? (
              <>
                <Shield className="mr-2 h-4 w-4" />
                <span>Unsuspend User</span>
              </>
            ) : (
              <>
                <Ban className="mr-2 h-4 w-4" />
                <span>Suspend User</span>
              </>
            )}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Role Change Dialog */}
      <Dialog open={showRoleDialog} onOpenChange={setShowRoleDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change User Role</DialogTitle>
            <DialogDescription>
              Update the role for {user.first_name} {user.last_name}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="role">Role</Label>
              <Select 
                value={selectedRole} 
                onValueChange={(value) => setSelectedRole(value as 'super_admin' | 'admin' | 'user')}
              >
                <SelectTrigger id="role">
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">User</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  {isSuperAdmin() && (
                    <SelectItem value="super_admin">Super Admin</SelectItem>
                  )}
                </SelectContent>
              </Select>
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

      {/* Suspend Confirmation Dialog */}
      <AlertDialog open={showSuspendDialog} onOpenChange={setShowSuspendDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {user.is_suspended ? 'Unsuspend User' : 'Suspend User'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {user.is_suspended
                ? `Are you sure you want to unsuspend ${user.first_name} ${user.last_name}? They will regain access to the platform.`
                : `Are you sure you want to suspend ${user.first_name} ${user.last_name}? They will lose access to the platform.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isUpdating}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleSuspend} disabled={isUpdating}>
              {isUpdating
                ? 'Processing...'
                : user.is_suspended
                ? 'Unsuspend'
                : 'Suspend'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
