import { AdminUser } from '@/hooks/useAdminUsers';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, XCircle, User, Ban } from 'lucide-react';
import { format } from 'date-fns';
import { UserActionsMenu } from './UserActionsMenu';

const getRoleBadgeVariant = (role: string | null) => {
  switch (role) {
    case 'super_admin': 
      return 'destructive'; // Red - highest power
    case 'admin': 
      return 'default'; // Blue
    default: 
      return 'outline'; // Gray
  }
};

const getRoleLabel = (role: string | null) => {
  if (!role) return 'USER';
  return role.replace('_', ' ').toUpperCase();
};

interface UserListTableProps {
  users: AdminUser[];
  onUpdate: () => void;
}

export function UserListTable({ users, onUpdate }: UserListTableProps) {
  if (users.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <User className="h-12 w-12 text-muted-foreground/50 mb-4" />
        <p className="text-muted-foreground">No users found</p>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Mobile</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Joined</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.user_id}>
              <TableCell className="font-medium">
                {user.first_name && user.last_name
                  ? `${user.first_name} ${user.last_name}`
                  : user.first_name || user.last_name || 'N/A'}
              </TableCell>
              <TableCell>{user.email || 'N/A'}</TableCell>
              <TableCell>
                {user.mobile ? (
                  <span className="font-mono text-sm">
                    {user.mobile.startsWith('+')
                      ? user.mobile
                      : user.country_code
                      ? `${user.country_code}${user.mobile.replace(/^0+/, '')}`
                      : user.mobile}
                  </span>
                ) : (
                  'N/A'
                )}
              </TableCell>
              <TableCell>
                <Badge variant="secondary">
                  Looplly User
                </Badge>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  {user.is_suspended ? (
                    <Badge variant="destructive" className="text-xs">
                      <Ban className="h-3 w-3 mr-1" />
                      Suspended
                    </Badge>
                  ) : (
                    <>
                      {user.level_2_complete ? (
                        <div className="flex items-center gap-1 text-green-600 dark:text-green-400">
                          <CheckCircle2 className="h-4 w-4" />
                          <span className="text-xs">Level 2</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <XCircle className="h-4 w-4" />
                          <span className="text-xs">Level 1</span>
                        </div>
                      )}
                      {user.profile_complete && (
                        <Badge variant="outline" className="text-xs">
                          Complete
                        </Badge>
                      )}
                    </>
                  )}
                </div>
              </TableCell>
              <TableCell className="text-muted-foreground text-sm">
                {user.created_at
                  ? format(new Date(user.created_at), 'MMM d, yyyy')
                  : 'N/A'}
              </TableCell>
              <TableCell className="text-right">
                <UserActionsMenu user={user} onUpdate={onUpdate} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
