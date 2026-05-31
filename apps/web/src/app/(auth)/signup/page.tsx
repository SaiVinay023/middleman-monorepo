'use client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { signupSchema } from '@/lib/schemas/auth';
import { useAuth } from '@/hooks/useAuth';
import { AuthService } from '@/services/authService';
import * as z from 'zod';
import Link from 'next/link';

type SignupFormValues = z.infer<typeof signupSchema>;

export default function Signup() {
  const { loading, error, handleAction } = useAuth();
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      role: 'freelancer',
    },
  });

  const role = watch('role');

  const onSubmit = (data: SignupFormValues) => {
    handleAction(() => AuthService.register(data), '/');
  };

  return (
    <div className="w-full max-w-md bg-white p-6 rounded-2xl shadow-lg">
      <h1 className="text-2xl font-black text-gray-900 mb-1">Create Account</h1>
      <p className="text-gray-500 font-medium mb-6">Join the Middleman ecosystem</p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        {/* Role Selector */}
        <fieldset>
          <legend className="sr-only">Account type</legend>
          <div className="flex bg-gray-100 p-1.5 rounded-xl mb-2" role="group" aria-label="Select your role">
            <button
              type="button"
              onClick={() => setValue('role', 'freelancer')}
              aria-pressed={role === 'freelancer'}
              className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all ${
                role === 'freelancer'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              I want to work
            </button>
            <button
              type="button"
              onClick={() => setValue('role', 'company')}
              aria-pressed={role === 'company'}
              className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all ${
                role === 'company'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              I want to hire
            </button>
          </div>
        </fieldset>

        {/* Full Name / Company Name */}
        <div>
          <label htmlFor="signup-fullName" className="block text-sm font-medium text-gray-700 mb-1.5">
            {role === 'company' ? 'Company name' : 'Full name'}
          </label>
          <input
            {...register('fullName')}
            id="signup-fullName"
            type="text"
            autoComplete={role === 'company' ? 'organization' : 'name'}
            placeholder={role === 'company' ? 'Acme Corp' : 'Jane Smith'}
            className="w-full p-4 bg-gray-50 border border-gray-200 text-gray-900 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition"
            aria-describedby={errors.fullName ? 'signup-fullName-error' : undefined}
            aria-invalid={!!errors.fullName}
          />
          {errors.fullName && (
            <p id="signup-fullName-error" role="alert" className="text-red-500 text-xs mt-1 font-bold">
              {errors.fullName.message}
            </p>
          )}
        </div>

        {/* Email */}
        <div>
          <label htmlFor="signup-email" className="block text-sm font-medium text-gray-700 mb-1.5">
            Email address
          </label>
          <input
            {...register('email')}
            id="signup-email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            className="w-full p-4 bg-gray-50 border border-gray-200 text-gray-900 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition"
            aria-describedby={errors.email ? 'signup-email-error' : undefined}
            aria-invalid={!!errors.email}
          />
          {errors.email && (
            <p id="signup-email-error" role="alert" className="text-red-500 text-xs mt-1 font-bold">
              {errors.email.message}
            </p>
          )}
        </div>

        {/* Phone */}
        <div>
          <label htmlFor="signup-phone" className="block text-sm font-medium text-gray-700 mb-1.5">
            Phone number
          </label>
          <input
            {...register('phone')}
            id="signup-phone"
            type="tel"
            autoComplete="tel"
            placeholder="+1 (555) 000-0000"
            className="w-full p-4 bg-gray-50 border border-gray-200 text-gray-900 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition"
            aria-describedby={errors.phone ? 'signup-phone-error' : undefined}
            aria-invalid={!!errors.phone}
          />
          {errors.phone && (
            <p id="signup-phone-error" role="alert" className="text-red-500 text-xs mt-1 font-bold">
              {errors.phone.message}
            </p>
          )}
        </div>

        {/* Password */}
        <div>
          <label htmlFor="signup-password" className="block text-sm font-medium text-gray-700 mb-1.5">
            Password
          </label>
          <input
            {...register('password')}
            id="signup-password"
            type="password"
            autoComplete="new-password"
            placeholder="••••••••"
            className="w-full p-4 bg-gray-50 border border-gray-200 text-gray-900 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition"
            aria-describedby={errors.password ? 'signup-password-error' : undefined}
            aria-invalid={!!errors.password}
          />
          {errors.password && (
            <p id="signup-password-error" role="alert" className="text-red-500 text-xs mt-1 font-bold">
              {errors.password.message}
            </p>
          )}
        </div>

        {error && (
          <p role="alert" className="text-red-600 text-sm font-medium">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white p-4 rounded-2xl font-bold hover:bg-blue-700 transition active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed mt-2"
        >
          {loading ? 'Creating account…' : 'Create Account'}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-gray-600">
        Already have an account?{' '}
        <Link href="/login" className="text-blue-600 font-bold hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}