import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useIntegrationStatus, useTestIntegration } from '@/hooks/useIntegrationStatus';
import { 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Settings2, 
  ExternalLink,
  RefreshCw,
  PlayCircle
} from 'lucide-react';
import type { IntegrationConfig, IntegrationStatus } from '@/types/integrations';
import { toast } from 'sonner';

const statusConfig: Record<IntegrationStatus, { icon: any; className: string; label: string }> = {
  active: { icon: CheckCircle2, className: 'text-green-600 bg-green-50', label: 'Active' },
  mock: { icon: AlertTriangle, className: 'text-amber-600 bg-amber-50', label: 'Mock Mode' },
  configured: { icon: CheckCircle2, className: 'text-blue-600 bg-blue-50', label: 'Configured' },
  not_configured: { icon: Settings2, className: 'text-gray-400 bg-gray-50', label: 'Not Configured' },
  error: { icon: XCircle, className: 'text-red-600 bg-red-50', label: 'Error' }
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

  const handleTest = async () => {
    const result = await testMutation.mutateAsync(integration.id);
    if (result.success) {
      toast.success(result.message);
    } else {
      toast.error(result.message);
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
          {integration.documentationUrl && (
            <Button size="sm" variant="ghost" asChild>
              <a href={integration.documentationUrl} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-3 w-3 mr-1" />
                Documentation
              </a>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default function AdminIntegrations() {
  const { data, isLoading, refetch } = useIntegrationStatus();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Integration Management</h1>
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

  if (!data) return null;

  const groupedIntegrations = data.integrations.reduce((acc, integration) => {
    if (!acc[integration.category]) {
      acc[integration.category] = [];
    }
    acc[integration.category].push(integration);
    return acc;
  }, {} as Record<string, IntegrationConfig[]>);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Integration Management</h1>
          <p className="text-muted-foreground">Manage and monitor all external service integrations</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => refetch()}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Integrations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.summary.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{data.summary.active}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Mock Mode</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">{data.summary.mock}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Not Configured</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-400">{data.summary.notConfigured}</div>
          </CardContent>
        </Card>
      </div>

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
    </div>
  );
}
