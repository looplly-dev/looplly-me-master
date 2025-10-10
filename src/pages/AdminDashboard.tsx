import ProtectedRoute from '@/components/auth/ProtectedRoute';
import AdminLayout from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, DollarSign, Award, TrendingUp } from 'lucide-react';

function AdminDashboardContent() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground">
          Overview of your Looplly platform
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,234</div>
            <p className="text-xs text-muted-foreground">
              +20% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Redemptions</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">23</div>
            <p className="text-xs text-muted-foreground">
              ₹45,678 total value
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Badges Earned</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">567</div>
            <p className="text-xs text-muted-foreground">
              This month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Tasks</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">89</div>
            <p className="text-xs text-muted-foreground">
              Across all categories
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Recent user activities and system events will appear here
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-sm text-muted-foreground">
              Common admin tasks and shortcuts will appear here
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-amber-500/50 bg-amber-500/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5 text-amber-500" />
            Integration Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-lg bg-background/50">
              <div>
                <p className="font-medium">Email Service</p>
                <p className="text-sm text-muted-foreground">Resend API for transactional emails</p>
              </div>
              <span className="px-3 py-1 text-xs font-medium rounded-full bg-amber-500/20 text-amber-700 dark:text-amber-400">
                Mock
              </span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-background/50">
              <div>
                <p className="font-medium">Payment Gateway</p>
                <p className="text-sm text-muted-foreground">Stripe or Razorpay integration</p>
              </div>
              <span className="px-3 py-1 text-xs font-medium rounded-full bg-amber-500/20 text-amber-700 dark:text-amber-400">
                Pending
              </span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-background/50">
              <div>
                <p className="font-medium">SMS Service</p>
                <p className="text-sm text-muted-foreground">Twilio for OTP and notifications</p>
              </div>
              <span className="px-3 py-1 text-xs font-medium rounded-full bg-amber-500/20 text-amber-700 dark:text-amber-400">
                Pending
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function AdminDashboard() {
  return (
    <ProtectedRoute requiredRole="admin">
      <AdminLayout>
        <AdminDashboardContent />
      </AdminLayout>
    </ProtectedRoute>
  );
}
