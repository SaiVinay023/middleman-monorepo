'use client'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { signupSchema } from '@/lib/schemas/auth'
import { useAuth } from '@/hooks/useAuth'
import { AuthService } from '@/services/authService'
import * as z from 'zod'

type SignupFormValues = z.infer<typeof signupSchema>;

export default function Signup() {
  const { loading, error, handleAction } = useAuth()
  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      role: 'freelancer'
    }
  })

  const role = watch('role')

  const onSubmit = (data: SignupFormValues) => {
    handleAction(() => AuthService.register(data), '/')
  }

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-2xl shadow-lg mt-10">
      <h1 className="text-2xl font-black text-gray-900 mb-2">Create Account</h1>
      <p className="text-gray-500 font-medium mb-6">Join the Middleman ecosystem</p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Segmented Control for Role */}
        <div className="flex bg-gray-100 p-1.5 rounded-xl mb-6">
          <button
            type="button"
            onClick={() => setValue('role', 'freelancer')}
            className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all ${role === 'freelancer' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
          >
            I want to work
          </button>
          <button
            type="button"
            onClick={() => setValue('role', 'company')}
            className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all ${role === 'company' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
          >
            I want to hire
          </button>
        </div>

        <div>
          <input {...register('fullName')} placeholder={role === 'company' ? "Company Name" : "Full Name"} className="w-full p-4 bg-gray-50 border border-gray-200 text-gray-900 rounded-2xl focus:ring-4 focus:ring-blue-100 outline-none transition" />
          {errors.fullName && <p className="text-red-500 text-xs mt-1 font-bold">{errors.fullName.message}</p>}
        </div>

        <div>
          <input {...register('email')} placeholder="Email Address" className="w-full p-4 bg-gray-50 border border-gray-200 text-gray-900 rounded-2xl focus:ring-4 focus:ring-blue-100 outline-none transition" />
          {errors.email && <p className="text-red-500 text-xs mt-1 font-bold">{errors.email.message}</p>}
        </div>

        <div>
          <input {...register('phone')} placeholder="Phone Number" className="w-full p-4 bg-gray-50 border border-gray-200 text-gray-900 rounded-2xl focus:ring-4 focus:ring-blue-100 outline-none transition" />
          {errors.phone && <p className="text-red-500 text-xs mt-1 font-bold">{errors.phone.message}</p>}
        </div>

        <div>
          <input {...register('password')} type="password" placeholder="Password" className="w-full p-4 bg-gray-50 border border-gray-200 text-gray-900 rounded-2xl focus:ring-4 focus:ring-blue-100 outline-none transition" />
          {errors.password && <p className="text-red-500 text-xs mt-1 font-bold">{errors.password.message}</p>}
        </div>

        {error && <p className="text-red-600 text-sm font-medium">{error}</p>}
        <button disabled={loading} className="w-full bg-blue-600 text-white p-4 rounded-2xl font-bold hover:bg-blue-700 transition active:scale-95 disabled:opacity-50 mt-2">
          {loading ? 'Processing...' : 'Create Account'}
        </button>
      </form>
    </div>
  )
}