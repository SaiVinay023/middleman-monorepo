// src/app/dashboard/RecentActivity.tsx
'use client';

import Link from 'next/link';
import { ChevronRight, TrendingUp, Search } from 'lucide-react';

type Gig = { id: string; title: string };

type RecentActivityProps = {
  gigs: Gig[];
};

export function RecentActivity({ gigs }: RecentActivityProps) {
  const hasGigs = gigs && gigs.length > 0;

  return (
    <section className="bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-900">Recent Activity</h2>
        <TrendingUp className="text-gray-300" size={20} />
      </div>

      <div className="space-y-4">
        {hasGigs ? (
          gigs.slice(0, 3).map((gig) => (
            <div
              key={gig.id}
              className="flex items-center gap-4 p-3 bg-gray-50 rounded-2xl"
            >
              <div className="w-2 h-2 bg-blue-500 rounded-full" />
              <p className="text-sm text-gray-700 flex-1 font-medium">{gig.title}</p>
              <ChevronRight size={16} className="text-gray-400" />
            </div>
          ))
        ) : (
          <div className="text-center py-6">
            <p className="text-sm text-gray-400 italic mb-4">
              No recent activity found.
            </p>
            <Link
              href="/freelancer/gigs"
              className="inline-flex items-center gap-2 bg-gray-900 text-white px-6 py-3 rounded-2xl font-bold text-sm active:scale-95 transition"
            >
              <Search size={16} />
              Browse Marketplace
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
