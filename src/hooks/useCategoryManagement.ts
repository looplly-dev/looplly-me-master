import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Category {
  id: string;
  name: string;
  display_name: string;
  description: string | null;
  icon: string | null;
  level: number;
  display_order: number;
  default_decay_config_key: string | null;
  is_active: boolean;
  question_count?: number;
}

export const useCategoryManagement = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: categories, isLoading } = useQuery({
    queryKey: ['profile-categories-with-counts'],
    queryFn: async () => {
      const { data: cats, error: catsError } = await supabase
        .from('profile_categories')
        .select('*')
        .order('level', { ascending: true })
        .order('display_order', { ascending: true });

      if (catsError) throw catsError;

      // Get question counts for each category
      const { data: questions, error: questionsError } = await supabase
        .from('profile_questions')
        .select('category_id, is_active');

      if (questionsError) throw questionsError;

      const questionCounts = questions.reduce((acc, q) => {
        if (q.is_active) {
          acc[q.category_id] = (acc[q.category_id] || 0) + 1;
        }
        return acc;
      }, {} as Record<string, number>);

      return (cats || []).map(cat => ({
        ...cat,
        question_count: questionCounts[cat.id] || 0
      }));
    }
  });

  const createCategory = useMutation({
    mutationFn: async (category: Omit<Category, 'id' | 'question_count'>) => {
      const { data, error } = await supabase
        .from('profile_categories')
        .insert([category])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile-categories-with-counts'] });
      queryClient.invalidateQueries({ queryKey: ['profile-questions'] });
      toast({ title: 'Category created successfully' });
    },
    onError: (error: Error) => {
      toast({
        title: 'Failed to create category',
        description: error.message,
        variant: 'destructive'
      });
    }
  });

  const updateCategory = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Category> }) => {
      const { data, error } = await supabase
        .from('profile_categories')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile-categories-with-counts'] });
      queryClient.invalidateQueries({ queryKey: ['profile-questions'] });
      toast({ title: 'Category updated successfully' });
    },
    onError: (error: Error) => {
      toast({
        title: 'Failed to update category',
        description: error.message,
        variant: 'destructive'
      });
    }
  });

  const reorderCategories = useMutation({
    mutationFn: async (updates: { id: string; display_order: number }[]) => {
      const promises = updates.map(({ id, display_order }) =>
        supabase
          .from('profile_categories')
          .update({ display_order })
          .eq('id', id)
      );

      const results = await Promise.all(promises);
      const error = results.find(r => r.error)?.error;
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile-categories-with-counts'] });
      toast({ title: 'Categories reordered successfully' });
    },
    onError: (error: Error) => {
      toast({
        title: 'Failed to reorder categories',
        description: error.message,
        variant: 'destructive'
      });
    }
  });

  return {
    categories,
    isLoading,
    createCategory,
    updateCategory,
    reorderCategories
  };
};
