import { BadgeGenerator } from '@/components/admin/BadgeGenerator';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import AdminLayout from '@/components/admin/AdminLayout';

function AdminBadgesContent() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Badge Generator</h1>
        <p className="text-muted-foreground">
          Generate AI-powered badge images using Gemini. This is a one-time setup to create all badge assets.
        </p>
      </div>

      <BadgeGenerator />

      <div className="bg-muted/50 p-4 rounded-lg space-y-2 text-sm">
        <h3 className="font-semibold">Quick Guide:</h3>
        <ul className="list-disc list-inside space-y-1 text-muted-foreground">
          <li><strong>All Badges:</strong> View and manage all badges with status filters</li>
          <li><strong>Active:</strong> Badges currently visible to users on their dashboards</li>
          <li><strong>Inactive:</strong> Draft or deactivated badges (hidden from users)</li>
          <li><strong>Create New:</strong> Design and generate new badges with AI</li>
        </ul>
      </div>
    </div>
  );
}

export default function AdminBadges() {
  return (
    <ProtectedRoute requiredRole="admin">
      <AdminLayout>
        <AdminBadgesContent />
      </AdminLayout>
    </ProtectedRoute>
  );
}
