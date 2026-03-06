'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { ROUTES } from '@/lib/constants/routes';

export default function CompanyGuard({ children }: { children: React.ReactNode }) {
    const { user, profile, isLoading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (isLoading) {
            return;
        }

        if (!user) {
            router.replace(ROUTES.AUTH.LOGIN);
            return;
        }

        if (profile && profile.role !== 'company') {
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

    if (user && profile?.role === 'company') {
        return <>{children}</>;
    }

    return null;
}
