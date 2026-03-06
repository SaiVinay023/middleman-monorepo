import { useQuery } from '@tanstack/react-query';
import { GigService } from '@/services/gigService';

export function useBalance(userId?: string) {
  return useQuery({
    queryKey: ['balance', userId],
    queryFn: () => GigService.getBalance(userId!),
    enabled: !!userId,
    refetchOnWindowFocus: true // Ensure they see fresh money stats when returning to the app
  });
}