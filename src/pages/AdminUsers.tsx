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

  const filteredUsers = selectedRoles.length === 0
    ? users
    : users.filter(u => selectedRoles.includes(u.role || 'user'));

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
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by mobile number, email, or name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Filter by Role</CardTitle>
            {selectedRoles.length > 0 && (
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setSelectedRoles([])}
              >
                Clear filters
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <ToggleGroup 
            type="multiple" 
            value={selectedRoles}
            onValueChange={setSelectedRoles}
            className="justify-start flex-wrap"
          >
            <ToggleGroupItem value="super_admin" className="gap-2">
              <Badge variant="destructive" className="h-5 px-2">SA</Badge>
              Super Admin
            </ToggleGroupItem>
            <ToggleGroupItem value="admin" className="gap-2">
              <Badge variant="default" className="h-5 px-2">A</Badge>
              Admin
            </ToggleGroupItem>
            <ToggleGroupItem value="user" className="gap-2">
              <Badge variant="secondary" className="h-5 px-2">U</Badge>
              User
            </ToggleGroupItem>
          </ToggleGroup>
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
