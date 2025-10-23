import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Undo2 } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

export function UndoTeamSetupButton() {
  const [isUndoing, setIsUndoing] = useState(false);
  const { toast } = useToast();

  const handleUndo = async () => {
    setIsUndoing(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast({
          title: "Error",
          description: "You must be logged in to perform this action",
          variant: "destructive",
        });
        return;
      }

      const response = await supabase.functions.invoke('undo-team-dual-accounts', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (response.error) {
        throw response.error;
      }

      toast({
        title: "Success",
        description: "Original team accounts have been restored. Page will reload.",
      });

      // Reload the page after 2 seconds
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } catch (error) {
      console.error('Undo failed:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to undo team setup",
        variant: "destructive",
      });
    } finally {
      setIsUndoing(false);
    }
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="outline" disabled={isUndoing}>
          <Undo2 className="mr-2 h-4 w-4" />
          {isUndoing ? 'Undoing...' : 'Undo Team Setup'}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Undo Team Dual Accounts Setup?</AlertDialogTitle>
          <AlertDialogDescription>
            This will delete the 4 recently created/modified accounts and restore the original 2 team accounts 
            (nadia@looplly.me and warren@looplly.me) with their complete profiling data as team users.
            <br /><br />
            This action cannot be reversed.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleUndo}>
            Yes, Undo Setup
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
