'use client'
import { useGigs } from '@/hooks/useGigs'
import { useAuth } from '@/hooks/useAuth'
import { MapPin, Clock, Zap, ShieldCheck, ChevronRight } from 'lucide-react'

// Sub-component for the Gig Card to keep the main page clean
function GigCard({ gig, onAccept, isClaiming, isDisabled }: any) {
  // Logic for "Hot" badge (High pay or Urgent)
  const isHot = gig.pay_amount >= 300 || gig.priority === 'urgent';

  return (
    <div className="bg-white border border-gray-100 rounded-[2.5rem] p-5 shadow-sm hover:shadow-md transition-all active:scale-[0.98] relative overflow-hidden group">
      {/* 1. Price Pill - Top Right (Primary Anchor) */}
      <div className="absolute top-5 right-5">
        <div className="bg-emerald-500 text-white px-4 py-2 rounded-2xl font-black text-lg shadow-lg shadow-emerald-100">
          ${gig.pay_amount}
        </div>
      </div>

      <div className="flex flex-col h-full justify-between">
        <div className="pr-20"> {/* Padding to avoid overlapping price */}
          {/* Status Indicators */}
          {isHot && (
            <div className="flex items-center gap-1 text-amber-600 mb-2">
              <Zap size={14} fill="currentColor" />
              <span className="text-[10px] font-black uppercase tracking-widest">High Value</span>
            </div>
          )}
          
          <h2 className="font-black text-xl text-gray-900 leading-tight mb-1">
            {gig.title}
          </h2>
          <p className="text-sm text-gray-500 line-clamp-1 mb-4">
            {gig.description}
          </p>

          {/* Visual Badges - Grid for scannability */}
          <div className="flex flex-wrap gap-3 mb-6">
            <div className="flex items-center gap-1.5 bg-gray-50 px-3 py-1.5 rounded-xl border border-gray-100">
              <MapPin size={14} className="text-gray-400" />
              <span className="text-xs font-bold text-gray-600">{gig.location || '2.4 mi'}</span>
            </div>
            <div className="flex items-center gap-1.5 bg-gray-50 px-3 py-1.5 rounded-xl border border-gray-100">
              <Clock size={14} className="text-gray-400" />
              <span className="text-xs font-bold text-gray-600">{gig.duration || '2-3h'}</span>
            </div>
            <div className="flex items-center gap-1.5 bg-blue-50 px-3 py-1.5 rounded-xl border border-blue-100">
              <ShieldCheck size={14} className="text-blue-500" />
              <span className="text-xs font-bold text-blue-700">{gig.category || 'IT Support'}</span>
            </div>
          </div>
        </div>

        {/* 2. Primary Action Area */}
        <button 
          onClick={() => onAccept(gig.id)}
          disabled={isClaiming || isDisabled}
          className="w-full bg-gray-900 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition active:scale-95 disabled:bg-gray-200"
        >
          {isClaiming ? (
            <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              Accept This Gig
              <ChevronRight size={18} />
            </>
          )}
        </button>
      </div>
    </div>
  )
}

export default function GigsPage() {
  const { user } = useAuth()
  const { available, claimGig, isClaiming } = useGigs(user?.id)

  if (available.isLoading) {
    return (
      <div className="p-10 space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-48 bg-gray-100 rounded-[2.5rem] animate-pulse" />
        ))}
      </div>
    )
  }

  return (
    <div className="p-6 pb-32">
      <header className="mb-8 px-2">
        <h1 className="text-3xl font-black text-gray-900 tracking-tight">Marketplace</h1>
        <p className="text-gray-500 font-medium">Find work near your location</p>
      </header>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {available.data?.map((gig: any) => (
          <GigCard 
            key={gig.id} 
            gig={gig} 
            onAccept={(id: string) => claimGig({ gigId: id, techId: user?.id! })}
            isClaiming={isClaiming}
            isDisabled={!user}
          />
        ))}

        {available.data?.length === 0 && (
          <div className="col-span-full text-center py-20 bg-gray-50 rounded-[3rem] border-2 border-dashed border-gray-200">
            <p className="text-gray-400 font-bold">No gigs available in your area yet.</p>
          </div>
        )}
      </div>
    </div>
  )
}