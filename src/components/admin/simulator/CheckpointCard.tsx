import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { UserPlus, CheckCircle, ClipboardList, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Checkpoint {
  id: string;
  name: string;
  description: string;
  resets: string[];
}

interface CheckpointCardProps {
  checkpoint: Checkpoint;
  userId: string;
  onReset: () => void;
}

const CHECKPOINT_ICONS = {
  fresh_signup: UserPlus,
  profile_complete: CheckCircle,
  ready_for_surveys: ClipboardList,
};

export default function CheckpointCard({ checkpoint, userId, onReset }: CheckpointCardProps) {
  const [showConfirm, setShowConfirm] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const { toast } = useToast();
  const Icon = CHECKPOINT_ICONS[checkpoint.id as keyof typeof CHECKPOINT_ICONS] || UserPlus;

  const handleReset = async () => {
    setIsResetting(true);
    try {
      // Type assertion since types haven't regenerated yet
      const { data, error } = await supabase.rpc('reset_user_journey' as any, {
        p_target_user_id: userId,
        p_checkpoint: checkpoint.id
      });

      if (error) throw error;

      toast({
        title: 'Journey Reset',
        description: `Successfully reset user to ${checkpoint.name} checkpoint`,
      });

      onReset();
    } catch (error: any) {
      console.error('Reset error:', error);
      toast({
        title: 'Reset Failed',
        description: error.message || 'Failed to reset user journey',
        variant: 'destructive',
      });
    } finally {
      setIsResetting(false);
      setShowConfirm(false);
    }
  };

  return (
    <>
      <Card className="hover:border-primary transition-colors">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Icon className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-lg">{checkpoint.name}</CardTitle>
              </div>
            </div>
          </div>
          <CardDescription className="mt-2">{checkpoint.description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm font-medium mb-2">Will Reset:</p>
            <div className="flex flex-wrap gap-2">
              {checkpoint.resets.map((reset) => (
                <Badge key={reset} variant="secondary" className="text-xs">
                  {reset}
                </Badge>
              ))}
            </div>
          </div>
          <Button 
            className="w-full" 
            onClick={() => setShowConfirm(true)}
            disabled={isResetting}
          >
            {isResetting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Resetting...
              </>
            ) : (
              'Reset to Checkpoint'
            )}
          </Button>
        </CardContent>
      </Card>

      <AlertDialog open={showConfirm} onOpenChange={setShowConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Journey Reset</AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              <p>Are you sure you want to reset this user to the <strong>{checkpoint.name}</strong> checkpoint?</p>
              <p className="text-destructive font-medium">This will modify the user's actual profile data:</p>
              <ul className="list-disc list-inside space-y-1">
                {checkpoint.resets.map((reset) => (
                  <li key={reset}>{reset}</li>
                ))}
              </ul>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleReset} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Confirm Reset
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
