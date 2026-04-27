'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/src/context/AuthContext';
import { useTheme } from '@/src/context/ThemeContext';
import * as reservasActions from '@/src/actions/reservas';
import ModalPago from '@/src/components/reservas/ModalPago';
import ModalReserva from '@/src/components/reservas/ModalReserva';
import { RefreshCw, MessageCircle, Check, Clock } from 'lucide-react';
import { clsx } from 'clsx';

const TABS = ['Pendientes', 'Confirmadas'];
const MESES_CORTO = ['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic'];

function extraerHora(horaInicio: string): string {
  if (!horaInicio) return '';
  if (horaInicio.includes('T')) return horaInicio.substring(11, 16);
  return horaInicio.substring(0, 5);
}

function formatearFecha(fechaStr: string): string {
  if (!fechaStr) return '';
  const d = new Date(fechaStr + 'T12:00:00');
  const DIAS = ['dom','lun','mar','mié','jue','vie','sáb'];
  return `${DIAS[d.getDay()]} ${d.getDate()} ${MESES_CORTO[d.getMonth()]}`;
}

function claveOrden(r: any): string {
  return `${r.fecha || ''}T${extraerHora(r.hora_inicio || '')}`;
}

export default function GestionReservasPage() {
  const { profile } = useAuth();
  const { colors } = useTheme();

  const [activeTab, setActiveTab] = useState(0);
  const [reservas, setReservas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [señas, setSeñas] = useState<Record<string, string>>({});
  const [pagoModal, setPagoModal] = useState<{ open: boolean; reserva: any | null }>({ open: false, reserva: null });
  const [cambiarModal, setCambiarModal] = useState<{ open: boolean; reserva: any | null }>({ open: false, reserva: null });

  const cargarReservas = useCallback(async () => {
    setLoading(true);
    const result = await reservasActions.obtenerTodas();
    if (result.success) setReservas((result as any).data || []);
    setLoading(false);
  }, []);

  useEffect(() => { cargarReservas(); }, [cargarReservas]);

  const today = new Date().toISOString().split('T')[0];

  const { pendientes, confirmadas } = useMemo(() => {
    const pendientes = reservas
      .filter(r => r.estado === 'pendiente')
      .sort((a, b) => claveOrden(a).localeCompare(claveOrden(b)));
    const confirmadas = reservas
      .filter(r => r.estado === 'confirmada' && (r.fecha || '') >= today)
      .sort((a, b) => claveOrden(a).localeCompare(claveOrden(b)));
    return { pendientes, confirmadas };
  }, [reservas, today]);

  const reservasFiltradas = activeTab === 0 ? pendientes : confirmadas;

  const handleConfirmar = async (reserva: any) => {
    await reservasActions.cambiarEstadoReserva(reserva.id, 'confirmada');

    // WhatsApp al cliente con confirmación (+ seña si corresponde)
    const tel = (reserva.consultante_telefono || reserva.consultante?.telefono || '').replace(/\D/g, '');
    if (tel) {
      const hora = extraerHora(reserva.hora_inicio || '');
      const nombre = reserva.consultante_nombre || reserva.consultante?.nombre || '';
      const seña = señas[reserva.id];
      let msg = `Hola ${nombre}, tu turno del ${formatearFecha(reserva.fecha)} a las ${hora}hs fue confirmado.`;
      if (seña && parseFloat(seña) > 0) {
        msg += ` Para asegurar el turno, por favor abonà una seña de $${seña}.`;
      }
      window.open(`https://wa.me/${tel}?text=${encodeURIComponent(msg)}`, '_blank');
    }

    cargarReservas();
  };

  const handleCambiarHorario = (reserva: any) => {
    setCambiarModal({ open: true, reserva });
  };

  const handleWhatsApp = (reserva: any) => {
    const tel = (reserva.consultante_telefono || reserva.consultante?.telefono || '').replace(/\D/g, '');
    if (!tel) return;
    const hora = extraerHora(reserva.hora_inicio || '');
    const nombre = reserva.consultante_nombre || reserva.consultante?.nombre || '';
    const msg = `Hola ${nombre}, recordamos tu turno del ${formatearFecha(reserva.fecha)} a las ${hora}hs.`;
    window.open(`https://wa.me/${tel}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  // Fecha para el ModalReserva (se usa la fecha de la reserva origen como base)
  const fechaModal = cambiarModal.reserva?.fecha || today;

  // Profesionales para el ModalReserva (mínimo vacío)
  const [profesionales] = useState<any[]>([]);

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold" style={{ color: colors.text }}>Gestión de Reservas</h1>
        <button onClick={cargarReservas} className="p-2 rounded-lg hover:bg-gray-100 transition">
          <RefreshCw size={18} style={{ color: colors.textSecondary }} />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 w-fit mb-6">
        {TABS.map((tab, i) => {
          const count = i === 0 ? pendientes.length : confirmadas.length;
          return (
            <button
              key={tab}
              onClick={() => setActiveTab(i)}
              className={clsx('flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition',
                activeTab === i ? 'bg-white shadow-sm' : 'text-gray-500 hover:text-gray-700')}
              style={activeTab === i ? { color: colors.primary } : {}}
            >
              {tab}
              {count > 0 && (
                <span className="inline-flex items-center justify-center min-w-[18px] h-[18px] rounded-full text-white font-bold"
                  style={{ background: i === 0 ? '#ef4444' : colors.success, fontSize: '10px', padding: '0 4px' }}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: colors.primary }} />
        </div>
      ) : reservasFiltradas.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-4xl mb-3">📋</p>
          <p style={{ color: colors.textSecondary }}>No hay reservas {TABS[activeTab].toLowerCase()}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {reservasFiltradas.map(reserva => {
            const hora = extraerHora(reserva.hora_inicio || '');
            const nombre = reserva.consultante_nombre || reserva.consultante?.nombre || 'Sin nombre';
            const telefono = (reserva.consultante_telefono || reserva.consultante?.telefono || '').replace(/\D/g, '');
            const profesional = reserva.profesional_nombre || reserva.profesional?.nombre || '';
            const servicio = reserva.servicio || reserva.servicio_nombre || reserva.tipo_sesion || '';

            return (
              <div key={reserva.id} className="bg-white rounded-xl border p-4"
                style={{ borderColor: colors.border, borderLeft: `4px solid ${activeTab === 0 ? '#f59e0b' : colors.success}` }}>

                {/* Contenido: info + seña en paralelo */}
                <div className="flex gap-4">
                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold truncate" style={{ color: colors.text }}>{nombre}</p>
                    <p className="text-sm font-medium mt-0.5" style={{ color: colors.primary }}>
                      📅 {formatearFecha(reserva.fecha)} · {hora}hs
                    </p>
                    {profesional && (
                      <p className="text-xs mt-0.5" style={{ color: colors.textSecondary }}>👤 {profesional}</p>
                    )}
                    {servicio && (
                      <p className="text-xs mt-0.5" style={{ color: colors.textSecondary }}>🗂 {servicio}</p>
                    )}
                    {reserva.precio_total != null && (
                      <p className="text-sm font-bold mt-1" style={{ color: colors.primary }}>
                        ${Number(reserva.precio_total).toLocaleString('es-AR')}
                      </p>
                    )}
                  </div>

                  {/* Seña */}
                  <div className="flex flex-col items-end gap-1 flex-shrink-0">
                    <label className="text-xs font-medium" style={{ color: colors.textSecondary }}>seña</label>
                    <div className="flex items-center border rounded-lg overflow-hidden"
                      style={{ borderColor: colors.border }}>
                      <span className="px-2 text-xs font-bold" style={{ color: colors.textMuted }}>$</span>
                      <input
                        type="number"
                        min="0"
                        placeholder="0"
                        value={señas[reserva.id] || ''}
                        onChange={e => setSeñas(prev => ({ ...prev, [reserva.id]: e.target.value }))}
                        className="w-20 py-1.5 pr-2 text-sm focus:outline-none"
                        style={{ color: colors.text }}
                      />
                    </div>
                  </div>
                </div>

                {/* Botones */}
                <div className="flex gap-2 mt-3 flex-wrap">
                  {activeTab === 0 ? (
                    <>
                      <button
                        onClick={() => handleConfirmar(reserva)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-white"
                        style={{ background: colors.success }}
                      >
                        <Check size={12} /> Confirmar
                      </button>
                      <button
                        onClick={() => handleCambiarHorario(reserva)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-amber-50 text-amber-700"
                      >
                        <Clock size={12} /> Cambiar horario
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => setPagoModal({ open: true, reserva })}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-white"
                        style={{ background: colors.primary }}
                      >
                        💰 Registrar pago
                      </button>
                      {telefono && (
                        <button
                          onClick={() => handleWhatsApp(reserva)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-green-50 text-green-700"
                        >
                          <MessageCircle size={12} /> WhatsApp
                        </button>
                      )}
                      <button
                        onClick={() => handleCambiarHorario(reserva)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-amber-50 text-amber-700"
                      >
                        <Clock size={12} /> Cambiar horario
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {pagoModal.open && pagoModal.reserva && (
        <ModalPago
          open={pagoModal.open}
          onClose={() => setPagoModal({ open: false, reserva: null })}
          onSaved={() => { setPagoModal({ open: false, reserva: null }); cargarReservas(); }}
          reserva={pagoModal.reserva}
          profile={profile}
        />
      )}

      {cambiarModal.open && cambiarModal.reserva && (
        <ModalReserva
          open={cambiarModal.open}
          onClose={() => setCambiarModal({ open: false, reserva: null })}
          onSaved={() => { setCambiarModal({ open: false, reserva: null }); cargarReservas(); }}
          fecha={fechaModal}
          reservaOrigen={cambiarModal.reserva}
          profesionales={profesionales}
          profile={profile}
        />
      )}
    </div>
  );
}
