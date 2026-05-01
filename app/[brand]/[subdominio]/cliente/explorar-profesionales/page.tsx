'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/src/context/AuthContext';
import { useTheme } from '@/src/context/ThemeContext';
import { supabase } from '@/src/config/supabase';
import {
  Check, ChevronRight, PlusCircle,
  Home, Briefcase, User, Search, Loader2, MapPin,
} from 'lucide-react';

function parseCoords(location: any): [number, number] | null {
  if (!location) return null;
  try {
    const geo = typeof location === 'string' ? JSON.parse(location) : location;
    if (geo?.type === 'Point' && Array.isArray(geo.coordinates)) {
      return [geo.coordinates[1], geo.coordinates[0]]; // [lat, lon]
    }
  } catch {}
  return null;
}

function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function formatDistancia(km: number): string {
  if (km < 1) return `${Math.round(km * 1000)} m`;
  return `${km.toFixed(1)} km`;
}

export default function ExplorarProfesionalesPage() {
  const params = useParams();
  const brand = params.brand as string;
  const subdominio = params.subdominio as string;
  const router = useRouter();
  const { profile, setActiveEmpresa } = useAuth();
  const { colors } = useTheme();
  const primaryColor = profile?.colorPrimario || primaryColor;
  const backgroundColor = profile?.colorBackground || colors.background;

  const [empresas, setEmpresas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [uniendose, setUniendose] = useState<string | null>(null);
  const [busqueda, setBusqueda] = useState('');

  const nombreCorto = profile?.nombre_completo?.split(' ')[0]?.toLowerCase() || '';

  const cargar = useCallback(async () => {
    setLoading(true);

    // Ubicación del usuario
    let userCoords: [number, number] | null = null;
    if (profile?.usuarioId) {
      const { data: userData } = await supabase
        .from('usuarios')
        .select('location')
        .eq('id', profile.usuarioId)
        .single();
      userCoords = parseCoords(userData?.location);
    }

    // Empresas tusturnos (producto = 'tusturnos' o sin producto definido)
    const { data } = await supabase
      .from('empresas')
      .select('id, nombre, descripcion, logo_url, color_primary, color_secondary, color_background, location')
      .eq('activa', true)
      .or('producto.eq.tusturnos,producto.is.null');

    if (data) {
      const conDistancia = data.map(e => {
        const eCoords = parseCoords(e.location);
        const distancia = userCoords && eCoords
          ? haversineKm(userCoords[0], userCoords[1], eCoords[0], eCoords[1])
          : null;
        return { ...e, distancia };
      });

      conDistancia.sort((a, b) => {
        if (a.distancia === null && b.distancia === null)
          return (a.nombre || '').localeCompare(b.nombre || '');
        if (a.distancia === null) return 1;
        if (b.distancia === null) return -1;
        return a.distancia - b.distancia;
      });

      setEmpresas(conDistancia);
    }
    setLoading(false);
  }, [profile?.usuarioId]);

  useEffect(() => { cargar(); }, [cargar]);

  const filtradas = empresas.filter(e =>
    e.nombre?.toLowerCase().includes(busqueda.toLowerCase()) ||
    e.descripcion?.toLowerCase().includes(busqueda.toLowerCase())
  );

  const handleSeleccionar = async (empresa: any) => {
    if (!profile?.usuarioId || uniendose) return;
    setUniendose(empresa.id);
    await fetch('/api/cliente/unirse-empresa', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ usuarioId: profile.usuarioId, empresaId: empresa.id }),
    });
    setActiveEmpresa({
      empresaId: empresa.id,
      empresaNombre: empresa.nombre,
      rol: 'cliente',
      colorPrimario: empresa.color_primary,
      colorSecundario: empresa.color_secondary,
      colorBackground: empresa.color_background,
      logoUrl: empresa.logo_url,
    });
    router.push(`/${brand}/${subdominio}/cliente/reservar`);
  };

  return (
    <div
      className="min-h-screen flex flex-col items-center px-6 py-12 pb-28"
      style={{ backgroundColor }}
    >
      {/* Header */}
      <header className="w-full max-w-md mb-10 text-center">
        <h1 className="text-2xl font-bold tracking-tight lowercase mb-2" style={{ color: colors.secondary }}>
          {profile?.empresaNombre?.toLowerCase() || 'mensana'}
        </h1>
        <div className="h-1 w-8 rounded-full mx-auto" style={{ backgroundColor: primaryColorFaded }} />
      </header>

      <main className="w-full max-w-md space-y-7">
        {/* Saludo */}
        <div className="text-center space-y-1.5">
          <h2 className="text-2xl font-semibold leading-tight tracking-tight lowercase" style={{ color: colors.text }}>
            {nombreCorto ? `hola ${nombreCorto}, ` : ''}¿a qué centro deseas ir?
          </h2>
          <p className="text-sm font-normal lowercase tracking-wide" style={{ color: colors.textMuted }}>
            seleccioná el espacio donde querés reservar tu turno
          </p>
        </div>

        {/* Buscador */}
        <div className="relative">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: colors.textMuted }} />
          <input
            type="text"
            value={busqueda}
            onChange={e => setBusqueda(e.target.value)}
            placeholder="buscar centro..."
            className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm bg-white border lowercase placeholder:lowercase focus:outline-none focus:ring-2"
            style={{ borderColor: colors.border, color: colors.text, fontFamily: 'inherit' }}
          />
        </div>

        {/* Lista */}
        <div className="space-y-3">
          {loading ? (
            <div className="flex justify-center py-14">
              <Loader2 size={26} className="animate-spin" style={{ color: primaryColor }} />
            </div>
          ) : filtradas.length === 0 ? (
            <div className="text-center py-14">
              <p className="text-4xl mb-3">🔍</p>
              <p className="text-sm lowercase" style={{ color: colors.textMuted }}>no se encontraron centros</p>
            </div>
          ) : (
            filtradas.map((empresa) => {
              const esActual = empresa.id === profile?.empresaId;
              const ePrimary = empresa.color_primary || primaryColor;
              const eSecondary = empresa.color_secondary || colors.textSecondary;
              const eBg = empresa.color_background || '#ffffff';
              return (
                <button
                  key={empresa.id}
                  onClick={() => handleSeleccionar(empresa)}
                  disabled={!!uniendose}
                  className="w-full group relative p-5 rounded-xl flex items-center gap-5 text-left transition-all duration-200 overflow-hidden disabled:opacity-60"
                  style={{
                    backgroundColor: eBg,
                    borderLeft: `4px solid ${ePrimary}`,
                    boxShadow: '0 10px 25px -5px rgba(0,0,0,0.06), 0 8px 10px -6px rgba(0,0,0,0.03)',
                  }}
                >
                  {/* Avatar */}
                  <div className="relative shrink-0">
                    <div
                      className="w-16 h-16 rounded-full overflow-hidden border-2 flex items-center justify-center"
                      style={{ borderColor: ePrimary, backgroundColor: `${ePrimary}18` }}
                    >
                      {empresa.logo_url ? (
                        <img src={empresa.logo_url} alt={empresa.nombre} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-2xl font-bold lowercase" style={{ color: ePrimary }}>
                          {empresa.nombre?.charAt(0)}
                        </span>
                      )}
                    </div>
                    {esActual && (
                      <div
                        className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-white flex items-center justify-center"
                        style={{ backgroundColor: ePrimary }}
                      >
                        <Check size={10} color="white" strokeWidth={3} />
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 overflow-hidden">
                    <h3 className="font-semibold text-lg leading-tight lowercase truncate" style={{ color: colors.text }}>
                      {empresa.nombre?.toLowerCase()}
                    </h3>
                    {empresa.descripcion && (
                      <p className="text-sm lowercase mt-0.5 truncate" style={{ color: colors.textMuted }}>
                        {empresa.descripcion.toLowerCase()}
                      </p>
                    )}
                    {empresa.distancia !== null && (
                      <p className="flex items-center gap-1 text-xs lowercase mt-1" style={{ color: eSecondary }}>
                        <MapPin size={11} />
                        {formatDistancia(empresa.distancia)}
                      </p>
                    )}
                  </div>

                  {/* Chevron / Loader */}
                  {uniendose === empresa.id
                    ? <Loader2 size={20} className="shrink-0 animate-spin" style={{ color: ePrimary }} />
                    : <ChevronRight size={20} className="shrink-0" style={{ color: ePrimary }} />
                  }
                </button>
              );
            })
          )}

          {/* Nota */}
          {!loading && (
            <p className="text-xs text-center lowercase px-2" style={{ color: colors.textMuted }}>
              si vas a un centro o profesional que no tenés en tus turnos envianos sus datos
            </p>
          )}

          {/* Vincular otro centro */}
          {!loading && (
            <button
              className="w-full p-5 rounded-xl border-2 border-dashed flex items-center justify-center gap-2.5 transition-all duration-200"
              style={{ borderColor: colors.borderLight }}
            >
              <PlusCircle size={18} style={{ color: primaryColorLight }} />
              <span className="font-medium text-sm lowercase" style={{ color: colors.textMuted }}>vincular otro centro</span>
            </button>
          )}
        </div>

        {/* Footer */}
        <footer className="pt-8 text-center">
          <button
            onClick={() => router.push(`/${brand}/${subdominio}/cliente`)}
            className="inline-block text-sm font-semibold tracking-wide lowercase hover:underline underline-offset-4 transition-all"
            style={{ color: primaryColor }}
          >
          </button>
        </footer>
      </main>

      {/* Bottom nav flotante */}
      <nav
        className="fixed bottom-6 left-1/2 -translate-x-1/2 px-6 py-3 rounded-full flex items-center gap-8 md:hidden"
        style={{
          background: 'rgba(255,255,255,0.85)',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(255,255,255,0.5)',
          boxShadow: '0 10px 25px -5px rgba(0,0,0,0.08)',
        }}
      >
        <button onClick={() => router.push(`/${brand}/${subdominio}/cliente`)}>
          <Home size={22} style={{ color: colors.textSecondary }} />
        </button>
        <button>
          <Briefcase size={22} style={{ color: primaryColor }} />
        </button>
        <button onClick={() => router.push(`/${brand}/${subdominio}/cliente/perfil`)}>
          <User size={22} style={{ color: colors.textSecondary }} />
        </button>
      </nav>
    </div>
  );
}
