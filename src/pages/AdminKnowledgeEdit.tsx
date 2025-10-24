import AdminLayout from '@/components/admin/AdminLayout';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import DocumentationEditor from '@/components/admin/knowledge/DocumentationEditor';

export default function AdminKnowledgeEdit() {
  return (
    <ProtectedRoute requiredRole="admin">
      <AdminLayout>
        <DocumentationEditor />
      </AdminLayout>
    </ProtectedRoute>
  );
}
