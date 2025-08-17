import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { 
  Coins, 
  CheckCircle, 
  Star,
  TrendingUp,
  Target,
  Gift,
  Sparkles,
  ArrowRight,
  HelpCircle,
  Trophy
} from 'lucide-react';
import { useBalance } from '@/hooks/useBalance';
import { useEarningActivities } from '@/hooks/useEarningActivities';
import { useTransactions } from '@/hooks/useTransactions';

export default function SimplifiedEarnTab() {
  const [checkInDone, setCheckInDone] = useState(false);
  const { toast } = useToast();
  const { balance } = useBalance();
  const { activities, addActivity } = useEarningActivities();
  const { addTransaction } = useTransactions();

  // Progress to next goal (simplified for basic users)
  const nextGoal = 5.00; // First withdrawal goal
  const currentProgress = balance?.available_balance || 0;
  const progressPercentage = Math.min((currentProgress / nextGoal) * 100, 100);

  const handleCheckIn = () => {
    if (checkInDone) return;
    
    setCheckInDone(true);
    
    addTransaction({
      type: 'bonus',
      amount: 0.50,
      currency: 'USD',
      description: 'Daily check-in bonus',
      source: 'daily_checkin',
      status: 'completed',
      metadata: { streak: 1 }
    });

    // Enhanced success feedback
    toast({
      title: '🎉 Daily Bonus Earned!',
      description: `+$0.50 added to your balance! Keep your streak going!`,
    });
  };

  const handleStartTask = (type: string, title: string, reward: number) => {
    // More celebratory feedback
    toast({
      title: '✨ Task Started!',
      description: `Great choice! Complete "${title}" to earn $${reward.toFixed(2)}`,
    });
  };

  // Get available tasks (simplified view)
  const availableTasks = activities.filter(a => a.status === 'available');
  const completedTasks = activities.filter(a => a.status === 'completed');

  return (
    <div className="p-4 pb-20 space-y-6">
      {/* Enhanced Balance Card with Progress */}
      <Card className="bg-gradient-to-r from-primary to-accent text-white border-0 shadow-lg overflow-hidden relative">
        <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -mr-10 -mt-10" />
        <CardContent className="p-6 relative">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-white/80 text-sm">Your Balance</p>
              <p className="text-3xl font-bold">${currentProgress.toFixed(2)}</p>
              <p className="text-white/80 text-sm flex items-center gap-1">
                <TrendingUp className="h-3 w-3" />
                Earn $5-15 per week
              </p>
            </div>
            <div className="text-center">
              <Coins className="h-12 w-12 text-white/60 mx-auto mb-1" />
              <p className="text-xs text-white/80">Ready to cash out?</p>
            </div>
          </div>
          
          {/* Progress to Goal */}
          <div className="pt-4 border-t border-white/20">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-white/80">Progress to first cashout</span>
              <span className="text-sm font-bold">${nextGoal.toFixed(2)}</span>
            </div>
            <Progress 
              value={progressPercentage} 
              className="bg-white/20 h-2"
            />
            <p className="text-xs text-white/80 mt-1">
              ${(nextGoal - currentProgress).toFixed(2)} to go
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Daily Check-in - More Prominent */}
      <Card className="border-success/30 bg-gradient-to-r from-success/5 to-success/10">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-success/20 rounded-xl">
                <Gift className="h-6 w-6 text-success" />
              </div>
              <div>
                <h3 className="font-bold text-lg">Daily Bonus</h3>
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <Star className="h-3 w-3 text-warning" />
                  Free money every day!
                </p>
              </div>
            </div>
            <Button
              variant={checkInDone ? "secondary" : "default"}
              size="lg"
              onClick={handleCheckIn}
              disabled={checkInDone}
              className={checkInDone ? "" : "bg-success hover:bg-success/90 shadow-success"}
            >
              {checkInDone ? (
                <>
                  <CheckCircle className="h-5 w-5 mr-2" />
                  Done Today!
                </>
              ) : (
                <>
                  <Sparkles className="h-5 w-5 mr-2" />
                  Earn $0.50
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
          <CardContent className="p-3 text-center">
            <p className="text-2xl font-bold text-primary">{completedTasks.length}</p>
            <p className="text-xs text-muted-foreground">Tasks Done</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-warning/5 to-warning/10 border-warning/20">
          <CardContent className="p-3 text-center">
            <p className="text-2xl font-bold text-warning">{availableTasks.length}</p>
            <p className="text-xs text-muted-foreground">Available</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-success/5 to-success/10 border-success/20">
          <CardContent className="p-3 text-center">
            <p className="text-2xl font-bold text-success">
              ${(balance?.total_earned || 0).toFixed(0)}
            </p>
            <p className="text-xs text-muted-foreground">Total Earned</p>
          </CardContent>
        </Card>
      </div>

      {/* Simplified Task Sections */}
      <div className="space-y-4">
        {/* Available Tasks */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Target className="h-5 w-5 text-primary" />
                Ready to Earn
              </span>
              <Badge variant="secondary" className="bg-primary/10 text-primary">
                {availableTasks.length} available
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {availableTasks.length === 0 ? (
              <div className="text-center py-8">
                <Trophy className="h-12 w-12 mx-auto mb-3 text-muted-foreground/50" />
                <h3 className="font-semibold mb-2">All caught up!</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Great work! New opportunities coming soon.
                </p>
                <Button size="sm" variant="outline">
                  <HelpCircle className="h-4 w-4 mr-2" />
                  Get Notified
                </Button>
              </div>
            ) : (
              availableTasks.slice(0, 3).map((activity) => (
                <Card key={activity.id} className="border-l-4 border-l-primary/50 bg-gradient-to-r from-background to-primary/5">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold mb-1">{activity.title}</h3>
                        <p className="text-sm text-muted-foreground mb-2">
                          {activity.description}
                        </p>
                        <div className="flex items-center gap-3 text-sm">
                          <span className="text-success font-bold">
                            ${activity.reward_amount.toFixed(2)}
                          </span>
                          <span className="text-muted-foreground">
                            {activity.time_estimate || 5} min
                          </span>
                        </div>
                      </div>
                      <Button
                        onClick={() => handleStartTask(activity.activity_type, activity.title, activity.reward_amount)}
                        className="ml-4"
                      >
                        Start
                        <ArrowRight className="h-4 w-4 ml-1" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </CardContent>
        </Card>

        {/* Completed Tasks (if any) */}
        {completedTasks.length > 0 && (
          <Card className="bg-success/5 border-success/30">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-success">
                <CheckCircle className="h-5 w-5" />
                Recently Completed
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {completedTasks.slice(0, 2).map((activity) => (
                  <div key={activity.id} className="flex items-center justify-between p-2 bg-background/50 rounded">
                    <span className="text-sm font-medium">{activity.title}</span>
                    <span className="text-sm font-bold text-success">
                      +${activity.reward_amount.toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}