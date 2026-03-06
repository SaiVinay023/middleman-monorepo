'use client'

import { useState } from 'react'
import { useDocuments } from '@/hooks/useDocuments'
import { compressImage } from '@/lib/compression' 
import { CheckCircle, Clock, Upload, AlertTriangle, Loader2 } from 'lucide-react'

interface Props {
  userId: string
  docType: 'ID_CARD' | 'CV' | 'CERT' | 'TAX'
  label: string
}

export default function DocumentUploader({ userId, docType, label }: Props) {
  const { recordUpload, documents, isUploading: isRecording } = useDocuments(userId)
  const [isProcessing, setIsProcessing] = useState(false)
  const [localError, setLocalError] = useState<string | null>(null)

  // Find if this specific doc type is already in our Supabase list
  const existingDoc = documents?.find(d => d.document_type === docType)

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // 1. Initial Validation
    const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
    if (!ALLOWED_TYPES.includes(file.type)) {
      setLocalError('Invalid format. Use JPG, PNG, or PDF.')
      return
    }

    setLocalError(null)
    setIsProcessing(true)

    try {
      // 2. Client-Side Compression (Save those Cloudinary credits!)
      let fileToUpload = file
      if (file.type.startsWith('image/')) {
        fileToUpload = await compressImage(file) as File
      }

      // 3. Direct Fetch to Cloudinary API
      const formData = new FormData()
      formData.append('file', fileToUpload)
      formData.append('upload_preset', 'middleman_docs') // Must be "Unsigned" in Cloudinary
      
      const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/upload`,
        {
          method: 'POST',
          body: formData,
        }
      )

      const result = await response.json()

      if (result.secure_url) {
        // 4. Save metadata to Supabase
        await recordUpload({ docType, url: result.secure_url })
      } else {
        throw new Error(result.error?.message || 'Upload failed')
      }
    } catch (err: any) {
      console.error('Upload Error:', err)
      setLocalError(err.message || 'Server error. Try again.')
    } finally {
      setIsProcessing(false)
      e.target.value = '' // Reset input
    }
  }

  return (
    <div className="flex flex-col gap-2 p-5 border rounded-[2rem] bg-white shadow-sm transition-all hover:shadow-md border-gray-100">
      <div className="flex items-center justify-between">
        <div>
          <p className="font-black text-gray-900 uppercase tracking-tight text-sm">{label}</p>
          <div className="flex items-center gap-1 mt-1">
            {existingDoc ? (
              <span className="text-[10px] font-black uppercase tracking-widest flex items-center gap-1 text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
                <Clock size={10} strokeWidth={3} /> {existingDoc.status}
              </span>
            ) : (
              <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                Not Uploaded
              </span>
            )}
          </div>
        </div>

        {existingDoc?.status === 'verified' ? (
          <div className="bg-emerald-100 text-emerald-600 p-2 rounded-xl">
            <CheckCircle size={24} strokeWidth={3} />
          </div>
        ) : (
          <div className="relative">
            <input 
              type="file" 
              className="hidden" 
              id={`file-input-${docType}`}
              onChange={handleUpload}
              accept="image/*,application/pdf"
              disabled={isProcessing || isRecording}
            />
            <button 
              type="button"
              onClick={() => document.getElementById(`file-input-${docType}`)?.click()}
              disabled={isProcessing || isRecording}
              className="bg-gray-900 text-white p-3 rounded-2xl hover:bg-black active:scale-95 transition-all disabled:opacity-50 shadow-lg shadow-gray-200"
            >
              {isProcessing || isRecording ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <Upload size={20} strokeWidth={3} />
              )}
            </button>
          </div>
        )}
      </div>

      {localError && (
        <div className="text-red-600 text-[10px] font-black uppercase p-3 rounded-xl bg-red-50 border border-red-100 mt-2 flex items-center gap-2">
          <AlertTriangle size={14} />
          {localError}
        </div>
      )}
    </div>
  )
}