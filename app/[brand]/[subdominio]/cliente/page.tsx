'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/src/context/AuthContext';
import { useTheme } from '@/src/context/ThemeContext';
import { supabase } from '@/src/config/supabase';
import ModalResena from '@/src/components/ModalResena';

const MESES = ['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic'];
const DIAS  = ['dom','lun','mar','mié','jue','vie','sáb'];

function formatProxima(fecha: string, hora: string) {
  if (!fecha) return '';
  const hoy = new Date();
  const todayStr = hoy.toISOString().split('T')[0];
  const mañanaStr = new Date(hoy.getTime() + 86400000).toISOString().split('T')[0];
  const horaFmt = hora ? hora.slice(0, 5) : '';
  if (fecha === todayStr) return `hoy, ${horaFmt}`;
  if (fecha === mañanaStr) return `mañana, ${horaFmt}`;
  const d = new Date(fecha + 'T12:00:00');
  return `${DIAS[d.getDay()]} ${d.getDate()} ${MESES[d.getMonth()]}, ${horaFmt}`;
}

function formatFechaHistorial(fechaStr: string) {
  const d = new Date(fechaStr + 'T12:00:00');
  return `${d.getDate()} de ${MESES[d.getMonth()]}`;
}

export default function ClientePage() {
  const router = useRouter();
  const params = useParams();
  const brand = params.brand as string;
  const subdominio = params.subdominio as string;
  const { colors, logoUrl } = useTheme();
  const { profile } = useAuth();
  const primaryColor = profile?.colorPrimario || primaryColor;
  const backgroundColor = profile?.colorBackground || colors.background;

  const nombreCorto = profile?.nombre_completo?.split(' ')[0]?.toLowerCase() || 'hola';

  const [loading, setLoading] = useState(true);
  const [proximasSesiones, setProximasSesiones] = useState<any[]>([]);
  const [historial, setHistorial] = useState<any[]>([]);
  const [resenasMap, setResenasMap] = useState<Record<string, any>>({});
  const [reservaParaResena, setReservaParaResena] = useState<any>(null);

  const cargar = useCallback(async () => {
    if (!profile?.usuarioId) return;
    setLoading(true);
    try {
      const today = new Date().toISOString().split('T')[0];

      const res = await fetch(`/api/reservas?clienteId=${profile.usuarioId}&empresaId=${profile.empresaId}`);
      if (!res.ok) { setLoading(false); return; }
      const json = await res.json();
      if (!json.success) { setLoading(false); return; }

      // fecha y hora ya vienen normalizados desde la API (time without time zone)
      const todas = (json.data as any[]).map((r: any) => ({
        ...r,
        servicio: r.servicio_nombre,
      }));

      const proximas = todas
        .filter((r: any) => r.fecha >= today && ['pendiente', 'confirmada'].includes(r.estado?.toLowerCase()))
        .sort((a: any, b: any) => a.hora_inicio.localeCompare(b.hora_inicio));

      const pasadas = todas
        .filter((r: any) => r.fecha < today && ['pendiente', 'confirmada', 'completada'].includes(r.estado?.toLowerCase()))
        .slice(0, 3);

      setProximasSesiones(proximas);
      setHistorial(pasadas);

      const pasadasIds = pasadas.map((r: any) => r.id).filter(Boolean);
      if (pasadasIds.length > 0) {
        const { data: resenasData } = await supabase.from('resenas').select('*').in('reserva_id', pasadasIds);
        const map: Record<string, any> = {};
        (resenasData || []).forEach((r: any) => { map[r.reserva_id] = r; });
        setResenasMap(map);
      }
    } catch {
      // silenciar errores de API (ej. permisos) — mostrar estado vacío
    } finally {
      setLoading(false);
    }
  }, [profile]);

  useEffect(() => { cargar(); }, [cargar]);

  const buildWhatsAppUrl = (reserva: any, tipo: 'cancelar' | 'cambiar') => {
    const telefono = reserva.profesional_telefono?.replace(/\D/g, '');
    if (!telefono) return null;

    let texto = tipo === 'cancelar'
      ? 'Solicito la cancelación de la reserva.'
      : 'Solicito un cambio de horario de mi reserva.';

    if (tipo === 'cancelar' && reserva.seña_pagada && reserva.vencimiento_seña) {
      const hoy = new Date().toISOString().split('T')[0];
      if (hoy <= reserva.vencimiento_seña) {
        texto += ' Dentro de las 24 hs devolveremos su seña.';
      } else {
        texto += ' Su seña ha vencido, por lo tanto no le será devuelta.';
      }
    }

    return `https://wa.me/${telefono}?text=${encodeURIComponent(texto)}`;
  };

  const handleCancelar = async (reserva: any) => {
    if (!window.confirm('¿Cancelar esta reserva?')) return;
    const res = await fetch(`/api/reservas/${reserva.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ estado: 'cancelada', clienteId: profile?.usuarioId }),
    });
    if (res.ok) {
      // Notificar al profesional por WhatsApp si tiene teléfono
      const url = buildWhatsAppUrl(reserva, 'cancelar');
      if (url) window.open(url, '_blank');
      cargar();
    } else {
      window.alert('No se pudo cancelar la reserva. Intentá de nuevo.');
    }
  };

  const handleCambiarHorario = (reserva: any) => {
    router.push(`/${brand}/${subdominio}/cliente/reservar?cambiarId=${reserva.id}`);
  };

  const handleBorrarResena = async (reservaId: string) => {
    const resena = resenasMap[reservaId];
    if (!resena?.id) return;
    if (!window.confirm('¿Eliminar esta reseña?')) return;
    const { error } = await supabase.from('resenas').delete().eq('id', resena.id);
    if (!error) setResenasMap(prev => { const n = { ...prev }; delete n[reservaId]; return n; });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: colors.background }}>
        <div className="animate-spin rounded-full h-10 w-10 border-b-2" style={{ borderColor: primaryColor }} />
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor }}>
      {/* Header */}
      <header className="px-6 py-5 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold" style={{ color: colors.secondary }}>hola, {nombreCorto}</h1>
        </div>
      </header>

      <div className="px-6 space-y-7">
        {/* Nueva reserva */}
        <Link href={`/${brand}/${subdominio}/cliente/reservar`}
          className="flex items-center justify-center gap-2 w-full py-3.5 rounded-2xl text-sm font-bold"
          style={{ backgroundColor: primaryColor, color: '#fff' }}>
          + nueva reserva
        </Link>

        {/* Próximas sesiones */}
        <section>
          <p className="text-xs uppercase tracking-wider mb-3" style={{ color: colors.textSecondary }}>próximas sesiones</p>

          {proximasSesiones.length > 0 ? (
            <div className="space-y-3">
              {proximasSesiones.map((sesion: any) => (
                <div key={sesion.id}>
                  <div className="bg-white rounded-2xl p-5 shadow-sm border" style={{ borderColor: colors.borderLight }}>
                    {sesion.estado?.toLowerCase() === 'pendiente' ? (
                      <span className="inline-flex items-center gap-1 text-xs font-bold px-3 py-1 rounded-full bg-yellow-100 text-yellow-700 mb-3">
                        ⏰ pendiente de confirmación
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs font-bold px-3 py-1 rounded-full bg-green-100 text-green-700 mb-3">
                        ✓ confirmada
                      </span>
                    )}

                    <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: primaryColor }}>
                      {formatProxima(sesion.fecha, sesion.hora)}
                    </p>
                    <p className="text-lg font-bold lowercase mb-1" style={{ color: colors.text }}>
                      {sesion.servicio || 'sesión'}
                    </p>
                    {sesion.profesional_nombre && (
                      <p className="text-xs lowercase mb-4" style={{ color: colors.textMuted }}>
                        👤 {sesion.profesional_nombre}
                      </p>
                    )}
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleCancelar(sesion)}
                        className="flex-1 py-2.5 rounded-xl text-xs font-bold border"
                        style={{ borderColor: colors.border, color: colors.textSecondary }}
                      >
                        cancelar
                      </button>
                      {sesion.estado?.toLowerCase() === 'confirmada' && (
                        <button
                          onClick={() => handleCambiarHorario(sesion)}
                          className="flex-1 py-2.5 rounded-xl text-xs font-bold"
                          style={{ backgroundColor: primaryColorFaded, color: primaryColor }}
                        >
                          cambiar horario
                        </button>
                      )}
                    </div>
                  </div>

                  {sesion.estado?.toLowerCase() === 'pendiente' && (
                    <div className="mt-2 flex items-start gap-2 bg-green-50 border border-green-200 rounded-xl px-4 py-3">
                      <span className="text-green-600">💬</span>
                      <p className="text-xs text-green-800 lowercase">
                        tu reserva depende de la aprobación del centro. te avisaremos cuando sea confirmada.
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-2xl p-6 flex flex-col items-center gap-3 border" style={{ borderColor: colors.borderLight }}>
              <span className="text-3xl opacity-30">📅</span>
              <p className="text-sm lowercase" style={{ color: colors.textMuted }}>sin sesiones próximas</p>
            </div>
          )}
        </section>

        {/* Historial */}
        <section>
          <p className="text-xs uppercase tracking-wider mb-3" style={{ color: colors.textSecondary }}>mi historial</p>

          {historial.length > 0 ? (
            <div>
              {historial.map((h: any, idx: number) => (
                <div key={h.id} className="flex gap-4 pb-6">
                  <div className="flex flex-col items-center w-3">
                    <div className="w-3 h-3 rounded-full border-2 border-white z-10" style={{ backgroundColor: primaryColorFaded }} />
                    {idx < historial.length - 1 && <div className="w-px flex-1 mt-1" style={{ backgroundColor: primaryColorFaded }} />}
                  </div>
                  <div className="flex-1">
                    <p className="text-xs lowercase mb-0.5" style={{ color: colors.textMuted }}>{formatFechaHistorial(h.fecha)}</p>
                    <p className="text-sm font-bold lowercase mb-0.5" style={{ color: colors.text }}>{h.servicio || 'sesión'}</p>
                    {h.profesional_nombre && <p className="text-xs lowercase mb-2" style={{ color: colors.textSecondary }}>{h.profesional_nombre}</p>}

                    {h.estado?.toLowerCase() === 'completada' && (
                      resenasMap[h.id] ? (
                        <div className="flex gap-2">
                          <button onClick={() => setReservaParaResena(h)}
                            className="flex items-center gap-1 px-3 py-1 rounded-full border text-xs font-bold lowercase"
                            style={{ borderColor: primaryColor, color: primaryColor }}>
                            ✏️ editar
                          </button>
                          <button onClick={() => handleBorrarResena(h.id)}
                            className="flex items-center gap-1 px-3 py-1 rounded-full border text-xs font-bold lowercase"
                            style={{ borderColor: colors.error, color: colors.error }}>
                            🗑 borrar
                          </button>
                        </div>
                      ) : (
                        <button onClick={() => setReservaParaResena(h)}
                          className="flex items-center gap-1 px-3 py-1 rounded-full border text-xs font-bold lowercase"
                          style={{ borderColor: primaryColor, color: primaryColor }}>
                          calificar ★
                        </button>
                      )
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-2xl p-6 flex flex-col items-center gap-3 border" style={{ borderColor: colors.borderLight }}>
              <span className="text-3xl opacity-30">📋</span>
              <p className="text-sm lowercase" style={{ color: colors.textMuted }}>sin sesiones anteriores</p>
            </div>
          )}
        </section>

        {/* BIENVENIDO */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs uppercase tracking-wider" style={{ color: colors.textSecondary }}>pensando en tu bienestar integral</p>
            <button className="text-xs font-bold lowercase" style={{ color: primaryColor }}>ver más</button>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
            {[
              { icon: '🧘', tag: 'ejercicio', titulo: 'mindfulness: respiración consciente', sub: '5 minutos de calma absoluta' },
              { icon: '🌿', tag: 'rutina', titulo: 'estiramientos de mañana', sub: 'mejora tu postura hoy' },
            ].map((c, i) => (
              <div key={i} className="flex-shrink-0 w-56 rounded-2xl overflow-hidden border" style={{ borderColor: colors.borderLight }}>
                <div className="h-24 flex items-center justify-center text-4xl" style={{ backgroundColor: primaryColorFaded }}>{c.icon}</div>
                <div className="p-3">
                  <p className="text-xs font-bold uppercase tracking-wide lowercase mb-1" style={{ color: primaryColor }}>{c.tag}</p>
                  <p className="text-xs font-bold lowercase leading-snug mb-0.5" style={{ color: colors.text }}>{c.titulo}</p>
                  <p className="text-xs lowercase" style={{ color: colors.textMuted }}>{c.sub}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Modal reseña */}
      <ModalResena
        visible={!!reservaParaResena}
        reserva={reservaParaResena}
        resenaExistente={reservaParaResena ? resenasMap[reservaParaResena.id] : null}
        onCerrar={() => setReservaParaResena(null)}
        onGuardado={() => { setReservaParaResena(null); cargar(); }}
      />

    </div>
  );
}
