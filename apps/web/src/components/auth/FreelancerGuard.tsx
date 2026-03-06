'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

export default function FreelancerGuard({ children }: { children: React.ReactNode }) {
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

    if (profile && profile.role !== 'freelancer' && profile.role !== 'admin') {
      router.replace('/');
    }
  }, [user, profile, isLoading, router]);

  if (isLoading || (user && !profile)) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-white text-gray-900 font-bold uppercase text-xs tracking-widest">
        Loading Profile...
      </div>
    );
  }

  if (user && (profile?.role === 'freelancer' || profile?.role === 'admin')) {
    return <>{children}</>;
  }

  return null;
}
