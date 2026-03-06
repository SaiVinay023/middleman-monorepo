// src/app/dashboard/WeeklyGoalCard.tsx
'use client';

type WeeklyGoalCardProps = {
  earnings: number;
  weeklyGoal: number;
};

export function WeeklyGoalCard({ earnings, weeklyGoal }: WeeklyGoalCardProps) {
  const progress = Math.min((earnings / weeklyGoal) * 100, 100);

  return (
    <div className="bg-gray-900 text-white p-6 pt-12 rounded-b-[3rem] shadow-2xl mb-8">
      <header className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">System Status</h1>
        <p className="text-gray-400 text-sm">Real-time overview of your activity</p>
      </header>

      <div className="bg-white/10 p-5 rounded-3xl border border-white/10 backdrop-blur-md">
        <div className="flex justify-between items-end mb-2">
          <div>
            <p className="text-xs text-gray-400 uppercase font-bold tracking-widest">
              Weekly Goal
            </p>
            <h2 className="text-3xl font-black">
              ${earnings}{' '}
              <span className="text-lg text-gray-500 font-normal">/ ${weeklyGoal}</span>
            </h2>
          </div>
          <div className="text-right">
            <span className="text-emerald-400 font-bold">
              {Number.isFinite(progress) ? Math.round(progress) : 0}%
            </span>
          </div>
        </div>
        <div className="h-3 w-full bg-white/10 rounded-full overflow-hidden">
          <div
            className="h-full bg-emerald-500 rounded-full transition-all duration-1000 ease-out"
            style={{ width: `${Number.isFinite(progress) ? progress : 0}%` }}
          />
        </div>
      </div>
    </div>
  );
}
