import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { integrationStatusService } from '@/services/integrationStatus';

export function useIntegrationStatus() {
  return useQuery({
    queryKey: ['integration-status'],
    queryFn: () => integrationStatusService.getIntegrationStatus(),
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchInterval: 1000 * 60 * 5 // Auto-refresh every 5 minutes
  });
}

export function useTestIntegration() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (integrationId: string) => 
      integrationStatusService.testConnection(integrationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['integration-status'] });
    }
  });
}
