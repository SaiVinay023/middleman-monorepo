import { createUseAuth } from '@repo/utils';
import { supabase } from '../lib/supabase';
import { useRouter } from 'expo-router';

// Initializes the shared auth hook factory with the native Supabase client
const useAuthBase = createUseAuth(supabase);

export const useAuth = () => {
    const router = useRouter();
    return useAuthBase(router);
};
