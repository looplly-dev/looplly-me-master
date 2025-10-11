import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Sparkles, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export function BadgeSeeder() {
  const [isSeeding, setIsSeeding] = useState(false);
  const { toast } = useToast();

  const handleSeedBadges = async () => {
    setIsSeeding(true);
    try {
      const { data, error } = await supabase.functions.invoke('seed-badges');

      if (error) throw error;

      toast({
        title: 'Badges Seeded Successfully!',
        description: `${data.count} badges have been added to your catalog`,
      });

      // Refresh the page to show new badges
      window.location.reload();
    } catch (error) {
      console.error('Seeding error:', error);
      toast({
        title: 'Seeding Failed',
        description: error instanceof Error ? error.message : 'Failed to seed badges',
        variant: 'destructive',
      });
    } finally {
      setIsSeeding(false);
    }
  };

  return (
    <Card className="border-dashed">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5" />
          Quick Start: Seed Badge Collection
        </CardTitle>
        <CardDescription>
          Populate your badge catalog with 35 pre-designed badges across 7 thematic categories and all tiers
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 text-sm">
            <div className="text-center p-3 bg-muted/50 rounded-lg">
              <div className="text-2xl mb-1">🛡️</div>
              <div className="font-semibold">5 Identity</div>
              <div className="text-xs text-muted-foreground">Security badges</div>
            </div>
            <div className="text-center p-3 bg-muted/50 rounded-lg">
              <div className="text-2xl mb-1">🔥</div>
              <div className="font-semibold">5 Consistency</div>
              <div className="text-xs text-muted-foreground">Streak rewards</div>
            </div>
            <div className="text-center p-3 bg-muted/50 rounded-lg">
              <div className="text-2xl mb-1">🏆</div>
              <div className="font-semibold">5 Excellence</div>
              <div className="text-xs text-muted-foreground">Quality & Impact</div>
            </div>
            <div className="text-center p-3 bg-muted/50 rounded-lg">
              <div className="text-2xl mb-1">👥</div>
              <div className="font-semibold">5 Social</div>
              <div className="text-xs text-muted-foreground">Referral badges</div>
            </div>
            <div className="text-center p-3 bg-muted/50 rounded-lg">
              <div className="text-2xl mb-1">⚡</div>
              <div className="font-semibold">5 Speed</div>
              <div className="text-xs text-muted-foreground">Fast completion</div>
            </div>
            <div className="text-center p-3 bg-muted/50 rounded-lg">
              <div className="text-2xl mb-1">✨</div>
              <div className="font-semibold">5 Perfection</div>
              <div className="text-xs text-muted-foreground">Quality scores</div>
            </div>
            <div className="text-center p-3 bg-muted/50 rounded-lg">
              <div className="text-2xl mb-1">🔍</div>
              <div className="font-semibold">5 Exploration</div>
              <div className="text-xs text-muted-foreground">Category diversity</div>
            </div>
          </div>

          <Button 
            onClick={handleSeedBadges} 
            disabled={isSeeding}
            className="w-full"
            size="lg"
          >
            {isSeeding ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Seeding Badges...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Seed All 35 Badges
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}