import { createClient } from '@supabase/supabase-js';

// Storage configuration depends on the platform
export type StorageAdapter = {
    getItem: (key: string) => Promise<string | null> | string | null;
    setItem: (key: string, value: string) => Promise<void> | void;
    removeItem: (key: string) => Promise<void> | void;
};

/**
 * Universal Supabase client factory.
 * - Web (Next.js): call with no args; will use supabase-js defaults (window.localStorage etc.)
 * - Native (Expo):  call with AsyncStorage so sessions persist across app restarts.
 */
export const createUniversalClient = (storage?: StorageAdapter) => {
    const supabaseUrl =
        process.env.NEXT_PUBLIC_SUPABASE_URL ||
        process.env.EXPO_PUBLIC_SUPABASE_URL ||
        '';
    const supabaseKey =
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
        process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ||
        '';

    if (!supabaseUrl || !supabaseKey) {
        throw new Error(
            'Missing Supabase environment variables. Please check your .env files.'
        );
    }

    return createClient(supabaseUrl, supabaseKey, {
        auth: {
            persistSession: true,
            autoRefreshToken: true,
            detectSessionInUrl: false,
            ...(storage ? { storage } : {}),
        },
    });
};
