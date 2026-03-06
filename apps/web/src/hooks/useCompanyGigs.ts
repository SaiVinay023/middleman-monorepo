import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { GigService } from '@/services/gigService';

export function useCompanyGigs(companyId: string) {
    const queryClient = useQueryClient();

    const query = useQuery({
        queryKey: ['companyGigs', companyId],
        queryFn: () => GigService.getCompanyGigs(companyId),
        enabled: !!companyId,
    });

    const createMutation = useMutation({
        mutationFn: (gigData: Omit<import('@/types').Gig, 'id' | 'created_at' | 'status'>) => GigService.createGig(gigData),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['companyGigs', companyId] });
        },
    });

    const payMutation = useMutation({
        mutationFn: (gigId: string) => GigService.processEscrowPayment(gigId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['companyGigs', companyId] });
        },
    });

    return {
        companyGigs: query.data || [],
        isLoading: query.isLoading,
        error: query.error,
        createGig: createMutation.mutateAsync,
        isCreating: createMutation.isPending,
        payForGig: payMutation.mutateAsync,
        isPaying: payMutation.isPending,
    };
}
