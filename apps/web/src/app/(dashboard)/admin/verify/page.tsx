'use client';
import { useAdminVerify } from '@/hooks/useAdminVerify';
import { ExternalLink, ShieldCheck, UserCheck } from 'lucide-react';

export default function AdminVerifyPage() {
  const { pendingDocs, isLoading, updateStatus, isProcessing } = useAdminVerify();

  if (isLoading) return <div className="p-10 text-center animate-pulse text-gray-400 font-black">SCANNING DOCUMENTS...</div>;

  return (
    <div className="p-8 pb-32 max-w-6xl mx-auto space-y-8">
      <header>
        <h1 className="text-4xl font-black text-gray-900 tracking-tighter uppercase">Technician Vetting</h1>
        <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">Approve or Reject Onboarding Docs</p>
      </header>

      {pendingDocs?.length === 0 ? (
        <div className="bg-white p-20 rounded-[3rem] border-2 border-dashed border-gray-100 text-center">
          <UserCheck size={48} className="mx-auto text-gray-200 mb-4" />
          <p className="text-gray-400 font-black uppercase tracking-widest text-sm">Clear Skies. No pending verifications.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {pendingDocs?.map((doc: any) => (
            <div key={doc.id} className="bg-white border border-gray-100 rounded-[2.5rem] overflow-hidden shadow-xl shadow-gray-50 flex flex-col transition-all hover:shadow-2xl">
              
              {/* Document Preview Area */}
              <div className="h-64 bg-slate-900 relative group">
                <img 
                  src={doc.file_url} 
                  className="w-full h-full object-contain opacity-80 group-hover:opacity-100 transition-opacity" 
                  alt="Review" 
                />
                <div className="absolute top-4 left-4 bg-black/50 backdrop-blur px-3 py-1 rounded-full text-[10px] font-black uppercase text-white tracking-widest">
                  {doc.document_type}
                </div>
                <a 
                  href={doc.file_url} 
                  target="_blank" 
                  className="absolute bottom-4 right-4 bg-white p-3 rounded-2xl text-gray-900 shadow-xl active:scale-90 transition-transform"
                >
                  <ExternalLink size={18} />
                </a>
              </div>

              <div className="p-6 flex flex-col flex-1">
                <div className="mb-6">
                  <h3 className="text-xl font-black text-gray-900 leading-tight">{doc.technicians?.full_name}</h3>
                  <p className="text-gray-400 font-bold text-sm tracking-tight">{doc.technicians?.email}</p>
                </div>

                <div className="mt-auto flex gap-3">
                  <button 
                    onClick={() => updateStatus({ docId: doc.id, userId: doc.user_id, status: 'rejected' })}
                    disabled={isProcessing}
                    className="flex-1 py-4 bg-red-50 text-red-600 rounded-2xl font-black text-sm active:scale-95 transition-all border border-red-100"
                  >
                    REJECT
                  </button>
                  <button 
                    onClick={() => updateStatus({ docId: doc.id, userId: doc.user_id, status: 'approved' })}
                    disabled={isProcessing}
                    className="flex-[2] py-4 bg-emerald-600 text-white rounded-2xl font-black text-sm active:scale-95 transition-all shadow-lg shadow-emerald-100 flex items-center justify-center gap-2"
                  >
                    <ShieldCheck size={18} /> APPROVE TECHNICIAN
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}