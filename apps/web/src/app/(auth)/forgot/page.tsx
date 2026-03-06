'use client'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { forgotPasswordSchema } from '@/lib/schemas/auth'
import { useAuth } from '@/hooks/useAuth'
import { AuthService } from '@/services/authService'
import { useState } from 'react'
import Link from 'next/link'
import { Mail, ArrowLeft } from 'lucide-react'

export default function ForgotPasswordPage() {
  const { loading, error, handleAction } = useAuth()
  const [emailSent, setEmailSent] = useState(false)
  
  const { register, handleSubmit, formState: { errors }, getValues } = useForm({
    resolver: zodResolver(forgotPasswordSchema)
  })

  const onSubmit = (data: any) => {
    handleAction(async () => {
      await AuthService.sendResetCode(data.email)
      setEmailSent(true)
    })
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gray-50">
      <div className="w-full max-w-md bg-white p-8 rounded-3xl shadow-xl">
        <Link href="/login" className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 mb-6 transition-colors">
          <ArrowLeft size={16} /> Back to Login
        </Link>

        <h1 className="text-2xl font-bold mb-2">Forgot Password?</h1>
        <p className="text-gray-500 mb-8 text-sm">
          No worries! Enter your email and we'll send you a 6-digit reset code.
        </p>

        {!emailSent ? (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="relative">
              <Mail className="absolute left-4 top-4 text-gray-400" size={20} />
              <input 
                {...register('email')} 
                placeholder="Email Address" 
                className="w-full pl-12 p-4 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all" 
              />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message as string}</p>}
            </div>

            {error && <p className="text-red-600 text-sm font-medium bg-red-50 p-3 rounded-lg">{error}</p>}

            <button 
              disabled={loading} 
              className="w-full bg-blue-600 text-white p-4 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 disabled:bg-blue-300"
            >
              {loading ? 'Sending...' : 'Send Reset Code'}
            </button>
          </form>
        ) : (
          <div className="text-center space-y-6">
            <div className="bg-green-50 p-4 rounded-2xl text-green-700 text-sm font-medium">
              Code sent to <strong>{getValues('email')}</strong>
            </div>
            <Link 
              href={`/auth/reset?email=${getValues('email')}`} 
              className="block w-full bg-blue-600 text-white p-4 rounded-xl font-bold shadow-lg shadow-blue-100"
            >
              Enter 6-Digit Code
            </Link>
            <button 
              onClick={() => setEmailSent(false)} 
              className="text-sm text-gray-400 hover:text-gray-600 underline"
            >
              Didn't get a code? Try again
            </button>
          </div>
        )}
      </div>
    </div>
  )
}