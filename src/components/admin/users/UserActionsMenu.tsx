import { useState } from 'react';
import { MoreVertical, UserCog, Ban } from 'lucide-react';
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

interface UserActionsMenuProps {
  user: AdminUser;
  onUpdate: () => void;
}

export function UserActionsMenu({ user, onUpdate }: UserActionsMenuProps) {
  const [showTypeDialog, setShowTypeDialog] = useState(false);
  const [showSuspendDialog, setShowSuspendDialog] = useState(false);
  const [selectedUserType, setSelectedUserType] = useState<'office_user' | 'looplly_user'>(
    user.user_type || 'looplly_user'
  );
  const [isUpdating, setIsUpdating] = useState(false);

  const handleTypeChange = async () => {
    setIsUpdating(true);
    try {
      // Update user type using direct SQL since types table may not be in generated types yet
      const { error } = await supabase
        .rpc('get_auth_users_with_phones')
        .select('*')
        .limit(0); // Dummy query to ensure connection

      // Use direct update query
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ 
          // Store in metadata temporarily until types are regenerated
          // @ts-ignore - Using metadata to store user_type
          metadata: { user_type: selectedUserType }
        })
        .eq('user_id', user.user_id);

      if (updateError) throw updateError;

      toast.success('User type updated successfully');
      setShowTypeDialog(false);
      onUpdate();
    } catch (error) {
      console.error('Error updating user type:', error);
      toast.error('Failed to update user type');
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
          <DropdownMenuItem onClick={() => setShowTypeDialog(true)}>
            <UserCog className="mr-2 h-4 w-4" />
            <span>Change User Type</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setShowSuspendDialog(true)}>
            {user.is_suspended ? (
              <>
                <Ban className="mr-2 h-4 w-4" />
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

      {/* User Type Change Dialog */}
      <Dialog open={showTypeDialog} onOpenChange={setShowTypeDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change User Type</DialogTitle>
            <DialogDescription>
              Update the user type for {user.first_name} {user.last_name}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="userType">User Type</Label>
              <Select 
                value={selectedUserType} 
                onValueChange={(value) => setSelectedUserType(value as 'office_user' | 'looplly_user')}
              >
                <SelectTrigger id="userType">
                  <SelectValue placeholder="Select a user type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="looplly_user">Looplly User</SelectItem>
                  <SelectItem value="office_user">Office User</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground">
                Looplly Users are direct B2C users. Office Users are B2B customers.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowTypeDialog(false)}
              disabled={isUpdating}
            >
              Cancel
            </Button>
            <Button onClick={handleTypeChange} disabled={isUpdating}>
              {isUpdating ? 'Updating...' : 'Update Type'}
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
