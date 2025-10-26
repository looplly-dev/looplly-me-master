import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { RefreshCw, ExternalLink, AlertCircle } from 'lucide-react';

interface SimulatorIframeProps {
  sessionToken: string;
  stage: string;
  onReset: () => void;
}

export default function SimulatorIframe({ sessionToken, stage, onReset }: SimulatorIframeProps) {
  const [iframeKey, setIframeKey] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Parse session and construct URL with custom JWT token
  const simulatorUrl = (() => {
    try {
      const session = JSON.parse(sessionToken);
      const customToken = session.custom_token; // NEW: expect custom_token

      if (!customToken) {
        console.error('No custom_token in session object:', session);
        return '';
      }

      const params = new URLSearchParams({
        custom_token: customToken,
        stage: stage,
        key: iframeKey.toString(),
        ts: Date.now().toString()
      });

      return `${window.location.origin}/simulator-session?${params}`;
    } catch (error) {
      console.error('Failed to parse session token:', error);
      return '';
    }
  })();

  const handleRefresh = () => {
    setIsLoading(true);
    setIframeKey(prev => prev + 1);
  };

  const handleOpenInNewTab = () => {
    window.open(simulatorUrl, '_blank');
  };

  useEffect(() => {
    setIsLoading(true);
    setIframeKey(prev => prev + 1);
  }, [sessionToken, stage]);

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Live Simulator</CardTitle>
              <CardDescription>
                Interact with the app as the test user
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                disabled={isLoading}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleOpenInNewTab}
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Open in Tab
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={onReset}
              >
                End Simulation
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          <strong>Simulator Mode Active:</strong> You are viewing the app as a test user. 
          Any actions taken will affect only the test account's data.
        </AlertDescription>
      </Alert>

      <Card>
        <CardContent className="p-0">
          <div className="relative w-full bg-muted" style={{ height: '800px' }}>
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-10">
                <div className="text-center space-y-2">
                  <RefreshCw className="h-8 w-8 animate-spin mx-auto text-primary" />
                  <p className="text-sm text-muted-foreground">Loading simulator...</p>
                </div>
              </div>
            )}
            <iframe
              key={iframeKey}
              src={simulatorUrl}
              className="w-full h-full border-0"
              title="Journey Simulator"
              sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-modals"
              onLoad={() => setIsLoading(false)}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
