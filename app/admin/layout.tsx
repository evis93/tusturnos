'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/src/context/AuthContext';
import AdminMenu from '@/src/components/AdminMenu';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { profile, loading, totalSucursales } = useAuth();
  const router = useRouter();
  const redirected = useRef(false);

  useEffect(() => {
    if (loading || redirected.current) return;

    // Si no hay perfil, redirigir a login
    if (!profile) {
      redirected.current = true;
      router.replace('/auth/login');
      return;
    }

    // Si tiene múltiples sucursales y aún no selecciona una, ir al selector
    if ((totalSucursales ?? 0) > 1 && !profile.empresaId) {
      redirected.current = true;
      router.replace('/seleccionar-empresa');
      return;
    }
  }, [profile, loading, totalSucursales, router]);

  // Mientras carga o redirige, mostrar spinner
  if (loading || !profile || ((totalSucursales ?? 0) > 1 && !profile.empresaId)) {
    return (
      <div className="flex min-h-screen items-center justify-center" style={{ background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)' }}>
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#43b9e5]" />
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <AdminMenu />
      <div className="flex-1 overflow-auto">
        {children}
      </div>
    </div>
  );
}
