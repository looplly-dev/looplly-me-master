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
  const [iframeError, setIframeError] = useState(false);

  // Parse session and construct URL with custom JWT token
  const simulatorUrl = (() => {
    try {
      let session;
      try {
        session = JSON.parse(sessionToken);
      } catch (parseError) {
        console.error('[SimulatorIframe] ❌ Failed to parse session token:', parseError);
        throw new Error('Invalid session token format');
      }

      const customToken = session.custom_token;
      const showUI = session.show_ui;

      if (!customToken) {
        console.error('[SimulatorIframe] ❌ No custom_token in session:', session);
        throw new Error('Missing custom_token in session');
      }

      // Explicitly encode token (URLSearchParams already does this, but being explicit)
      const params = new URLSearchParams();
      params.set('custom_token', customToken);
      params.set('stage', stage);
      params.set('key', iframeKey.toString());
      params.set('ts', Date.now().toString());

      if (showUI) {
        params.set('show_ui', showUI);
      }

      const url = `${window.location.origin}/simulator/session?${params}`;
      console.info('[SimulatorIframe] ✅ Generated URL');
      return url;
    } catch (error) {
      console.error('[SimulatorIframe] ❌ URL generation failed:', error);
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
    setIframeError(false);
    setIframeKey(prev => prev + 1);
  }, [sessionToken, stage]);

  // Log iframe URL and detect load failures
  useEffect(() => {
    if (simulatorUrl) {
      console.info('[SimulatorIframe] URL:', simulatorUrl);
    }
    
    // Detect if iframe fails to load (likely CORS issue)
    const timeout = setTimeout(() => {
      if (isLoading) {
        console.warn('[SimulatorIframe] Load timeout - possible CORS issue');
        setIframeError(true);
        setIsLoading(false);
      }
    }, 5000); // 5 second timeout
    
    return () => clearTimeout(timeout);
  }, [simulatorUrl, iframeKey, isLoading]);

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

      {iframeError ? (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="space-y-2">
            <p><strong>CORS Error Detected:</strong> The simulator couldn't load in an iframe due to platform authentication restrictions.</p>
            <p className="text-sm">This is a known limitation in preview environments. Please use "Open in Tab" instead.</p>
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleOpenInNewTab}
              className="mt-2"
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Open Simulator in New Tab
            </Button>
          </AlertDescription>
        </Alert>
      ) : (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>Simulator Mode Active:</strong> You are viewing the app as a test user. 
            Any actions taken will affect only the test account's data.
          </AlertDescription>
        </Alert>
      )}

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
