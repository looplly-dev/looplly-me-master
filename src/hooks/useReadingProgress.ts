import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export function useReadingProgress(documentId: string) {
  const [progress, setProgress] = useState(0);
  const { authState } = useAuth();

  // Load saved progress
  useEffect(() => {
    if (!authState.user) return;

    const loadProgress = async () => {
      const { data } = await supabase
        .from('documentation_reading_progress')
        .select('progress_percent')
        .eq('document_id', documentId)
        .eq('user_id', authState.user.id)
        .single();

      if (data) {
        setProgress(data.progress_percent);
      }
    };

    loadProgress();
  }, [documentId, authState.user]);

  // Update progress
  const updateProgress = useCallback(async (newProgress: number) => {
    if (!authState.user) return;

    setProgress(newProgress);

    await supabase
      .from('documentation_reading_progress')
      .upsert({
        document_id: documentId,
        user_id: authState.user.id,
        progress_percent: Math.round(newProgress),
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'document_id,user_id'
      });
  }, [documentId, authState.user]);

  return { progress, updateProgress };
}
