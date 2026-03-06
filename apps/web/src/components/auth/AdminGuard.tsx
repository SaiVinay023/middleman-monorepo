'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

export default function AdminGuard({ children }: { children: React.ReactNode }) {
  const { user, profile, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) {
      return;
    }

    if (!user) {
      router.replace('/login');
      return;
    }

    if (profile && profile.role !== 'admin') {
      router.replace('/');
    }
  }, [user, profile, isLoading, router]);

  if (isLoading || (user && !profile)) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-gray-900 text-white font-black uppercase text-xs tracking-widest">
        Verifying Security Clearence...
      </div>
    );
  }

  // Only render children if the user is definitely an admin
  if (user && profile?.role === 'admin') {
    return <>{children}</>;
  }

  return null;
}
