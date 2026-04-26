'use client';

import { useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/src/context/AuthContext';
import { getPostLoginRoute } from '@/src/lib/brand-utils';

export default function TenantHomePage() {
  const router = useRouter();
  const params = useParams();
  const { session, profile, loading } = useAuth();
  const brand = params.brand as 'mensana' | 'tusturnos';
  const subdominio = params.subdominio as string;

  useEffect(() => {
    if (loading) return;

    if (!session) {
      // Not logged in
      if (brand === 'tusturnos') {
        // TusTurnos goes directly to login
        router.replace(`/${brand}/${subdominio}/auth/login`);
      }
      // Mensana shows landing page (keep this page)
      return;
    }

    // Logged in: redirect to dashboard based on role
    const destination = getPostLoginRoute(brand, subdominio, profile?.rol || 'cliente');
    router.replace(destination);
  }, [loading, session, profile, brand, subdominio, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full" />
      </div>
    );
  }

  // Only show landing for Mensana when not logged in
  if (brand === 'mensana' && !session) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex flex-col items-center justify-center px-4">
        <div className="text-center">
          <h1 className="text-5xl font-bold text-blue-900 mb-4">Bienvenido a Mensana</h1>
          <p className="text-xl text-blue-700 mb-8">
            Plataforma integral de reservas y agendamiento profesional
          </p>
          <button
            onClick={() => router.push(`/${brand}/${subdominio}/auth/login`)}
            className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold transition"
          >
            Iniciar Sesión
          </button>
        </div>
      </div>
    );
  }

  return null;
}