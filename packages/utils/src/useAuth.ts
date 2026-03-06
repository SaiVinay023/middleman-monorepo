import { useState, useEffect } from 'react';

// Accepts the initialized universal supabase client
export const createUseAuth = (supabase: any) => {
    // Accepts the platform-specific router (Next.js or Expo)
    return function useAuth(router?: any) {
        const [user, setUser] = useState<any>(null);
        const [profile, setProfile] = useState<any>(null);
        const [isLoading, setIsLoading] = useState(true);
        const [loading, setLoading] = useState(false);
        const [error, setError] = useState<string | null>(null);

        // Helper function to fetch profile with error handling
        const fetchProfile = async (userId: string) => {
            try {
                const { data, error: profileError } = await supabase
                    .from('technicians')
                    .select('*')
                    .eq('id', userId)
                    .single();

                if (profileError) {
                    console.warn('Profile fetch error:', profileError.message);
                    setProfile(null);
                } else {
                    setProfile(data);
                }
            } catch (err: any) {
                console.error('Error fetching profile:', err.message);
                setProfile(null);
            }
        };

        // Session & Auth State Listener
        useEffect(() => {
            let mounted = true;

            const initialize = async () => {
                // 10-second timeout guard: if Supabase hangs on Web, we still show the UI
                const timeoutPromise = new Promise<void>((_, reject) =>
                    setTimeout(() => reject(new Error('Session check timeout')), 10000)
                );

                try {
                    const sessionPromise = supabase.auth.getSession().then(async ({ data: { session }, error: sessionError }: any) => {
                        if (!mounted) return;

                        if (sessionError) {
                            console.warn('Session error:', sessionError.message);
                            setUser(null);
                            setProfile(null);
                            return;
                        }

                        const currentUser = session?.user ?? null;
                        setUser(currentUser);

                        if (currentUser) {
                            await fetchProfile(currentUser.id);
                        }
                    });

                    await Promise.race([sessionPromise, timeoutPromise]);
                } catch (err: any) {
                    if (mounted) {
                        console.warn('Auth init error or timeout:', err.message);
                        setUser(null);
                        setProfile(null);
                    }
                } finally {
                    if (mounted) setIsLoading(false);
                }
            };

            initialize();

            const { data: { subscription } } = supabase.auth.onAuthStateChange(
                async (_event: any, session: any) => {
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
                subscription.unsubscribe();
            };
        }, []);

        const handleAction = async (action: () => Promise<any>, redirectPath?: string) => {
            setLoading(true);
            setError(null);
            try {
                await action();
                if (redirectPath && router) router.push(redirectPath);
            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        const signIn = async (email: string, password: string) => {
            setLoading(true);
            setError(null);
            try {
                const { error } = await supabase.auth.signInWithPassword({ email, password });
                if (error) throw error;
            } catch (err: any) {
                setError(err.message);
                setLoading(false);
                throw err;
            }
        };

        const signUp = async (email: string, password: string, fullName: string, phone: string) => {
            setLoading(true);
            setError(null);
            try {
                const { data, error } = await supabase.auth.signUp({
                    email,
                    password,
                    options: {
                        data: { full_name: fullName, phone }
                    }
                });
                if (error) throw error;
                return data;
            } catch (err: any) {
                setError(err.message);
                setLoading(false);
                throw err;
            }
        };

        const signOut = async () => {
            setLoading(true);
            try {
                await supabase.auth.signOut();
                setProfile(null);
                setUser(null);
                if (router) router.push('/login');
            } catch (err: any) {
                console.error('Signout error:', err.message);
            } finally {
                setLoading(false);
            }
        };

        return {
            user,
            profile,
            isLoading,
            loading,
            error,
            handleAction,
            signIn,
            signUp,
            signOut,
        };
    };
};
