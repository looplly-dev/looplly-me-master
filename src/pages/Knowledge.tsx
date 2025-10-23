import { Navigate } from 'react-router-dom';
import { useUserType } from '@/hooks/useUserType';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import KnowledgeDashboard from '@/components/admin/knowledge/KnowledgeDashboard';
import { Loader2 } from 'lucide-react';

export default function Knowledge() {
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
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Knowledge Centre</h1>
          <p className="text-muted-foreground mt-2">
            Documentation and resources for office users
          </p>
        </div>
        <KnowledgeDashboard />
      </div>
    </DashboardLayout>
  );
}
