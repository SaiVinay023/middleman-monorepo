'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useDocuments } from '@/hooks/useDocuments'
import DocUploader from '@/components/DocUploader' // Import the component

const DOC_TYPES = [
  { id: 'ID_CARD', label: 'National ID / Passport' },
  { id: 'CV', label: 'Technical Resume (CV)' },
  { id: 'CERT', label: 'Professional Certification' },
  { id: 'TAX', label: 'Tax Identification' }
] as const;

export default function ProfilePage() {
  const [userId, setUserId] = useState<string | null>(null)

  // Get the user ID to pass to our hook
  useEffect(() => {
    supabase.auth.getUser().then(({ data }: any) => {
      setUserId(data.user?.id || null)
    })
  }, [])

  const { documents, isLoading } = useDocuments(userId || '')

  // Calculate Progress using the data from our hook
  const totalCount = DOC_TYPES.length
  const uploadedCount = documents?.length || 0
  const progressPercent = Math.round((uploadedCount / totalCount) * 100)

  if (isLoading || !userId) return <div className="p-10 text-center animate-pulse">Initializing...</div>

  return (
    <div className="p-6 pb-32 max-w-2xl mx-auto space-y-8">
      {/* 1. PROGRESS HEADER */}
      <section className="bg-gray-900 rounded-[3rem] p-8 text-white shadow-2xl text-center">
        <h1 className="text-3xl font-black mb-2">{progressPercent}% COMPLETE</h1>
        <p className="text-gray-400 text-xs uppercase tracking-widest font-bold">
          Verification Progress
        </p>
      </section>

      {/* 2. THE DOC UPLOADER COMPONENTS */}
      <div className="grid grid-cols-1 gap-4">
        {DOC_TYPES.map((doc) => (
          <DocUploader
            key={doc.id}
            userId={userId}
            docType={doc.id as any} // Cast to our specific types
            label={doc.label}
          />
        ))}
      </div>
    </div>
  )
}