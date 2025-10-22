import AdminLayout from '@/components/admin/AdminLayout';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import KnowledgeDashboard from '@/components/admin/knowledge/KnowledgeDashboard';

export default function AdminKnowledge() {
  return (
    <ProtectedRoute requiredRole="user">
      <AdminLayout>
        <KnowledgeDashboard />
      </AdminLayout>
    </ProtectedRoute>
  );
}
