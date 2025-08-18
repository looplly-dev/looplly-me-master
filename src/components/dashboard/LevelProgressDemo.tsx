import { LevelProgressDial } from '@/components/ui/level-progress-dial';

export function LevelProgressDemo() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary to-accent flex items-center justify-center p-8 relative overflow-hidden">
      <div className="flex flex-col items-center gap-12">
        
        {/* Single Modern Progress Display */}
        <div className="flex flex-col items-center gap-6 bg-white/15 backdrop-blur-sm rounded-2xl p-8 border border-white/30 shadow-2xl">
          <h1 className="text-2xl font-bold text-white/90">Level Progress</h1>
          <LevelProgressDial
            currentLevel={67}
            progress={67}
            pointsToNext={33}
            membershipTier="Premium Member"
            size="lg"
          />
          <p className="text-white/70 text-sm">Continue earning to reach the next level</p>
        </div>

      </div>

      {/* Clean Subtle Background Effects */}
      <div className="absolute top-20 left-20 w-32 h-32 bg-white/3 rounded-full blur-xl animate-pulse"></div>
      <div className="absolute bottom-40 right-32 w-24 h-24 bg-white/5 rounded-full blur-lg animate-pulse delay-1000"></div>
    </div>
  );
}