import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import { Platform } from 'react-native';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

// On Web, use localStorage so getSession() resolves correctly.
// On iOS/Android, use AsyncStorage for persistence across app restarts.
const storageAdapter = Platform.OS === 'web'
    ? (typeof window !== 'undefined' ? window.localStorage : undefined)
    : AsyncStorage;

export const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: {
        storage: storageAdapter as any,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
    },
});
