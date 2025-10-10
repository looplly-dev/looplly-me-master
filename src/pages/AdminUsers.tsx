import ProtectedRoute from '@/components/auth/ProtectedRoute';
import AdminLayout from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';
import { useState } from 'react';

function AdminUsersContent() {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">User Management</h1>
        <p className="text-muted-foreground">
          Search and manage user accounts
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Search Users</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by mobile number, email, or name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Button>Search</Button>
          </div>
          
          {searchQuery && (
            <div className="mt-4">
              <p className="text-sm text-muted-foreground">
                No users found. User search functionality will be connected to the database.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>User List</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            User list with profiles, earnings, and management options will appear here
          </p>
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
