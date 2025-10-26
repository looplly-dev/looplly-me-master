import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Users, Loader2 } from 'lucide-react';

export default function SeedTestUsersButton() {
  const [isSeeding, setIsSeeding] = useState(false);

  const handleSeedTestUsers = async () => {
    setIsSeeding(true);
    try {
      const { data, error } = await supabase.functions.invoke('seed-test-users', {
        body: {},
      });

      if (error) throw error;

      if (data.success) {
        const parts = [];
        if (data.created > 0) parts.push(`Created: ${data.created}`);
        if (data.updated > 0) parts.push(`Updated: ${data.updated}`);
        if (data.already_correct > 0) parts.push(`Already correct: ${data.already_correct}`);
        if (data.failed > 0) parts.push(`Failed: ${data.failed}`);
        
        toast.success(`Test users seeded successfully!`, {
          description: parts.join(', '),
        });
      } else {
        throw new Error('Seeding failed');
      }
    } catch (error) {
      console.error('Error seeding test users:', error);
      toast.error('Failed to seed test users', {
        description: error instanceof Error ? error.message : 'Unknown error',
      });
    } finally {
      setIsSeeding(false);
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleSeedTestUsers}
      disabled={isSeeding}
    >
      {isSeeding ? (
        <Loader2 className="h-4 w-4 animate-spin mr-2" />
      ) : (
        <Users className="h-4 w-4 mr-2" />
      )}
      {isSeeding ? 'Creating Test Users...' : 'Seed Test Users'}
    </Button>
  );
}
