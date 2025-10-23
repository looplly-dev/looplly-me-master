import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Info } from 'lucide-react';
import CheckpointCard from './CheckpointCard';
import StateInspector from './StateInspector';
import UserSelector from './UserSelector';

export default function SimulatorDashboard() {
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [refreshKey, setRefreshKey] = useState(0);

  const handleCheckpointReset = () => {
    // Refresh the state inspector after reset
    setRefreshKey(prev => prev + 1);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">User Journey Simulator</h1>
        <p className="text-muted-foreground mt-2">
          Test user flows by resetting profiles to different journey checkpoints
        </p>
      </div>

      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          This tool allows testers to simulate different stages of the user journey for testing purposes.
          Changes are applied to real user profiles, so use with caution.
        </AlertDescription>
      </Alert>

      <UserSelector onUserSelect={setSelectedUserId} />

      {selectedUserId && (
        <Tabs defaultValue="checkpoints" className="space-y-4">
          <TabsList>
            <TabsTrigger value="checkpoints">Checkpoints</TabsTrigger>
            <TabsTrigger value="state">Current State</TabsTrigger>
          </TabsList>

          <TabsContent value="checkpoints" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <CheckpointCard
                checkpoint={{
                  id: 'fresh_signup',
                  name: 'Fresh Signup',
                  description: 'New account with nothing completed',
                  resets: ['Profile', 'Answers', 'Reputation', 'Onboarding']
                }}
                userId={selectedUserId}
                onReset={handleCheckpointReset}
              />
              <CheckpointCard
                checkpoint={{
                  id: 'profile_complete',
                  name: 'Profile Complete',
                  description: 'Profile setup finished, ready to explore',
                  resets: ['Onboarding status only']
                }}
                userId={selectedUserId}
                onReset={handleCheckpointReset}
              />
              <CheckpointCard
                checkpoint={{
                  id: 'ready_for_surveys',
                  name: 'Ready for Surveys',
                  description: 'Profile complete with initial reputation',
                  resets: ['Partial - keeps profile data']
                }}
                userId={selectedUserId}
                onReset={handleCheckpointReset}
              />
            </div>
          </TabsContent>

          <TabsContent value="state">
            <StateInspector userId={selectedUserId} key={refreshKey} />
          </TabsContent>
        </Tabs>
      )}

      {!selectedUserId && (
        <Card>
          <CardHeader>
            <CardTitle>Select a User</CardTitle>
            <CardDescription>
              Choose a user from the dropdown above to begin simulating their journey
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Once selected, you'll be able to reset their profile to different journey checkpoints
              and inspect their current state.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
