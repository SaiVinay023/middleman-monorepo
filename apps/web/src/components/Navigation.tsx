'use client'
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Briefcase, User, FileText } from 'lucide-react';

const navItems = [
  { name: 'Home', href: '/', icon: Home },
  { name: 'Gigs', href: '/freelancer/gigs', icon: Briefcase },
  { name: 'Docs', href: '/freelancer/documents', icon: FileText },
  { name: 'Profile', href: '/freelancer/profile', icon: User },
];

export default function Navigation() {
  const pathname = usePathname();

  return (
    <>
      {/* DESKTOP SIDEBAR - Hidden on Mobile */}
      <aside className="hidden md:flex flex-col w-64 h-screen fixed left-0 top-0 bg-white border-r p-4">
        <h1 className="text-xl font-bold mb-8">Middleman</h1>
        <nav className="space-y-2">
          {navItems.map((item) => (
            <Link 
              key={item.href} 
              href={item.href}
              className={`flex items-center gap-3 p-3 rounded-lg ${pathname === item.href ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-100'}`}
            >
              <item.icon size={20} />
              {item.name}
            </Link>
          ))}
        </nav>
      </aside>

      {/* MOBILE BOTTOM BAR - Hidden on Desktop */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t flex justify-around p-3 pb-safe">
        {navItems.map((item) => (
          <Link 
            key={item.href} 
            href={item.href}
            className={`flex flex-col items-center ${pathname === item.href ? 'text-blue-600' : 'text-gray-400'}`}
          >
            <item.icon size={24} />
            <span className="text-[10px] mt-1">{item.name}</span>
          </Link>
        ))}
      </nav>
    </>
  );
}