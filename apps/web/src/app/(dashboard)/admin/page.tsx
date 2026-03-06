'use client';
import { useAdminGigs } from '@/hooks/useAdminGigs';
import { useAdminVerify } from '@/hooks/useAdminVerify';
import { BarChart3, Users, Zap, AlertCircle } from 'lucide-react';
import Link from 'next/link';

export default function AdminOperationsHub() {
  const { pendingCompany, pendingReview } = useAdminGigs();
  const { pendingDocs } = useAdminVerify();

  const stats = [
    { 
        label: 'New Gig Requests', 
        count: pendingCompany?.length || 0, 
        link: '/admin/gigs', 
        color: 'bg-blue-500', 
        icon: Zap 
    },
    { 
        label: 'Work Proofs', 
        count: pendingReview?.length || 0, 
        link: '/admin/gigs', 
        color: 'bg-emerald-500', 
        icon: BarChart3 
    },
    { 
        label: 'ID Verifications', 
        count: pendingDocs?.length || 0, 
        link: '/admin/verify', 
        color: 'bg-purple-500', 
        icon: Users 
    },
  ];

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-10">
      <header>
        <h1 className="text-4xl font-black text-gray-900 tracking-tighter">OPERATIONS HUB</h1>
        <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">System Oversight</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat) => (
          <Link href={stat.link} key={stat.label} className="group">
            <div className="bg-white border border-gray-100 p-8 rounded-[2.5rem] shadow-xl shadow-gray-50 transition-all hover:-translate-y-2 hover:shadow-2xl flex flex-col items-center text-center">
              <div className={`${stat.color} p-4 rounded-2xl text-white mb-4 shadow-lg`}>
                <stat.icon size={28} />
              </div>
              <p className="text-4xl font-black text-gray-900 mb-1">{stat.count}</p>
              <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px]">{stat.label}</p>
            </div>
          </Link>
        ))}
      </div>

      {/* Critical Alerts Area */}
      {(pendingCompany?.length > 0 || pendingReview?.length > 0) && (
        <div className="bg-amber-50 border border-amber-100 p-6 rounded-[2rem] flex items-center gap-4">
            <div className="bg-amber-500 p-2 rounded-lg text-white">
                <AlertCircle size={20} />
            </div>
            <div>
                <p className="font-black text-amber-900 leading-tight">Attention Required</p>
                <p className="text-amber-700 text-sm">You have pending items in the pipeline that are delaying user payouts.</p>
            </div>
        </div>
      )}
    </div>
  );
}