import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useRole } from '@/hooks/useRole';

export interface DocumentationStats {
  total: number;
  published: number;
  comingSoon: number;
  categoryStats: {
    category: string;
    total: number;
    published: number;
    comingSoon: number;
  }[];
}

export function useDocumentationStats() {
  const { isAdmin } = useRole();
  
  return useQuery({
    queryKey: ['documentation-stats', isAdmin],
    queryFn: async (): Promise<DocumentationStats> => {
      // Build query with audience filtering
      let query = supabase
        .from('documentation')
        .select('id, status, category, audience');

      // Apply audience filter based on user role
      if (isAdmin) {
        // Admins see both 'all' and 'admin' docs
        query = query.in('audience', ['all', 'admin']);
      } else {
        // Non-admins only see 'all' docs
        query = query.eq('audience', 'all');
      }

      const { data: docs, error } = await query;

      if (error) throw error;

      const total = docs?.length || 0;
      const published = docs?.filter(d => d.status === 'published').length || 0;
      const comingSoon = docs?.filter(d => d.status === 'coming_soon').length || 0;

      // Group by category
      const categoryMap = new Map<string, { total: number; published: number; comingSoon: number }>();
      
      docs?.forEach(doc => {
        const category = doc.category || 'Uncategorized';
        const existing = categoryMap.get(category) || { total: 0, published: 0, comingSoon: 0 };
        
        existing.total++;
        if (doc.status === 'published') existing.published++;
        if (doc.status === 'coming_soon') existing.comingSoon++;
        
        categoryMap.set(category, existing);
      });

      const categoryStats = Array.from(categoryMap.entries()).map(([category, stats]) => ({
        category,
        ...stats
      }));

      return {
        total,
        published,
        comingSoon,
        categoryStats
      };
    },
    refetchOnMount: true,
    refetchOnWindowFocus: false,
    staleTime: 1000 * 60 * 5 // 5 minutes
  });
}
