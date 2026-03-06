'use client';

import FreelancerGuard from '@/components/auth/FreelancerGuard';
import { AdaptiveNav } from '@/components/adaptive-nav';

export default function FreelancerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <FreelancerGuard>
      <div className="flex h-screen bg-white overflow-hidden">
        {/* Navigation Sidebar/Bottom Bar */}
        <AdaptiveNav mode="freelancer" />

        {/* Scrollable Content Area */}
        <main className="flex-1 overflow-y-auto relative pb-20 md:pb-0">
          <div className="max-w-7xl mx-auto p-4 md:p-8">
            {children}
          </div>
        </main>
      </div>
    </FreelancerGuard>
  );
}