'use client'
import { useGigs } from '@/hooks/useGigs'
import { useAuth } from '@/hooks/useAuth'
import { compressImage } from '@/lib/compression';
import { 
  Briefcase, 
  Clock, 
  MapPin, 
  Phone, 
  MessageSquare, 
  Navigation, 
  CheckCircle2, 
  Play, 
  Camera, 
  Loader2 
} from 'lucide-react'

// Sub-component for progress phases
const StatusStepper = ({ currentStatus }: { currentStatus: string }) => {
  const phases = [
    { id: 'assigned', label: 'Assigned' },
    { id: 'in_progress', label: 'Active' },
    { id: 'pending_review', label: 'Review' },
    { id: 'completed', label: 'Done' }
  ];

  const currentIndex = phases.findIndex(p => p.id === currentStatus);

  return (
    <div className="flex items-center justify-between mb-6 px-2">
      {phases.map((phase, index) => (
        <div key={phase.id} className="flex flex-col items-center gap-1">
          <div className={`w-8 h-1.5 rounded-full transition-all duration-500 ${
            index <= currentIndex ? 'bg-emerald-500' : 'bg-gray-200'
          }`} />
          <span className={`text-[10px] font-black uppercase tracking-tighter ${
            index <= currentIndex ? 'text-emerald-600' : 'text-gray-400'
          }`}>
            {phase.label}
          </span>
        </div>
      ))}
    </div>
  );
};

export default function MyWorkPage() {
  const { user } = useAuth()
  
  // Destructure all needed methods from your safe hook
  const { 
    mine, 
    updateStatus, 
    isUpdatingStatus, 
    completeGig, 
    isCompleting 
  } = useGigs(user?.id)

  // Handle the Finish Work flow: Compression -> Cloudinary -> Supabase
  const handleFinishWork = async (e: React.ChangeEvent<HTMLInputElement>, gigId: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      // 1. Local Compression (Saves you Cloudinary Credits)
      const compressedFile = await compressImage(file);

      // 2. Direct Upload to Cloudinary API (Unsigned)
      const formData = new FormData();
      formData.append('file', compressedFile);
      formData.append('upload_preset', 'middleman_proofs'); 

      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
        { method: 'POST', body: formData }
      );
      
      const uploadData = await res.json();

      // 3. Update status to 'pending_review' in Supabase
      if (uploadData.secure_url) {
        completeGig({ gigId, cloudinaryUrl: uploadData.secure_url, userId: user?.id || '' });
      }
    } catch (err) {
      console.error("Completion flow failed:", err);
    }
  };

  if (mine.isLoading) return <div className="p-10 text-center animate-pulse text-gray-400 font-bold">Syncing Command Center...</div>

  return (
    <div className="p-6 pb-32 max-w-2xl mx-auto">
      <header className="mb-8 px-2">
        <h1 className="text-3xl font-black text-gray-900 tracking-tight">Command Center</h1>
        <p className="text-gray-500 font-medium">Manage your active operations</p>
      </header>

      {mine.data?.length === 0 ? (
        <div className="bg-white p-12 rounded-[3rem] border-2 border-dashed border-gray-100 text-center">
          <div className="bg-gray-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Briefcase className="text-gray-300" size={32} />
          </div>
          <p className="text-gray-900 font-black text-xl mb-1">Station Idle</p>
          <p className="text-sm text-gray-500 mb-6 px-4">You don't have any active contracts. Visit the marketplace to deploy.</p>
          <button className="bg-gray-900 text-white px-8 py-4 rounded-2xl font-bold shadow-xl active:scale-95 transition">
            Go to Marketplace
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {mine.data?.map((gig: any) => (
            <div key={gig.id} className="bg-white rounded-[2.5rem] border border-gray-100 shadow-xl overflow-hidden">
              
              {/* 1. MOCK MAP SNIPPET */}
              <div className="h-32 bg-slate-200 relative overflow-hidden group">
                <div className="absolute inset-0 bg-[url('https://api.mapbox.com/styles/v1/mapbox/light-v10/static/-122.4,37.7,12/400x200?access_token=MOCK')] bg-cover bg-center opacity-80" />
                <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent" />
                <div className="absolute bottom-4 left-6 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-xl border border-white flex items-center gap-2 shadow-sm">
                  <Navigation size={14} className="text-blue-600 fill-blue-600" />
                  <span className="text-[10px] font-black text-gray-800 uppercase tracking-widest">Get Directions</span>
                </div>
              </div>

              <div className="p-6 pt-2">
                <StatusStepper currentStatus={gig.status || 'assigned'} />
                
                <div className="mb-6 px-2">
                  <h2 className="text-2xl font-black text-gray-900 leading-tight mb-2">{gig.title}</h2>
                  <div className="flex flex-wrap gap-4">
                    <div className="flex items-center gap-1.5 text-gray-500">
                      <MapPin size={16} />
                      <span className="text-xs font-bold">{gig.location}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-gray-500">
                      <Clock size={16} />
                      <span className="text-xs font-bold">Assigned {new Date(gig.updated_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                {/* 2. CONTACT SHORTCUTS */}
                <div className="grid grid-cols-2 gap-3 mb-6">
                  <a href={`tel:${gig.client_phone || '#'}`} className="flex items-center justify-center gap-2 bg-blue-50 text-blue-700 py-4 rounded-2xl font-black text-sm active:scale-95 transition border border-blue-100">
                    <Phone size={18} />
                    Call Client
                  </a>
                  <a href={`sms:${gig.client_phone || '#'}`} className="flex items-center justify-center gap-2 bg-indigo-50 text-indigo-700 py-4 rounded-2xl font-black text-sm active:scale-95 transition border border-indigo-100">
                    <MessageSquare size={18} />
                    Message
                  </a>
                </div>

                {/* 3. DYNAMIC ACTION BUTTON (Start vs. Finish) */}
                <div className="px-1">
                  {gig.status === 'in_progress' ? (
                    <div className="relative">
                      <input
                        type="file"
                        accept="image/*"
                        capture="environment" // Forces camera on mobile
                        className="hidden"
                        id={`complete-${gig.id}`}
                        onChange={(e) => handleFinishWork(e, gig.id)}
                        disabled={isCompleting}
                      />
                      <label
                        htmlFor={`complete-${gig.id}`}
                        className="w-full bg-emerald-600 text-white py-4 rounded-2xl font-black text-lg flex items-center justify-center gap-3 cursor-pointer active:scale-95 transition shadow-xl shadow-emerald-100"
                      >
                        {isCompleting ? (
                          <Loader2 className="animate-spin" size={22} />
                        ) : (
                          <>
                            <Camera size={22} />
                            Capture Proof & Finish
                          </>
                        )}
                      </label>
                    </div>
                  ) : (
                    <button 
                      onClick={() => updateStatus({ gigId: gig.id, status: 'in_progress', userId: user?.id || ''   })}
                      disabled={isUpdatingStatus || gig.status === 'pending_review' || gig.status === 'completed'}
                      className="w-full bg-gray-900 text-white py-4 rounded-2xl font-black text-lg shadow-2xl active:scale-[0.98] transition flex items-center justify-center gap-3 disabled:bg-gray-200 disabled:text-gray-400"
                    >
                      {isUpdatingStatus ? (
                        <Loader2 className="animate-spin" size={22} />
                      ) : gig.status === 'pending_review' ? (
                        <>
                          <CheckCircle2 size={22} className="text-emerald-500" />
                          Pending Review
                        </>
                      ) : (
                        <>
                          <Play size={22} className="text-emerald-400" fill="currentColor" />
                          Start Work Session
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}