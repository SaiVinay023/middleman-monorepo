'use client'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { loginSchema } from '@/lib/schemas/auth'
import { useAuth } from '@/hooks/useAuth'
import { AuthService } from '@/services/authService'
import Link from 'next/link'

export default function LoginPage() {
  const { loading, error, handleAction } = useAuth()
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(loginSchema)
  })

  const onSubmit = async (data: any) => {
    await handleAction(async () => {
      return AuthService.login(data);
    }, '/');
  }

  return (
    <div className="max-w-md mx-auto p-8 bg-white rounded-3xl shadow-xl mt-12">
      <h1 className="text-2xl font-bold mb-6">Login</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <input {...register('email')} placeholder="Email" className="w-full p-4 border rounded-xl" />
        {errors.email && <p className="text-red-500 text-xs">{errors.email.message as string}</p>}

        <input {...register('password')} type="password" placeholder="Password" className="w-full p-4 border rounded-xl" />
        {errors.password && <p className="text-red-500 text-xs">{errors.password.message as string}</p>}

        <div className="text-right">
          <Link href="/auth/forgot" className="text-sm text-blue-600 hover:underline">Forgot Password?</Link>
        </div>
        {error && (
          <div className="bg-red-50 border border-red-100 text-red-600 p-4 rounded-xl text-sm font-bold animate-shake">
            {error}
          </div>
        )}
        <button disabled={loading} className="w-full bg-blue-600 text-white p-4 rounded-xl font-bold">
          {loading ? 'Checking...' : 'Login'}
        </button>
      </form>

      <p className="mt-6 text-center text-sm">
        New here? <Link href="/auth/signup" className="text-blue-600 font-bold">Create an account</Link>
      </p>
    </div>
  )
}
