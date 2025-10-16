import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';

export interface CommunityPost {
  id: string;
  user_id: string;
  type: 'tip' | 'poll' | 'suggestion';
  title: string;
  content: string;
  status: 'pending' | 'approved' | 'rejected';
  category: string | null;
  moderation_score: Record<string, any> | null;
  poll_options: Array<{ option: string; votes: number }> | null;
  reputation_impact: number;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
  profiles?: {
    first_name: string | null;
    last_name: string | null;
  };
  vote_count?: {
    up: number;
    down: number;
  };
  user_vote?: 'up' | 'down' | null;
}

export const useCommunityPosts = () => {
  const { authState } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: posts, isLoading } = useQuery({
    queryKey: ['community-posts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('community_posts')
        .select(`
          *,
          profiles!inner(first_name, last_name)
        `)
        .eq('status', 'approved')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Get vote counts for each post
      const postsWithVotes = await Promise.all(
        (data || []).map(async (post) => {
          const { data: votes } = await supabase
            .from('community_votes')
            .select('vote_type, user_id')
            .eq('post_id', post.id);

          const upVotes = votes?.filter(v => v.vote_type === 'up').length || 0;
          const downVotes = votes?.filter(v => v.vote_type === 'down').length || 0;
          const userVote = votes?.find(v => v.user_id === authState.user?.id)?.vote_type || null;

          return {
            ...post,
            vote_count: { up: upVotes, down: downVotes },
            user_vote: userVote
          };
        })
      );

      return postsWithVotes as CommunityPost[];
    },
  });

  const createPost = useMutation({
    mutationFn: async (postData: {
      type: CommunityPost['type'];
      title: string;
      content: string;
      category?: string;
      poll_options?: Array<{ option: string; votes: number }>;
    }) => {
      if (!authState.user?.id) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('community_posts')
        .insert({
          user_id: authState.user.id,
          ...postData,
          status: 'pending',
          metadata: {}
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['community-posts'] });
      toast({
        title: 'Post Created',
        description: 'Your post has been submitted for moderation.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const votePost = useMutation({
    mutationFn: async ({ postId, voteType }: { postId: string; voteType: 'up' | 'down' }) => {
      if (!authState.user?.id) throw new Error('User not authenticated');

      // Check if user already voted
      const { data: existingVote } = await supabase
        .from('community_votes')
        .select('*')
        .eq('post_id', postId)
        .eq('user_id', authState.user.id)
        .maybeSingle();

      if (existingVote) {
        // Update existing vote
        const { error } = await supabase
          .from('community_votes')
          .update({ vote_type: voteType })
          .eq('post_id', postId)
          .eq('user_id', authState.user.id);

        if (error) throw error;
      } else {
        // Create new vote
        const { error } = await supabase
          .from('community_votes')
          .insert({
            post_id: postId,
            user_id: authState.user.id,
            vote_type: voteType
          });

        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['community-posts'] });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const deletePost = useMutation({
    mutationFn: async (postId: string) => {
      if (!authState.user?.id) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('community_posts')
        .delete()
        .eq('id', postId)
        .eq('user_id', authState.user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['community-posts'] });
      toast({
        title: 'Post Deleted',
        description: 'Your post has been removed.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  return {
    posts,
    isLoading,
    createPost: createPost.mutate,
    votePost: votePost.mutate,
    deletePost: deletePost.mutate,
  };
};
