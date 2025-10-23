import ProtectedRoute from '@/components/auth/ProtectedRoute';
import AdminLayout from '@/components/admin/AdminLayout';
import { CountryBlocklist } from '@/components/admin/CountryBlocklist';
import { Card, CardContent } from '@/components/ui/card';
import { AlertCircle } from 'lucide-react';

export default function AdminCountryBlocklist() {
  return (
    <ProtectedRoute requiredRole="admin">
      <AdminLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold">Country Blocklist</h1>
            <p className="text-muted-foreground mt-2">
              Manage countries blocked from registration due to data residency requirements or regulatory restrictions.
            </p>
          </div>

          <Card className="border-warning/50 bg-warning/5">
            <CardContent className="pt-6">
              <div className="flex gap-3">
                <AlertCircle className="h-5 w-5 text-warning flex-shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="text-sm font-medium">Important Notes</p>
                  <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                    <li>Blocking a country prevents <strong>new registrations</strong> only</li>
                    <li>Existing users from blocked countries remain unaffected</li>
                    <li>Registration attempts from blocked countries will show a clear error message</li>
                    <li>All changes are logged for audit and compliance purposes</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          <CountryBlocklist />
        </div>
      </AdminLayout>
    </ProtectedRoute>
  );
}
