import { useCallback, useEffect, useSyncExternalStore } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

type AuthState = {
  user: any | null;
  profile: any | null;
  isLoading: boolean;
  loading: boolean;
  error: string | null;
};

type AuthStore = AuthState & {
  handleAction: (action: () => Promise<any>, redirectPath?: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, fullName: string, phone: string) => Promise<any>;
  signOut: () => Promise<void>;
};

const INITIAL_STATE: AuthState = {
  user: null,
  profile: null,
  isLoading: true,
  loading: false,
  error: null,
};

let state: AuthState = { ...INITIAL_STATE };
const listeners = new Set<() => void>();
let initialized = false;
let profileRequestVersion = 0;

const emit = () => {
  listeners.forEach((listener) => listener());
};

const setState = (partial: Partial<AuthState>) => {
  state = { ...state, ...partial };
  emit();
};

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

const getSnapshot = () => state;

const readProfile = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('technicians')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      return null;
    }

    return data;
  } catch {
    return null;
  }
};

const loadProfile = async (userId: string) => {
  const requestVersion = ++profileRequestVersion;
  const data = await readProfile(userId);

  if (requestVersion !== profileRequestVersion) {
    return;
  }

  setState({ profile: data });
};

const initializeAuthStore = () => {
  if (initialized) {
    return;
  }

  initialized = true;

  const init = async () => {
    const timeout = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('Session check timeout')), 10000);
    });

    try {
      const sessionResult = (await Promise.race([
        supabase.auth.getSession(),
        timeout,
      ])) as Awaited<ReturnType<typeof supabase.auth.getSession>>;

      const currentUser = sessionResult.data.session?.user ?? null;
      setState({ user: currentUser });

      if (currentUser) {
        await loadProfile(currentUser.id);
      } else {
        profileRequestVersion += 1;
        setState({ profile: null });
      }
    } catch {
      profileRequestVersion += 1;
      setState({ user: null, profile: null });
    } finally {
      setState({ isLoading: false });
    }
  };

  void init();

  supabase.auth.onAuthStateChange(async (_event, session) => {
    const currentUser = session?.user ?? null;
    setState({ user: currentUser, isLoading: false });

    if (!currentUser) {
      profileRequestVersion += 1;
      setState({ profile: null });
      return;
    }

    await loadProfile(currentUser.id);
  });
};

export const useAuth = (): AuthStore => {
  const router = useRouter();

  useEffect(() => {
    initializeAuthStore();
  }, []);

  const snapshot = useSyncExternalStore(subscribe, getSnapshot, () => INITIAL_STATE);

  const handleAction = useCallback(
    async (action: () => Promise<any>, redirectPath?: string) => {
      setState({ loading: true, error: null });
      try {
        await action();
        if (redirectPath) {
          router.push(redirectPath);
        }
      } catch (err: any) {
        setState({ error: err?.message ?? 'Unexpected error' });
      } finally {
        setState({ loading: false });
      }
    },
    [router]
  );

  const signIn = useCallback(async (email: string, password: string) => {
    setState({ loading: true, error: null });

    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        throw error;
      }
    } catch (err: any) {
      setState({ error: err?.message ?? 'Unable to sign in' });
      throw err;
    } finally {
      setState({ loading: false });
    }
  }, []);

  const signUp = useCallback(
    async (email: string, password: string, fullName: string, phone: string) => {
      setState({ loading: true, error: null });

      try {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: fullName, phone },
          },
        });

        if (error) {
          throw error;
        }

        return data;
      } catch (err: any) {
        setState({ error: err?.message ?? 'Unable to sign up' });
        throw err;
      } finally {
        setState({ loading: false });
      }
    },
    []
  );

  const signOut = useCallback(async () => {
    setState({ loading: true });

    try {
      await supabase.auth.signOut();
      profileRequestVersion += 1;
      setState({ user: null, profile: null });
      router.push('/login');
    } finally {
      setState({ loading: false });
    }
  }, [router]);

  return {
    ...snapshot,
    handleAction,
    signIn,
    signUp,
    signOut,
  };
};
