import { createBrowserClient } from '@supabase/ssr';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Web uses @supabase/ssr for full SSR + Capacitor support
export const supabase = createBrowserClient(supabaseUrl, supabaseKey);
