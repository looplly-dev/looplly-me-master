import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Users } from 'lucide-react';

export function CreateTeamDualAccountsButton() {
  const [isCreating, setIsCreating] = useState(false);
  const { toast } = useToast();

  const handleCreateDualAccounts = async () => {
    setIsCreating(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast({
          title: 'Not authenticated',
          description: 'Please log in to perform this action',
          variant: 'destructive',
        });
        return;
      }

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-team-dual-accounts`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to create dual accounts');
      }

      toast({
        title: 'Success',
        description: `Dual accounts setup complete. ${result.results?.length || 0} operations successful.`,
      });

      if (result.errors && result.errors.length > 0) {
        console.error('Some operations failed:', result.errors);
        toast({
          title: 'Partial success',
          description: `${result.errors.length} operations failed. Check console for details.`,
          variant: 'destructive',
        });
      }

    } catch (error) {
      console.error('Error creating dual accounts:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to create dual accounts',
        variant: 'destructive',
      });
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Button
      onClick={handleCreateDualAccounts}
      disabled={isCreating}
      variant="outline"
      className="gap-2"
    >
      <Users className="h-4 w-4" />
      {isCreating ? 'Setting up accounts...' : 'Setup Team Dual Accounts'}
    </Button>
  );
}
