import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trash2, Plus, RefreshCw, Eye, EyeOff } from 'lucide-react';
import { configService, AppConfig } from '@/services/configService';
import { toast } from 'sonner';

export const ConfigManager: React.FC = () => {
  const [configs, setConfigs] = useState<AppConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [showSecrets, setShowSecrets] = useState(false);
  const [newConfig, setNewConfig] = useState({
    key: '',
    value: '',
    description: '',
    environment: 'production',
    is_secret: false,
    is_active: true,
  });

  const fetchConfigs = async () => {
    try {
      setLoading(true);
      await configService.refreshCache();
      // Get all configs including secrets for admin view
      const allConfigs = await configService.getAllConfigs(true);
      
      // Convert to AppConfig format for display
      const configArray: AppConfig[] = Object.entries(allConfigs).map(([key, value]) => ({
        key,
        value,
        description: null,
        environment: 'production',
        is_secret: key.toLowerCase().includes('secret') || key.toLowerCase().includes('key'),
        is_active: true,
      }));
      
      setConfigs(configArray);
    } catch (error) {
      console.error('Error fetching configs:', error);
      toast.error('Failed to fetch configurations');
    } finally {
      setLoading(false);
    }
  };

  const handleAddConfig = async () => {
    if (!newConfig.key || !newConfig.value) {
      toast.error('Key and value are required');
      return;
    }

    try {
      const success = await configService.setConfig(
        newConfig.key,
        newConfig.value,
        {
          description: newConfig.description,
          environment: newConfig.environment,
          is_secret: newConfig.is_secret,
          is_active: newConfig.is_active,
        }
      );

      if (success) {
        toast.success('Configuration added successfully');
        setNewConfig({
          key: '',
          value: '',
          description: '',
          environment: 'production',
          is_secret: false,
          is_active: true,
        });
        fetchConfigs();
      } else {
        toast.error('Failed to add configuration');
      }
    } catch (error) {
      console.error('Error adding config:', error);
      toast.error('Failed to add configuration');
    }
  };

  const handleDeleteConfig = async (key: string) => {
    if (!confirm(`Are you sure you want to delete the configuration "${key}"?`)) {
      return;
    }

    try {
      const success = await configService.deleteConfig(key);
      if (success) {
        toast.success('Configuration deleted successfully');
        fetchConfigs();
      } else {
        toast.error('Failed to delete configuration');
      }
    } catch (error) {
      console.error('Error deleting config:', error);
      toast.error('Failed to delete configuration');
    }
  };

  const handleUpdateConfig = async (config: AppConfig) => {
    try {
      const success = await configService.setConfig(
        config.key,
        config.value || '',
        {
          description: config.description || undefined,
          environment: config.environment,
          is_secret: config.is_secret,
          is_active: config.is_active,
        }
      );

      if (success) {
        toast.success('Configuration updated successfully');
        fetchConfigs();
      } else {
        toast.error('Failed to update configuration');
      }
    } catch (error) {
      console.error('Error updating config:', error);
      toast.error('Failed to update configuration');
    }
  };

  const maskValue = (value: string | null, isSecret: boolean) => {
    if (!value) return '';
    if (isSecret && !showSecrets) {
      return '••••••••';
    }
    return value;
  };

  useEffect(() => {
    fetchConfigs();
  }, []);

  return (
    <div className=\"space-y-6\">
      <div className=\"flex items-center justify-between\">
        <h2 className=\"text-2xl font-bold\">Configuration Manager</h2>
        <div className=\"flex items-center space-x-2\">
          <Button
            variant=\"outline\"
            size=\"sm\"
            onClick={() => setShowSecrets(!showSecrets)}
          >
            {showSecrets ? <EyeOff className=\"h-4 w-4\" /> : <Eye className=\"h-4 w-4\" />}
            {showSecrets ? 'Hide' : 'Show'} Secrets
          </Button>
          <Button
            variant=\"outline\"
            size=\"sm\"
            onClick={fetchConfigs}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Add New Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className=\"flex items-center\">
            <Plus className=\"h-5 w-5 mr-2\" />
            Add New Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className=\"space-y-4\">
          <div className=\"grid grid-cols-1 md:grid-cols-2 gap-4\">
            <div>
              <Label htmlFor=\"new-key\">Key</Label>
              <Input
                id=\"new-key\"
                value={newConfig.key}
                onChange={(e) => setNewConfig({ ...newConfig, key: e.target.value })}
                placeholder=\"VITE_APP_SETTING\"
              />
            </div>
            <div>
              <Label htmlFor=\"new-value\">Value</Label>
              <Input
                id=\"new-value\"
                type={newConfig.is_secret ? 'password' : 'text'}
                value={newConfig.value}
                onChange={(e) => setNewConfig({ ...newConfig, value: e.target.value })}
                placeholder=\"Configuration value\"
              />
            </div>
          </div>
          
          <div>
            <Label htmlFor=\"new-description\">Description</Label>
            <Textarea
              id=\"new-description\"
              value={newConfig.description}
              onChange={(e) => setNewConfig({ ...newConfig, description: e.target.value })}
              placeholder=\"Optional description\"
              rows={2}
            />
          </div>

          <div className=\"grid grid-cols-1 md:grid-cols-3 gap-4\">
            <div>
              <Label htmlFor=\"new-environment\">Environment</Label>
              <Select
                value={newConfig.environment}
                onValueChange={(value) => setNewConfig({ ...newConfig, environment: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder=\"Select environment\" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value=\"all\">All</SelectItem>
                  <SelectItem value=\"development\">Development</SelectItem>
                  <SelectItem value=\"production\">Production</SelectItem>
                  <SelectItem value=\"test\">Test</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className=\"flex items-center space-x-2\">
              <Switch
                id=\"new-is-secret\"
                checked={newConfig.is_secret}
                onCheckedChange={(checked) => setNewConfig({ ...newConfig, is_secret: checked })}
              />
              <Label htmlFor=\"new-is-secret\">Is Secret</Label>
            </div>
            
            <div className=\"flex items-center space-x-2\">
              <Switch
                id=\"new-is-active\"
                checked={newConfig.is_active}
                onCheckedChange={(checked) => setNewConfig({ ...newConfig, is_active: checked })}
              />
              <Label htmlFor=\"new-is-active\">Is Active</Label>
            </div>
          </div>

          <Button onClick={handleAddConfig} className=\"w-full\">
            Add Configuration
          </Button>
        </CardContent>
      </Card>

      {/* Existing Configurations */}
      <div className=\"space-y-4\">
        <h3 className=\"text-lg font-semibold\">Existing Configurations</h3>
        {loading ? (
          <div className=\"text-center py-8\">Loading configurations...</div>
        ) : configs.length === 0 ? (
          <div className=\"text-center py-8 text-muted-foreground\">
            No configurations found. Add your first configuration above.
          </div>
        ) : (
          configs.map((config) => (
            <Card key={config.key}>
              <CardContent className=\"pt-6\">
                <div className=\"flex items-center justify-between mb-4\">
                  <div className=\"flex items-center space-x-2\">
                    <h4 className=\"font-medium\">{config.key}</h4>
                    {config.is_secret && (
                      <Badge variant=\"secondary\">Secret</Badge>
                    )}
                    {!config.is_active && (
                      <Badge variant=\"outline\">Inactive</Badge>
                    )}
                    <Badge variant=\"outline\">{config.environment}</Badge>
                  </div>
                  <Button
                    variant=\"destructive\"
                    size=\"sm\"
                    onClick={() => handleDeleteConfig(config.key)}
                  >
                    <Trash2 className=\"h-4 w-4\" />
                  </Button>
                </div>
                
                <div className=\"space-y-2\">
                  <div>
                    <Label>Value</Label>
                    <Input
                      type={config.is_secret && !showSecrets ? 'password' : 'text'}
                      value={maskValue(config.value, config.is_secret)}
                      onChange={(e) => {
                        const updatedConfigs = configs.map(c =>
                          c.key === config.key ? { ...c, value: e.target.value } : c
                        );
                        setConfigs(updatedConfigs);
                      }}
                      onBlur={() => handleUpdateConfig(config)}
                    />
                  </div>
                  
                  {config.description && (
                    <div>
                      <Label>Description</Label>
                      <p className=\"text-sm text-muted-foreground\">{config.description}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};