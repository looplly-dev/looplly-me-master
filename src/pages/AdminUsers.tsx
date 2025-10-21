import ProtectedRoute from '@/components/auth/ProtectedRoute';
import AdminLayout from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Search, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { useAdminUsers } from '@/hooks/useAdminUsers';
import { UserListTable } from '@/components/admin/users/UserListTable';
import { useDebounce } from '@/hooks/use-debounce';

function AdminUsersContent() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const debouncedSearch = useDebounce(searchQuery, 500);
  const { users, isLoading, error, refetch } = useAdminUsers(debouncedSearch);

  const filteredUsers = users;

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-3xl font-bold">User Management</h1>
          {selectedRoles.length > 0 && (
            <Badge variant="outline">
              {selectedRoles.length} {selectedRoles.length === 1 ? 'filter' : 'filters'} active
            </Badge>
          )}
        </div>
        <p className="text-muted-foreground">
          View and manage user accounts ({selectedRoles.length > 0 
            ? `${filteredUsers.length} of ${users.length} users`
            : `${users.length} ${users.length === 1 ? 'user' : 'users'}`
          })
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Search Users</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by mobile number, email, or name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm text-muted-foreground">Filter by role:</span>
            <ToggleGroup 
              type="multiple" 
              value={selectedRoles}
              onValueChange={setSelectedRoles}
              className="justify-start gap-2"
            >
              <ToggleGroupItem value="super_admin" size="sm" className="gap-1.5">
                <Badge variant="destructive" className="h-4 px-1.5 text-xs">SA</Badge>
                <span className="text-sm">Super Admin</span>
              </ToggleGroupItem>
              <ToggleGroupItem value="admin" size="sm" className="gap-1.5">
                <Badge variant="default" className="h-4 px-1.5 text-xs">A</Badge>
                <span className="text-sm">Admin</span>
              </ToggleGroupItem>
              <ToggleGroupItem value="user" size="sm" className="gap-1.5">
                <Badge variant="secondary" className="h-4 px-1.5 text-xs">U</Badge>
                <span className="text-sm">User</span>
              </ToggleGroupItem>
            </ToggleGroup>
            {selectedRoles.length > 0 && (
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setSelectedRoles([])}
              >
                Clear
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>User List</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-sm text-destructive">Error: {error}</p>
            </div>
          ) : (
            <UserListTable users={filteredUsers} onUpdate={refetch} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function AdminUsers() {
  return (
    <ProtectedRoute requiredRole="admin">
      <AdminLayout>
        <AdminUsersContent />
      </AdminLayout>
    </ProtectedRoute>
  );
}
