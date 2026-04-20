'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/src/context/AuthContext';
import { supabase } from '@/src/config/supabase';
import {
  Check, ChevronRight, PlusCircle, Settings, LogOut,
  Home, Briefcase, User, Search, Loader2,
} from 'lucide-react';

export default function ExplorarProfesionalesPage() {
  const router = useRouter();
  const { profile, logout } = useAuth();

  const [empresas, setEmpresas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState('');

  const nombreCorto = profile?.nombre_completo?.split(' ')[0]?.toLowerCase() || '';

  const cargar = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from('empresas')
      .select('id, nombre, descripcion, logo_url, color_primary')
      .eq('activa', true)
      .order('nombre');
    if (data) setEmpresas(data);
    setLoading(false);
  }, []);

  useEffect(() => { cargar(); }, [cargar]);

  const filtradas = empresas.filter(e =>
    e.nombre?.toLowerCase().includes(busqueda.toLowerCase()) ||
    e.descripcion?.toLowerCase().includes(busqueda.toLowerCase())
  );

  const handleSeleccionar = (empresa: any) => {
    router.push(`/cliente/reservar?empresaId=${empresa.id}`);
  };

  return (
    <div
      className="min-h-screen flex flex-col items-center px-6 py-12 pb-28"
      style={{ background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)' }}
    >
      {/* Header */}
      <header className="w-full max-w-md mb-10 text-center">
        <h1 className="text-2xl font-bold tracking-tight lowercase mb-2" style={{ color: '#43b9e5' }}>
          {profile?.empresaNombre?.toLowerCase() || 'mensana'}
        </h1>
        <div className="h-1 w-8 rounded-full mx-auto" style={{ background: 'rgba(67,185,229,0.2)' }} />
      </header>

      <main className="w-full max-w-md space-y-7">
        {/* Saludo */}
        <div className="text-center space-y-1.5">
          <h2 className="text-2xl font-semibold leading-tight tracking-tight lowercase" style={{ color: '#121616' }}>
            {nombreCorto ? `hola ${nombreCorto}, ` : ''}¿a qué centro deseas ir?
          </h2>
          <p className="text-sm font-normal lowercase tracking-wide" style={{ color: '#6a8180' }}>
            seleccioná el espacio donde querés reservar tu turno
          </p>
        </div>

        {/* Buscador */}
        <div className="relative">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: '#6a8180' }} />
          <input
            type="text"
            value={busqueda}
            onChange={e => setBusqueda(e.target.value)}
            placeholder="buscar centro..."
            className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm bg-white border lowercase placeholder:lowercase focus:outline-none focus:ring-2"
            style={{ borderColor: '#e2e8f0', color: '#121616', fontFamily: 'inherit' }}
          />
        </div>

        {/* Lista */}
        <div className="space-y-3">
          {loading ? (
            <div className="flex justify-center py-14">
              <Loader2 size={26} className="animate-spin" style={{ color: '#43b9e5' }} />
            </div>
          ) : filtradas.length === 0 ? (
            <div className="text-center py-14">
              <p className="text-4xl mb-3">🔍</p>
              <p className="text-sm lowercase" style={{ color: '#6a8180' }}>no se encontraron centros</p>
            </div>
          ) : (
            filtradas.map((empresa, idx) => {
              const esActual = empresa.id === profile?.empresaId;
              return (
                <button
                  key={empresa.id}
                  onClick={() => handleSeleccionar(empresa)}
                  className="w-full group relative bg-white p-5 rounded-xl flex items-center gap-5 border border-transparent text-left transition-all duration-200 hover:border-[rgba(67,185,229,0.3)]"
                  style={{ boxShadow: '0 10px 25px -5px rgba(67,185,229,0.08), 0 8px 10px -6px rgba(67,185,229,0.04)' }}
                >
                  {/* Avatar */}
                  <div className="relative shrink-0">
                    <div
                      className="w-16 h-16 rounded-full overflow-hidden border flex items-center justify-center bg-slate-50"
                      style={{ borderColor: '#e2e8f0' }}
                    >
                      {empresa.logo_url ? (
                        <img src={empresa.logo_url} alt={empresa.nombre} className="w-full h-full object-cover" />
                      ) : (
                        <span
                          className="text-2xl font-bold lowercase"
                          style={{ color: empresa.color_primary || '#43b9e5' }}
                        >
                          {empresa.nombre?.charAt(0)}
                        </span>
                      )}
                    </div>
                    {(esActual || idx === 0) && (
                      <div
                        className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-white flex items-center justify-center"
                        style={{ backgroundColor: '#43b9e5' }}
                      >
                        <Check size={10} color="white" strokeWidth={3} />
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 overflow-hidden">
                    <h3 className="font-semibold text-lg leading-tight lowercase truncate" style={{ color: '#121616' }}>
                      {empresa.nombre?.toLowerCase()}
                    </h3>
                    {empresa.descripcion && (
                      <p className="text-sm lowercase mt-0.5 truncate" style={{ color: '#6a8180' }}>
                        {empresa.descripcion.toLowerCase()}
                      </p>
                    )}
                  </div>

                  {/* Chevron */}
                  <ChevronRight
                    size={20}
                    className="shrink-0 transition-colors duration-200"
                    style={{ color: '#6a8180' }}
                  />
                </button>
              );
            })
          )}

          {/* Vincular otro centro */}
          {!loading && (
            <button
              className="w-full p-5 rounded-xl border-2 border-dashed flex items-center justify-center gap-2.5 transition-all duration-200 hover:border-[rgba(67,185,229,0.4)]"
              style={{ borderColor: '#E4E7ED' }}
            >
              <PlusCircle size={18} style={{ color: 'rgba(67,185,229,0.7)' }} />
              <span className="font-medium text-sm lowercase" style={{ color: '#6a8180' }}>vincular otro centro</span>
            </button>
          )}
        </div>

        {/* Footer */}
        <footer className="pt-8 text-center space-y-6">
          <button
            onClick={() => router.push('/cliente')}
            className="inline-block text-sm font-semibold tracking-wide lowercase hover:underline underline-offset-4 transition-all"
            style={{ color: '#43b9e5', textDecorationColor: 'rgba(67,185,229,0.3)' }}
          >
            volver al inicio
          </button>

          <div className="pt-4 flex items-center justify-center gap-8">
            <button className="flex flex-col items-center gap-1 group">
              <div
                className="w-10 h-10 rounded-full bg-white flex items-center justify-center transition-colors"
                style={{ boxShadow: '0 10px 25px -5px rgba(67,185,229,0.08)' }}
              >
                <Settings size={18} style={{ color: '#6a8180' }} />
              </div>
              <span className="text-[10px] font-medium uppercase tracking-widest" style={{ color: '#6a8180' }}>ajustes</span>
            </button>

            <button
              onClick={async () => { await logout(); router.push('/auth/login'); }}
              className="flex flex-col items-center gap-1 group"
            >
              <div
                className="w-10 h-10 rounded-full bg-white flex items-center justify-center transition-colors"
                style={{ boxShadow: '0 10px 25px -5px rgba(67,185,229,0.08)' }}
              >
                <LogOut size={18} style={{ color: '#6a8180' }} />
              </div>
              <span className="text-[10px] font-medium uppercase tracking-widest" style={{ color: '#6a8180' }}>salir</span>
            </button>
          </div>
        </footer>
      </main>

      {/* Bottom nav flotante */}
      <nav
        className="fixed bottom-6 left-1/2 -translate-x-1/2 px-6 py-3 rounded-full flex items-center gap-8 md:hidden"
        style={{
          background: 'rgba(255,255,255,0.85)',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(255,255,255,0.5)',
          boxShadow: '0 10px 25px -5px rgba(67,185,229,0.1)',
        }}
      >
        <button onClick={() => router.push('/cliente')}>
          <Home size={22} style={{ color: '#6a8180' }} />
        </button>
        <button>
          <Briefcase size={22} style={{ color: '#43b9e5' }} />
        </button>
        <button onClick={() => router.push('/cliente/perfil')}>
          <User size={22} style={{ color: '#6a8180' }} />
        </button>
      </nav>
    </div>
  );
}
