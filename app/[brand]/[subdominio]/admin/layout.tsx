'use client';

import { useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/src/context/AuthContext';
import DashboardLayout from '@/src/components/layout/DashboardLayout';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { profile, loading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const brand = params.brand as string;
  const subdominio = params.subdominio as string;

  useEffect(() => {
    if (loading) return;
    if (!profile) {
      router.replace(`/${brand}/${subdominio}/auth/login`);
    } else if (profile.rol !== 'admin' && profile.rol !== 'superadmin') {
      router.replace(`/${brand}/${subdominio}`);
    }
  }, [profile, loading, router, brand, subdominio]);

  if (loading || !profile) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
      </div>
    );
  }

  return <DashboardLayout>{children}</DashboardLayout>;
}
