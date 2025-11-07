import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { RefreshCw, Loader2 } from 'lucide-react';
import { adminClient } from '@/integrations/supabase/adminClient';

interface StateInspectorProps {
  userId: string;
}

interface UserState {
  profile: any;
  reputation: any;
  answersCount: number;
}

export default function StateInspector({ userId }: StateInspectorProps) {
  const [state, setState] = useState<UserState | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchState = async () => {
    setIsLoading(true);
    try {
      const [profileRes, reputationRes, answersRes] = await Promise.all([
        adminClient
          .from('profiles')
          .select('*')
          .eq('user_id', userId)
          .single(),
        adminClient
          .from('user_reputation')
          .select('*')
          .eq('user_id', userId)
          .single(),
        adminClient
          .from('profile_answers')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', userId),
      ]);

      setState({
        profile: profileRes.data,
        reputation: reputationRes.data,
        answersCount: answersRes.count || 0,
      });
    } catch (error) {
      console.error('Error fetching state:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchState();
  }, [userId]);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6 flex items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (!state) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>State Inspector</CardTitle>
          <CardDescription>Failed to load user state</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Current User State</CardTitle>
            <CardDescription>Real-time snapshot of user's journey progress</CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={fetchState}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Profile Section */}
        <div>
          <h3 className="text-sm font-semibold mb-3">Profile Information</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Profile Complete</p>
              <Badge variant={state.profile?.profile_complete ? 'default' : 'secondary'}>
                {state.profile?.profile_complete ? 'Yes' : 'No'}
              </Badge>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Completeness Score</p>
              <p className="text-lg font-semibold">{state.profile?.profile_completeness_score || 0}%</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Profile Level</p>
              <p className="text-lg font-semibold">{state.profile?.profile_level || 1}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Verified</p>
              <Badge variant={state.profile?.is_verified ? 'default' : 'secondary'}>
                {state.profile?.is_verified ? 'Yes' : 'No'}
              </Badge>
            </div>
          </div>
        </div>

        <Separator />

        {/* Reputation Section */}
        <div>
          <h3 className="text-sm font-semibold mb-3">Reputation Status</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Current Score</p>
              <p className="text-lg font-semibold">{state.reputation?.score || 0}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Level</p>
              <Badge variant="outline">{state.reputation?.level || 'Bronze Novice'}</Badge>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Tier</p>
              <Badge>{state.reputation?.tier || 'Bronze'}</Badge>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Next Threshold</p>
              <p className="text-lg font-semibold">{state.reputation?.next_level_threshold || 100}</p>
            </div>
          </div>
        </div>

        <Separator />

        {/* Profile Answers Section */}
        <div>
          <h3 className="text-sm font-semibold mb-3">Profile Questions</h3>
          <div className="flex items-center gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Answered Questions</p>
              <p className="text-2xl font-bold">{state.answersCount}</p>
            </div>
          </div>
        </div>

        {/* Additional Metadata */}
        <Separator />
        <div>
          <h3 className="text-sm font-semibold mb-3">Timestamps</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Profile Created:</span>
              <span>{state.profile?.created_at ? new Date(state.profile.created_at).toLocaleString() : 'N/A'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Last Updated:</span>
              <span>{state.profile?.last_profile_update ? new Date(state.profile.last_profile_update).toLocaleString() : 'N/A'}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
