'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { LogOut } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function LogoutButton({ isMobile: _isMobile }: { isMobile?: boolean }) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleLogout = async () => {
    setLoading(true)
    try {
      await supabase.auth.signOut()
      // 1. Force a refresh to clear all internal state/caches
      // 2. Redirect to login explicitly
      router.replace('/login')
      router.refresh()
    } catch (error) {
      console.error('Logout failed:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleLogout}
      className="flex items-center gap-3 px-4 py-3 w-full text-red-400 hover:bg-gray-800 rounded-lg transition-colors font-medium"
    >
      <LogOut size={20} />
      <span>{loading ? 'Leaving...' : 'Logout'}</span>
    </button>
  )
}