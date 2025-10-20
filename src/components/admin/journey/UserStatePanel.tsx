import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { useJourneyPreview } from '@/contexts/JourneyPreviewContext';
import { User, Award, Flame, Shield, AlertTriangle } from 'lucide-react';

export function UserStatePanel() {
  const { mockUserState, updateMockUserState, resetMockUserState } = useJourneyPreview();

  return (
    <div className="w-80 border-l bg-background flex flex-col">
      <Card className="rounded-none border-0 border-b flex-1 overflow-auto">
        <CardHeader className="sticky top-0 bg-background z-10">
          <CardTitle className="text-base flex items-center gap-2">
            <User className="h-4 w-4" />
            Virtual User State
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* User Info */}
          <div className="space-y-3">
            <div className="text-sm space-y-1">
              <div className="flex justify-between">
                <span className="text-muted-foreground">User ID:</span>
                <span className="font-mono text-xs">{mockUserState.userId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Email:</span>
                <span className="text-sm">{mockUserState.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Country:</span>
                <Badge variant="outline">{mockUserState.countryCode}</Badge>
              </div>
            </div>
          </div>

          {/* Profile Progress */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Profile Level
              </Label>
              <Badge>{mockUserState.profileLevel}</Badge>
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
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm flex items-center gap-2">
                <Award className="h-4 w-4" />
                Reputation
              </Label>
              <Badge variant="secondary">{mockUserState.reputationTier}</Badge>
            </div>
            
            <div className="space-y-1">
              <div className="flex justify-between text-sm">
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
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm flex items-center gap-2">
                <Flame className="h-4 w-4" />
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
          <div className="space-y-3">
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
                <span className="text-sm font-medium w-6 text-center">
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

          {/* Reset Button */}
          <Button 
            variant="outline" 
            className="w-full" 
            onClick={resetMockUserState}
          >
            Reset to Defaults
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
