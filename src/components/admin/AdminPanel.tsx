import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Settings, Plus, Search, Users, FileText } from 'lucide-react';

export default function AdminPanel() {
  const [activeTab, setActiveTab] = useState('create');

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-12 h-12 bg-gradient-to-r from-primary to-accent rounded-xl flex items-center justify-center">
              <Settings className="h-6 w-6 text-white" />
            </div>
            <CardTitle>Admin Panel</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button 
                variant={activeTab === 'create' ? 'default' : 'outline'}
                onClick={() => setActiveTab('create')}
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Content
              </Button>
              <Button 
                variant={activeTab === 'users' ? 'default' : 'outline'}
                onClick={() => setActiveTab('users')}
                className="w-full"
              >
                <Users className="h-4 w-4 mr-2" />
                User Lookup
              </Button>
              <Button 
                variant={activeTab === 'redemptions' ? 'default' : 'outline'}
                onClick={() => setActiveTab('redemptions')}
                className="w-full"
              >
                <FileText className="h-4 w-4 mr-2" />
                Redemptions
              </Button>
            </div>
          </CardContent>
        </Card>

        {activeTab === 'create' && (
          <Card>
            <CardHeader>
              <CardTitle>Create Survey/Video/Task</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Type</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="survey">Survey</SelectItem>
                      <SelectItem value="video">Video</SelectItem>
                      <SelectItem value="task">Micro-task</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Reward (points)</Label>
                  <Input type="number" placeholder="100" />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Title</Label>
                <Input placeholder="Survey title" />
              </div>
              <Button className="w-full">Create Content</Button>
            </CardContent>
          </Card>
        )}

        {activeTab === 'users' && (
          <Card>
            <CardHeader>
              <CardTitle>User Lookup</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex gap-2">
                  <Input placeholder="Enter mobile number" className="flex-1" />
                  <Button><Search className="h-4 w-4" /></Button>
                </div>
                <div className="p-4 bg-secondary/50 rounded-lg">
                  <p className="text-sm text-muted-foreground">No user selected</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === 'redemptions' && (
          <Card>
            <CardHeader>
              <CardTitle>Pending Redemptions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">PayPal - $5.00</p>
                      <p className="text-sm text-muted-foreground">User: +1234567890</p>
                    </div>
                    <Badge variant="secondary">Pending</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}