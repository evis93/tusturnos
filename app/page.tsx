'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/src/context/AuthContext';

export default function HomePage() {
  const { profile, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!profile) {
      router.replace('/auth/login');
      return;
    }
    if (profile.rol === 'superadmin') router.replace('/tusturnos');
    else if (profile.rol === 'admin') router.replace('/admin/agenda');
    else if (profile.rol === 'profesional') router.replace('/profesional/agenda');
    else if (profile.rol === 'cliente') router.replace('/cliente');
    else router.replace('/auth/login');
  }, [profile, loading, router]);

  return (
    <div className="flex min-h-screen items-center justify-center" style={{ backgroundColor: '#f7f9fb' }}>
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500" />
    </div>
  );
}
