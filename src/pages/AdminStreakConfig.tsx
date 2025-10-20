import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Save, Shield } from 'lucide-react';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import AdminLayout from '@/components/admin/AdminLayout';

function AdminStreakConfigContent() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: configs, isLoading } = useQuery({
    queryKey: ['admin-streak-configs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('streak_unlock_config')
        .select('*')
        .order('stage');

      if (error) throw error;
      return data;
    },
  });

  const updateConfigMutation = useMutation({
    mutationFn: async ({ id, configValue }: { id: string; configValue: any }) => {
      const { error } = await supabase
        .from('streak_unlock_config')
        .update({ config_value: configValue })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-streak-configs'] });
      queryClient.invalidateQueries({ queryKey: ['streak-unlock-config'] });
      toast({
        title: 'Configuration Updated',
        description: 'Streak unlock requirements have been saved.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Update Failed',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const [editingConfig, setEditingConfig] = useState<{ [key: string]: any }>({});

  const handleSave = (config: any) => {
    const updatedValue = editingConfig[config.id] || config.config_value;
    updateConfigMutation.mutate({ id: config.id, configValue: updatedValue });
  };

  const handleChange = (configId: string, field: string, value: any) => {
    setEditingConfig(prev => ({
      ...prev,
      [configId]: {
        ...(prev[configId] || configs?.find(c => c.id === configId)?.config_value || {}),
        [field]: value,
      },
    }));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const stage2Config = configs?.find(c => c.stage === 2);

  const getConfigValue = (config: any, key: string) => {
    if (typeof config.config_value === 'object' && config.config_value !== null) {
      return (config.config_value as any)[key];
    }
    return undefined;
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-3 mb-8">
        <Shield className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold">Streak Unlock Configuration</h1>
          <p className="text-muted-foreground">Manage requirements for unlocking streak stages</p>
        </div>
      </div>

      <div className="grid gap-6">
        {/* Stage 1 */}
        <Card>
          <CardHeader>
            <CardTitle>Stage 1: Always Unlocked</CardTitle>
            <CardDescription>Default stage - no requirements</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Stage 1 is always available to all users by default.
            </p>
          </CardContent>
        </Card>

        {/* Stage 2 */}
        {stage2Config && (
          <Card>
            <CardHeader>
              <CardTitle>Stage 2: Badge Requirements</CardTitle>
              <CardDescription>{stage2Config.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="stage2-required">Required Badges</Label>
                  <Input
                    id="stage2-required"
                    type="number"
                    min="1"
                    max="5"
                    value={editingConfig[stage2Config.id]?.required ?? getConfigValue(stage2Config, 'required')}
                    onChange={(e) => handleChange(stage2Config.id, 'required', parseInt(e.target.value))}
                  />
                </div>
                <div>
                  <Label htmlFor="stage2-total">Total Badges</Label>
                  <Input
                    id="stage2-total"
                    type="number"
                    disabled
                    value={getConfigValue(stage2Config, 'total')}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="stage2-message">Display Message</Label>
                <Input
                  id="stage2-message"
                  value={editingConfig[stage2Config.id]?.message ?? getConfigValue(stage2Config, 'message')}
                  onChange={(e) => handleChange(stage2Config.id, 'message', e.target.value)}
                />
              </div>
              <Button onClick={() => handleSave(stage2Config)} disabled={updateConfigMutation.isPending}>
                {updateConfigMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                Save Changes
              </Button>
            </CardContent>
          </Card>
        )}

      </div>
    </div>
  );
}

export default function AdminStreakConfig() {
  return (
    <ProtectedRoute requiredRole="admin">
      <AdminLayout>
        <AdminStreakConfigContent />
      </AdminLayout>
    </ProtectedRoute>
  );
}
