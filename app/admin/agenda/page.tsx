'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/src/context/AuthContext';
import { useTheme } from '@/src/context/ThemeContext';
import { ReservaController } from '@/src/controllers/ReservaController';
import { ProfesionalController } from '@/src/controllers/ProfesionalController';
import ModalReserva from '@/src/components/reservas/ModalReserva';
import ModalPago from '@/src/components/reservas/ModalPago';
import ModalFicha from '@/src/components/reservas/ModalFicha';
import ModalAccesoCliente from '@/src/components/reservas/ModalAccesoCliente';
import { ChevronLeft, ChevronRight, ClipboardList, CheckCircle2 } from 'lucide-react';
import { clsx } from 'clsx';
import { supabase } from '@/src/config/supabase';

const DIAS_SEMANA = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
const MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
const HORARIOS = Array.from({ length: 13 }, (_, i) => i + 8); // 8-20h

export default function AgendaPage() {
  const { profile } = useAuth();
  const { colors } = useTheme();

  const hoy = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState(hoy);

  useEffect(() => {
    localStorage.setItem('agenda_fecha_seleccionada', selectedDate);
  }, [selectedDate]);
  const [reservas, setReservas] = useState<any[]>([]);
  const [profesionales, setProfesionales] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [pagoModal, setPagoModal] = useState<{ open: boolean; reserva: any | null }>({ open: false, reserva: null });
  const [fichaModal, setFichaModal] = useState<{ open: boolean; reserva: any | null }>({ open: false, reserva: null });
  const [editingReserva, setEditingReserva] = useState<any>(null);
  const [horaSeleccionada, setHoraSeleccionada] = useState<string | null>(null);


  // Acceso cliente
  const [accesoModal, setAccesoModal] = useState<{
    open: boolean;
    clienteId: string;
    clienteNombre: string;
    clienteTelefono: string;
  }>({ open: false, clienteId: '', clienteNombre: '', clienteTelefono: '' });

  // Hora actual para indicador (se actualiza cada minuto)
  const [horaActual, setHoraActual] = useState(new Date().getHours());
  useEffect(() => {
    const interval = setInterval(() => setHoraActual(new Date().getHours()), 60000);
    return () => clearInterval(interval);
  }, []);

  const [fichasCount, setFichasCount] = useState(0);

  const cargarReservas = useCallback(async () => {
    setLoading(true);
    const [result, fichasResult] = await Promise.all([
      ReservaController.obtenerReservasPorFecha(selectedDate, profile?.profesionalId, profile),
      profile?.profesionalId
        ? supabase.from('fichas').select('id', { count: 'exact', head: true }).eq('fecha', selectedDate).eq('profesional_id', profile.profesionalId)
        : Promise.resolve({ count: 0 }),
    ]);
    if (result.success) setReservas((result as any).data || []);
    setFichasCount((fichasResult as any).count ?? 0);
    setLoading(false);
  }, [selectedDate, profile]);

  useEffect(() => { cargarReservas(); }, [cargarReservas]);

  useEffect(() => {
    ProfesionalController.obtenerProfesionales(profile).then(r => {
      if (r.success && 'data' in r) setProfesionales(r.data || []);
    });
  }, [profile]);

  // Nombre del profesional actual (informativo)
  const profesionalActual = profesionales.find(p => p.id === profile?.profesionalId);

  const diasSemana = Array.from({ length: 7 }, (_, i) => {
    const base = new Date(selectedDate + 'T12:00:00');
    base.setDate(base.getDate() + (i - 3));
    const str = base.toISOString().split('T')[0];
    return { fecha: str, diaSemana: DIAS_SEMANA[base.getDay()], diaNumero: base.getDate(), esHoy: str === hoy };
  });

  const fechaFormateada = (() => {
    const f = new Date(selectedDate + 'T12:00:00');
    return `${DIAS_SEMANA[f.getDay()]}, ${f.getDate()} de ${MESES[f.getMonth()]}`;
  })();

  const getReservaParaHora = (hora: number) =>
    reservas.find(r => r.hora_inicio && parseInt(r.hora_inicio.split(':')[0]) === hora);

  const handleNuevaReserva = (hora?: number) => {
    setEditingReserva(null);
    setHoraSeleccionada(hora ? `${hora.toString().padStart(2, '0')}:00` : null);
    setModalOpen(true);
  };

  const handleEditarReserva = (reserva: any) => {
    setEditingReserva(reserva);
    setHoraSeleccionada(null);
    setModalOpen(true);
  };

  const handleEliminarReserva = async (id: string) => {
    if (!confirm('¿Eliminar esta reserva?')) return;
    await ReservaController.eliminarReserva(id, profile);
    cargarReservas();
  };

  const handleNuevoClienteCreado = (clienteId: string, clienteNombre: string, clienteTelefono: string) => {
    setAccesoModal({ open: true, clienteId, clienteNombre, clienteTelefono });
  };

  const navFecha = (dir: number) => {
    const d = new Date(selectedDate + 'T12:00:00');
    d.setDate(d.getDate() + dir);
    setSelectedDate(d.toISOString().split('T')[0]);
  };

  // Color del bloque según estado y pago
  const getReservaStyle = (reserva: any) => {
    if (reserva.estado === 'cancelada') {
      return {
        background: '#f3f4f6',
        borderLeft: `4px solid #9ca3af`,
      };
    }
    if (reserva.pagado) {
      return {
        background: colors.primaryFaded,
        borderLeft: `4px solid ${colors.primary}`,
      };
    }
    return {
      background: '#FFF3CD',
      borderLeft: `4px solid ${colors.warning}`,
    };
  };

  const esHoySeleccionado = selectedDate === hoy;

  const cajaCerrada = useMemo(() => {
    if (fichasCount === 0) return false;
    return reservas.filter(r => r.estado === 'confirmada').length === 0;
  }, [fichasCount, reservas]);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-6 pt-6 pb-4">
        <div className="flex items-center justify-between mb-1">
          <div>
            <h1 className="text-2xl font-bold" style={{ color: colors.text }}>Agenda</h1>
            {profesionalActual && (
              <p className="text-xs mt-0.5 lowercase" style={{ color: colors.textSecondary }}>
                {profesionalActual.nombre_completo}
              </p>
            )}
          </div>
        </div>

        {/* Navegación de días */}
        <div className="flex items-center gap-2 mt-3">
          <button onClick={() => navFecha(-1)} className="p-1.5 rounded-lg hover:bg-gray-100 transition">
            <ChevronLeft size={20} style={{ color: colors.text }} />
          </button>
          <div className="flex gap-1 flex-1 justify-center">
            {diasSemana.map(d => (
              <button
                key={d.fecha}
                onClick={() => setSelectedDate(d.fecha)}
                className="flex flex-col items-center px-3 py-2 rounded-xl transition-all text-center flex-1 max-w-[64px]"
                style={{
                  background: d.fecha === selectedDate ? colors.primary : 'transparent',
                  color: d.fecha === selectedDate ? '#fff' : colors.text,
                }}
              >
                <span className="text-xs opacity-70">{d.diaSemana}</span>
                <span className={clsx('text-sm font-bold mt-0.5', d.esHoy && d.fecha !== selectedDate && 'underline')}>
                  {d.diaNumero}
                </span>
              </button>
            ))}
          </div>
          <button onClick={() => navFecha(1)} className="p-1.5 rounded-lg hover:bg-gray-100 transition">
            <ChevronRight size={20} style={{ color: colors.text }} />
          </button>
        </div>

        <p className="text-sm mt-2 capitalize" style={{ color: colors.textSecondary }}>{fechaFormateada}</p>
      </div>

      {/* Banner caja cerrada */}
      {!loading && cajaCerrada && (
        <div className="mx-6 mb-3 flex items-center gap-3 px-4 py-3 rounded-xl" style={{ background: '#d1fae5', color: '#065f46' }}>
          <CheckCircle2 size={18} className="shrink-0" />
          <div>
            <p className="text-sm font-semibold">Caja cerrada</p>
            <p className="text-xs opacity-80">Todas las sesiones del día fueron cobradas y archivadas.</p>
          </div>
        </div>
      )}

      {/* Timeline */}
      <div className="flex-1 overflow-auto px-6 pb-6">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: colors.primary }} />
          </div>
        ) : (
          <div className="space-y-1">
            {HORARIOS.map(hora => {
              const reserva = getReservaParaHora(hora);
              const horaLabel = `${hora.toString().padStart(2, '0')}:00`;
              const mostrarLineaHora = esHoySeleccionado && horaActual === hora;

              return (
                <div key={hora} className="flex items-stretch min-h-[56px] relative">
                  <span className="w-16 text-xs pt-2 shrink-0" style={{ color: colors.textMuted }}>{horaLabel}</span>
                  <div className="flex-1 border-l pl-3 relative" style={{ borderColor: colors.borderLight }}>

                    {/* Indicador de hora actual (Gap #8) */}
                    {mostrarLineaHora && (
                      <div className="absolute -left-px top-0 right-0 flex items-center pointer-events-none z-10">
                        <div className="w-2 h-2 rounded-full flex-shrink-0 -ml-1" style={{ background: '#ef4444' }} />
                        <div className="flex-1 h-px" style={{ background: '#ef4444' }} />
                      </div>
                    )}

                    {reserva ? (
                      <div
                        className="rounded-xl px-4 py-3 cursor-pointer hover:opacity-90 transition"
                        style={getReservaStyle(reserva)}
                        onClick={() => handleEditarReserva(reserva)}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-semibold text-sm" style={{ color: reserva.estado === 'cancelada' ? '#6b7280' : colors.text }}>
                              {reserva.consultante_nombre || 'Sin nombre'}
                              {reserva.estado === 'cancelada' && (
                                <span className="ml-2 text-xs font-normal">(cancelada)</span>
                              )}
                            </p>
                            <p className="text-xs mt-0.5" style={{ color: colors.textSecondary }}>
                              {reserva.hora_inicio?.substring(0, 5)} · {reserva.estado}
                              {reserva.servicio_nombre ? ` · ${reserva.servicio_nombre}` : ''}
                            </p>
                          </div>
                          <div className="flex gap-2 flex-wrap justify-end">
                            {/* Ficha */}
                            <button
                              className="flex items-center gap-1 text-xs px-3 py-1 rounded-lg"
                              style={{ background: colors.primaryFaded, color: colors.primary }}
                              onClick={e => { e.stopPropagation(); setFichaModal({ open: true, reserva }); }}
                            >
                              <ClipboardList size={13} />
                              Ficha
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleNuevaReserva(hora)}
                        className="w-full h-12 text-left text-xs rounded-xl px-3 hover:bg-gray-50 transition text-gray-300 hover:text-gray-400"
                      >
                        + Agregar reserva
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modales */}
      {modalOpen && (
        <ModalReserva
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          onSaved={() => { setModalOpen(false); cargarReservas(); }}
          onNuevoClienteCreado={handleNuevoClienteCreado}
          fecha={selectedDate}
          horaInicial={horaSeleccionada}
          reservaEditar={editingReserva}
          profesionales={profesionales}
          profile={profile}
        />
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

      {fichaModal.open && fichaModal.reserva && (
        <ModalFicha
          open={fichaModal.open}
          onClose={() => setFichaModal({ open: false, reserva: null })}
          onSaved={() => { setFichaModal({ open: false, reserva: null }); cargarReservas(); }}
          reserva={fichaModal.reserva}
          profile={profile}
        />
      )}

      {accesoModal.open && (
        <ModalAccesoCliente
          open={accesoModal.open}
          onClose={() => setAccesoModal({ open: false, clienteId: '', clienteNombre: '', clienteTelefono: '' })}
          clienteId={accesoModal.clienteId}
          clienteNombre={accesoModal.clienteNombre}
          clienteTelefono={accesoModal.clienteTelefono}
          empresaId={profile?.empresaId || ''}
        />
      )}

    </div>
  );
}
