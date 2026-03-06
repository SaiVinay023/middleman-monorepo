'use client';

import AdminGuard from '@/components/auth/AdminGuard';
import { AdaptiveNav } from '@/components/adaptive-nav';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AdminGuard>
      <div className="flex h-screen bg-gray-50 overflow-hidden">
        {/* 1. Persistent Navigation Bar */}
        <AdaptiveNav />

        {/* 2. Scrollable Content Area */}
        <main className="flex-1 overflow-y-auto relative pb-20 md:pb-0">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </AdminGuard>
  );
}