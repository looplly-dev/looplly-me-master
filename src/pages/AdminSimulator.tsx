import AdminLayout from '@/components/admin/AdminLayout';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import SimulatorDashboard from '@/components/admin/simulator/SimulatorDashboard';

export default function AdminSimulator() {
  return (
    <ProtectedRoute requiredRole="tester" requireExactRole={true}>
      <AdminLayout>
        <SimulatorDashboard />
      </AdminLayout>
    </ProtectedRoute>
  );
}
