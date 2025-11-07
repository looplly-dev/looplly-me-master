import ProtectedRoute from '@/components/auth/ProtectedRoute';
import AdminLayout from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Search, Loader2, Users, UserCheck, UserX, UserCog, CheckCircle2, XCircle } from 'lucide-react';
import { useState, useMemo } from 'react';
import { useAdminUsers } from '@/hooks/useAdminUsers';
import { UserListTable } from '@/components/admin/users/UserListTable';
import { useDebounce } from '@/hooks/use-debounce';

function AdminUsersContent() {
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearch = useDebounce(searchQuery, 500);
  const { users, isLoading, error, refetch } = useAdminUsers(debouncedSearch);

  // Calculate statistics
  const stats = useMemo(() => {
    const total = users.length;
    const verified = users.filter(u => u.is_verified).length;
    const unverified = users.filter(u => !u.is_verified).length;
    const suspended = users.filter(u => u.is_suspended).length;
    const profileComplete = users.filter(u => u.profile_complete).length;
    const profileIncomplete = users.filter(u => !u.profile_complete).length;

    return {
      total,
      verified,
      unverified,
      suspended,
      profileComplete,
      profileIncomplete,
      verifiedPercentage: total > 0 ? Math.round((verified / total) * 100) : 0,
      completedPercentage: total > 0 ? Math.round((profileComplete / total) * 100) : 0,
    };
  }, [users]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">User Management</h1>
        <p className="text-muted-foreground mt-2">
          View and manage Looplly user accounts (customers)
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground mt-1">
              All registered users
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Verified Users</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.verified}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.verifiedPercentage}% of total • {stats.unverified} unverified
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Profile Complete</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.profileComplete}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.completedPercentage}% • {stats.profileIncomplete} incomplete
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Suspended Users</CardTitle>
            <UserX className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.suspended}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.total > 0 ? Math.round((stats.suspended / stats.total) * 100) : 0}% of total
            </p>
          </CardContent>
        </Card>
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
            <UserListTable users={users} onUpdate={refetch} />
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
