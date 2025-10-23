import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';

interface UserSelectorProps {
  onUserSelect: (userId: string) => void;
}

interface UserOption {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  userType: string;
}

export default function UserSelector({ onUserSelect }: UserSelectorProps) {
  const [users, setUsers] = useState<UserOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedUserId, setSelectedUserId] = useState<string>('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select(`
          user_id,
          email,
          first_name,
          last_name
        `)
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;

      // Fetch user types separately (type assertion since types haven't regenerated yet)
      const userIds = profiles?.map(p => p.user_id) || [];
      const { data: userTypes } = await supabase
        .from('user_types' as any)
        .select('user_id, user_type')
        .in('user_id', userIds);

      const userTypeMap = new Map(
        userTypes?.map((ut: any) => [ut.user_id, ut.user_type]) || []
      );

      const userOptions: UserOption[] = (profiles || []).map(profile => ({
        id: profile.user_id,
        email: profile.email || 'No email',
        firstName: profile.first_name || '',
        lastName: profile.last_name || '',
        userType: userTypeMap.get(profile.user_id) || 'looplly_user',
      }));

      setUsers(userOptions);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUserChange = (userId: string) => {
    setSelectedUserId(userId);
    onUserSelect(userId);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Select User to Simulate</CardTitle>
        <CardDescription>
          Choose a user profile to test different journey stages
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center p-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <Select value={selectedUserId} onValueChange={handleUserChange}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select a user..." />
            </SelectTrigger>
            <SelectContent>
              {users.map((user) => (
                <SelectItem key={user.id} value={user.id}>
                  <div className="flex items-center gap-2">
                    <span>
                      {user.firstName || user.lastName 
                        ? `${user.firstName} ${user.lastName}`.trim()
                        : user.email}
                    </span>
                    <Badge variant="outline" className="ml-auto text-xs">
                      {user.userType === 'office_user' ? 'B2B' : 'B2C'}
                    </Badge>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </CardContent>
    </Card>
  );
}
