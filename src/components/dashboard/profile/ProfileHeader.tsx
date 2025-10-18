import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Award, TrendingUp } from 'lucide-react';

interface ProfileHeaderProps {
  level2Complete: boolean;
  level3Percentage: number;
}

export const ProfileHeader = ({
  level2Complete,
  level3Percentage
}: ProfileHeaderProps) => {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Profile Progress</h2>
            {level2Complete && (
              <Badge className="gap-1 bg-success text-success-foreground">
                <CheckCircle2 className="h-4 w-4" />
                Level 2 Complete
              </Badge>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Level 2 Status */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className={`p-2 rounded-lg ${level2Complete ? 'bg-success/20' : 'bg-muted'}`}>
                  <CheckCircle2 className={`h-5 w-5 ${level2Complete ? 'text-success' : 'text-muted-foreground'}`} />
                </div>
                <div>
                  <p className="text-sm font-medium">Essential Profile</p>
                  <p className="text-xs text-muted-foreground">Level 2</p>
                </div>
              </div>
              <Badge variant={level2Complete ? "default" : "secondary"}>
                {level2Complete ? 'Complete' : 'In Progress'}
              </Badge>
            </div>

            {/* Level 3 Status */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-muted rounded-lg">
                  <Award className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm font-medium">Extended Profile</p>
                  <p className="text-xs text-muted-foreground">Level 3 (Optional)</p>
                </div>
              </div>
              <Badge variant="secondary">
                {level3Percentage}% Complete
              </Badge>
            </div>

            {/* Benefits */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-primary/20 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium">Better Matches</p>
                  <p className="text-xs text-muted-foreground">Complete more for higher rewards</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
