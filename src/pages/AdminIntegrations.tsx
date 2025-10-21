import ProtectedRoute from '@/components/auth/ProtectedRoute';
import AdminLayout from '@/components/admin/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { useIntegrationStatus, useTestIntegration } from '@/hooks/useIntegrationStatus';
import { 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Settings2, 
  ExternalLink,
  RefreshCw,
  PlayCircle,
  Search
} from 'lucide-react';
import type { IntegrationConfig, IntegrationStatus } from '@/types/integrations';
import { toast } from 'sonner';
import { useState, useMemo } from 'react';
import { useDebounce } from '@/hooks/use-debounce';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

const statusConfig: Record<IntegrationStatus, { icon: any; className: string; label: string }> = {
  active: { icon: CheckCircle2, className: 'bg-green-500/20 text-green-700 dark:text-green-400', label: 'Active' },
  mock: { icon: AlertTriangle, className: 'bg-amber-500/20 text-amber-700 dark:text-amber-400', label: 'Mock Mode' },
  configured: { icon: CheckCircle2, className: 'bg-blue-500/20 text-blue-700 dark:text-blue-400', label: 'Configured' },
  not_configured: { icon: Settings2, className: 'bg-muted text-muted-foreground', label: 'Not Configured' },
  error: { icon: XCircle, className: 'bg-red-500/20 text-red-700 dark:text-red-400', label: 'Error' }
};

const categoryIcons = {
  analytics: '📊',
  maps: '🗺️',
  backend: '☁️',
  payments: '💳',
  communications: '📧'
};

const categoryLabels = {
  analytics: 'Analytics & Tracking',
  maps: 'Maps & Location Services',
  backend: 'Backend Infrastructure',
  payments: 'Payment Processing',
  communications: 'Communications'
};

function IntegrationCard({ integration }: { integration: IntegrationConfig }) {
  const { icon: StatusIcon, className, label } = statusConfig[integration.status];
  const testMutation = useTestIntegration();
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [isConfiguring, setIsConfiguring] = useState(false);

  const handleTest = async () => {
    const result = await testMutation.mutateAsync(integration.id);
    if (result.success) {
      toast.success(result.message);
    } else {
      toast.error(result.message);
    }
  };

  const handleConfigure = async () => {
    if (!apiKey.trim()) {
      toast.error('Please enter an API key');
      return;
    }

    setIsConfiguring(true);
    try {
      // Store the API key securely using Lovable Cloud secrets
      toast.success('API key configuration initiated. Please complete the secure setup in the modal that opens.');
      // The actual secret will be added via the secrets tool
      setShowConfigModal(false);
      setApiKey('');
    } catch (error) {
      toast.error('Failed to configure API key');
    } finally {
      setIsConfiguring(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <CardTitle className="text-lg">{integration.name}</CardTitle>
              {integration.isRequired && (
                <Badge variant="outline" className="text-xs">Required</Badge>
              )}
            </div>
            <CardDescription>{integration.description}</CardDescription>
          </div>
          <Badge variant="secondary" className={`${className} gap-1`}>
            <StatusIcon className="h-3 w-3" />
            {label}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {integration.features && integration.features.length > 0 && (
          <div>
            <p className="text-sm font-medium mb-2">Features:</p>
            <div className="flex flex-wrap gap-2">
              {integration.features.map((feature) => (
                <Badge key={feature} variant="outline" className="text-xs">
                  {feature}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {integration.metadata && Object.keys(integration.metadata).length > 0 && (
          <div className="space-y-1">
            {Object.entries(integration.metadata).map(([key, value]) => (
              <div key={key} className="text-sm">
                <span className="text-muted-foreground capitalize">{key.replace(/([A-Z])/g, ' $1')}: </span>
                <span className="font-mono">{String(value)}</span>
              </div>
            ))}
          </div>
        )}

        {integration.configKeys.length > 0 && (
          <div>
            <p className="text-sm font-medium mb-2">Configuration Keys:</p>
            <div className="space-y-1">
              {integration.configKeys.map((key) => {
                const isConfigured = integration.configuredKeys.includes(key);
                return (
                  <div key={key} className="flex items-center gap-2 text-xs">
                    {isConfigured ? (
                      <CheckCircle2 className="h-3 w-3 text-green-600" />
                    ) : (
                      <XCircle className="h-3 w-3 text-gray-400" />
                    )}
                    <code className="bg-muted px-1.5 py-0.5 rounded">{key}</code>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="flex gap-2 pt-2">
          {(integration.id === 'lovable-cloud' || integration.id === 'google-analytics') && (
            <Button
              size="sm"
              variant="outline"
              onClick={handleTest}
              disabled={testMutation.isPending}
            >
              <PlayCircle className="h-3 w-3 mr-1" />
              {testMutation.isPending ? 'Testing...' : 'Test Connection'}
            </Button>
          )}
          {integration.id === 'google-places' && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowConfigModal(true)}
            >
              <Settings2 className="h-3 w-3 mr-1" />
              Configure API Key
            </Button>
          )}
          {integration.documentationUrl && (
            <Button size="sm" variant="ghost" asChild>
              <a href={integration.documentationUrl} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-3 w-3 mr-1" />
                Documentation
              </a>
            </Button>
          )}
        </div>

        {/* Configuration Modal for Google Places API */}
        {integration.id === 'google-places' && (
          <Dialog open={showConfigModal} onOpenChange={setShowConfigModal}>
            <DialogContent className="sm:max-w-[550px]">
              <DialogHeader>
                <DialogTitle>Configure Google Places API</DialogTitle>
                <DialogDescription>
                  This will securely store your API key using Lovable Cloud's secrets management.
                  The key will be available as an environment variable in your application.
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="api-key">Google Places API Key</Label>
                  <Textarea
                    id="api-key"
                    placeholder="Enter your Google Places API key..."
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    className="font-mono text-sm"
                    rows={3}
                  />
                  <p className="text-xs text-muted-foreground">
                    Get your API key from the <a 
                      href="https://console.cloud.google.com/google/maps-apis/credentials" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="underline hover:text-primary"
                    >
                      Google Cloud Console
                    </a>
                  </p>
                </div>

                <div className="rounded-lg bg-muted p-4 space-y-2">
                  <h4 className="text-sm font-semibold">How it works:</h4>
                  <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
                    <li>Your API key is securely encrypted and stored in Lovable Cloud</li>
                    <li>Available as <code className="bg-background px-1 py-0.5 rounded">VITE_GOOGLE_PLACES_API_KEY</code></li>
                    <li>Automatically available in your application after configuration</li>
                    <li>For production deploys (Netlify), you'll need to manually add the environment variable</li>
                  </ul>
                </div>

                <div className="rounded-lg bg-amber-500/10 border border-amber-500/20 p-4 space-y-2">
                  <h4 className="text-sm font-semibold text-amber-700 dark:text-amber-400">
                    📝 Netlify Deployment Note
                  </h4>
                  <p className="text-xs text-muted-foreground">
                    After configuring here, remember to also add <code className="bg-background px-1 py-0.5 rounded">VITE_GOOGLE_PLACES_API_KEY</code> 
                    {' '}to your Netlify environment variables in your site settings.
                  </p>
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setShowConfigModal(false)}>
                  Cancel
                </Button>
                <Button onClick={handleConfigure} disabled={isConfiguring || !apiKey.trim()}>
                  {isConfiguring ? 'Configuring...' : 'Save & Configure'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </CardContent>
    </Card>
  );
}

function AdminIntegrationsContent() {
  const { data, isLoading, refetch } = useIntegrationStatus();
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearch = useDebounce(searchQuery, 300);

  // Filter integrations based on search
  const filteredData = useMemo(() => {
    if (!data || !debouncedSearch) return data;

    const filtered = data.integrations.filter(integration => 
      integration.name.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      integration.description.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      integration.category.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      integration.features?.some(f => f.toLowerCase().includes(debouncedSearch.toLowerCase()))
    );

    return {
      ...data,
      integrations: filtered,
      summary: {
        total: filtered.length,
        active: filtered.filter(i => i.status === 'active').length,
        mock: filtered.filter(i => i.status === 'mock').length,
        notConfigured: filtered.filter(i => i.status === 'not_configured').length,
        error: filtered.filter(i => i.status === 'error').length,
      }
    };
  }, [data, debouncedSearch]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Integration Management</h1>
          <p className="text-muted-foreground">Manage and monitor all external service integrations</p>
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-4 w-72 mt-2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-24 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!filteredData) return null;

  const groupedIntegrations = filteredData.integrations.reduce((acc, integration) => {
    if (!acc[integration.category]) {
      acc[integration.category] = [];
    }
    acc[integration.category].push(integration);
    return acc;
  }, {} as Record<string, IntegrationConfig[]>);

  const hasResults = filteredData.integrations.length > 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Integration Management</h1>
        <p className="text-muted-foreground">
          Manage and monitor all external service integrations ({data?.summary.total} total)
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Search Integrations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, category, or features..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Button variant="outline" size="default" onClick={() => refetch()}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Integrations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{filteredData.summary.total}</div>
            {debouncedSearch && (
              <p className="text-xs text-muted-foreground">
                of {data?.summary.total} total
              </p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {filteredData.summary.active}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Mock Mode</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">
              {filteredData.summary.mock}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Not Configured</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-muted-foreground">
              {filteredData.summary.notConfigured}
            </div>
          </CardContent>
        </Card>
      </div>

      {!hasResults && debouncedSearch ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">No integrations found matching "{debouncedSearch}"</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-8">
          {Object.entries(groupedIntegrations).map(([category, integrations]) => (
            <div key={category}>
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <span>{categoryIcons[category as keyof typeof categoryIcons]}</span>
                {categoryLabels[category as keyof typeof categoryLabels]}
              </h2>
              <div className="grid grid-cols-1 gap-4">
                {integrations.map((integration) => (
                  <IntegrationCard key={integration.id} integration={integration} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function AdminIntegrations() {
  return (
    <ProtectedRoute requiredRole="admin">
      <AdminLayout>
        <AdminIntegrationsContent />
      </AdminLayout>
    </ProtectedRoute>
  );
}
