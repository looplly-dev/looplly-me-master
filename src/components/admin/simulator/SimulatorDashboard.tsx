import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Info, ExternalLink, RefreshCw } from 'lucide-react';
import UserSelector from './UserSelector';
import StageSelector from './StageSelector';
import SimulatorIframe from './SimulatorIframe';
import StateInspector from './StateInspector';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export default function SimulatorDashboard() {
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [selectedStage, setSelectedStage] = useState<string>('');
  const [sessionToken, setSessionToken] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const { toast } = useToast();

  const handleStartSimulation = async () => {
    if (!selectedUserId || !selectedStage) {
      toast({
        title: 'Selection Required',
        description: 'Please select both a test user and journey stage',
        variant: 'destructive'
      });
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke(
        'create-simulator-session',
        {
          body: {
            test_user_id: selectedUserId,
            stage: selectedStage
          }
        }
      );

      if (error) throw error;

      if (!data.success) {
        throw new Error(data.error || 'Failed to create simulator session');
      }

      setSessionToken(data.session_token);
      setRefreshKey(prev => prev + 1);

      toast({
        title: 'Simulation Started',
        description: `Viewing ${data.test_user.name} at ${data.stage_info.description}`,
      });

    } catch (error: any) {
      console.error('Simulation error:', error);
      toast({
        title: 'Simulation Failed',
        description: error.message || 'Failed to start simulation',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetSimulation = () => {
    setSessionToken('');
    setSelectedStage('');
    setRefreshKey(prev => prev + 1);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">User Journey Simulator</h1>
        <p className="text-muted-foreground mt-2">
          Experience the app as a test user at different journey stages
        </p>
      </div>

      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          This simulator uses isolated test accounts only. Production user data is never affected.
          Test users are marked with <code>is_test_account = true</code> and cannot be accidentally modified.
        </AlertDescription>
      </Alert>

      <div className="grid gap-4 md:grid-cols-2">
        <UserSelector onUserSelect={setSelectedUserId} />
        <StageSelector 
          onStageSelect={setSelectedStage} 
          disabled={!selectedUserId}
        />
      </div>

      {selectedUserId && selectedStage && !sessionToken && (
        <Card>
          <CardContent className="pt-6">
            <Button 
              onClick={handleStartSimulation}
              disabled={isLoading}
              size="lg"
              className="w-full"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Starting Simulation...
                </>
              ) : (
                <>
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Start Simulation
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      )}

      {sessionToken && (
        <Tabs defaultValue="simulator" className="space-y-4">
          <TabsList>
            <TabsTrigger value="simulator">Live Simulator</TabsTrigger>
            <TabsTrigger value="state">User State Inspector</TabsTrigger>
          </TabsList>

          <TabsContent value="simulator">
            <SimulatorIframe
              sessionToken={sessionToken}
              stage={selectedStage}
              onReset={handleResetSimulation}
            />
          </TabsContent>

          <TabsContent value="state">
            <StateInspector userId={selectedUserId} key={refreshKey} />
          </TabsContent>
        </Tabs>
      )}

      {!selectedUserId && (
        <Card>
          <CardHeader>
            <CardTitle>Get Started</CardTitle>
            <CardDescription>
              Follow these steps to simulate a user journey:
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ol className="list-decimal list-inside space-y-2 text-sm">
              <li>Select a test user from the dropdown</li>
              <li>Choose a journey stage to simulate</li>
              <li>Click "Start Simulation" to view the app as that user</li>
              <li>Test user's data will be reset to match the selected stage</li>
              <li>Interact with the app in the simulator iframe</li>
            </ol>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
