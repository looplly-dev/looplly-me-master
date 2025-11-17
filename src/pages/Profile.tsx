import ProfileTab from '@/components/dashboard/ProfileTab';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { ProfileErrorBoundary } from '@/components/dashboard/ProfileErrorBoundary';

export default function Profile() {
  return (
    <DashboardLayout>
      <ProfileErrorBoundary>
        <ProfileTab />
      </ProfileErrorBoundary>
    </DashboardLayout>
  );
}
