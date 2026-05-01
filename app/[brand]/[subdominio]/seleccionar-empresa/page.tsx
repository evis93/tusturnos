'use client';

import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/src/context/AuthContext';
import { useTheme } from '@/src/context/ThemeContext';
import { useState } from 'react';

const ROL_LABEL: Record<string, string> = {
  superadmin: 'administrador general',
  admin: 'administrador',
  profesional: 'profesional de salud',
  cliente: 'consultante',
};

function rutaPorRol(rol: string, brand: string, subdominio: string): string {
  if (rol === 'admin' || rol === 'superadmin') return `/${brand}/${subdominio}/admin/gestion-reservas`;
  if (rol === 'profesional') return `/${brand}/${subdominio}/profesional`;
  return `/${brand}/${subdominio}/cliente`;
}

function Spinner() {
  return (
    <div className="flex min-h-screen items-center justify-center" style={{ background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)' }}>
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#43b9e5]" />
    </div>
  );
}

export default function SeleccionarEmpresaPage() {
  const router = useRouter();
  const params = useParams();
  const brand = params.brand as string;
  const subdominio = params.subdominio as string;
  const { profile, loading: authLoading, setActiveEmpresa, logout } = useAuth();
  const { colors } = useTheme();
  const primaryColor = profile?.colorPrimario || primaryColor;
  const backgroundColor = profile?.colorBackground || 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)';
  const [showLogout, setShowLogout] = useState(false);

  if (authLoading || !profile) return <Spinner />;

  const sucursales = profile.sucursalesDisponibles || [];

  const handleSeleccionar = (sucursal: any) => {
    setActiveEmpresa({
      empresaId: sucursal.empresaId,
      empresaNombre: sucursal.empresaNombre,
      rol: profile.rol || '',
      colorPrimario: sucursal.colorPrimario,
      colorSecundario: sucursal.colorSecundario,
      colorBackground: sucursal.colorBackground,
      logoUrl: sucursal.logoUrl,
    });
    router.replace(rutaPorRol(profile.rol || '', brand, subdominio));
  };

  const handleLogout = async () => {
    await logout();
    router.replace(`/${brand}/${subdominio}/auth/login`);
  };

  const nombreCorto = profile?.nombre_completo?.split(' ')[0]?.toLowerCase() || '';

  // Agrupar por empresa
  const sucursalesPorEmpresa = sucursales.reduce((acc: any, suc: any) => {
    if (!acc[suc.empresaId]) {
      acc[suc.empresaId] = { nombre: suc.empresaNombre, sucursales: [] };
    }
    acc[suc.empresaId].sucursales.push(suc);
    return acc;
  }, {});

  return (
    <div
      className="min-h-screen flex flex-col items-center px-6 py-12 md:py-20"
      style={{ background: backgroundColor }}
    >
      <header className="w-full max-w-2xl mb-12 text-center">
        <h1 className="text-2xl font-bold tracking-tight lowercase mb-2" style={{ color: primaryColor }}>
          mensana
        </h1>
        <div className="h-1 w-8 mx-auto rounded-full" style={{ backgroundColor: 'rgba(67,185,229,0.2)' }} />
      </header>

      <main className="w-full max-w-2xl space-y-8">
        <div className="text-center space-y-2">
          <h2 className="text-2xl md:text-3xl font-semibold leading-tight tracking-tight lowercase" style={{ color: '#121616' }}>
            {nombreCorto ? `hola ${nombreCorto}, ` : ''}¿a qué sucursal deseas ingresar?
          </h2>
          <p className="text-sm font-normal lowercase tracking-wide" style={{ color: '#6a8180' }}>
            seleccioná donde querés trabajar hoy
          </p>
        </div>

        <div className="space-y-6">
          {Object.entries(sucursalesPorEmpresa).length === 0 ? (
            <p className="text-center text-sm lowercase" style={{ color: '#6a8180' }}>
              no tenés sucursales asignadas
            </p>
          ) : (
            Object.entries(sucursalesPorEmpresa).map(([empresaId, data]: any) => (
              <div key={empresaId} className="space-y-3">
                <h3 className="text-sm font-semibold uppercase tracking-widest" style={{ color: '#6a8180' }}>
                  {data.nombre}
                </h3>
                <div className="space-y-2">
                  {data.sucursales.map((sucursal: any) => (
                    <button
                      key={sucursal.sucursalId}
                      onClick={() => handleSeleccionar(sucursal)}
                      className="w-full group relative bg-white p-4 rounded-lg flex items-start gap-4 border border-transparent text-left transition-all duration-300"
                      style={{
                        boxShadow: '0 10px 25px -5px rgba(67,185,229,0.1), 0 8px 10px -6px rgba(67,185,229,0.05)',
                      }}
                      onMouseEnter={e => (e.currentTarget.style.borderColor = 'rgba(67,185,229,0.3)')}
                      onMouseLeave={e => (e.currentTarget.style.borderColor = 'transparent')}
                    >
                      <div className="flex-1 overflow-hidden">
                        <h4
                          className="font-semibold text-base leading-tight lowercase truncate"
                          style={{ color: '#121616' }}
                        >
                          {sucursal.sucursalNombre}
                        </h4>
                        {sucursal.direccion && (
                          <p className="text-sm lowercase mt-1" style={{ color: '#6a8180' }}>
                            {sucursal.direccion}
                          </p>
                        )}
                        <p className="text-xs lowercase mt-1" style={{ color: '#9ca3af' }}>
                          {ROL_LABEL[profile.rol || ''] || profile.rol}
                        </p>
                      </div>
                      <span
                        className="material-symbols-outlined transition-colors flex-shrink-0"
                        style={{ color: '#6a8180' }}
                      >
                        chevron_right
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>

        <footer className="pt-12 text-center">
          <div className="pt-4 flex items-center justify-center gap-8">
            <button
              onClick={() => setShowLogout(!showLogout)}
              className="flex flex-col items-center gap-1 group"
            >
              <div
                className="size-10 rounded-full bg-white flex items-center justify-center transition-colors"
                style={{
                  boxShadow: '0 10px 25px -5px rgba(67,185,229,0.1)',
                  color: '#6a8180',
                }}
                onMouseEnter={e => ((e.currentTarget as HTMLElement).style.color = '#f87171')}
                onMouseLeave={e => ((e.currentTarget as HTMLElement).style.color = '#6a8180')}
              >
                <span className="material-symbols-outlined">logout</span>
              </div>
              <span className="text-[10px] font-medium uppercase tracking-widest" style={{ color: '#6a8180' }}>
                salir
              </span>
            </button>
          </div>
          {showLogout && (
            <div className="mt-6 p-4 bg-white rounded-lg shadow-lg">
              <p className="text-sm mb-3" style={{ color: '#6a8180' }}>
                ¿Seguro que deseas salir?
              </p>
              <button
                onClick={handleLogout}
                className="w-full px-4 py-2 rounded-lg text-sm font-medium transition"
                style={{
                  background: '#dc2626',
                  color: '#fff',
                }}
              >
                Sí, salir
              </button>
            </div>
          )}
        </footer>
      </main>
    </div>
  );
}
