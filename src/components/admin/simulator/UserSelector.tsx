import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { adminClient } from '@/integrations/supabase/adminClient';
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
      // Fetch ONLY test accounts using adminClient to bypass RLS
      const { data, error } = await adminClient
        .from('profiles')
        .select('user_id, email, first_name, last_name, mobile, is_test_account')
        .eq('is_test_account', true)
        .eq('user_type', 'looplly_user')
        .order('first_name', { ascending: true });

      if (error) {
        console.error('Error fetching test users:', error);
        throw error;
      }

      const userOptions: UserOption[] = (data || []).map((profile: any) => ({
        id: profile.user_id,
        email: profile.email || profile.mobile || 'No email',
        firstName: profile.first_name || '',
        lastName: profile.last_name || '',
        userType: 'Test User',
      }));

      setUsers(userOptions);
      
      if (userOptions.length === 0) {
        console.warn('No test users found. Click "Seed Test Users" to create them.');
      }
    } catch (error) {
      console.error('Error fetching test users:', error);
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
                    <Badge variant="secondary" className="ml-auto text-xs">
                      Test User
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
