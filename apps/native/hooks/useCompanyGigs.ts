import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { Gig } from '../../web/src/types'; // Can import types cross-workspace safely

export function useCompanyGigs(companyId: string) {
    const [companyGigs, setCompanyGigs] = useState<Gig[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isCreating, setIsCreating] = useState(false);
    const [isPaying, setIsPaying] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    const fetchGigs = useCallback(async () => {
        if (!companyId) return;
        setIsLoading(true);
        try {
            const { data, error } = await supabase
                .from('gigs')
                .select('*')
                .eq('company_id', companyId)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setCompanyGigs(data as Gig[]);
        } catch (err: any) {
            setError(err);
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    }, [companyId]);

    useEffect(() => {
        fetchGigs();
    }, [fetchGigs]);

    // Setup realtime subscription
    useEffect(() => {
        if (!companyId) return;
        const channel = supabase
            .channel('company-gigs-changes')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'gigs', filter: `company_id=eq.${companyId}` }, () => {
                fetchGigs();
            })
            .subscribe();
        return () => { supabase.removeChannel(channel); };
    }, [companyId, fetchGigs]);

    const createGig = async (gigData: Omit<Gig, 'id' | 'created_at' | 'status'>) => {
        setIsCreating(true);
        try {
            const { error } = await supabase
                .from('gigs')
                .insert([{
                    ...gigData,
                    status: 'pending_admin'
                }]);
            if (error) throw error;
            await fetchGigs();
        } catch (err: any) {
            throw err;
        } finally {
            setIsCreating(false);
        }
    };

    const payForGig = async (gigId: string) => {
        setIsPaying(true);
        try {
            const { error } = await supabase
                .from('gigs')
                .update({ status: 'available' })
                .eq('id', gigId)
                .eq('status', 'awaiting_payment');
            if (error) throw error;
            await fetchGigs();
        } catch (err: any) {
            throw err;
        } finally {
            setIsPaying(false);
        }
    };

    return {
        companyGigs,
        isLoading,
        error,
        createGig,
        isCreating,
        payForGig,
        isPaying
    };
}
