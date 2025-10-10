import ProtectedRoute from '@/components/auth/ProtectedRoute';
import AdminLayout from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle } from 'lucide-react';

function AdminRedemptionsContent() {
  // Mock data - will be replaced with real data from database
  const mockRedemptions = [
    { id: 1, user: 'John Doe', amount: 500, status: 'pending', date: '2025-01-09' },
    { id: 2, user: 'Jane Smith', amount: 1000, status: 'pending', date: '2025-01-08' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Redemption Management</h1>
        <p className="text-muted-foreground">
          Review and process user redemption requests
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Pending Redemptions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockRedemptions.map((redemption) => (
              <div
                key={redemption.id}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div className="space-y-1">
                  <p className="font-medium">{redemption.user}</p>
                  <p className="text-sm text-muted-foreground">
                    Amount: ₹{redemption.amount} • {redemption.date}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">{redemption.status}</Badge>
                  <Button size="sm" variant="default">
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Approve
                  </Button>
                  <Button size="sm" variant="destructive">
                    <XCircle className="h-4 w-4 mr-1" />
                    Reject
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent Redemptions</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Approved and rejected redemptions will appear here
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

export default function AdminRedemptions() {
  return (
    <ProtectedRoute requiredRole="admin">
      <AdminLayout>
        <AdminRedemptionsContent />
      </AdminLayout>
    </ProtectedRoute>
  );
}
