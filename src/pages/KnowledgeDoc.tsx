import { Navigate } from 'react-router-dom';
import { useUserType } from '@/hooks/useUserType';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import DocumentationViewer from '@/components/admin/knowledge/DocumentationViewer';
import { Loader2 } from 'lucide-react';

export default function KnowledgeDoc() {
  const { isOfficeUser, isLoading } = useUserType();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!isOfficeUser()) {
    return <Navigate to="/" replace />;
  }

  return (
    <DashboardLayout>
      <DocumentationViewer />
    </DashboardLayout>
  );
}
