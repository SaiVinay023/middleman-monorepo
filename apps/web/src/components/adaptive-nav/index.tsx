'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import LogoutButton from '@/components/auth/LogoutButton';
import { useAuth } from '@/hooks/useAuth';
import {
  LayoutDashboard,
  User,
  Search,
  Briefcase,
  Settings,
  ShieldAlert,
  Database,
  UserCheck,
} from 'lucide-react';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function AdaptiveNav({ mode: _mode }: { mode?: string } = {}) {
  const { user, profile, isLoading } = useAuth();
  const pathname = usePathname();

  if (isLoading || (user && !profile)) {
    return null;
  }

  const isAdmin = profile?.role === 'admin';
  const isCompany = profile?.role === 'company';

  const freelancerItems = [
    { name: 'Dashboard', href: '/freelancer', icon: LayoutDashboard },
    { name: 'Profile', href: '/freelancer/profile', icon: User },
    { name: 'Gigs', href: '/freelancer/gigs', icon: Search, isCenter: true },
    { name: 'My Work', href: '/freelancer/my-gigs', icon: Briefcase },
    { name: 'Settings', href: '/freelancer/profile/settings', icon: Settings },
  ];

  const adminItems = [
    { name: 'Operations', href: '/admin', icon: ShieldAlert },
    { name: 'Gigs List', href: '/admin/gigs', icon: Database },
    { name: 'Verify', href: '/admin/verify', icon: UserCheck, isCenter: true },
    { name: 'Settings', href: '/freelancer/profile/settings', icon: Settings },
  ];

  const companyItems = [
    { name: 'Discover', href: '/company', icon: Search },
    { name: 'Manage Gigs', href: '/company/post', icon: Briefcase, isCenter: true },
    { name: 'Settings', href: '/freelancer/profile/settings', icon: Settings },
  ];

  const navItems = isAdmin ? adminItems : isCompany ? companyItems : freelancerItems;

  return (
    <>
      <aside className="hidden md:flex w-64 bg-gray-900 text-white p-6 flex-col h-full border-r border-white/5">
        <div className="mb-10 px-4 flex items-center justify-between">
          <h2 className="text-2xl font-black tracking-tighter italic">MIDDLEMAN</h2>
          {isAdmin && <span className="text-[10px] bg-red-600 px-2 py-0.5 rounded font-bold">ADMIN</span>}
        </div>

        <nav className="flex-1 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all duration-300 group ${isActive
                  ? 'bg-blue-600 shadow-lg shadow-blue-900/20 text-white'
                  : 'text-gray-400 hover:bg-white/5 hover:text-white'
                  }`}
              >
                <Icon size={20} className={isActive ? 'animate-pulse' : 'group-hover:scale-110 transition-transform'} />
                <span className="font-bold text-sm">{item.name}</span>
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto pt-6 border-t border-white/5">
          <LogoutButton />
        </div>
      </aside>

      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-gray-900/95 backdrop-blur-xl text-white border-t border-white/5 pb-safe z-50 px-2">
        <div className="flex justify-around items-end h-20">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            if (item.isCenter) {
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="relative -top-6 flex flex-col items-center group"
                >
                  <div
                    className={`w-16 h-16 rounded-full flex items-center justify-center shadow-2xl transition-all duration-500 ${isActive
                      ? (isAdmin ? 'bg-red-600' : 'bg-blue-600') + ' rotate-[360deg] scale-110'
                      : 'bg-white text-gray-900 group-active:scale-90'
                      }`}
                  >
                    <Icon size={28} strokeWidth={3} />
                    {!isActive && (
                      <div className="absolute inset-0 rounded-full bg-white/20 animate-ping pointer-events-none" />
                    )}
                  </div>
                  <span
                    className={`text-[10px] font-black uppercase mt-2 transition-opacity duration-300 ${isActive
                      ? (isAdmin ? 'text-red-400' : 'text-blue-400') + ' opacity-100'
                      : 'opacity-0'
                      }`}
                  >
                    {item.name}
                  </span>
                </Link>
              );
            }

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center justify-center flex-1 h-16 transition-all duration-300 pb-2 ${isActive ? (isAdmin ? 'text-red-400' : 'text-blue-400') : 'text-gray-500'
                  }`}
              >
                <div className="relative">
                  <Icon size={isActive ? 24 : 22} className="transition-transform duration-300" />
                  {isActive && (
                    <div
                      className={`absolute -bottom-2 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full shadow-[0_0_8px] ${isAdmin ? 'bg-red-400 shadow-red-400' : 'bg-blue-400 shadow-blue-400'
                        }`}
                    />
                  )}
                </div>
                <span
                  className={`text-[10px] font-bold mt-1 transition-all duration-300 overflow-hidden ${isActive ? 'max-h-4 opacity-100' : 'max-h-0 opacity-0'
                    }`}
                >
                  {item.name}
                </span>
              </Link>
            );
          })}

          <div className="flex flex-col items-center justify-center flex-1 h-16 pb-2 text-gray-500">
            <LogoutButton isMobile />
          </div>
        </div>
      </nav>
    </>
  );
}
