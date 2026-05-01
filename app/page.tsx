'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/src/context/AuthContext';

export default function HomePage() {
  const { profile, loading, setActiveEmpresa } = useAuth();
  const router = useRouter();
  const redirected = useRef(false);

  useEffect(() => {
    if (loading) return;
    if (redirected.current) return;

    if (!profile) {
      redirected.current = true;
      router.replace('/auth/login');
      return;
    }

    console.log('[page.tsx] Profile:', {
      totalSucursales: profile.totalSucursales,
      rol: profile.rol,
      sucursalesDisponibles: profile.sucursalesDisponibles?.length,
    });

    if (profile.rol === 'superadmin') {
      redirected.current = true;
      router.replace('/nrc-admin/dashboard');
      return;
    }

    const totalSucursales = profile.totalSucursales || 0;
    console.log('[page.tsx] totalSucursales:', totalSucursales);

    if (totalSucursales === 0) {
      redirected.current = true;
      router.replace('/auth/login');
      return;
    }

    // Si el usuario tiene solo 1 sucursal, redirigir directamente sin selector
    if (totalSucursales === 1) {
      redirected.current = true;
      console.log('[page.tsx] Redirecting to role-based page');
      const sucursal = profile.sucursalesDisponibles?.[0];
      if (sucursal) {
        console.log('[page.tsx] Setting active empresa:', sucursal);
        setActiveEmpresa({
          empresaId: sucursal.empresaId,
          empresaNombre: sucursal.empresaNombre,
          rol: profile.rol || '',
        });
      }
      const rol = profile.rol;
      console.log('[page.tsx] Redirecting to:', rol);
      if (rol === 'admin') router.replace('/admin/agenda');
      else if (rol === 'profesional') router.replace('/profesional/agenda');
      else if (rol === 'cliente') router.replace('/cliente');
      else router.replace('/seleccionar-sucursal');
      return;
    }

    console.log('[page.tsx] Multiple sucursales, redirecting to selector');
    // Si el usuario tiene múltiples sucursales, mostrar selector
    redirected.current = true;
    router.replace('/seleccionar-empresa');
  }, [profile, loading, router]);

  return (
    <div className="flex min-h-screen items-center justify-center" style={{ backgroundColor: '#f7f9fb' }}>
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500" />
    </div>
  );
}
