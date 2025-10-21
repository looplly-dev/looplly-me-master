import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import AdminLayout from '@/components/admin/AdminLayout';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  RefreshCw, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  Lock, 
  Smartphone,
  Trophy,
  UserCheck,
  Clock,
  TrendingUp,
  Search
} from 'lucide-react';
import { format } from 'date-fns';

// Earning rule definitions
const EARNING_RULES = [
  {
    id: 'mobile_verification',
    title: 'Mobile Verification',
    priority: 1,
    blockType: 'hard',
    icon: Smartphone,
    color: 'red',
    description: 'User must verify their mobile number',
  },
  {
    id: 'stage2_unlock',
    title: 'Stage 2 Unlock',
    priority: 2,
    blockType: 'hard',
    icon: Trophy,
    color: 'orange',
    description: 'User must unlock Stage 2 (7-day streak)',
  },
  {
    id: 'profile_completion',
    title: 'Profile Completion (Level 2)',
    priority: 3,
    blockType: 'conditional',
    icon: UserCheck,
    color: 'yellow',
    description: 'User must complete Level 2 (except grace period)',
  },
  {
    id: 'data_freshness',
    title: 'Data Freshness',
    priority: 4,
    blockType: 'soft',
    icon: Clock,
    color: 'blue',
    description: 'User profile data should be < 6 months old',
  },
];

interface RuleStats {
  mobileUnverified: number;
  stage2Locked: number;
  profileIncomplete: number;
  staleData: number;
  gracePeriodCountries: string[];
}

interface JobDistribution {
  level0: { surveys: number; videos: number; tasks: number; data: number; total: number };
  level1: { surveys: number; videos: number; tasks: number; data: number; total: number };
  level2: { surveys: number; videos: number; tasks: number; data: number; total: number };
  level3: { surveys: number; videos: number; tasks: number; data: number; total: number };
}

function AdminEarningRulesContent() {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);
  const [userLookupInput, setUserLookupInput] = useState('');
  const [lookupResult, setLookupResult] = useState<any>(null);

  // Fetch rule statistics
  const { data: ruleStats, refetch: refetchStats } = useQuery({
    queryKey: ['earning-rule-stats'],
    queryFn: async (): Promise<RuleStats> => {
      const [
        mobileUnverifiedResult,
        stage2LockedResult,
        profileIncompleteResult,
        staleDataResult,
        gracePeriodResult
      ] = await Promise.all([
        supabase.from('profiles').select('user_id', { count: 'exact', head: true }).eq('is_verified', false),
        supabase.from('user_streaks').select('user_id', { count: 'exact', head: true }).or('unlocked_stages->stage2.is.null,unlocked_stages->stage2.eq.false'),
        supabase.from('profiles').select('user_id', { count: 'exact', head: true }).lt('profile_level', 2).not('country_iso', 'in', `(SELECT country_iso FROM country_profiling_gaps WHERE status = 'pending')`),
        supabase.from('profile_answers').select('user_id', { count: 'exact', head: true }).lt('last_updated', new Date(Date.now() - 182 * 24 * 60 * 60 * 1000).toISOString()),
        supabase.from('country_profiling_gaps').select('country_iso').eq('status', 'pending')
      ]);

      return {
        mobileUnverified: mobileUnverifiedResult.count || 0,
        stage2Locked: stage2LockedResult.count || 0,
        profileIncomplete: profileIncompleteResult.count || 0,
        staleData: staleDataResult.count || 0,
        gracePeriodCountries: gracePeriodResult.data?.map((g: any) => g.country_iso) || [],
      };
    },
    refetchOnMount: false,
    staleTime: Infinity,
  });

  // Fetch job distribution by targeting level
  const { data: jobDistribution, refetch: refetchJobs } = useQuery({
    queryKey: ['job-distribution'],
    queryFn: async (): Promise<JobDistribution> => {
      const { data: activities } = await supabase
        .from('earning_activities')
        .select('activity_type, targeting_requirements');

      const distribution: JobDistribution = {
        level0: { surveys: 0, videos: 0, tasks: 0, data: 0, total: 0 },
        level1: { surveys: 0, videos: 0, tasks: 0, data: 0, total: 0 },
        level2: { surveys: 0, videos: 0, tasks: 0, data: 0, total: 0 },
        level3: { surveys: 0, videos: 0, tasks: 0, data: 0, total: 0 },
      };

      activities?.forEach((activity: any) => {
        const level = activity.targeting_requirements?.level || 0;
        const type = activity.activity_type;
        const levelKey = `level${level}` as keyof JobDistribution;
        
        if (distribution[levelKey]) {
          distribution[levelKey][type as keyof typeof distribution.level0]++;
          distribution[levelKey].total++;
        }
      });

      return distribution;
    },
    refetchOnMount: false,
    staleTime: Infinity,
  });

  // Fetch recent blocks from audit logs
  const { data: recentBlocks, refetch: refetchBlocks } = useQuery({
    queryKey: ['recent-earning-blocks'],
    queryFn: async () => {
      const { data } = await supabase
        .from('audit_logs')
        .select(`
          *,
          profiles!inner(email, first_name, last_name)
        `)
        .eq('action', 'earning_blocked')
        .order('created_at', { ascending: false })
        .limit(20);

      return data || [];
    },
    refetchOnMount: false,
    staleTime: Infinity,
  });

  // Manual refresh handler
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await Promise.all([
      refetchStats(),
      refetchJobs(),
      refetchBlocks(),
    ]);
    setLastRefresh(new Date());
    setIsRefreshing(false);
  };

  // Helper to detect input type
  const detectInputType = (input: string): 'uuid' | 'email' | 'mobile' => {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (uuidRegex.test(input)) return 'uuid';
    if (input.includes('@')) return 'email';
    return 'mobile';
  };

  // User lookup handler
  const handleUserLookup = async () => {
    const trimmedInput = userLookupInput.trim();
    if (!trimmedInput) return;

    try {
      const inputType = detectInputType(trimmedInput);
      
      // Build query based on input type
      let query = supabase
        .from('profiles')
        .select('*, user_streaks(*)');

      switch (inputType) {
        case 'uuid':
          query = query.eq('user_id', trimmedInput);
          break;
        case 'email':
          query = query.eq('email', trimmedInput);
          break;
        case 'mobile':
          query = query.eq('mobile', trimmedInput);
          break;
      }

      const { data: profile, error: profileError } = await query.maybeSingle();

      if (profileError) throw profileError;

      if (!profile) {
        const fieldName = inputType === 'uuid' ? 'user ID' : inputType;
        setLookupResult({ error: `User not found with ${fieldName}: ${trimmedInput}` });
        return;
      }

      // Check against all rules
      const checks = {
        mobileVerified: profile.is_verified === true,
        stage2Unlocked: profile.user_streaks?.[0]?.unlocked_stages?.stage2 === true,
        profileComplete: profile.profile_level >= 2,
        dataFresh: true, // TODO: implement stale check
        inGracePeriod: ruleStats?.gracePeriodCountries?.includes(profile.country_iso) || false,
      };

      setLookupResult({
        profile,
        checks,
        canEarn: checks.mobileVerified && 
                 checks.stage2Unlocked && 
                 (checks.profileComplete || checks.inGracePeriod),
      });
    } catch (error) {
      console.error('Lookup error:', error);
      setLookupResult({ error: 'Error looking up user' });
    }
  };

  const getRuleBlockCount = (ruleId: string) => {
    if (!ruleStats) return 0;
    switch (ruleId) {
      case 'mobile_verification': return ruleStats.mobileUnverified;
      case 'stage2_unlock': return ruleStats.stage2Locked;
      case 'profile_completion': return ruleStats.profileIncomplete;
      case 'data_freshness': return ruleStats.staleData;
      default: return 0;
    }
  };

  const getColorClasses = (color: string) => {
    const colors = {
      red: 'border-red-200 bg-red-50 dark:bg-red-950/20',
      orange: 'border-orange-200 bg-orange-50 dark:bg-orange-950/20',
      yellow: 'border-yellow-200 bg-yellow-50 dark:bg-yellow-950/20',
      blue: 'border-blue-200 bg-blue-50 dark:bg-blue-950/20',
    };
    return colors[color as keyof typeof colors] || '';
  };

  const getColorText = (color: string) => {
    const colors = {
      red: 'text-red-700 dark:text-red-400',
      orange: 'text-orange-700 dark:text-orange-400',
      yellow: 'text-yellow-700 dark:text-yellow-400',
      blue: 'text-blue-700 dark:text-blue-400',
    };
    return colors[color as keyof typeof colors] || '';
  };

  return (
    <div className="space-y-6">
      {/* Header with manual refresh */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Earning Rules Dashboard</h1>
          <p className="text-muted-foreground">
            Monitor and track all earning access requirements
          </p>
        </div>
        <div className="flex items-center gap-3">
          {lastRefresh && (
            <span className="text-sm text-muted-foreground">
              Last updated: {format(lastRefresh, 'HH:mm:ss')}
            </span>
          )}
          <Button 
            onClick={handleRefresh} 
            disabled={isRefreshing}
            size="lg"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* 4 Rule Status Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {EARNING_RULES.map(rule => {
          const RuleIcon = rule.icon;
          const blockCount = getRuleBlockCount(rule.id);
          
          return (
            <Card key={rule.id} className={`border-2 ${getColorClasses(rule.color)}`}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <RuleIcon className={`h-5 w-5 ${getColorText(rule.color)}`} />
                  <div className="flex gap-1">
                    <Badge variant="outline" className="text-xs">
                      P{rule.priority}
                    </Badge>
                    <Badge variant="secondary" className="text-xs">
                      {rule.blockType}
                    </Badge>
                  </div>
                </div>
                <h3 className="font-semibold text-sm mb-1">{rule.title}</h3>
                <p className="text-xs text-muted-foreground mb-3">{rule.description}</p>
                <div className="flex items-baseline gap-2">
                  <span className={`text-3xl font-bold ${getColorText(rule.color)}`}>
                    {blockCount}
                  </span>
                  <span className="text-sm text-muted-foreground">users blocked</span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Grace Period Alert */}
      {ruleStats?.gracePeriodCountries && ruleStats.gracePeriodCountries.length > 0 && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Grace Period Active</AlertTitle>
          <AlertDescription>
            <strong>{ruleStats.gracePeriodCountries.join(', ')}</strong> currently in grace period.
            Users from these countries can access Level 0 and Level 1 jobs only.
            <br />
            <span className="text-sm mt-1 block">
              Available: {(jobDistribution?.level0.total || 0) + (jobDistribution?.level1.total || 0)} opportunities
              • Locked: {(jobDistribution?.level2.total || 0) + (jobDistribution?.level3.total || 0)} opportunities
            </span>
          </AlertDescription>
        </Alert>
      )}

      {/* Opportunity Distribution */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Opportunity Distribution by Targeting Level
          </CardTitle>
          <CardDescription>
            Shows how many jobs require each profile level. Grace period users can only access Level 0/1 jobs.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Level summary cards */}
            <div className="grid grid-cols-4 gap-4">
              <Card className="border-2 border-green-200 bg-green-50 dark:bg-green-950/20">
                <CardContent className="p-4">
                  <div className="text-center">
                    <p className="text-3xl font-bold text-green-700 dark:text-green-400">
                      {jobDistribution?.level0.total || 0}
                    </p>
                    <p className="text-sm text-muted-foreground">Level 0 Jobs</p>
                    <p className="text-xs text-green-600 dark:text-green-500 mt-1">Available to everyone</p>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="border-2 border-blue-200 bg-blue-50 dark:bg-blue-950/20">
                <CardContent className="p-4">
                  <div className="text-center">
                    <p className="text-3xl font-bold text-blue-700 dark:text-blue-400">
                      {jobDistribution?.level1.total || 0}
                    </p>
                    <p className="text-sm text-muted-foreground">Level 1 Jobs</p>
                    <p className="text-xs text-blue-600 dark:text-blue-500 mt-1">Grace period access</p>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="border-2 border-orange-200 bg-orange-50 dark:bg-orange-950/20">
                <CardContent className="p-4">
                  <div className="text-center">
                    <p className="text-3xl font-bold text-orange-700 dark:text-orange-400">
                      {jobDistribution?.level2.total || 0}
                    </p>
                    <p className="text-sm text-muted-foreground">Level 2 Jobs</p>
                    <p className="text-xs text-orange-600 dark:text-orange-500 mt-1">Require demographics</p>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="border-2 border-purple-200 bg-purple-50 dark:bg-purple-950/20">
                <CardContent className="p-4">
                  <div className="text-center">
                    <p className="text-3xl font-bold text-purple-700 dark:text-purple-400">
                      {jobDistribution?.level3.total || 0}
                    </p>
                    <p className="text-sm text-muted-foreground">Level 3 Jobs</p>
                    <p className="text-xs text-purple-600 dark:text-purple-500 mt-1">Require lifestyle data</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Breakdown by activity type */}
            <div className="pt-4 border-t">
              <h4 className="font-semibold mb-3">Breakdown by Activity Type</h4>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Activity Type</TableHead>
                    <TableHead className="text-right">Level 0</TableHead>
                    <TableHead className="text-right">Level 1</TableHead>
                    <TableHead className="text-right">Level 2</TableHead>
                    <TableHead className="text-right">Level 3</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {['surveys', 'videos', 'tasks', 'data'].map(type => (
                    <TableRow key={type}>
                      <TableCell className="font-medium capitalize">{type}</TableCell>
                      <TableCell className="text-right">
                        {jobDistribution?.level0[type as keyof typeof jobDistribution.level0] || 0}
                      </TableCell>
                      <TableCell className="text-right">
                        {jobDistribution?.level1[type as keyof typeof jobDistribution.level1] || 0}
                      </TableCell>
                      <TableCell className="text-right">
                        {jobDistribution?.level2[type as keyof typeof jobDistribution.level2] || 0}
                      </TableCell>
                      <TableCell className="text-right">
                        {jobDistribution?.level3[type as keyof typeof jobDistribution.level3] || 0}
                      </TableCell>
                      <TableCell className="text-right font-bold">
                        {(jobDistribution?.level0[type as keyof typeof jobDistribution.level0] || 0) +
                         (jobDistribution?.level1[type as keyof typeof jobDistribution.level1] || 0) +
                         (jobDistribution?.level2[type as keyof typeof jobDistribution.level2] || 0) +
                         (jobDistribution?.level3[type as keyof typeof jobDistribution.level3] || 0)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* User Lookup Tool */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            User Lookup Tool
          </CardTitle>
          <CardDescription>
            Check individual user's earning status and see which rules they pass/fail
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 mb-4">
            <Input
              placeholder="Enter email, mobile number, or user ID..."
              value={userLookupInput}
              onChange={(e) => setUserLookupInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleUserLookup()}
              className="font-mono"
            />
            <Button onClick={handleUserLookup}>
              <Search className="h-4 w-4 mr-2" />
              Lookup
            </Button>
          </div>

          {lookupResult && (
            <div className="space-y-3">
              {lookupResult.error ? (
                <Alert variant="destructive">
                  <XCircle className="h-4 w-4" />
                  <AlertDescription>{lookupResult.error}</AlertDescription>
                </Alert>
              ) : (
                <>
                  <div className="p-4 border rounded-lg bg-muted/50">
                    <p className="font-semibold mb-1">
                      {lookupResult.profile.first_name} {lookupResult.profile.last_name}
                    </p>
                    <p className="text-sm text-muted-foreground font-mono">
                      {lookupResult.profile.email} • Mobile: {lookupResult.profile.mobile || 'N/A'} • Country: {lookupResult.profile.country_iso} • Level: {lookupResult.profile.profile_level}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-semibold">Rule Checks:</h4>
                    <div className="grid gap-2">
                      <div className="flex items-center gap-2">
                        {lookupResult.checks.mobileVerified ? (
                          <CheckCircle2 className="h-4 w-4 text-green-600" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-600" />
                        )}
                        <span>Mobile Verified</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {lookupResult.checks.stage2Unlocked ? (
                          <CheckCircle2 className="h-4 w-4 text-green-600" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-600" />
                        )}
                        <span>Stage 2 Unlocked</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {lookupResult.checks.profileComplete ? (
                          <CheckCircle2 className="h-4 w-4 text-green-600" />
                        ) : lookupResult.checks.inGracePeriod ? (
                          <AlertCircle className="h-4 w-4 text-yellow-600" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-600" />
                        )}
                        <span>
                          Profile Complete (Level 2)
                          {lookupResult.checks.inGracePeriod && (
                            <Badge variant="secondary" className="ml-2 text-xs">Grace Period</Badge>
                          )}
                        </span>
                      </div>
                    </div>
                  </div>

                  <Alert variant={lookupResult.canEarn ? "default" : "destructive"}>
                    {lookupResult.canEarn ? (
                      <>
                        <CheckCircle2 className="h-4 w-4" />
                        <AlertTitle>Can Earn</AlertTitle>
                        <AlertDescription>
                          This user can access earning opportunities
                          {lookupResult.checks.inGracePeriod && ' (limited to Level 0/1 jobs during grace period)'}
                        </AlertDescription>
                      </>
                    ) : (
                      <>
                        <Lock className="h-4 w-4" />
                        <AlertTitle>Blocked from Earning</AlertTitle>
                        <AlertDescription>
                          User must complete the failed requirements above to access earning opportunities.
                        </AlertDescription>
                      </>
                    )}
                  </Alert>
                </>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Blocks Table */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Earning Blocks</CardTitle>
          <CardDescription>Last 20 users blocked from earning opportunities</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Block Reason</TableHead>
                <TableHead>Timestamp</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentBlocks && recentBlocks.length > 0 ? (
                recentBlocks.map((block: any) => (
                  <TableRow key={block.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">
                          {block.profiles?.first_name} {block.profiles?.last_name}
                        </p>
                        <p className="text-sm text-muted-foreground">{block.profiles?.email}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{block.metadata?.reason || 'Unknown'}</Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {format(new Date(block.created_at), 'MMM d, yyyy HH:mm')}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={3} className="text-center text-muted-foreground">
                    No recent blocks found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Future Enhancements Note */}
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Future Enhancements Planned</AlertTitle>
        <AlertDescription className="text-sm">
          <ul className="list-disc list-inside space-y-1 mt-2">
            <li>Historical trends (blocked users over time)</li>
            <li>CSV export functionality</li>
            <li>Bulk admin overrides (e.g., "Unlock Stage 2 for Country X")</li>
            <li>Real-time updates via Supabase Realtime</li>
            <li>Slack/email alerts for unusual spikes</li>
          </ul>
        </AlertDescription>
      </Alert>
    </div>
  );
}

export default function AdminEarningRules() {
  return (
    <ProtectedRoute requiredRole="admin">
      <AdminLayout>
        <AdminEarningRulesContent />
      </AdminLayout>
    </ProtectedRoute>
  );
}
