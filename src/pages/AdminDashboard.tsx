import ProtectedRoute from '@/components/auth/ProtectedRoute';
import AdminLayout from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, DollarSign, Award, TrendingUp, Eye, CheckCircle2, AlertTriangle, XCircle, Settings2, ArrowRight } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { adminClient } from '@/integrations/supabase/adminClient';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { useIntegrationStatus } from '@/hooks/useIntegrationStatus';
import { useNavigate } from 'react-router-dom';
import { useUserType } from '@/hooks/useUserType';
import { useState, useEffect } from 'react';
import type { IntegrationStatus } from '@/types/integrations';

const statusConfig: Record<IntegrationStatus, { icon: any; className: string; label: string }> = {
  active: { icon: CheckCircle2, className: 'bg-green-500/20 text-green-700 dark:text-green-400', label: 'Active' },
  mock: { icon: AlertTriangle, className: 'bg-amber-500/20 text-amber-700 dark:text-amber-400', label: 'Mock Mode' },
  configured: { icon: CheckCircle2, className: 'bg-blue-500/20 text-blue-700 dark:text-blue-400', label: 'Configured' },
  not_configured: { icon: Settings2, className: 'bg-gray-500/20 text-gray-700 dark:text-gray-400', label: 'Not Configured' },
  error: { icon: XCircle, className: 'bg-red-500/20 text-red-700 dark:text-red-400', label: 'Error' }
};

function AdminDashboardContent() {
  const { authState } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { userType } = useUserType();
  const { data: integrationData } = useIntegrationStatus();

  // Fetch badge preview setting (only for regular users, not team members)
  const { data: profile } = useQuery({
    queryKey: ['admin-profile', authState.user?.id],
    queryFn: async () => {
      if (!authState.user?.id) return null;
      const { data, error } = await adminClient
        .from('profiles')
        .select('badge_preview_mode')
        .eq('user_id', authState.user.id)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!authState.user?.id && userType === 'looplly_user',
  });

  // Update badge preview mode
  const updatePreviewMode = useMutation({
    mutationFn: async (enabled: boolean) => {
      if (!authState.user?.id) throw new Error('No user ID');
      const { error } = await adminClient
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

        {userType === 'looplly_user' && (
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
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Settings2 className="h-5 w-5" />
              Integration Status
            </span>
            {integrationData && (
              <div className="flex items-center gap-2 text-sm">
                <Badge variant="secondary" className="gap-1">
                  <CheckCircle2 className="h-3 w-3" />
                  {integrationData.summary.active} Active
                </Badge>
                {integrationData.summary.mock > 0 && (
                  <Badge variant="secondary" className="gap-1 bg-amber-500/20 text-amber-700 dark:text-amber-400">
                    <AlertTriangle className="h-3 w-3" />
                    {integrationData.summary.mock} Mock
                  </Badge>
                )}
              </div>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {integrationData ? (
            <div className="space-y-3">
              {integrationData.integrations.slice(0, 4).map((integration) => {
                const { icon: StatusIcon, className, label } = statusConfig[integration.status];
                return (
                  <div key={integration.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <div className="flex-1">
                      <p className="font-medium">{integration.name}</p>
                      <p className="text-sm text-muted-foreground">{integration.description}</p>
                    </div>
                    <Badge variant="secondary" className={`${className} gap-1 shrink-0`}>
                      <StatusIcon className="h-3 w-3" />
                      {label}
                    </Badge>
                  </div>
                );
              })}
              <Button 
                variant="outline" 
                className="w-full mt-2"
                onClick={() => navigate('/admin/integrations')}
              >
                View All Integrations
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Loading integration status...</p>
          )}
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
