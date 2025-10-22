import AdminLayout from '@/components/admin/AdminLayout';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import DocumentationViewer from '@/components/admin/knowledge/DocumentationViewer';

export default function AdminKnowledgeDoc() {
  return (
    <ProtectedRoute requiredRole="user">
      <AdminLayout>
        <DocumentationViewer />
      </AdminLayout>
    </ProtectedRoute>
  );
}
