'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/src/context/AuthContext';
import { useTheme } from '@/src/context/ThemeContext';
import { ReservaController } from '@/src/controllers/ReservaController';
import ModalPago from '@/src/components/reservas/ModalPago';
import { ChevronLeft, ChevronRight, Banknote, RefreshCw, CreditCard, Wallet, MoreHorizontal, User, CheckCircle, Lock, LockOpen } from 'lucide-react';

const MESES = ['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic'];
const DIAS = ['dom','lun','mar','mié','jue','vie','sáb'];

const METODOS_PAGO_CONFIG: Record<string, { icon: React.ReactNode; label: string; colorKey: string }> = {
  efectivo:       { icon: <Banknote size={18} />,     label: 'Efectivo',      colorKey: 'warning' },
  transferencia:  { icon: <RefreshCw size={18} />,    label: 'Transferencia', colorKey: 'secondary' },
  tarjeta_debito: { icon: <CreditCard size={18} />,   label: 'Débito',        colorKey: 'accent' },
  tarjeta_credito:{ icon: <CreditCard size={18} />,   label: 'Crédito',       colorKey: 'primary' },
  mercadopago:    { icon: <Wallet size={18} />,        label: 'MP',            colorKey: 'primary' },
  modo:           { icon: <Wallet size={18} />,        label: 'Modo',          colorKey: 'secondary' },
  obra_social:    { icon: <Banknote size={18} />,     label: 'Obra Social',   colorKey: 'accent' },
  otro:           { icon: <MoreHorizontal size={18} />,label: 'Otro',          colorKey: 'textMuted' },
};

function formatFechaISO(date: Date) {
  return date.toISOString().split('T')[0];
}

function formatFechaLarga(date: Date) {
  return `${DIAS[date.getDay()]} ${date.getDate()} de ${MESES[date.getMonth()]} ${date.getFullYear()}`;
}

function formatMonto(monto: number) {
  return (monto || 0).toLocaleString('es-AR', { minimumFractionDigits: 2 });
}

export default function ReportesPage() {
  const { profile } = useAuth();
  const { colors } = useTheme();

  const [fecha, setFecha] = useState(() => {
    const d = new Date();
    d.setHours(12, 0, 0, 0);
    return d;
  });
  const [loading, setLoading] = useState(true);
  const [reservaParaPagar, setReservaParaPagar] = useState<any>(null);
  const [resumen, setResumen] = useState({
    totalRecaudado: 0,
    desglosePagos: {} as Record<string, number>,
    transaccionesPendientes: [] as any[],
    cantidadPagadas: 0,
    cantidadPendientes: 0,
  });

  const cargarResumen = useCallback(async () => {
    setLoading(true);
    const result = await ReservaController.obtenerResumenCajaDiario(formatFechaISO(fecha), profile);
    if (result.success) setResumen((result as any).data);
    setLoading(false);
  }, [fecha, profile]);

  useEffect(() => { cargarResumen(); }, [cargarResumen]);

  const cambiarDia = (dir: number) => {
    setFecha(prev => {
      const d = new Date(prev);
      d.setDate(d.getDate() + dir);
      return d;
    });
  };

  const esHoy = formatFechaISO(fecha) === formatFechaISO(new Date());

  const desglosePagosArray = useMemo(() =>
    Object.entries(resumen.desglosePagos).map(([metodo, monto]) => {
      const config = METODOS_PAGO_CONFIG[metodo] || METODOS_PAGO_CONFIG.otro;
      return { metodo, label: config.label, monto, icon: config.icon, colorKey: config.colorKey };
    }),
    [resumen.desglosePagos]
  );

  const cajaCerrada = resumen.cantidadPendientes === 0;

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6" style={{ color: colors.text }}>Resumen de Caja</h1>

      {/* Selector de día */}
      <div className="flex items-center justify-between mb-6 bg-white rounded-xl border p-4" style={{ borderColor: colors.border }}>
        <button onClick={() => cambiarDia(-1)} className="p-2 rounded-lg hover:bg-gray-100 transition">
          <ChevronLeft size={20} style={{ color: colors.text }} />
        </button>
        <div className="text-center">
          <p className="font-semibold text-base" style={{ color: colors.text }}>{formatFechaLarga(fecha)}</p>
          {esHoy && <p className="text-xs mt-0.5 font-medium" style={{ color: colors.primary }}>hoy</p>}
        </div>
        <button onClick={() => cambiarDia(1)} className="p-2 rounded-lg hover:bg-gray-100 transition" disabled={esHoy} style={{ opacity: esHoy ? 0.3 : 1 }}>
          <ChevronRight size={20} style={{ color: colors.text }} />
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: colors.primary }} />
        </div>
      ) : (
        <div className="space-y-5">
          {/* Hero card */}
          <div className="bg-white rounded-2xl border p-6 shadow-sm" style={{ borderColor: colors.border }}>
            <div className="flex items-start justify-between mb-2">
              <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: colors.textMuted }}>Total Recaudado</p>
              <div className="p-2 rounded-lg" style={{ background: colors.primaryFaded }}>
                <Banknote size={20} style={{ color: colors.primary }} />
              </div>
            </div>
            <p className="text-4xl font-extrabold mt-1" style={{ color: colors.text }}>${formatMonto(resumen.totalRecaudado)}</p>
            <div className="flex items-center gap-1.5 mt-3">
              <CheckCircle size={14} style={{ color: colors.success || '#16a34a' }} />
              <span className="text-xs font-medium" style={{ color: colors.success || '#16a34a' }}>
                {resumen.cantidadPagadas} {resumen.cantidadPagadas === 1 ? 'reserva pagada' : 'reservas pagadas'}
              </span>
            </div>
          </div>

          {/* Desglose por método de pago */}
          <section>
            <div className="flex items-center justify-between mb-3">
              <p className="font-bold text-base" style={{ color: colors.text }}>Desglose por Pago</p>
              {desglosePagosArray.length > 0 && (
                <span className="text-xs font-bold px-2 py-1 rounded" style={{ background: colors.primaryFaded, color: colors.primary }}>
                  {desglosePagosArray.length} {desglosePagosArray.length === 1 ? 'MÉTODO' : 'MÉTODOS'}
                </span>
              )}
            </div>
            {desglosePagosArray.length === 0 ? (
              <div className="bg-white rounded-xl border p-6 text-center" style={{ borderColor: colors.border }}>
                <p className="text-sm" style={{ color: colors.textMuted }}>No hay pagos registrados</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {desglosePagosArray.map((pago) => {
                  const iconColor = (colors as any)[pago.colorKey] || colors.textMuted;
                  return (
                    <div key={pago.metodo} className="bg-white rounded-xl border p-4" style={{ borderColor: colors.border }}>
                      <div className="flex items-center justify-between mb-3">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: iconColor + '20', color: iconColor }}>
                          {pago.icon}
                        </div>
                        <span className="text-xs font-bold uppercase" style={{ color: colors.textMuted }}>{pago.label}</span>
                      </div>
                      <p className="text-lg font-bold" style={{ color: colors.text }}>${formatMonto(pago.monto)}</p>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          {/* Pendientes de pago */}
          <section>
            <div className="flex items-center justify-between mb-3">
              <p className="font-bold text-base" style={{ color: colors.text }}>Pendientes de Pago</p>
              <span className="text-xs font-bold px-2 py-1 rounded" style={{ background: resumen.cantidadPendientes > 0 ? '#fef9c3' : colors.primaryFaded, color: resumen.cantidadPendientes > 0 ? '#a16207' : colors.primary }}>
                {resumen.cantidadPendientes} PENDIENTES
              </span>
            </div>
            {resumen.transaccionesPendientes.length === 0 ? (
              <div className="bg-white rounded-xl border p-6 text-center" style={{ borderColor: colors.border }}>
                <p className="text-sm" style={{ color: colors.textMuted }}>No hay pagos pendientes</p>
              </div>
            ) : (
              <div className="space-y-2">
                {resumen.transaccionesPendientes.map((reserva: any) => (
                  <div key={reserva.id} className="bg-white rounded-xl border p-4 flex items-center gap-3" style={{ borderColor: colors.border }}>
                    <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: colors.borderLight || '#f3f4f6' }}>
                      <User size={20} style={{ color: colors.textMuted }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-sm truncate" style={{ color: colors.text }}>
                        {reserva.consultante_nombre || 'Sin nombre'}
                      </p>
                      <p className="text-xs" style={{ color: (colors as any).warning || '#d97706' }}>
                        {reserva.seña_pagada ? 'Seña pagada' : 'Pendiente de pago'}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                      <p className="font-bold text-sm" style={{ color: colors.text }}>
                        ${formatMonto(reserva.precio_total)}
                      </p>
                      {reserva.hora_inicio && (
                        <p className="text-xs" style={{ color: colors.textMuted }}>{reserva.hora_inicio.substring(0, 5)}</p>
                      )}
                      <button
                        onClick={() => setReservaParaPagar(reserva)}
                        className="text-xs font-bold px-3 py-1 rounded-lg text-white"
                        style={{ background: colors.primary }}
                      >
                        cobrar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Estado de caja */}
          <div
            className="rounded-xl p-4 flex items-center gap-3"
            style={{ background: cajaCerrada ? '#dcfce7' : '#fef9c3', border: `1px solid ${cajaCerrada ? '#86efac' : '#fde047'}` }}
          >
            {cajaCerrada
              ? <Lock size={18} style={{ color: '#15803d' }} />
              : <LockOpen size={18} style={{ color: '#a16207' }} />
            }
            <p className="text-sm font-semibold" style={{ color: cajaCerrada ? '#15803d' : '#a16207' }}>
              {cajaCerrada
                ? 'Caja cerrada — todas las reservas cobradas'
                : `${resumen.cantidadPendientes} reserva${resumen.cantidadPendientes > 1 ? 's' : ''} pendiente${resumen.cantidadPendientes > 1 ? 's' : ''} de cobro`
              }
            </p>
          </div>
        </div>
      )}

      <ModalPago
        open={!!reservaParaPagar}
        reserva={reservaParaPagar}
        onClose={() => setReservaParaPagar(null)}
        onSaved={() => { setReservaParaPagar(null); cargarResumen(); }}
        profile={profile}
      />
    </div>
  );
}
