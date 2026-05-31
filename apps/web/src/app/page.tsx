'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import Link from 'next/link';
import type { Metadata } from 'next';

// Note: metadata must be in a server component. For the root page (which must stay
// 'use client' due to static export + auth redirect), the description is set in layout.tsx.
// Child pages use their own layout.tsx for page-specific metadata.

export default function Home() {
  const router = useRouter();
  const { user, profile, isLoading } = useAuth();

  // Silently redirect authenticated users — does NOT block initial render
  useEffect(() => {
    if (isLoading) return;
    if (user && profile) {
      if (profile.role === 'admin') router.replace('/admin');
      else if (profile.role === 'company') router.replace('/company');
      else router.replace('/freelancer');
    }
  }, [user, profile, isLoading, router]);

  // Always render the landing page immediately — auth redirect happens in background.
  // This ensures Lighthouse always has a real LCP element (the h1) to paint.
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 bg-white">
      <div className="text-center space-y-6 max-w-md">
        <div className="flex items-center justify-center mb-2" aria-hidden="true">
          {/* Branded logomark */}
          <div className="w-16 h-16 rounded-2xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-200">
            <span className="text-white text-3xl font-extrabold">M</span>
          </div>
        </div>

        <h1 className="text-5xl font-extrabold text-gray-900 tracking-tight">Middleman</h1>
        <p className="text-xl text-gray-600">
          The premium ecosystem for technicians and companies.
        </p>

        <div className="flex flex-col gap-4 w-full pt-4">
          <Link
            href="/login"
            className="w-full px-6 py-4 bg-blue-600 text-white rounded-2xl font-bold text-lg shadow-lg shadow-blue-200 hover:bg-blue-700 transition active:scale-95"
          >
            Sign In
          </Link>

          <Link
            href="/signup"
            className="w-full px-6 py-4 bg-white text-blue-600 border-2 border-blue-600 rounded-2xl font-bold text-lg hover:bg-blue-50 transition active:scale-95"
          >
            Create Account
          </Link>
        </div>

        {/* Fixed: text-gray-400 (contrast 2.53:1) → text-gray-600 (contrast 5.74:1) */}
        <p className="text-sm text-gray-600 pt-8">
          Next.js 15 &amp; Capacitor 8 Certified
        </p>
      </div>
    </main>
  );
}
