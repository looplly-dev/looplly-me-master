import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { UserPlus, CheckCircle, ClipboardList, Trophy } from 'lucide-react';

interface StageSelectorProps {
  onStageSelect: (stageId: string) => void;
  disabled?: boolean;
}

const JOURNEY_STAGES = [
  {
    id: 'fresh_signup',
    name: 'Stage 1: Fresh Signup',
    description: 'Just created account, needs OTP verification',
    icon: UserPlus,
    level: 1
  },
  {
    id: 'otp_verified',
    name: 'Stage 2: OTP Verified',
    description: 'Verified mobile, needs profile setup',
    icon: CheckCircle,
    level: 2
  },
  {
    id: 'basic_profile',
    name: 'Stage 3: Basic Profile',
    description: 'Level 1 questions done, needs Level 2',
    icon: ClipboardList,
    level: 3
  },
  {
    id: 'full_profile',
    name: 'Stage 4: Full Profile',
    description: 'Level 2 complete, can see surveys',
    icon: CheckCircle,
    level: 4
  },
  {
    id: 'first_survey',
    name: 'Stage 5: First Survey',
    description: 'Has completed 1 survey, building reputation',
    icon: ClipboardList,
    level: 5
  },
  {
    id: 'established_user',
    name: 'Stage 6: Established User',
    description: 'Has reputation, badges, and earnings',
    icon: Trophy,
    level: 6
  }
];

export default function StageSelector({ onStageSelect, disabled }: StageSelectorProps) {
  return (
    <Card className={disabled ? 'opacity-50' : ''}>
      <CardHeader>
        <CardTitle>Select Journey Stage</CardTitle>
        <CardDescription>
          Choose which stage of the user journey to simulate
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Select onValueChange={onStageSelect} disabled={disabled}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Choose a stage..." />
          </SelectTrigger>
          <SelectContent>
            {JOURNEY_STAGES.map((stage) => {
              const Icon = stage.icon;
              return (
                <SelectItem key={stage.id} value={stage.id}>
                  <div className="flex items-center gap-3 py-2">
                    <Icon className="h-5 w-5 text-primary flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium">{stage.name}</div>
                      <div className="text-xs text-muted-foreground truncate">
                        {stage.description}
                      </div>
                    </div>
                    <Badge variant="outline" className="ml-auto">
                      Lvl {stage.level}
                    </Badge>
                  </div>
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>

        {!disabled && (
          <p className="text-xs text-muted-foreground mt-3">
            💡 Each stage resets the test user's data to match that point in their journey
          </p>
        )}
      </CardContent>
    </Card>
  );
}
