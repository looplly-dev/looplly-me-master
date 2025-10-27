import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

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
  return useQuery({
    queryKey: ['documentation-stats'],
    queryFn: async (): Promise<DocumentationStats> => {
      // Get total counts by status
      const { data: docs, error } = await supabase
        .from('documentation')
        .select('id, status, category');

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
