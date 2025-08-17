import { LevelProgressDial } from '@/components/ui/level-progress-dial';

export function LevelProgressDemo() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 flex items-center justify-center p-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-12 items-center">
        
        {/* Small Size */}
        <div className="flex flex-col items-center gap-6">
          <h3 className="text-sm font-medium text-muted-foreground">Small</h3>
          <LevelProgressDial
            currentLevel={67}
            progress={67}
            pointsToNext={33}
            membershipTier="Gold Member"
            size="sm"
          />
        </div>

        {/* Medium Size (Main) */}
        <div className="flex flex-col items-center gap-6">
          <h3 className="text-sm font-medium text-muted-foreground">Medium</h3>
          <LevelProgressDial
            currentLevel={67}
            progress={67}
            pointsToNext={33}
            membershipTier="Gold Member"
            size="md"
          />
        </div>

        {/* Large Size */}
        <div className="flex flex-col items-center gap-6">
          <h3 className="text-sm font-medium text-muted-foreground">Large</h3>
          <LevelProgressDial
            currentLevel={67}
            progress={67}
            pointsToNext={33}
            membershipTier="Gold Member"
            size="lg"
          />
        </div>

      </div>

      {/* Different States */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
        <div className="flex gap-8 items-center">
          
          {/* Low Progress */}
          <div className="text-center">
            <LevelProgressDial
              currentLevel={23}
              progress={23}
              pointsToNext={77}
              membershipTier="Silver Member"
              size="sm"
            />
            <p className="text-xs text-muted-foreground mt-2">Low Progress</p>
          </div>

          {/* High Progress */}
          <div className="text-center">
            <LevelProgressDial
              currentLevel={89}
              progress={89}
              pointsToNext={11}
              membershipTier="Platinum Member"
              size="sm"
            />
            <p className="text-xs text-muted-foreground mt-2">High Progress</p>
          </div>

          {/* Complete */}
          <div className="text-center">
            <LevelProgressDial
              currentLevel={100}
              progress={100}
              membershipTier="Diamond Member"
              size="sm"
            />
            <p className="text-xs text-muted-foreground mt-2">Complete</p>
          </div>

        </div>
      </div>
    </div>
  );
}