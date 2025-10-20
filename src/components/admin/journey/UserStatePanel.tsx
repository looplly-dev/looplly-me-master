import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useJourneyPreview } from '@/contexts/JourneyPreviewContext';
import { User, Award, Flame, Shield, AlertTriangle, ChevronLeft, ChevronRight, RotateCcw } from 'lucide-react';

interface UserStatePanelProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
}

export function UserStatePanel({ collapsed, onToggleCollapse }: UserStatePanelProps) {
  const { mockUserState, updateMockUserState, resetMockUserState } = useJourneyPreview();

  if (collapsed) {
    return (
      <div className="w-14 border-l bg-muted/30 h-full flex flex-col">
        <div className="p-2 border-b bg-background flex items-center justify-center shrink-0">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={onToggleCollapse}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
        </div>
        
        <TooltipProvider>
          <div className="flex-1 p-1 space-y-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex flex-col items-center justify-center p-2 bg-background rounded border">
                  <Shield className="h-4 w-4 text-muted-foreground" />
                  <span className="text-xs font-medium mt-1">{mockUserState.profileLevel}</span>
                </div>
              </TooltipTrigger>
              <TooltipContent side="left">
                <div className="text-xs">Profile Level: {mockUserState.profileLevel}</div>
              </TooltipContent>
            </Tooltip>
            
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex flex-col items-center justify-center p-2 bg-background rounded border">
                  <Award className="h-4 w-4 text-muted-foreground" />
                  <span className="text-xs font-medium mt-1">{mockUserState.reputationScore}</span>
                </div>
              </TooltipTrigger>
              <TooltipContent side="left">
                <div className="text-xs">
                  <div>Reputation: {mockUserState.reputationScore}</div>
                  <div>Tier: {mockUserState.reputationTier}</div>
                </div>
              </TooltipContent>
            </Tooltip>
            
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex flex-col items-center justify-center p-2 bg-background rounded border">
                  <Flame className="h-4 w-4 text-muted-foreground" />
                  <span className="text-xs font-medium mt-1">{mockUserState.currentStreak}</span>
                </div>
              </TooltipTrigger>
              <TooltipContent side="left">
                <div className="text-xs">Current Streak: {mockUserState.currentStreak} days</div>
              </TooltipContent>
            </Tooltip>
          </div>
        </TooltipProvider>
      </div>
    );
  }

  return (
    <div className="w-72 border-l bg-background h-full flex flex-col overflow-hidden transition-all duration-200">
      <Card className="rounded-none border-0 shadow-none flex-1 overflow-hidden flex flex-col">
        <CardHeader className="border-b bg-background py-2 px-3 shrink-0">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2">
              <User className="h-4 w-4" />
              User State
            </CardTitle>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={resetMockUserState}
                className="h-7 w-7"
              >
                <RotateCcw className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={onToggleCollapse}
                className="h-7 w-7"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 px-3 pb-3 overflow-auto flex-1">
          {/* User Info */}
          <div className="space-y-2 pb-2 border-b">
            <div className="text-sm space-y-1">
              <div className="flex justify-between">
                <span className="text-muted-foreground text-xs">User ID:</span>
                <span className="font-mono text-xs">{mockUserState.userId.slice(0, 8)}...</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground text-xs">Email:</span>
                <span className="text-xs">{mockUserState.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground text-xs">Country:</span>
                <Badge variant="outline" className="text-xs">{mockUserState.countryCode}</Badge>
              </div>
            </div>
          </div>

          {/* Profile Progress */}
          <div className="space-y-2 pb-2 border-b">
            <div className="flex items-center justify-between">
              <Label className="text-xs flex items-center gap-2">
                <Shield className="h-3.5 w-3.5" />
                Profile Level
              </Label>
              <Badge className="text-xs">{mockUserState.profileLevel}</Badge>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-xs">Level 2 Complete</Label>
                <Switch
                  checked={mockUserState.level2Complete}
                  onCheckedChange={(checked) => 
                    updateMockUserState({ 
                      level2Complete: checked,
                      level2CompletionPercent: checked ? 100 : 0 
                    })
                  }
                />
              </div>
              
              {!mockUserState.level2Complete && (
                <div className="space-y-1">
                  <Label className="text-xs">Completion: {mockUserState.level2CompletionPercent}%</Label>
                  <Slider
                    value={[mockUserState.level2CompletionPercent]}
                    onValueChange={([value]) => 
                      updateMockUserState({ level2CompletionPercent: value })
                    }
                    max={100}
                    step={5}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Reputation */}
          <div className="space-y-2 pb-2 border-b">
            <div className="flex items-center justify-between">
              <Label className="text-xs flex items-center gap-2">
                <Award className="h-3.5 w-3.5" />
                Reputation
              </Label>
              <Badge variant="secondary" className="text-xs">{mockUserState.reputationTier}</Badge>
            </div>
            
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Score:</span>
                <span className="font-semibold">{mockUserState.reputationScore}</span>
              </div>
              <Slider
                value={[mockUserState.reputationScore]}
                onValueChange={([value]) => {
                  let tier = 'Bronze';
                  let level = 'Bronze Novice';
                  if (value >= 2000) {
                    tier = 'Diamond';
                    level = 'Diamond Master';
                  } else if (value >= 1000) {
                    tier = 'Gold';
                    level = 'Gold Elite';
                  } else if (value >= 500) {
                    tier = 'Silver';
                    level = 'Silver Elite';
                  } else if (value >= 100) {
                    tier = 'Bronze';
                    level = 'Bronze Champion';
                  }
                  updateMockUserState({ 
                    reputationScore: value,
                    reputationTier: tier,
                    reputationLevel: level,
                  });
                }}
                max={2500}
                step={10}
              />
              <p className="text-xs text-muted-foreground">{mockUserState.reputationLevel}</p>
            </div>
          </div>

          {/* Streaks */}
          <div className="space-y-2 pb-2 border-b">
            <div className="flex items-center justify-between">
              <Label className="text-xs flex items-center gap-2">
                <Flame className="h-3.5 w-3.5" />
                Streaks
              </Label>
            </div>
            
            <div className="space-y-2">
              <div className="space-y-1">
                <Label className="text-xs">Current: {mockUserState.currentStreak} days</Label>
                <Slider
                  value={[mockUserState.currentStreak]}
                  onValueChange={([value]) => 
                    updateMockUserState({ currentStreak: value })
                  }
                  max={90}
                  step={1}
                />
              </div>
              
              <div className="space-y-1">
                <Label className="text-xs">Longest: {mockUserState.longestStreak} days</Label>
                <Slider
                  value={[mockUserState.longestStreak]}
                  onValueChange={([value]) => 
                    updateMockUserState({ longestStreak: value })
                  }
                  max={365}
                  step={1}
                />
              </div>
            </div>
          </div>

          {/* Additional States */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-xs">Badges Earned</Label>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="h-6 w-6 p-0"
                  onClick={() => updateMockUserState({ 
                    badgesEarned: Math.max(0, mockUserState.badgesEarned - 1) 
                  })}
                >
                  -
                </Button>
                <span className="text-xs font-medium w-6 text-center">
                  {mockUserState.badgesEarned}
                </span>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-6 w-6 p-0"
                  onClick={() => updateMockUserState({ 
                    badgesEarned: mockUserState.badgesEarned + 1 
                  })}
                >
                  +
                </Button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <Label className="text-xs flex items-center gap-2">
                <AlertTriangle className="h-3 w-3" />
                Has Stale Data
              </Label>
              <Switch
                checked={mockUserState.hasStaleData}
                onCheckedChange={(checked) => 
                  updateMockUserState({ 
                    hasStaleData: checked,
                    staleQuestionCount: checked ? 3 : 0 
                  })
                }
              />
            </div>

            {mockUserState.hasStaleData && (
              <div className="flex items-center justify-between pl-5">
                <Label className="text-xs">Stale Questions</Label>
                <Slider
                  value={[mockUserState.staleQuestionCount]}
                  onValueChange={([value]) => 
                    updateMockUserState({ staleQuestionCount: value })
                  }
                  max={10}
                  step={1}
                  className="w-24"
                />
                <span className="text-xs w-4">{mockUserState.staleQuestionCount}</span>
              </div>
            )}

            <div className="flex items-center justify-between">
              <Label className="text-xs">Stage 2 Unlocked</Label>
              <Switch
                checked={mockUserState.unlockedStages.stage2}
                onCheckedChange={(checked) => 
                  updateMockUserState({ 
                    unlockedStages: { ...mockUserState.unlockedStages, stage2: checked } 
                  })
                }
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
