'use client';

import { useState, useEffect } from 'react';
import { useBalance } from '@/hooks/useBalance';
import { useProfile } from '@/hooks/useProfile';
import { useAuth } from '@/hooks/useAuth';
import { User, CreditCard, ArrowUpRight, Clock, LifeBuoy, Bell, ChevronRight, ShieldCheck } from 'lucide-react';

export default function SettingsPage() {
  const { user } = useAuth();
  const { profile, updateProfile, isUpdating, isLoading } = useProfile(user?.id || '');
  const { data: balance, isLoading: balanceLoading } = useBalance(user?.id);
  const [fullName, setFullName] = useState('');
  const [bio, setBio] = useState('');

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || '');
      setBio(profile.bio || '');
    }
  }, [profile]);

  const handleSave = () => {
    updateProfile({ full_name: fullName, bio: bio });
  };

  if (isLoading) return <div className="p-10 text-center animate-pulse">Loading preferences...</div>;

  return (
    <div className="p-6 pb-32 max-w-2xl mx-auto space-y-8">
      <header>
        <h1 className="text-3xl font-black text-gray-900 tracking-tight">Settings</h1>
        <p className="text-gray-500 font-medium">Manage your account and preferences</p>
      </header>

      {/* --- Section: Personal Information --- */}
      <section className="bg-white rounded-[2.5rem] border border-gray-100 p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-6 text-gray-900">
          <div className="bg-blue-50 p-2 rounded-xl text-blue-600">
            <User size={20} />
          </div>
          <h2 className="text-lg font-bold">Personal Information</h2>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-[10px] uppercase font-black tracking-widest text-gray-400 ml-1">Full Name</label>
            <input 
              type="text"
              className="w-full mt-1 p-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 transition-all"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Your display name"
            />
          </div>

          <div>
            <label className="text-[10px] uppercase font-black tracking-widest text-gray-400 ml-1">Bio & Expertise</label>
            <textarea 
              rows={3}
              className="w-full mt-1 p-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 transition-all"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell clients about your IT skills..."
            />
          </div>

          <button 
            onClick={handleSave}
            disabled={isUpdating}
            className="w-full py-4 bg-gray-900 text-white rounded-2xl font-black active:scale-95 transition disabled:bg-gray-200"
          >
            {isUpdating ? 'Updating...' : 'Save Profile'}
          </button>
        </div>
      </section>

      {/* --- Section: Bank & Payouts --- */}
      <section className="bg-white rounded-[2.5rem] border border-gray-100 p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-4 text-gray-900">
          <div className="bg-emerald-50 p-2 rounded-xl text-emerald-600">
            <CreditCard size={20} />
          </div>
          <h2 className="text-lg font-bold">Bank & Payouts</h2>
        </div>
        
        <button className="w-full flex items-center justify-between p-4 hover:bg-gray-50 rounded-2xl transition group">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-400 group-hover:bg-emerald-100 group-hover:text-emerald-600 transition">
              <ShieldCheck size={20} />
            </div>
            <div className="text-left">
              <p className="font-bold text-gray-900">Payment Methods</p>
              <p className="text-xs text-gray-500">Configure where you receive funds</p>
            </div>
          </div>
          <ChevronRight size={20} className="text-gray-300" />
        </button>
      </section>

      {/* --- Section: Support & Legal --- */}
      <section className="space-y-3">
        <h3 className="text-[10px] uppercase font-black tracking-widest text-gray-400 ml-6">Support</h3>
        <div className="bg-white rounded-[2.5rem] border border-gray-100 overflow-hidden shadow-sm">
          <button className="w-full flex items-center justify-between p-5 hover:bg-gray-50 border-b border-gray-50 transition">
            <div className="flex items-center gap-4">
              <LifeBuoy size={20} className="text-blue-500" />
              <span className="font-bold text-gray-700">Help Center</span>
            </div>
            <ChevronRight size={18} className="text-gray-300" />
          </button>
          
          <button className="w-full flex items-center justify-between p-5 hover:bg-gray-50 transition">
            <div className="flex items-center gap-4">
              <Bell size={20} className="text-purple-500" />
              <span className="font-bold text-gray-700">Notification Settings</span>
            </div>
            <ChevronRight size={18} className="text-gray-300" />
          </button>
        </div>
      </section>
      <section className="bg-white rounded-[2.5rem] border border-gray-100 p-6 shadow-sm overflow-hidden">
      <div className="flex items-center gap-3 mb-6 text-gray-900">
        <div className="bg-emerald-50 p-2 rounded-xl text-emerald-600">
          <CreditCard size={20} />
        </div>
        <h2 className="text-lg font-bold">Payouts Hub</h2>
      </div>

      {/* Balance Display */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-gray-50 p-5 rounded-[2rem] border border-gray-100">
          <div className="flex items-center gap-2 text-emerald-600 mb-1">
            <ShieldCheck size={14} />
            <span className="text-[10px] font-black uppercase tracking-widest">Available</span>
          </div>
          <h3 className="text-2xl font-black text-gray-900">
            ${balanceLoading ? '...' : balance?.available}
          </h3>
        </div>

        <div className="bg-gray-50 p-5 rounded-[2rem] border border-gray-100 opacity-60">
          <div className="flex items-center gap-2 text-amber-600 mb-1">
            <Clock size={14} />
            <span className="text-[10px] font-black uppercase tracking-widest">Pending</span>
          </div>
          <h3 className="text-2xl font-black text-gray-900">
            ${balanceLoading ? '...' : balance?.pending}
          </h3>
        </div>
      </div>

      <button 
        disabled={!balance?.available || balance.available <= 0}
        className="w-full flex items-center justify-center gap-2 bg-emerald-500 text-white py-4 rounded-2xl font-black active:scale-95 transition disabled:bg-gray-100 disabled:text-gray-400"
      >
        <ArrowUpRight size={20} />
        Withdraw to Bank
      </button>
      
      <p className="text-[10px] text-center text-gray-400 mt-4 px-4 leading-relaxed">
        Funds become available 24-48 hours after gig completion review.
      </p>
    </section>
    </div>
  );
}