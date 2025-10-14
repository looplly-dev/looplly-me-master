import ProtectedRoute from '@/components/auth/ProtectedRoute';
import AdminLayout from '@/components/admin/AdminLayout';
import { AgentGrid } from '@/components/admin/agents/AgentGrid';

function AdminAgentsContent() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">AI Agents</h1>
        <p className="text-muted-foreground">
          Monitor and manage automated intelligence agents powering the Looplly ecosystem.
        </p>
      </div>

      <AgentGrid />
    </div>
  );
}

export default function AdminAgents() {
  return (
    <ProtectedRoute requiredRole="admin">
      <AdminLayout>
        <AdminAgentsContent />
      </AdminLayout>
    </ProtectedRoute>
  );
}
