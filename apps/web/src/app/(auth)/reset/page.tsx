'use client'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { resetPasswordSchema } from '@/lib/schemas/auth'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/lib/supabase'
import { useState } from 'react'

export default function ResetPasswordPage() {
  const { loading, error, handleAction } = useAuth()
  const [isSuccess, setIsSuccess] = useState(false)
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(resetPasswordSchema)
  })

  const onSubmit = async (data: any) => {
    handleAction(async () => {
      // 1. Verify the OTP code sent to email
      const { error: verifyError } = await supabase.auth.verifyOtp({
        email: data.email, // You may need to pass email from a state/param
        token: data.code,
        type: 'recovery'
      })
      if (verifyError) throw verifyError

      // 2. Update the user's password
      const { error: updateError } = await supabase.auth.updateUser({
        password: data.newPassword
      })
      if (updateError) throw updateError
      
      setIsSuccess(true)
    }, '/login')
  }

  if (isSuccess) return <div className="p-10 text-center">Password updated! Redirecting...</div>

  return (
    <div className="max-w-md mx-auto p-8 bg-white rounded-3xl shadow-xl mt-12">
      <h1 className="text-2xl font-bold mb-2">Create New Password</h1>
      <p className="text-gray-500 mb-6 text-sm">Enter the 6-digit code from your email.</p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <div>
          <label htmlFor="reset-code" className="block text-sm font-medium text-gray-700 mb-1.5">
            6-digit code
          </label>
          <input
            {...register('code')}
            id="reset-code"
            type="text"
            autoComplete="one-time-code"
            inputMode="numeric"
            maxLength={6}
            placeholder="000000"
            className="w-full p-4 border rounded-xl text-center text-xl tracking-widest"
            aria-describedby={errors.code ? 'reset-code-error' : undefined}
            aria-invalid={!!errors.code}
          />
          {errors.code && (
            <p id="reset-code-error" role="alert" className="text-red-500 text-xs mt-1">
              {errors.code.message as string}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="reset-newPassword" className="block text-sm font-medium text-gray-700 mb-1.5">
            New password
          </label>
          <input
            {...register('newPassword')}
            id="reset-newPassword"
            type="password"
            autoComplete="new-password"
            placeholder="••••••••"
            className="w-full p-4 border rounded-xl"
            aria-describedby={errors.newPassword ? 'reset-newPassword-error' : undefined}
            aria-invalid={!!errors.newPassword}
          />
          {errors.newPassword && (
            <p id="reset-newPassword-error" role="alert" className="text-red-500 text-xs mt-1">
              {errors.newPassword.message as string}
            </p>
          )}
        </div>

        {error && <p className="text-red-600 text-sm">{error}</p>}

        <button disabled={loading} className="w-full bg-blue-600 text-white p-4 rounded-xl font-bold">
          {loading ? 'Updating...' : 'Set New Password'}
        </button>
      </form>
    </div>
  )
}