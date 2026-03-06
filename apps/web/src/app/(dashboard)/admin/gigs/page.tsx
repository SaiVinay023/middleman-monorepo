'use client';
import { useAdminGigs } from '@/hooks/useAdminGigs';
import { Trash2, MoreHorizontal } from 'lucide-react';

export default function AdminGigsPage() {
  const { gigs, isLoading, deleteGig} = useAdminGigs();

 /* const handleAddTestGig = () => {
    createGig({
      title: 'Fiber Optic Repair',
      description: 'Repair broken line at Main St.',
      pay_amount: 150,
      location: 'Downtown',
      status: 'pending_admin' // Starts in your review queue
    });
  }; */

  if (isLoading) return <div className="p-10 text-center animate-pulse font-black text-gray-400 uppercase tracking-widest">Initialising Database...</div>;

  return (
    <div className="p-8 pb-32 max-w-7xl mx-auto space-y-8">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-4xl font-black text-gray-900 tracking-tighter uppercase">Master Gigs List</h1>
          <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">Full Database Control</p>
        </div>
       {/* <button 
          onClick={handleAddTestGig} 
          disabled={isCreating} 
          className="flex items-center gap-3 bg-gray-900 text-white px-8 py-4 rounded-2xl font-black shadow-xl active:scale-95 transition-all hover:bg-black"
        > 
          <Plus size={20} strokeWidth={3} /> Create Work Order
        </button>  */}
      </header>

      {/* Stats Quick-View */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {['available', 'assigned', 'pending_review', 'completed'].map((status) => (
          <div key={status} className="bg-white border border-gray-100 p-4 rounded-3xl shadow-sm">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{status}</p>
            <p className="text-2xl font-black text-gray-900">{gigs?.filter(g => g.status === status).length || 0}</p>
          </div>
        ))}
      </div>

      <div className="bg-white border border-gray-100 rounded-[2.5rem] overflow-hidden shadow-xl shadow-gray-50">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                <th className="p-6 text-[10px] font-black uppercase text-gray-400 tracking-widest">Details</th>
                <th className="p-6 text-[10px] font-black uppercase text-gray-400 tracking-widest">Company</th>
                <th className="p-6 text-[10px] font-black uppercase text-gray-400 tracking-widest">Status</th>
                <th className="p-6 text-[10px] font-black uppercase text-gray-400 tracking-widest">Budget</th>
                <th className="p-6 text-[10px] font-black uppercase text-gray-400 tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {gigs?.map((gig) => (
                <tr key={gig.id} className="hover:bg-gray-50/50 transition-colors group">
                  <td className="p-6">
                    <p className="font-black text-gray-900 text-lg">{gig.title}</p>
                    <p className="text-xs text-gray-400 font-medium">{gig.location}</p>
                  </td>
                  <td className="p-6 font-bold text-gray-600 text-sm">
                    {gig.company?.full_name || 'N/A'}
                  </td>
                  <td className="p-6">
                    <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm ${
                      gig.status === 'available' ? 'bg-emerald-100 text-emerald-700' : 
                      gig.status === 'pending_review' ? 'bg-amber-100 text-amber-700' :
                      'bg-gray-100 text-gray-500'
                    }`}>
                      {gig.status}
                    </span>
                  </td>
                  <td className="p-6 font-black text-gray-900">${gig.pay_amount}</td>
                  <td className="p-6 text-right space-x-2">
                    <button 
                      onClick={() => deleteGig(gig.id)}
                      className="p-3 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 size={18} />
                    </button>
                    <button className="p-3 text-gray-300 hover:text-gray-900 rounded-xl transition-all">
                      <MoreHorizontal size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}