'use client';

import dynamic from 'next/dynamic';
import { useCamera } from '@/hooks/useCamera';
import { useHaptics } from '@/hooks/useHaptics';
import { useGigs } from '@/hooks/useGigs';
import { useAuth } from '@/hooks/useAuth';
import { Camera } from 'lucide-react';
import { useMemo } from 'react';


const WeeklyGoalCard = dynamic(
  () => import('@/components/freelancer/WeeklyGoalCard').then((m) => m.WeeklyGoalCard),
  { ssr: false }
);

const PerformancePulse = dynamic(
  () => import('@/components/freelancer/PerformancePulse').then((m) => m.PerformancePulse),
  { ssr: false }
);

const RecentActivity = dynamic(
  () => import('@/components/freelancer/RecentActivity').then((m) => m.RecentActivity),
  { ssr: false }
);

export default function Dashboard() {
  const { user } = useAuth();
  const { takePicture } = useCamera();
  const { triggerHaptic } = useHaptics();

  const { available, mine } = useGigs(user?.id);

  const { earnings, weeklyGoal } = useMemo(() => {
  const total =
    mine.data?.reduce(
      (sum: number, gig: any) => sum + (gig.pay_amount || 0),
      0
        ) || 0;

    return {
    earnings: total,
    weeklyGoal: 1000,
        };
      }, [mine.data]);


  const handleCameraClick = async () => {
    await triggerHaptic();
    await takePicture();
  };

  return (
    <div className="pb-24 lg:pb-10">
      <WeeklyGoalCard earnings={earnings} weeklyGoal={weeklyGoal} />

      <div className="px-6 space-y-8">
        <PerformancePulse
          availableCount={available.data?.length || 0}
          mineCount={mine.data?.length || 0}
        />

        <RecentActivity gigs={mine.data || []} />

        <section className="bg-amber-50 p-6 rounded-[2.5rem] border border-amber-100 flex items-center gap-5">
          <div className="bg-amber-500 w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-amber-200">
            <Camera size={28} />
          </div>
          <div className="flex-1">
            <h4 className="font-bold text-amber-900">Identity Verification</h4>
            <p className="text-xs text-amber-700 mb-3">
              Keep your documents up to date to access high-pay gigs.
            </p>
            <button
              onClick={handleCameraClick}
              className="bg-white text-amber-900 text-xs font-black uppercase tracking-widest px-4 py-2 rounded-xl shadow-sm active:scale-95 transition"
            >
              Verify Now
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
