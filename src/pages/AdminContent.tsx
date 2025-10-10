import ProtectedRoute from '@/components/auth/ProtectedRoute';
import AdminLayout from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Plus } from 'lucide-react';

function AdminContentContent() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Content Management</h1>
        <p className="text-muted-foreground">
          Create and manage surveys, videos, and tasks
        </p>
      </div>

      <Tabs defaultValue="surveys" className="w-full">
        <TabsList>
          <TabsTrigger value="surveys">Surveys</TabsTrigger>
          <TabsTrigger value="videos">Videos</TabsTrigger>
          <TabsTrigger value="tasks">Tasks</TabsTrigger>
        </TabsList>

        <TabsContent value="surveys" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Create New Survey</span>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Survey
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="survey-title">Survey Title</Label>
                <Input id="survey-title" placeholder="Enter survey title" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="survey-reward">Reward (₹)</Label>
                <Input id="survey-reward" type="number" placeholder="0" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="survey-description">Description</Label>
                <Textarea id="survey-description" placeholder="Survey description" />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="videos" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Create New Video</span>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Video
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="video-title">Video Title</Label>
                <Input id="video-title" placeholder="Enter video title" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="video-url">Video URL</Label>
                <Input id="video-url" placeholder="https://..." />
              </div>
              <div className="space-y-2">
                <Label htmlFor="video-reward">Reward (₹)</Label>
                <Input id="video-reward" type="number" placeholder="0" />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tasks" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Create New Task</span>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Task
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="task-title">Task Title</Label>
                <Input id="task-title" placeholder="Enter task title" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="task-reward">Reward (₹)</Label>
                <Input id="task-reward" type="number" placeholder="0" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="task-description">Instructions</Label>
                <Textarea id="task-description" placeholder="Task instructions" />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default function AdminContent() {
  return (
    <ProtectedRoute requiredRole="admin">
      <AdminLayout>
        <AdminContentContent />
      </AdminLayout>
    </ProtectedRoute>
  );
}
