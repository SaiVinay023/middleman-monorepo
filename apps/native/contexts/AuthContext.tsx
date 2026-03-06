import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';

type Profile = {
    id: string;
    full_name: string | null;
    role: 'admin' | 'company' | 'freelancer' | null;
    [key: string]: any;
};

type AuthContextType = {
    user: any | null;
    profile: Profile | null;
    isLoading: boolean;
    loading: boolean;
    error: string | null;
    signIn: (email: string, password: string) => Promise<void>;
    signUp: (email: string, password: string, fullName: string, phone: string, role: 'company' | 'freelancer') => Promise<any>;
    signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<any | null>(null);
    const [profile, setProfile] = useState<Profile | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchProfile = useCallback(async (userId: string) => {
        try {
            const { data, error: profileError } = await supabase
                .from('technicians')
                .select('*')
                .eq('id', userId)
                .single();

            if (profileError) {
                console.warn('Profile fetch:', profileError.message);
                setProfile(null);
            } else {
                setProfile(data);
            }
        } catch (err: any) {
            console.error('Profile fetch error:', err.message);
            setProfile(null);
        }
    }, []);

    useEffect(() => {
        let mounted = true;

        // Get initial session
        const getInitialSession = async () => {
            try {
                const { data: { session } } = await supabase.auth.getSession();
                if (!mounted) return;
                const currentUser = session?.user ?? null;
                setUser(currentUser);
                if (currentUser) {
                    await fetchProfile(currentUser.id);
                }
            } catch (err: any) {
                console.warn('Initial session error:', err.message);
            } finally {
                if (mounted) setIsLoading(false);
            }
        };

        // 3-second safety net so the spinner never blocks forever
        const timeout = setTimeout(() => {
            if (mounted) setIsLoading(false);
        }, 3000);

        getInitialSession().then(() => clearTimeout(timeout));

        // Listen for auth changes (sign in, sign out, token refresh)
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (_event, session) => {
                if (!mounted) return;
                const currentUser = session?.user ?? null;
                setUser(currentUser);
                if (currentUser) {
                    await fetchProfile(currentUser.id);
                } else {
                    setProfile(null);
                }
                setIsLoading(false);
            }
        );

        return () => {
            mounted = false;
            clearTimeout(timeout);
            subscription.unsubscribe();
        };
    }, [fetchProfile]);

    const signIn = async (email: string, password: string) => {
        setLoading(true);
        setError(null);
        try {
            const { error } = await supabase.auth.signInWithPassword({ email, password });
            if (error) throw error;
            // onAuthStateChange will fire and update user/profile automatically
        } catch (err: any) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const signUp = async (email: string, password: string, fullName: string, phone: string, role: string) => {
        setLoading(true);
        setError(null);
        try {
            const { data, error } = await supabase.auth.signUp({
                email,
                password,
                options: { data: { full_name: fullName, phone, role } }
            });
            if (error) throw error;
            return data;
        } catch (err: any) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const signOut = async () => {
        setLoading(true);
        try {
            await supabase.auth.signOut();
            setUser(null);
            setProfile(null);
        } catch (err: any) {
            console.error('Sign out error:', err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthContext.Provider value={{ user, profile, isLoading, loading, error, signIn, signUp, signOut }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth(): AuthContextType {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used within AuthProvider');
    return ctx;
}
