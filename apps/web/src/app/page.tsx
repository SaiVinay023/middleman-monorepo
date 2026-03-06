'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import Link from 'next/link';

export default function Home() {
  const router = useRouter();
  const { user, profile, isLoading } = useAuth();

  useEffect(() => {
    if (isLoading) return;

    if (user && profile) {
      if (profile.role === 'admin') router.replace('/admin');
      else if (profile.role === 'company') router.replace('/company');
      else router.replace('/freelancer');
    }
  }, [user, profile, isLoading, router]);

  if (isLoading || (user && !profile)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Only show this if NOT logged in
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 bg-white">
      <div className="text-center space-y-6 max-w-md">
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
            Signup
          </Link>
        </div>

        <p className="text-sm text-gray-400 pt-8">
          Next.js 15 & Capacitor 8 Certified
        </p>
      </div>
    </main>
  );
}
