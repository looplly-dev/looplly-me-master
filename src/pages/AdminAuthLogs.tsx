import ProtectedRoute from '@/components/auth/ProtectedRoute';
import AdminLayout from '@/components/admin/AdminLayout';
import { AuthLogsDashboard } from '@/components/admin/auth-logs/AuthLogsDashboard';
import { Shield } from 'lucide-react';

function AdminAuthLogsContent() {
  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Shield className="h-6 w-6 text-primary" />
          <h1 className="text-3xl font-bold">Authentication Troubleshooting</h1>
        </div>
        <p className="text-muted-foreground">
          Monitor and debug authentication events, sessions, and errors across all portals
        </p>
      </div>

      <AuthLogsDashboard />
    </div>
  );
}

export default function AdminAuthLogs() {
  return (
    <ProtectedRoute requiredRole="admin">
      <AdminLayout>
        <AdminAuthLogsContent />
      </AdminLayout>
    </ProtectedRoute>
  );
}
