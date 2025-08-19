import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { 
  FileText, 
  Play, 
  Zap, 
  Gift, 
  Clock, 
  Coins, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Star,
  BarChart3
} from 'lucide-react';
import { useBalance } from '@/hooks/useBalance';
import { useEarningActivities } from '@/hooks/useEarningActivities';
import { useTransactions } from '@/hooks/useTransactions';

export default function EarnTab() {
  const [checkInDone, setCheckInDone] = useState(false);
  const { toast } = useToast();
  const { balance } = useBalance();
  const { activities, addActivity } = useEarningActivities();
  const { addTransaction } = useTransactions();

  const handleStartTask = (type: string, title: string, reward: number) => {
    toast({
      title: 'Task Started!',
      description: `You've started "${title}" - Earn $${reward.toFixed(2)}!`,
    });
  };

  const handleCheckIn = () => {
    if (checkInDone) return;
    
    setCheckInDone(true);
    
    // Add check-in transaction
    addTransaction({
      type: 'bonus',
      amount: 0.50,
      currency: 'USD',
      description: 'Daily check-in bonus',
      source: 'daily_checkin',
      status: 'completed',
      metadata: { streak: 1 }
    });

    toast({
      title: 'Daily Bonus!',
      description: `You earned $0.50! Keep your streak going!`,
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-success" />;
      case 'ineligible':
        return <XCircle className="h-4 w-4 text-destructive" />;
      default:
        return <Clock className="h-4 w-4 text-primary" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge variant="outline" className="text-success border-success">Completed</Badge>;
      case 'ineligible':
        return <Badge variant="destructive">Ineligible</Badge>;
      default:
        return <Badge variant="outline" className="text-primary border-primary">Available</Badge>;
    }
  };

  return (
    <div className="p-4 pb-20 space-y-6">
      {/* Balance Card */}
      <Card className="bg-primary text-white border-0 shadow-lg">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-white/80 text-sm">Current Balance</p>
              <p className="text-3xl font-bold">${balance?.available_balance?.toFixed(2) || '0.00'}</p>
              <p className="text-white/80 text-sm">USD</p>
            </div>
            <Coins className="h-12 w-12 text-white/60" />
          </div>
          <div className="grid grid-cols-3 gap-4 pt-4 border-t border-white/20">
            <div className="text-center">
              <p className="text-xl font-bold">{activities.filter(a => a.activity_type === 'survey' && a.status === 'completed').length}</p>
              <p className="text-white/80 text-xs">Surveys</p>
            </div>
            <div className="text-center">
              <p className="text-xl font-bold">{activities.filter(a => a.activity_type === 'video' && a.status === 'completed').length}</p>
              <p className="text-white/80 text-xs">Videos</p>
            </div>
            <div className="text-center">
              <p className="text-xl font-bold">{activities.filter(a => a.activity_type === 'task' && a.status === 'completed').length}</p>
              <p className="text-white/80 text-xs">Tasks</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Daily Check-in */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-success/10 rounded-lg">
                <Gift className="h-6 w-6 text-success" />
              </div>
              <div>
                <h3 className="font-semibold">Daily Check-in</h3>
                <p className="text-sm text-muted-foreground">
                  Daily streak: 1 day
                </p>
              </div>
            </div>
            <Button
              variant={checkInDone ? "secondary" : "success"}
              size="sm"
              onClick={handleCheckIn}
              disabled={checkInDone}
            >
              {checkInDone ? (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Done
                </>
              ) : (
                <>
                  <Star className="h-4 w-4 mr-2" />
                  +$0.50
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Earning Opportunities */}
      <Tabs defaultValue="surveys" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="surveys" className="text-xs">Surveys</TabsTrigger>
          <TabsTrigger value="videos" className="text-xs">Videos</TabsTrigger>
          <TabsTrigger value="tasks" className="text-xs">Tasks</TabsTrigger>
          <TabsTrigger value="data" className="text-xs">Data</TabsTrigger>
        </TabsList>

        <TabsContent value="surveys" className="space-y-4 mt-4">
          {activities.filter(a => a.activity_type === 'survey').length === 0 ? (
            <Card className="border-primary/50 bg-primary/5">
              <CardContent className="p-6 text-center">
                <FileText className="h-12 w-12 mx-auto mb-4 text-primary/50" />
                <h3 className="font-semibold mb-2">No Surveys Available</h3>
                <p className="text-sm text-muted-foreground">
                  Check back later for new survey opportunities!
                </p>
              </CardContent>
            </Card>
          ) : (
            activities.filter(a => a.activity_type === 'survey').map((activity) => (
              <Card key={activity.id} className="border-l-4 border-l-primary/50">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <FileText className="h-4 w-4 text-primary" />
                        <h3 className="font-semibold text-sm">{activity.title}</h3>
                      </div>
                      <p className="text-xs text-muted-foreground mb-2">
                        {activity.description}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {activity.time_estimate || 5} min
                        </span>
                        <span className="flex items-center gap-1">
                          <Coins className="h-3 w-3" />
                          ${activity.reward_amount.toFixed(2)}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      {getStatusBadge(activity.status)}
                      {activity.status === 'available' && (
                        <Button
                          size="sm"
                          onClick={() => handleStartTask('survey', activity.title, activity.reward_amount)}
                          className="text-xs h-8"
                        >
                          Start
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="videos" className="space-y-4 mt-4">
          {activities.filter(a => a.activity_type === 'video').length === 0 ? (
            <Card className="border-accent/50 bg-accent/5">
              <CardContent className="p-6 text-center">
                <Play className="h-12 w-12 mx-auto mb-4 text-accent/50" />
                <h3 className="font-semibold mb-2">No Videos Available</h3>
                <p className="text-sm text-muted-foreground">
                  Video opportunities will appear here when available!
                </p>
              </CardContent>
            </Card>
          ) : (
            activities.filter(a => a.activity_type === 'video').map((activity) => (
              <Card key={activity.id} className="border-l-4 border-l-accent/50">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="text-2xl">🎥</div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Play className="h-4 w-4 text-accent" />
                        <h3 className="font-semibold text-sm">{activity.title}</h3>
                      </div>
                      <p className="text-xs text-muted-foreground mb-2">
                        {activity.description}
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {activity.time_estimate || 2} min
                          </span>
                          <span className="flex items-center gap-1">
                            <Coins className="h-3 w-3" />
                            ${activity.reward_amount.toFixed(2)}
                          </span>
                        </div>
                        {activity.status === 'available' ? (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleStartTask('video', activity.title, activity.reward_amount)}
                            className="text-xs h-8"
                          >
                            Watch
                          </Button>
                        ) : (
                          <Badge variant="outline" className="text-success border-success">
                            Watched
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="tasks" className="space-y-4 mt-4">
          {/* Quick Poll */}
          <Card className="border-l-4 border-l-info/50 bg-info/5">
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <BarChart3 className="h-4 w-4 text-info" />
                    <h3 className="font-semibold text-sm">Quick Poll: Favorite Social Media Platform</h3>
                    <Badge variant="outline" className="text-xs">New</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mb-2">
                    Help us understand social media preferences - just one quick question!
                  </p>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      30 sec
                    </span>
                    <span className="flex items-center gap-1">
                      <Coins className="h-3 w-3" />
                      $0.15
                    </span>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleStartTask('poll', 'Quick Poll: Favorite Social Media Platform', 0.15)}
                    className="text-xs h-8"
                  >
                    Vote
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {activities.filter(a => a.activity_type === 'task').length === 0 ? (
            <Card className="border-warning/50 bg-warning/5">
              <CardContent className="p-6 text-center">
                <Zap className="h-12 w-12 mx-auto mb-4 text-warning/50" />
                <h3 className="font-semibold mb-2">No Tasks Available</h3>
                <p className="text-sm text-muted-foreground">
                  Micro-tasks will be posted here when available!
                </p>
              </CardContent>
            </Card>
          ) : (
            activities.filter(a => a.activity_type === 'task').map((activity) => (
              <Card key={activity.id} className="border-l-4 border-l-warning/50">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Zap className="h-4 w-4 text-warning" />
                        <h3 className="font-semibold text-sm">{activity.title}</h3>
                      </div>
                      <p className="text-xs text-muted-foreground mb-2">
                        {activity.description}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {activity.time_estimate || 1} min
                        </span>
                        <span className="flex items-center gap-1">
                          <Coins className="h-3 w-3" />
                          ${activity.reward_amount.toFixed(2)}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      {activity.status === 'available' ? (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleStartTask('task', activity.title, activity.reward_amount)}
                          className="text-xs h-8"
                        >
                          Start
                        </Button>
                      ) : (
                        <Badge variant="outline" className="text-success border-success">
                          Done
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="data" className="space-y-4 mt-4">
          <Card className="border-primary/50 bg-primary/5">
            <CardContent className="p-4">
              <div className="flex gap-3 mb-4">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <div className="text-lg">🔄</div>
                </div>
                <div>
                  <h3 className="font-semibold text-sm mb-1">Data Revenue Sharing</h3>
                  <p className="text-xs text-muted-foreground">
                    Earn when Looplly generates revenue from your opted-in data
                  </p>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-background/50 rounded-lg">
                  <div>
                    <p className="font-medium text-sm">Location Data</p>
                    <p className="text-xs text-muted-foreground">Anonymous location insights</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-success">$0.05/month</p>
                    <Badge variant="outline" className="text-success border-success text-xs">
                      Active
                    </Badge>
                  </div>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-background/50 rounded-lg">
                  <div>
                    <p className="font-medium text-sm">Shopping Behavior</p>
                    <p className="text-xs text-muted-foreground">Purchase pattern analysis</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-success">$0.10/month</p>
                    <Badge variant="secondary" className="text-xs">
                      Opt-in
                    </Badge>
                  </div>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-background/50 rounded-lg">
                  <div>
                    <p className="font-medium text-sm">App Usage Patterns</p>
                    <p className="text-xs text-muted-foreground">Digital behavior insights</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-success">$0.08/month</p>
                    <Badge variant="secondary" className="text-xs">
                      Opt-in
                    </Badge>
                  </div>
                </div>
              </div>
              
              <div className="mt-4 p-3 bg-info/5 rounded-lg">
                <p className="text-xs text-muted-foreground">
                  💡 <strong>Transparent Earnings:</strong> You earn a share of revenue each time your data contributes to insights sold to research partners. All data is anonymized and aggregated.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}