// src/app/dashboard/PerformancePulse.tsx
'use client';

import Link from 'next/link';
import { Briefcase, Search } from 'lucide-react';

type PerformancePulseProps = {
  availableCount: number;
  mineCount: number;
};

export function PerformancePulse({ availableCount, mineCount }: PerformancePulseProps) {
  return (
    <section>
      <h3 className="text-sm font-bold text-gray-400 uppercase mb-4 px-1">
        Performance Pulse
      </h3>
      <div className="flex overflow-x-auto pb-4 gap-4 no-scrollbar snap-x snap-mandatory lg:grid lg:grid-cols-2 lg:overflow-visible">
        <Link
          href="/freelancer/gigs"
          className="flex-shrink-0 w-40 h-40 bg-blue-50 rounded-[2.5rem] p-6 flex flex-col justify-between snap-center border border-blue-100 active:scale-95 transition"
        >
          <div className="bg-blue-600 w-10 h-10 rounded-2xl flex items-center justify-center text-white">
            <Search size={20} />
          </div>
          <div>
            <p className="text-3xl font-black text-blue-900">{availableCount}</p>
            <p className="text-xs font-bold text-blue-700 uppercase">Available</p>
          </div>
        </Link>

        <Link
          href="/freelancer/my-gigs"
          className="flex-shrink-0 w-40 h-40 bg-emerald-50 rounded-[2.5rem] p-6 flex flex-col justify-between snap-center border border-emerald-100 active:scale-95 transition"
        >
          <div className="bg-emerald-600 w-10 h-10 rounded-2xl flex items-center justify-center text-white">
            <Briefcase size={20} />
          </div>
          <div>
            <p className="text-3xl font-black text-emerald-900">{mineCount}</p>
            <p className="text-xs font-bold text-emerald-700 uppercase">Active</p>
          </div>
        </Link>
      </div>
    </section>
  );
}
