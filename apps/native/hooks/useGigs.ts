import { useCallback, useEffect, useMemo, useState } from 'react';
import { supabase } from '../lib/supabase';

type Gig = {
    id: string;
    title: string;
    description: string;
    location: string;
    pay_amount: number;
    duration: string;
    category: string;
    priority: string;
    status: string;
    technician_id: string | null;
    client_phone: string | null;
    created_at: string;
    updated_at: string;
    completion_photo_url: string | null;
    claimed_at: string | null;
};

type UseGigsOptions = {
    loadAvailable?: boolean;
    loadMine?: boolean;
    realtime?: boolean;
};

export function useGigs(userId?: string, options: UseGigsOptions = {}) {
    const loadAvailable = options.loadAvailable ?? true;
    const loadMine = options.loadMine ?? true;
    const realtime = options.realtime ?? true;

    const [availableGigs, setAvailableGigs] = useState<Gig[]>([]);
    const [myGigs, setMyGigs] = useState<Gig[]>([]);
    const [isLoadingAvailable, setIsLoadingAvailable] = useState(loadAvailable);
    const [isLoadingMine, setIsLoadingMine] = useState(Boolean(loadMine && userId));
    const [isClaiming, setIsClaiming] = useState(false);
    const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
    const [isCompleting, setIsCompleting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchAvailableGigs = useCallback(async () => {
        if (!loadAvailable) {
            setAvailableGigs([]);
            setIsLoadingAvailable(false);
            return [];
        }

        setIsLoadingAvailable(true);
        try {
            const { data, error: queryError } = await supabase
                .from('active_gigs')
                .select('*')
                .order('created_at', { ascending: false });

            if (queryError) {
                throw queryError;
            }

            const rows = data || [];
            setAvailableGigs(rows);
            return rows;
        } catch (err: any) {
            setError(err?.message ?? 'Failed to fetch available gigs');
            return [];
        } finally {
            setIsLoadingAvailable(false);
        }
    }, [loadAvailable]);

    const fetchMyGigs = useCallback(async () => {
        if (!loadMine || !userId) {
            setMyGigs([]);
            setIsLoadingMine(false);
            return [];
        }

        setIsLoadingMine(true);
        try {
            const { data, error: queryError } = await supabase
                .from('gigs')
                .select('*')
                .eq('technician_id', userId)
                .order('created_at', { ascending: false });

            if (queryError) {
                throw queryError;
            }

            const rows = data || [];
            setMyGigs(rows);
            return rows;
        } catch (err: any) {
            setError(err?.message ?? 'Failed to fetch assigned gigs');
            return [];
        } finally {
            setIsLoadingMine(false);
        }
    }, [loadMine, userId]);

    useEffect(() => {
        void fetchAvailableGigs();
    }, [fetchAvailableGigs]);

    useEffect(() => {
        void fetchMyGigs();
    }, [fetchMyGigs]);

    useEffect(() => {
        if (!realtime) {
            return;
        }

        const channel = supabase
            .channel('native-gigs-changes')
            .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'gigs' }, () => {
                if (loadAvailable) {
                    void fetchAvailableGigs();
                }
                if (loadMine && userId) {
                    void fetchMyGigs();
                }
            })
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'gigs' }, () => {
                if (loadAvailable) {
                    void fetchAvailableGigs();
                }
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [realtime, loadAvailable, loadMine, userId, fetchAvailableGigs, fetchMyGigs]);

    const claimGig = useCallback(
        async (gigId: string) => {
            if (!userId) {
                return;
            }

            setIsClaiming(true);
            try {
                const { error: mutationError } = await supabase
                    .from('gigs')
                    .update({ technician_id: userId, status: 'assigned', claimed_at: new Date().toISOString() })
                    .eq('id', gigId)
                    .is('technician_id', null)
                    .eq('status', 'available');

                if (mutationError) {
                    throw mutationError;
                }

                await Promise.all([
                    loadAvailable ? fetchAvailableGigs() : Promise.resolve([]),
                    loadMine ? fetchMyGigs() : Promise.resolve([]),
                ]);
            } finally {
                setIsClaiming(false);
            }
        },
        [userId, loadAvailable, loadMine, fetchAvailableGigs, fetchMyGigs]
    );

    const updateGigStatus = useCallback(
        async (gigId: string, status: string) => {
            if (!userId) {
                return;
            }

            setIsUpdatingStatus(true);
            try {
                const { error: mutationError } = await supabase
                    .from('gigs')
                    .update({ status })
                    .eq('id', gigId)
                    .eq('technician_id', userId);

                if (mutationError) {
                    throw mutationError;
                }

                if (loadMine) {
                    await fetchMyGigs();
                }
            } finally {
                setIsUpdatingStatus(false);
            }
        },
        [userId, loadMine, fetchMyGigs]
    );

    const completeGig = useCallback(
        async (gigId: string, cloudinaryUrl: string) => {
            if (!userId) {
                return;
            }

            setIsCompleting(true);
            try {
                const { error: mutationError } = await supabase
                    .from('gigs')
                    .update({ status: 'pending_review', completion_photo_url: cloudinaryUrl })
                    .eq('id', gigId)
                    .eq('technician_id', userId);

                if (mutationError) {
                    throw mutationError;
                }

                if (loadMine) {
                    await fetchMyGigs();
                }
            } finally {
                setIsCompleting(false);
            }
        },
        [userId, loadMine, fetchMyGigs]
    );

    const refresh = useCallback(async () => {
        await Promise.all([
            loadAvailable ? fetchAvailableGigs() : Promise.resolve([]),
            loadMine ? fetchMyGigs() : Promise.resolve([]),
        ]);
    }, [loadAvailable, loadMine, fetchAvailableGigs, fetchMyGigs]);

    const totalEarnings = useMemo(
        () => myGigs.reduce((sum, g) => sum + (g.pay_amount || 0), 0),
        [myGigs]
    );

    return {
        availableGigs,
        myGigs,
        isLoadingAvailable,
        isLoadingMine,
        isClaiming,
        isUpdatingStatus,
        isCompleting,
        error,
        claimGig,
        updateGigStatus,
        completeGig,
        refresh,
        totalEarnings,
    };
}
