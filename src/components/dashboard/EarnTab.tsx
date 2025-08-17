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
  Star
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
    toast({
      title: 'Daily Bonus!',
      description: `You earned $0.50! Streak: ${userStats.checkInStreak + 1} days`,
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
      <Card className="bg-gradient-to-r from-primary to-accent text-white border-0 shadow-lg">
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
                  Streak: {userStats.checkInStreak} days
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
          {mockSurveys.map((survey) => (
            <Card key={survey.id} className="border-l-4 border-l-primary/50">
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <FileText className="h-4 w-4 text-primary" />
                      <h3 className="font-semibold text-sm">{survey.title}</h3>
                    </div>
                    <p className="text-xs text-muted-foreground mb-2">
                      {survey.description}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {survey.estimatedMinutes} min
                      </span>
                      <span className="flex items-center gap-1">
                        <Coins className="h-3 w-3" />
                        ${survey.reward.toFixed(2)}
                      </span>
                      {survey.rating && (
                        <span className="flex items-center gap-1">
                          <Star className="h-3 w-3 fill-warning text-warning" />
                          {survey.rating.average.toFixed(1)} ({survey.rating.count})
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    {getStatusBadge(survey.status)}
                    {survey.status === 'available' && (
                      <Button
                        size="sm"
                        onClick={() => handleStartTask('survey', survey.title, survey.reward)}
                        className="text-xs h-8"
                      >
                        Start
                      </Button>
                    )}
                    {survey.status === 'ineligible' && (
                      <p className="text-xs text-muted-foreground text-right">
                        Profile mismatch
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="videos" className="space-y-4 mt-4">
          {mockVideos.map((video) => (
            <Card key={video.id} className="border-l-4 border-l-accent/50">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="text-2xl">{video.thumbnail}</div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Play className="h-4 w-4 text-accent" />
                      <h3 className="font-semibold text-sm">{video.title}</h3>
                    </div>
                    <p className="text-xs text-muted-foreground mb-2">
                      {video.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {video.estimatedMinutes} min
                        </span>
                        <span className="flex items-center gap-1">
                          <Coins className="h-3 w-3" />
                          ${video.reward.toFixed(2)}
                        </span>
                      </div>
                      {video.status === 'available' ? (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleStartTask('video', video.title, video.reward)}
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
          ))}
        </TabsContent>

        <TabsContent value="tasks" className="space-y-4 mt-4">
          {mockMicroTasks.map((task) => (
            <Card key={task.id} className="border-l-4 border-l-warning/50">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Zap className="h-4 w-4 text-warning" />
                      <h3 className="font-semibold text-sm">{task.title}</h3>
                    </div>
                    <p className="text-xs text-muted-foreground mb-2">
                      {task.description}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {task.estimatedMinutes} min
                      </span>
                      <span className="flex items-center gap-1">
                        <Coins className="h-3 w-3" />
                        ${task.reward.toFixed(2)}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    {task.status === 'available' ? (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleStartTask('task', task.title, task.reward)}
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
          ))}
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