import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ContextualHelp } from '@/components/ui/contextual-help';
import { 
  MessageSquare, 
  TrendingUp, 
  TrendingDown, 
  Plus, 
  Filter,
  BarChart3,
  Lightbulb,
  MessageCircle,
  Clock,
  ThumbsUp,
  ThumbsDown,
  AlertTriangle,
  CheckCircle,
  Star
} from 'lucide-react';
import { mockCommunityPosts, CommunityPost } from '@/data/mockData';
import { useToast } from '@/hooks/use-toast';

export default function CommunityTab() {
  const [posts, setPosts] = useState<CommunityPost[]>(mockCommunityPosts);
  const [activeFilter, setActiveFilter] = useState('all');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newPost, setNewPost] = useState({
    type: 'tip' as const,
    title: '',
    content: '',
    category: ''
  });
  const { toast } = useToast();

  const handleVote = (postId: string, voteType: 'up' | 'down') => {
    setPosts(posts.map(post => {
      if (post.id === postId) {
        const currentVote = post.votes.userVote;
        let newVotes = { ...post.votes };
        
        if (currentVote === voteType) {
          // Remove vote
          newVotes[voteType]--;
          newVotes.userVote = undefined;
        } else {
          // Add new vote, remove old if exists
          if (currentVote) {
            newVotes[currentVote]--;
          }
          newVotes[voteType]++;
          newVotes.userVote = voteType;
        }
        
        return { ...post, votes: newVotes };
      }
      return post;
    }));
  };

  const handleCreatePost = () => {
    if (!newPost.title.trim() || !newPost.content.trim()) {
      toast({
        title: "Missing Information",
        description: "Please fill in both title and content.",
        variant: "destructive"
      });
      return;
    }

    // Mock LLM moderation
    const relevanceScore = Math.random() * 40 + 60; // 60-100
    const qualityScore = Math.random() * 30 + 50;   // 50-80
    const toxicityScore = Math.random() * 20;       // 0-20

    const newCommunityPost: CommunityPost = {
      id: `new-${Date.now()}`,
      type: newPost.type,
      title: newPost.title,
      content: newPost.content,
      author: {
        id: 'current-user',
        name: 'You',
        avatar: '👤',
        reputation: 67
      },
      votes: { up: 0, down: 0 },
      createdAt: new Date().toISOString(),
      status: relevanceScore > 70 && qualityScore > 60 && toxicityScore < 15 ? 'approved' : 'pending',
      moderationScore: {
        relevance: Math.round(relevanceScore),
        quality: Math.round(qualityScore),
        toxicity: Math.round(toxicityScore)
      },
      category: newPost.category || 'general',
      reputationImpact: relevanceScore > 80 && qualityScore > 70 ? 3 : 1
    };

    setPosts([newCommunityPost, ...posts]);
    setNewPost({ type: 'tip', title: '', content: '', category: '' });
    setIsCreateDialogOpen(false);

    if (newCommunityPost.status === 'approved') {
      toast({
        title: "Post Published!",
        description: `Your ${newPost.type} has been approved and published. +${newCommunityPost.reputationImpact} reputation points!`,
      });
    } else {
      toast({
        title: "Post Under Review",
        description: "Your post is being reviewed by our AI moderation system. You'll be notified once it's processed.",
        variant: "default"
      });
    }
  };

  const filteredPosts = posts.filter(post => {
    if (activeFilter === 'all') return true;
    return post.type === activeFilter;
  });

  const getPostIcon = (type: string) => {
    switch (type) {
      case 'tip': return <Lightbulb className="h-4 w-4" />;
      case 'poll': return <BarChart3 className="h-4 w-4" />;
      case 'suggestion': return <MessageCircle className="h-4 w-4" />;
      default: return <MessageSquare className="h-4 w-4" />;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return <CheckCircle className="h-3 w-3 text-success" />;
      case 'pending': return <Clock className="h-3 w-3 text-warning" />;
      case 'rejected': return <AlertTriangle className="h-3 w-3 text-destructive" />;
      default: return null;
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) return `${diffDays}d ago`;
    if (diffHours > 0) return `${diffHours}h ago`;
    return 'Just now';
  };

  return (
    <div className="space-y-6 p-4 pb-20">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-primary">Community</h2>
          <p className="text-sm text-muted-foreground">Share tips, vote on polls, and suggest improvements</p>
        </div>
        <ContextualHelp 
          content="Share earning tips, participate in polls, and suggest app improvements. High-quality posts earn reputation points!"
          position="bottom"
        />
      </div>

      {/* Create Post Button */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogTrigger asChild>
          <Button className="w-full" size="lg">
            <Plus className="h-4 w-4 mr-2" />
            Create Post
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create New Post</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="post-type">Type</Label>
              <Select value={newPost.type} onValueChange={(value: any) => setNewPost({...newPost, type: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="tip">💡 Tip</SelectItem>
                  <SelectItem value="poll">📊 Poll</SelectItem>
                  <SelectItem value="suggestion">💬 Suggestion</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="post-title">Title</Label>
              <Input
                id="post-title"
                value={newPost.title}
                onChange={(e) => setNewPost({...newPost, title: e.target.value})}
                placeholder="Enter a clear, descriptive title..."
              />
            </div>

            <div>
              <Label htmlFor="post-content">Content</Label>
              <Textarea
                id="post-content"
                value={newPost.content}
                onChange={(e) => setNewPost({...newPost, content: e.target.value})}
                placeholder="Share your tip, poll question, or suggestion..."
                rows={4}
              />
            </div>

            <div>
              <Label htmlFor="post-category">Category (Optional)</Label>
              <Input
                id="post-category"
                value={newPost.category}
                onChange={(e) => setNewPost({...newPost, category: e.target.value})}
                placeholder="e.g., earnings, timing, payments..."
              />
            </div>

            <Button onClick={handleCreatePost} className="w-full">
              Create Post
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Filter Tabs */}
      <Tabs value={activeFilter} onValueChange={setActiveFilter}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all" className="text-xs">All</TabsTrigger>
          <TabsTrigger value="tip" className="text-xs">Tips</TabsTrigger>
          <TabsTrigger value="poll" className="text-xs">Polls</TabsTrigger>
          <TabsTrigger value="suggestion" className="text-xs">Ideas</TabsTrigger>
        </TabsList>

        <TabsContent value={activeFilter} className="space-y-4 mt-4">
          {filteredPosts.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center">
                <MessageSquare className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="font-semibold mb-2">No posts yet</h3>
                <p className="text-sm text-muted-foreground">Be the first to share a {activeFilter === 'all' ? 'post' : activeFilter}!</p>
              </CardContent>
            </Card>
          ) : (
            filteredPosts.map((post) => (
              <Card key={post.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    {/* Author Avatar */}
                    <div className="text-2xl">{post.author.avatar}</div>
                    
                    <div className="flex-1 min-w-0">
                      {/* Header */}
                      <div className="flex items-center gap-2 mb-2">
                        {getPostIcon(post.type)}
                        <Badge variant="outline" className="text-xs">
                          {post.type}
                        </Badge>
                        {post.category && (
                          <Badge variant="secondary" className="text-xs">
                            {post.category}
                          </Badge>
                        )}
                        {getStatusIcon(post.status)}
                      </div>

                      {/* Title & Content */}
                      <h3 className="font-semibold mb-2 text-sm">{post.title}</h3>
                      <p className="text-sm text-muted-foreground mb-3">{post.content}</p>

                      {/* Poll Options */}
                      {post.pollOptions && (
                        <div className="space-y-2 mb-3">
                          {post.pollOptions.map((option, index) => (
                            <div key={index} className="flex items-center justify-between bg-muted/50 rounded p-2">
                              <span className="text-sm">{option.option}</span>
                              <span className="text-xs text-muted-foreground">{option.votes} votes</span>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Moderation Score (for demonstration) */}
                      {post.moderationScore && post.author.id === 'current-user' && (
                        <div className="bg-info/10 border border-info/20 rounded p-2 mb-3">
                          <p className="text-xs text-info font-medium mb-1">AI Moderation Score:</p>
                          <div className="flex gap-4 text-xs">
                            <span>Relevance: {post.moderationScore.relevance}%</span>
                            <span>Quality: {post.moderationScore.quality}%</span>
                            <span>Safe: {100 - post.moderationScore.toxicity}%</span>
                          </div>
                        </div>
                      )}

                      {/* Footer */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span>{post.author.name}</span>
                          <span>•</span>
                          <div className="flex items-center gap-1">
                            <Star className="h-3 w-3" />
                            {post.author.reputation}
                          </div>
                          <span>•</span>
                          <span>{formatTimeAgo(post.createdAt)}</span>
                        </div>

                        {/* Voting */}
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleVote(post.id, 'up')}
                            className={`h-6 w-8 p-0 ${post.votes.userVote === 'up' ? 'text-success bg-success/10' : ''}`}
                          >
                            <ThumbsUp className="h-3 w-3" />
                          </Button>
                          <span className="text-xs font-medium min-w-6 text-center">
                            {post.votes.up - post.votes.down}
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleVote(post.id, 'down')}
                            className={`h-6 w-8 p-0 ${post.votes.userVote === 'down' ? 'text-destructive bg-destructive/10' : ''}`}
                          >
                            <ThumbsDown className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}