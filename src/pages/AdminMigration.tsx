import ProtectedRoute from '@/components/auth/ProtectedRoute';
import AdminLayout from '@/components/admin/AdminLayout';
import MigrationHelper from '@/components/admin/MigrationHelper';

export default function AdminMigration() {
  return (
    <ProtectedRoute requiredRole="admin">
      <AdminLayout>
        <MigrationHelper />
      </AdminLayout>
    </ProtectedRoute>
  );
}
