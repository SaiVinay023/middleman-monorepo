'use client';

import { memo, useCallback, useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import { useAuth } from '@/hooks/useAuth';
import { useCompanyGigs } from '@/hooks/useCompanyGigs';
import { DynamicMapWrapper } from '@/components/maps/DynamicMapWrapper';
import { Gig } from '@/types';
import { PlusCircle, Search, Briefcase, CheckCircle, CreditCard, Eye, X } from 'lucide-react';

const PostGigForm = dynamic(
  () => import('@/components/company/PostGigForm').then((mod) => mod.PostGigForm),
  {
    ssr: false,
    loading: () => <div className="text-gray-500 text-center py-10 font-medium">Loading form module...</div>,
  }
);

const getStatusBadgeClasses = (status: Gig['status']) => {
  if (status === 'pending_admin') return 'bg-gray-100 text-gray-600';
  if (status === 'awaiting_payment') return 'bg-rose-100 text-rose-700';
  if (status === 'available') return 'bg-blue-100 text-blue-700';
  if (status === 'assigned' || status === 'in_progress') return 'bg-indigo-100 text-indigo-700';
  if (status === 'pending_review') return 'bg-amber-100 text-amber-700';
  return 'bg-emerald-100 text-emerald-700';
};

type KanbanCardProps = {
  gig: Gig;
  isPaying: boolean;
  isMapExpanded: boolean;
  onToggleMap: (gigId: string) => void;
  onPayEscrow: (gigId: string) => Promise<void>;
  onReviewPhoto: (photoUrl: string | null) => void;
};

const KanbanCard = memo(function KanbanCard({
  gig,
  isPaying,
  isMapExpanded,
  onToggleMap,
  onPayEscrow,
  onReviewPhoto,
}: KanbanCardProps) {
  const isTrackable = gig.status === 'in_progress' || gig.status === 'assigned';

  return (
    <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex flex-col gap-3 transition hover:shadow-md">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-bold text-gray-900 text-base leading-tight">{gig.title}</h3>
          <p className="text-xs text-blue-600 font-bold mt-1 uppercase tracking-widest">{gig.category}</p>
        </div>
        <span
          className={`px-2 py-1 rounded-md text-[10px] font-black uppercase tracking-wider ${getStatusBadgeClasses(
            gig.status
          )}`}
        >
          {gig.status.replace('_', ' ')}
        </span>
      </div>

      <div className="text-sm text-gray-500 font-medium">
        <p>${gig.pay_amount}</p>
        <p className="mt-1">{new Date(gig.scheduled_at || gig.created_at).toLocaleDateString()}</p>
      </div>

      {isTrackable && (
        <div className="space-y-2">
          <button
            onClick={() => onToggleMap(gig.id)}
            className="w-full bg-indigo-50 text-indigo-700 border border-indigo-200 py-2.5 rounded-xl text-sm font-bold hover:bg-indigo-100 transition active:scale-95"
          >
            {isMapExpanded ? 'Hide Live Tracking' : 'Show Live Tracking'}
          </button>

          {isMapExpanded && (
            <div className="w-full rounded-xl overflow-hidden border border-gray-100 shadow-inner">
              <DynamicMapWrapper latitude={37.7749} longitude={-122.4194} gigId={gig.id} />
              <p className="text-[10px] text-center text-gray-400 font-bold uppercase tracking-widest mt-1 mb-1">
                Live Technician Tracking
              </p>
            </div>
          )}
        </div>
      )}

      {gig.status === 'awaiting_payment' && (
        <button
          onClick={() => onPayEscrow(gig.id)}
          disabled={isPaying}
          className="mt-2 w-full bg-gray-900 text-white py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 hover:bg-black transition active:scale-95 disabled:opacity-50"
        >
          <CreditCard className="w-4 h-4" />
          Pay Escrow
        </button>
      )}

      {gig.status === 'completed' && gig.completion_photo_url && (
        <button
          onClick={() => onReviewPhoto(gig.completion_photo_url || null)}
          className="mt-2 w-full bg-blue-50 text-blue-700 border border-blue-200 py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 hover:bg-blue-100 transition active:scale-95"
        >
          <Eye className="w-4 h-4" />
          Review Proof
        </button>
      )}
    </div>
  );
});

export default function CompanyDashboardPage() {
  const { user } = useAuth();
  const { companyGigs, isLoading, createGig, payForGig, isPaying } = useCompanyGigs(user?.id || '');
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [reviewPhotoUrl, setReviewPhotoUrl] = useState<string | null>(null);
  const [expandedMapGigId, setExpandedMapGigId] = useState<string | null>(null);

  const {
    gigsInMarket,
    awaitingReview,
    completedJobs,
    pipelineGigs,
    activeGigs,
    reviewGigs,
  } = useMemo(() => {
    const pipeline = companyGigs.filter((g) => g.status === 'pending_admin' || g.status === 'awaiting_payment');
    const active = companyGigs.filter(
      (g) => g.status === 'available' || g.status === 'assigned' || g.status === 'in_progress'
    );
    const review = companyGigs.filter((g) => g.status === 'pending_review' || g.status === 'completed');

    return {
      gigsInMarket: companyGigs.filter((g) => g.status === 'available').length,
      awaitingReview: companyGigs.filter((g) => g.status === 'pending_review').length,
      completedJobs: companyGigs.filter((g) => g.status === 'completed').length,
      pipelineGigs: pipeline,
      activeGigs: active,
      reviewGigs: review,
    };
  }, [companyGigs]);

  const handleToggleMap = useCallback((gigId: string) => {
    setExpandedMapGigId((prev) => (prev === gigId ? null : gigId));
  }, []);

  const handleCreateGig = useCallback(
    async (data: any) => {
      if (!user) {
        return;
      }

      try {
        await createGig({ ...data, company_id: user.id });
        setIsPostModalOpen(false);
      } catch {
        alert('Failed to post gig. Please try again.');
      }
    },
    [createGig, user]
  );

  const handlePayEscrow = useCallback(
    async (gigId: string) => {
      try {
        await payForGig(gigId);
      } catch {
        alert('Failed to process payment. Please try again.');
      }
    },
    [payForGig]
  );

  const handleReviewPhoto = useCallback((photoUrl: string | null) => {
    setReviewPhotoUrl(photoUrl);
  }, []);

  if (isLoading && companyGigs.length === 0) {
    return (
      <div className="flex-1 flex justify-center items-center h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 pb-24 max-w-7xl mx-auto w-full">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
        <div>
          <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Company Portal</span>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight mt-1">Dashboard</h1>
          <div className="mt-4 w-full md:w-96 rounded-2xl overflow-hidden border border-gray-200">
            <DynamicMapWrapper latitude={37.7749} longitude={-122.4194} />
          </div>
        </div>
        <button
          onClick={() => setIsPostModalOpen(true)}
          className="bg-blue-600 text-white px-6 py-3.5 rounded-2xl font-bold flex items-center gap-2 hover:bg-blue-700 transition active:scale-95 shadow-md shadow-blue-600/20"
        >
          <PlusCircle className="w-5 h-5" />
          Post New Gig
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
        <div className="bg-blue-50 border border-blue-100 rounded-3xl p-6 flex items-center gap-4">
          <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center shrink-0 shadow-sm">
            <Search className="text-white w-7 h-7" />
          </div>
          <div>
            <p className="text-3xl font-black text-blue-900 leading-none">{gigsInMarket}</p>
            <p className="text-sm font-bold text-blue-700 uppercase tracking-widest mt-1">Gigs in Market</p>
          </div>
        </div>

        <div className="bg-amber-50 border border-amber-100 rounded-3xl p-6 flex items-center gap-4">
          <div className="w-14 h-14 bg-amber-500 rounded-2xl flex items-center justify-center shrink-0 shadow-sm">
            <Briefcase className="text-white w-7 h-7" />
          </div>
          <div>
            <p className="text-3xl font-black text-amber-900 leading-none">{awaitingReview}</p>
            <p className="text-sm font-bold text-amber-700 uppercase tracking-widest mt-1">Awaiting Review</p>
          </div>
        </div>

        <div className="bg-emerald-50 border border-emerald-100 rounded-3xl p-6 flex items-center gap-4">
          <div className="w-14 h-14 bg-emerald-500 rounded-2xl flex items-center justify-center shrink-0 shadow-sm">
            <CheckCircle className="text-white w-7 h-7" />
          </div>
          <div>
            <p className="text-3xl font-black text-emerald-900 leading-none">{completedJobs}</p>
            <p className="text-sm font-bold text-emerald-700 uppercase tracking-widest mt-1">Completed Jobs</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gray-50/80 border border-gray-100 rounded-3xl p-5 flex flex-col h-[600px]">
          <h2 className="text-base font-black text-gray-800 mb-4 px-1 flex justify-between items-center">
            Pre-Market Pipeline
            <span className="bg-gray-200 text-gray-700 py-0.5 px-2.5 rounded-full text-xs">
              {pipelineGigs.length}
            </span>
          </h2>
          <div className="flex-1 overflow-y-auto space-y-4 pr-1 pb-4">
            {pipelineGigs.map((gig) => (
              <KanbanCard
                key={gig.id}
                gig={gig}
                isPaying={isPaying}
                isMapExpanded={expandedMapGigId === gig.id}
                onToggleMap={handleToggleMap}
                onPayEscrow={handlePayEscrow}
                onReviewPhoto={handleReviewPhoto}
              />
            ))}
            {pipelineGigs.length === 0 && (
              <div className="border-2 border-dashed border-gray-200 rounded-2xl h-32 flex items-center justify-center">
                <span className="text-sm font-bold text-gray-400">No Drafts</span>
              </div>
            )}
          </div>
        </div>

        <div className="bg-blue-50/50 border border-blue-100 rounded-3xl p-5 flex flex-col h-[600px]">
          <h2 className="text-base font-black text-blue-900 mb-4 px-1 flex justify-between items-center">
            Active Jobs
            <span className="bg-blue-200 text-blue-800 py-0.5 px-2.5 rounded-full text-xs">
              {activeGigs.length}
            </span>
          </h2>
          <div className="flex-1 overflow-y-auto space-y-4 pr-1 pb-4">
            {activeGigs.map((gig) => (
              <KanbanCard
                key={gig.id}
                gig={gig}
                isPaying={isPaying}
                isMapExpanded={expandedMapGigId === gig.id}
                onToggleMap={handleToggleMap}
                onPayEscrow={handlePayEscrow}
                onReviewPhoto={handleReviewPhoto}
              />
            ))}
            {activeGigs.length === 0 && (
              <div className="border-2 border-dashed border-blue-200/60 rounded-2xl h-32 flex items-center justify-center">
                <span className="text-sm font-bold text-blue-400">No Active Jobs</span>
              </div>
            )}
          </div>
        </div>

        <div className="bg-emerald-50/50 border border-emerald-100 rounded-3xl p-5 flex flex-col h-[600px]">
          <h2 className="text-base font-black text-emerald-900 mb-4 px-1 flex justify-between items-center">
            Review & Completed
            <span className="bg-emerald-200 text-emerald-800 py-0.5 px-2.5 rounded-full text-xs">
              {reviewGigs.length}
            </span>
          </h2>
          <div className="flex-1 overflow-y-auto space-y-4 pr-1 pb-4">
            {reviewGigs.map((gig) => (
              <KanbanCard
                key={gig.id}
                gig={gig}
                isPaying={isPaying}
                isMapExpanded={expandedMapGigId === gig.id}
                onToggleMap={handleToggleMap}
                onPayEscrow={handlePayEscrow}
                onReviewPhoto={handleReviewPhoto}
              />
            ))}
            {reviewGigs.length === 0 && (
              <div className="border-2 border-dashed border-emerald-200/60 rounded-2xl h-32 flex items-center justify-center">
                <span className="text-sm font-bold text-emerald-400">No Completions</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {isPostModalOpen && <PostGigForm onSubmit={handleCreateGig} onCancel={() => setIsPostModalOpen(false)} />}

      {reviewPhotoUrl && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/80 backdrop-blur-sm"
          onClick={() => setReviewPhotoUrl(null)}
        >
          <div
            className="bg-white p-2 rounded-3xl shadow-2xl relative max-w-3xl w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setReviewPhotoUrl(null)}
              className="absolute -top-4 -right-4 bg-white text-gray-900 p-2 rounded-full shadow-lg hover:scale-110 transition z-10"
            >
              <X className="w-5 h-5" />
            </button>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={reviewPhotoUrl}
              alt="Completion Proof"
              className="w-full h-auto rounded-2xl max-h-[85vh] object-contain bg-black"
            />
          </div>
        </div>
      )}
    </div>
  );
}
