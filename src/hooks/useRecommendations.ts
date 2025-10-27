import { useState, useEffect } from 'react';
import { documentationIndex, DocumentationItem } from '@/data/documentationIndex';
import { useAuth } from './useAuth';
import { useRole } from './useRole';

export function useRecommendations(limit: number = 6): DocumentationItem[] {
  const [recommendations, setRecommendations] = useState<DocumentationItem[]>([]);
  const { authState } = useAuth();
  const { role } = useRole();

  useEffect(() => {
    const getRecommendations = () => {
      const published = documentationIndex.filter(doc => doc.status === 'published');
      
      // Score documents based on relevance
      const scored = published.map(doc => {
        let score = 0;

        // Role-based recommendations
        if (role === 'admin' || role === 'super_admin') {
          if (doc.category === 'Admin Guides') score += 10;
        }
        if (role === 'tester') {
          if (doc.category === 'Technical Reference') score += 5;
        }

        // Boost core system docs
        if (doc.category === 'Core Systems') score += 3;

        // Random factor for diversity
        score += Math.random() * 2;

        return { doc, score };
      });

      const sorted = scored
        .sort((a, b) => b.score - a.score)
        .slice(0, limit)
        .map(item => item.doc);

      setRecommendations(sorted);
    };

    getRecommendations();
  }, [authState.user, role, limit]);

  return recommendations;
}
