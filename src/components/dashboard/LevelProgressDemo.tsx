import { LevelProgressDial } from '@/components/ui/level-progress-dial';

export function LevelProgressDemo() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-accent via-coral to-teal flex items-center justify-center p-8 relative overflow-hidden">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-12 items-center">
        
        {/* Silver Tier */}
        <div className="flex flex-col items-center gap-6 bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
          <h3 className="text-sm font-medium text-white/80">Silver Tier</h3>
          <LevelProgressDial
            currentLevel={35}
            progress={35}
            pointsToNext={65}
            membershipTier="Silver Member"
            size="sm"
          />
        </div>

        {/* Gold Tier (Main) */}
        <div className="flex flex-col items-center gap-6 bg-white/15 backdrop-blur-sm rounded-2xl p-8 border border-white/30 shadow-2xl">
          <h3 className="text-sm font-medium text-white/90">Gold Tier</h3>
          <LevelProgressDial
            currentLevel={67}
            progress={67}
            pointsToNext={33}
            membershipTier="Gold Member"
            size="md"
          />
        </div>

        {/* Platinum Tier */}
        <div className="flex flex-col items-center gap-6 bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
          <h3 className="text-sm font-medium text-white/80">Platinum Tier</h3>
          <LevelProgressDial
            currentLevel={85}
            progress={85}
            pointsToNext={15}
            membershipTier="Platinum Member"
            size="lg"
          />
        </div>

      </div>

      {/* Different States */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
        <div className="flex gap-8 items-center">
          
          {/* Cultural Heritage */}
          <div className="text-center bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
            <LevelProgressDial
              currentLevel={23}
              progress={23}
              pointsToNext={77}
              membershipTier="Silver Member"
              size="sm"
            />
            <p className="text-xs text-white/70 mt-2">Ocean Depths</p>
          </div>

          {/* Celebration */}
          <div className="text-center bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
            <LevelProgressDial
              currentLevel={89}
              progress={89}
              pointsToNext={11}
              membershipTier="Platinum Member"
              size="sm"
            />
            <p className="text-xs text-white/70 mt-2">Cultural Pride</p>
          </div>

          {/* Achievement */}
          <div className="text-center bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
            <LevelProgressDial
              currentLevel={100}
              progress={100}
              membershipTier="Diamond Member"
              size="sm"
            />
            <p className="text-xs text-white/70 mt-2">Unity & Excellence</p>
          </div>

        </div>
      </div>

      {/* Floating Accent Elements */}
      <div className="absolute top-20 left-20 w-32 h-32 bg-magenta/20 rounded-full blur-xl animate-pulse"></div>
      <div className="absolute bottom-40 right-32 w-24 h-24 bg-achievement/30 rounded-full blur-lg animate-pulse delay-1000"></div>
      <div className="absolute top-1/2 left-10 w-16 h-16 bg-cultural/25 rounded-full blur-md animate-pulse delay-500"></div>
      <div className="absolute bottom-20 left-1/3 w-20 h-20 bg-teal-glow/20 rounded-full blur-lg animate-pulse delay-700"></div>
    </div>
  );
}