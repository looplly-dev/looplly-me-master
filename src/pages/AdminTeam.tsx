import ProtectedRoute from '@/components/auth/ProtectedRoute';
import AdminLayout from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Loader2, UserPlus } from 'lucide-react';
import { useState } from 'react';
import { useAdminTeam } from '@/hooks/useAdminTeam';
import { TeamListTable } from '@/components/admin/team/TeamListTable';
import { useDebounce } from '@/hooks/use-debounce';
import { useRole } from '@/hooks/useRole';

function AdminTeamContent() {
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearch = useDebounce(searchQuery, 500);
  const { teamMembers, isLoading, error, refetch } = useAdminTeam(debouncedSearch);
  const { isSuperAdmin } = useRole();

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Team Management</h1>
          {isSuperAdmin() && (
            <Button>
              <UserPlus className="h-4 w-4 mr-2" />
              Add Team Member
            </Button>
          )}
        </div>
        <p className="text-muted-foreground mt-2">
          Manage Looplly staff members (super admins and admins)
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Search Team Members</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </CardContent>
      </Card>

      {error && (
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <p className="text-destructive">Error: {error}</p>
          </CardContent>
        </Card>
      )}

      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <TeamListTable teamMembers={teamMembers} onUpdate={refetch} />
      )}
    </div>
  );
}

export default function AdminTeam() {
  return (
    <ProtectedRoute requiredRole="admin">
      <AdminLayout>
        <AdminTeamContent />
      </AdminLayout>
    </ProtectedRoute>
  );
}
