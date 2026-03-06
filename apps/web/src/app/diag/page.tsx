'use client';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';

export default function Diag() {
  const { user } = useAuth();
  const { profile, isLoading } = useProfile(user?.id || '');

  if (isLoading) return <p>Loading...</p>;

  return (
    <div className="p-20 space-y-4">
      <h1 className="text-3xl font-bold">Diagnostic Mode</h1>
      <pre className="bg-gray-100 p-4 rounded-xl">
        {JSON.stringify({
          auth_uid: user?.id,
          profile_role: profile?.role, // This MUST say 'admin'
          full_name: profile?.full_name
        }, null, 2)}
      </pre>
    </div>
  );
}