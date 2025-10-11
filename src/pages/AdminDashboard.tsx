import ProtectedRoute from '@/components/auth/ProtectedRoute';
import AdminLayout from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, DollarSign, Award, TrendingUp, Eye } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';

function AdminDashboardContent() {
  const { authState } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch admin's badge preview setting
  const { data: profile } = useQuery({
    queryKey: ['admin-profile', authState.user?.id],
    queryFn: async () => {
      if (!authState.user?.id) return null;
      const { data, error } = await supabase
        .from('profiles')
        .select('badge_preview_mode')
        .eq('user_id', authState.user.id)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!authState.user?.id,
  });

  // Update badge preview mode
  const updatePreviewMode = useMutation({
    mutationFn: async (enabled: boolean) => {
      if (!authState.user?.id) throw new Error('No user ID');
      const { error } = await supabase
        .from('profiles')
        .update({ badge_preview_mode: enabled })
        .eq('user_id', authState.user.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-profile'] });
      queryClient.invalidateQueries({ queryKey: ['user-profile'] });
      toast({
        title: 'Badge Preview Updated',
        description: profile?.badge_preview_mode 
          ? 'All badges will now show as locked based on your actual progress'
          : 'All badges will now appear unlocked for preview',
      });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to update badge preview mode',
        variant: 'destructive',
      });
    },
  });

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
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Badge Preview Mode
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              When enabled, all badges appear unlocked in your Rep tab for preview purposes
            </p>
            <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
              <Label htmlFor="badge-preview" className="cursor-pointer">
                <div>
                  <p className="font-medium">Show All Badges as Earned</p>
                  <p className="text-sm text-muted-foreground">Preview all badges in unlocked state</p>
                </div>
              </Label>
              <Switch
                id="badge-preview"
                checked={profile?.badge_preview_mode || false}
                onCheckedChange={(checked) => updatePreviewMode.mutate(checked)}
                disabled={updatePreviewMode.isPending}
              />
            </div>
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
