import ProtectedRoute from '@/components/auth/ProtectedRoute';
import AdminLayout from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Search, Loader2, UserPlus } from 'lucide-react';
import { useState } from 'react';
import { useAdminTeam } from '@/hooks/useAdminTeam';
import { TeamListTable } from '@/components/admin/team/TeamListTable';
import { useDebounce } from '@/hooks/use-debounce';
import { useRole } from '@/hooks/useRole';
import { AddTeamMemberModal } from '@/components/admin/team/AddTeamMemberModal';
import { UndoTeamSetupButton } from '@/components/admin/team/UndoTeamSetupButton';

function AdminTeamContent() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const debouncedSearch = useDebounce(searchQuery, 500);
  const { teamMembers, isLoading, error, refetch } = useAdminTeam(debouncedSearch);
  const { isSuperAdmin } = useRole();

  const filteredTeamMembers = selectedRoles.length > 0
    ? teamMembers.filter(member => selectedRoles.includes(member.role))
    : teamMembers;

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-bold">Team Management</h1>
            {selectedRoles.length > 0 && (
              <Badge variant="outline">
                {selectedRoles.length} {selectedRoles.length === 1 ? 'filter' : 'filters'} active
              </Badge>
            )}
          </div>
          {isSuperAdmin() && (
            <div className="flex gap-2">
              <UndoTeamSetupButton />
              <Button onClick={() => setShowAddModal(true)}>
                <UserPlus className="h-4 w-4 mr-2" />
                Add Team Member
              </Button>
            </div>
          )}
        </div>
        <p className="text-muted-foreground mt-2">
          Manage Looplly staff members (super admins, admins, and testers) ({selectedRoles.length > 0 
            ? `${filteredTeamMembers.length} of ${teamMembers.length} members`
            : `${teamMembers.length} ${teamMembers.length === 1 ? 'member' : 'members'}`
          })
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Search Team Members</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name or email..."
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
              <ToggleGroupItem value="tester" size="sm" className="gap-1.5">
                <Badge variant="secondary" className="h-4 px-1.5 text-xs">T</Badge>
                <span className="text-sm">Tester</span>
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
        <TeamListTable teamMembers={filteredTeamMembers} onUpdate={refetch} />
      )}

      <AddTeamMemberModal 
        open={showAddModal}
        onOpenChange={setShowAddModal}
        onSuccess={() => {
          refetch();
        }}
      />
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
