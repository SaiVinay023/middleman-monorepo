import { supabase } from '@/lib/supabase'
import { z } from 'zod'
import { signupSchema, loginSchema } from '@/lib/schemas/auth'
import { logAuthError } from '@/lib/errorTracking'
import { authLimiter } from '@/lib/rateLimit';

export const AuthService = {
  async register(values: z.infer<typeof signupSchema>) {
    const { data, error } = await supabase.auth.signUp({
      email: values.email,
      password: values.password,
      options: {
        data: {
          full_name: values.fullName,
          phone: values.phone,
          role: values.role
        }
      }
    })
    if (error) {
      logAuthError(error, 'register', values.email);
      throw error;
    }

    return data;
  },

  async login(values: z.infer<typeof loginSchema>) {
    const identifier = values.email;

    // 1. The Bulletproof Guard
    // We check if authLimiter exists AND if it has the limit function
    if (authLimiter && typeof authLimiter.limit === 'function') {
      try {
        const { success } = await authLimiter.limit(identifier);

        if (!success) {
          const rateError = new Error('Too many login attempts. Please try again in 15 minutes.');
          logAuthError(rateError, 'login_rate_limit', values.email);
          throw rateError;
        }
      } catch (e) {
        // If Redis fails or is blocked by CSP, we log it and MOVE ON
        // This ensures the user can still login via Supabase
        console.warn("Rate limiter skipped due to connection error:", e);
      }
    }

    // 2. Database Authentication (The "Real" Login)
    console.log('Sending signInWithPassword to Supabase', { email: values.email });
    const { data, error } = await supabase.auth.signInWithPassword({
      email: values.email,
      password: values.password
    });
    console.log('signInWithPassword returned', { data, error });

    if (error) {
      logAuthError(error, 'login_failure', values.email);
      throw error;
    }

    return data;
  },
  async sendResetCode(email: string) {
    const { error } = await supabase.auth.resetPasswordForEmail(email)
    if (error) {
      logAuthError(error, 'password_reset', email);
      throw error;
    }
    return { success: true };
  }
}
