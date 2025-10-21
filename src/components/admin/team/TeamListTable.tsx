import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TeamMember } from '@/hooks/useAdminTeam';
import { TeamActionsMenu } from './TeamActionsMenu';
import { useRole } from '@/hooks/useRole';

interface TeamListTableProps {
  teamMembers: TeamMember[];
  onUpdate: () => void;
}

function getRoleBadgeVariant(role: string): 'destructive' | 'default' {
  if (role === 'super_admin') return 'destructive';
  return 'default';
}

function getRoleLabel(role: string): string {
  if (role === 'super_admin') return 'Super Admin';
  if (role === 'admin') return 'Admin';
  return role;
}

export function TeamListTable({ teamMembers, onUpdate }: TeamListTableProps) {
  const { isSuperAdmin } = useRole();

  if (teamMembers.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground">No team members found.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Team Members ({teamMembers.length})</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Joined</TableHead>
                {isSuperAdmin() && <TableHead className="text-right">Actions</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {teamMembers.map((member) => (
                <TableRow key={member.user_id}>
                  <TableCell className="font-medium">
                    {member.first_name && member.last_name
                      ? `${member.first_name} ${member.last_name}`
                      : member.email?.split('@')[0] || 'Unknown'}
                  </TableCell>
                  <TableCell>{member.email || 'N/A'}</TableCell>
                  <TableCell>
                    <Badge variant={getRoleBadgeVariant(member.role)}>
                      {getRoleLabel(member.role)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {new Date(member.created_at).toLocaleDateString()}
                  </TableCell>
                  {isSuperAdmin() && (
                    <TableCell className="text-right">
                      <TeamActionsMenu member={member} onUpdate={onUpdate} />
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
