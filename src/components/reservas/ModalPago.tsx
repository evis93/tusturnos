'use client';

import { useEffect, useState } from 'react';
import { useTheme } from '@/src/context/ThemeContext';
import { useSucursal } from '@/src/context/SucursalContext';
import { ReservaController } from '@/src/controllers/ReservaController';
import { supabase } from '@/src/config/supabase';
import { X } from 'lucide-react';

const METODOS_PAGO = [
  { id: 'efectivo', nombre: 'Efectivo' },
  { id: 'transferencia', nombre: 'Transferencia' },
  { id: 'tarjeta_debito', nombre: 'Tarjeta de Débito' },
  { id: 'tarjeta_credito', nombre: 'Tarjeta de Crédito' },
  { id: 'mercadopago', nombre: 'Mercado Pago' },
  { id: 'obra_social', nombre: 'Obra Social' },
  { id: 'otro', nombre: 'Otro' },
];

interface Props {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  reserva: any;
  profile: any;
}

export default function ModalPago({ open, onClose, onSaved, reserva, profile }: Props) {
  const { colors } = useTheme();
  const { sucursalActiva } = useSucursal();
  const [monto, setMonto] = useState('');
  const [metodoPago, setMetodoPago] = useState<string | null>(null);
  const [pagado, setPagado] = useState(false);
  const [precioServicio, setPrecioServicio] = useState<any>(null);
  const [montoSena, setMontoSena] = useState('');
  const [senaPagada, setSenaPagada] = useState(false);
  const [nota, setNota] = useState('');
  const [guardando, setGuardando] = useState(false);
  const [errorMetodo, setErrorMetodo] = useState(false);
  const [errorGuardar, setErrorGuardar] = useState<string | null>(null);

  useEffect(() => {
    if (!open || !reserva) return;

    setMetodoPago(reserva.metodo_pago || null);
    setPagado(reserva.pagado || false);
    setMontoSena(reserva.monto_seña != null ? reserva.monto_seña.toString() : '');
    setSenaPagada(reserva.seña_pagada || false);
    setNota('');
    setErrorMetodo(false);
    setErrorGuardar(null);
    setPrecioServicio(null);

    // Monto inicial desde precio_total guardado o vacío hasta que llegue el servicio
    setMonto(reserva.precio_total ? reserva.precio_total.toString() : '');

    if (reserva.servicio_id) {
      supabase
        .from('servicios')
        .select('nombre, precio, sena_tipo, sena_valor')
        .eq('id', reserva.servicio_id)
        .single()
        .then(({ data }) => {
          if (!data) return;
          setPrecioServicio(data);

          // Usar precio_total de la reserva si existe (puede incluir descuentos aplicados al crear)
          const base = reserva.precio_total
            ? parseFloat(reserva.precio_total)
            : (data.precio ? parseFloat(data.precio) : null);
          if (base == null) return;

          const montoSenaNum = reserva.monto_seña ? parseFloat(reserva.monto_seña) : 0;
          const sugerido = (reserva.seña_pagada && montoSenaNum > 0)
            ? Math.max(0, base - montoSenaNum)
            : base;

          setMonto(sugerido.toString());
        });
    }
  }, [open, reserva]);

  const senaSugerida = precioServicio?.sena_valor
    ? precioServicio.sena_tipo === 'porcentaje'
      ? ((parseFloat(monto || '0') * precioServicio.sena_valor) / 100).toFixed(2)
      : parseFloat(precioServicio.sena_valor).toFixed(2)
    : null;

  const handleGuardar = async () => {
    if (!metodoPago) {
      setErrorMetodo(true);
      return;
    }
    setErrorMetodo(false);
    setErrorGuardar(null);
    setGuardando(true);
    const result = await ReservaController.registrarPago(
      reserva.id,
      {
        precio_total: monto ? parseFloat(monto) : null,
        metodo_pago: metodoPago,
        pagado,
        monto_seña: montoSena !== '' ? montoSena : null,
        seña_pagada: senaPagada,
        nota: nota.trim() || null,
        sucursal_id: reserva.sucursal_id || sucursalActiva?.id || null,
      },
      profile
    );
    setGuardando(false);
    if (result.success) {
      onSaved();
    } else {
      setErrorGuardar(result.error || 'Error al guardar. Intentá de nuevo.');
    }
  };

  if (!open) return null;

  const nombreCliente = reserva.consultante?.nombre || reserva.consultante_nombre || 'Sin nombre';

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-sm p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold" style={{ color: colors.text }}>Registrar Pago</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 transition">
            <X size={18} style={{ color: colors.textSecondary }} />
          </button>
        </div>

        <div className="space-y-4">
          {/* Info del consultante */}
          <div className="bg-gray-50 rounded-xl p-3">
            <p className="font-medium text-sm" style={{ color: colors.text }}>
              {nombreCliente}
            </p>
            <p className="text-xs mt-0.5" style={{ color: colors.textSecondary }}>
              {reserva.fecha} · {reserva.hora_inicio?.substring(0, 5)}
            </p>
            {precioServicio && (
              <p className="text-xs mt-1" style={{ color: colors.primary }}>
                {precioServicio.nombre} · Precio: ${precioServicio.precio}
              </p>
            )}
          </div>

          {/* Seña */}
          <div className="rounded-xl border p-3 space-y-3" style={{ borderColor: colors.border }}>
            <p className="text-sm font-semibold" style={{ color: colors.text }}>Seña</p>
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: colors.textSecondary }}>
                Monto de seña
                {senaSugerida && (
                  <span className="ml-2 font-normal" style={{ color: colors.primary }}>
                    (sugerido: ${senaSugerida}{precioServicio?.sena_tipo === 'porcentaje' ? ` · ${precioServicio.sena_valor}%` : ''})
                  </span>
                )}
              </label>
              <input
                type="number"
                value={montoSena}
                onChange={e => setMontoSena(e.target.value)}
                placeholder="0"
                className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                style={{ borderColor: colors.border }}
              />
            </div>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={senaPagada}
                onChange={e => setSenaPagada(e.target.checked)}
                className="w-4 h-4 rounded"
              />
              <span className="text-sm font-medium" style={{ color: colors.text }}>Seña pagada</span>
            </label>
          </div>

          {/* Monto */}
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: colors.text }}>Monto a cobrar</label>
            <input
              type="number"
              value={monto}
              onChange={e => setMonto(e.target.value)}
              placeholder="0"
              className="w-full px-3 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              style={{ borderColor: colors.border }}
            />
          </div>

          {/* Método de pago */}
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: errorMetodo ? '#ef4444' : colors.text }}>
              Método de pago{' '}
              {errorMetodo && <span className="text-xs font-normal">— requerido</span>}
            </label>
            <div className="grid grid-cols-2 gap-2">
              {METODOS_PAGO.map(m => (
                <button
                  key={m.id}
                  onClick={() => { setMetodoPago(m.id); setErrorMetodo(false); }}
                  className="py-2 px-3 rounded-lg text-xs font-medium transition text-left"
                  style={{
                    background: metodoPago === m.id ? colors.primary : colors.primaryFaded,
                    color: metodoPago === m.id ? '#fff' : colors.primary,
                    outline: errorMetodo && !metodoPago ? '2px solid #ef4444' : 'none',
                  }}
                >
                  {m.nombre}
                </button>
              ))}
            </div>
          </div>

          {/* Pagado toggle */}
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={pagado}
              onChange={e => setPagado(e.target.checked)}
              className="w-4 h-4 rounded"
            />
            <span className="text-sm font-medium" style={{ color: colors.text }}>Marcar como pagado</span>
          </label>

          {/* Notas */}
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: colors.text }}>Notas</label>
            <textarea
              value={nota}
              onChange={e => setNota(e.target.value)}
              placeholder="Notas sobre la sesión..."
              rows={3}
              className="w-full px-3 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              style={{ borderColor: colors.border }}
            />
          </div>
        </div>

        {errorGuardar && (
          <p className="mt-4 text-xs text-red-600 bg-red-50 rounded-lg px-3 py-2">
            {errorGuardar}
          </p>
        )}

        <div className="flex gap-3 mt-4">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-lg border text-sm font-medium"
            style={{ borderColor: colors.border, color: colors.text }}
          >
            Cancelar
          </button>
          <button
            onClick={handleGuardar}
            disabled={guardando}
            className="flex-1 py-2.5 rounded-lg text-sm font-medium text-white disabled:opacity-60"
            style={{ background: colors.primary }}
          >
            {guardando ? 'Guardando...' : 'Guardar'}
          </button>
        </div>
      </div>
    </div>
  );
}
