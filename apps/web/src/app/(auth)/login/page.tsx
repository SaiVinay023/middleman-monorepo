'use client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema } from '@/lib/schemas/auth';
import { useAuth } from '@/hooks/useAuth';
import { AuthService } from '@/services/authService';
import Link from 'next/link';

export default function LoginPage() {
  const { loading, error, handleAction } = useAuth();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: any) => {
    await handleAction(async () => {
      return AuthService.login(data);
    }, '/');
  };

  return (
    <div className="w-full max-w-md bg-white p-8 rounded-3xl shadow-xl">
      <h1 className="text-2xl font-bold mb-6 text-gray-900">Welcome back</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
        {/* Email */}
        <div>
          <label htmlFor="login-email" className="block text-sm font-medium text-gray-700 mb-1.5">
            Email address
          </label>
          <input
            {...register('email')}
            id="login-email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            className="w-full p-4 border border-gray-200 rounded-xl bg-gray-50 text-gray-900 focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition"
            aria-describedby={errors.email ? 'login-email-error' : undefined}
            aria-invalid={!!errors.email}
          />
          {errors.email && (
            <p id="login-email-error" role="alert" className="text-red-500 text-xs mt-1 font-medium">
              {errors.email.message as string}
            </p>
          )}
        </div>

        {/* Password */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label htmlFor="login-password" className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <Link href="/forgot" className="text-sm text-blue-600 hover:underline">
              Forgot password?
            </Link>
          </div>
          <input
            {...register('password')}
            id="login-password"
            type="password"
            autoComplete="current-password"
            placeholder="••••••••"
            className="w-full p-4 border border-gray-200 rounded-xl bg-gray-50 text-gray-900 focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition"
            aria-describedby={errors.password ? 'login-password-error' : undefined}
            aria-invalid={!!errors.password}
          />
          {errors.password && (
            <p id="login-password-error" role="alert" className="text-red-500 text-xs mt-1 font-medium">
              {errors.password.message as string}
            </p>
          )}
        </div>

        {error && (
          <div role="alert" className="bg-red-50 border border-red-100 text-red-600 p-4 rounded-xl text-sm font-bold">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white p-4 rounded-xl font-bold hover:bg-blue-700 transition active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading ? 'Signing in…' : 'Sign In'}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-gray-600">
        New here?{' '}
        <Link href="/signup" className="text-blue-600 font-bold hover:underline">
          Create an account
        </Link>
      </p>
    </div>
  );
}
