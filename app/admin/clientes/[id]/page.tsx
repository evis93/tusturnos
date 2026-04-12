'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/src/context/AuthContext';
import { useTheme } from '@/src/context/ThemeContext';
import { ConsultanteController } from '@/src/controllers/ConsultanteController';
import { ReservaController } from '@/src/controllers/ReservaController';
import { FichaClienteController } from '@/src/controllers/FichaClienteController';
import { ArrowLeft, Pencil, Plus, X, CheckCircle, Clock, XCircle, FileText } from 'lucide-react';

const MESES = ['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic'];

function formatFecha(fechaStr: string) {
  if (!fechaStr) return '';
  const d = new Date(fechaStr + (fechaStr.includes('T') ? '' : 'T12:00:00'));
  return `${d.getDate()} de ${MESES[d.getMonth()]}`;
}

function formatHora(horaStr: string) {
  return horaStr?.slice(0, 5) || '';
}

function Initials({ nombre, colors }: { nombre: string; colors: any }) {
  const initials = (nombre || '?').split(' ').map((w: string) => w[0]).slice(0, 2).join('').toUpperCase();
  return (
    <div style={{ width: 56, height: 56, borderRadius: 28, background: colors.primaryFaded, border: `2px solid ${colors.primaryLight}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      <span style={{ fontSize: 20, fontWeight: 700, color: colors.primary }}>{initials}</span>
    </div>
  );
}

const ESTADO_COLORS: Record<string, { bg: string; text: string }> = {
  confirmada: { bg: '#dcfce7', text: '#15803d' },
  pendiente:  { bg: '#fef9c3', text: '#a16207' },
  cancelada:  { bg: '#fee2e2', text: '#b91c1c' },
  completada: { bg: '#e0f2fe', text: '#0369a1' },
};

function EstadoBadge({ estado }: { estado: string }) {
  const c = ESTADO_COLORS[estado] || { bg: '#f3f4f6', text: '#6b7280' };
  return (
    <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: c.bg, color: c.text }}>{estado}</span>
  );
}

export default function FichaClientePage() {
  const params = useParams();
  const router = useRouter();
  const { profile } = useAuth();
  const { colors } = useTheme();

  const clienteId = params.id as string;

  const [cliente, setCliente] = useState<any>(null);
  const [reservas, setReservas] = useState<any[]>([]);
  const [fichas, setFichas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [modalEdit, setModalEdit] = useState(false);
  const [editNombre, setEditNombre] = useState('');
  const [editTelefono, setEditTelefono] = useState('');
  const [guardando, setGuardando] = useState(false);
  const [errorEdit, setErrorEdit] = useState('');

  const [modalNota, setModalNota] = useState(false);
  const [notaTexto, setNotaTexto] = useState('');
  const [guardandoNota, setGuardandoNota] = useState(false);
  const [errorNota, setErrorNota] = useState('');

  const cargar = useCallback(async () => {
    if (!clienteId) return;
    setLoading(true);
    const [cResult, rResult] = await Promise.all([
      ConsultanteController.obtenerConsultantePorId(clienteId, profile),
      ReservaController.obtenerReservasPorCliente(clienteId, profile),
    ]);
    if (cResult.success) {
      setCliente(cResult.data);
      const fResult = await FichaClienteController.obtenerFichasPorCliente(clienteId, profile);
      if (fResult.success) setFichas(fResult.data || []);
    }
    if (rResult.success) setReservas(rResult.data || []);
    setLoading(false);
  }, [clienteId, profile]);

  useEffect(() => { cargar(); }, [cargar]);

  const hoy = new Date().toISOString().split('T')[0];

  const proximaReserva = useMemo(() =>
    reservas.filter(r => r.fecha >= hoy && r.estado !== 'cancelada').sort((a, b) => a.fecha > b.fecha ? 1 : -1)[0],
    [reservas, hoy]
  );

  const historial = useMemo(() =>
    reservas.filter(r => r.fecha < hoy || r.estado === 'cancelada').slice(0, 20),
    [reservas, hoy]
  );

  const handleGuardar = async () => {
    if (!editNombre.trim()) { setErrorEdit('El nombre es obligatorio'); return; }
    setGuardando(true);
    const result = await ConsultanteController.actualizarConsultante(clienteId, { nombre_completo: editNombre, telefono: editTelefono }, profile);
    setGuardando(false);
    if (result.success) { setModalEdit(false); cargar(); }
    else setErrorEdit(result.error || 'No se pudo guardar');
  };

  const handleGuardarNota = async () => {
    if (!notaTexto.trim()) { setErrorNota('La nota no puede estar vacía'); return; }
    setGuardandoNota(true);
    const result = await FichaClienteController.crearFicha(
      { cliente_id: clienteId, nota: notaTexto, profesional_id: profile?.profesionalId || null },
      profile,
    );
    setGuardandoNota(false);
    if (result.success) {
      setModalNota(false); setNotaTexto('');
      const fResult = await FichaClienteController.obtenerFichasPorCliente(clienteId, profile);
      if (fResult.success) setFichas(fResult.data || []);
    } else setErrorNota(result.error || 'No se pudo guardar');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: colors.primary }} />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => router.back()} className="p-2 rounded-lg hover:bg-gray-100 transition">
          <ArrowLeft size={18} style={{ color: colors.text }} />
        </button>
        <h1 className="text-xl font-bold lowercase" style={{ color: colors.text }}>ficha del cliente</h1>
        <div className="ml-auto">
          <button
            onClick={() => { setEditNombre(cliente?.nombre_completo || ''); setEditTelefono(cliente?.telefono || ''); setErrorEdit(''); setModalEdit(true); }}
            className="p-2 rounded-lg hover:bg-gray-100 transition"
          >
            <Pencil size={18} style={{ color: colors.textSecondary }} />
          </button>
        </div>
      </div>

      {/* Perfil */}
      <div className="bg-white rounded-2xl border p-5 mb-5 flex items-center gap-4" style={{ borderColor: colors.border }}>
        <Initials nombre={cliente?.nombre_completo || ''} colors={colors} />
        <div className="flex-1 min-w-0">
          <p className="font-bold text-lg" style={{ color: colors.text }}>{cliente?.nombre_completo || '—'}</p>
          {cliente?.email && <p className="text-sm" style={{ color: colors.textSecondary }}>{cliente.email}</p>}
          {cliente?.telefono && <p className="text-sm" style={{ color: colors.textSecondary }}>{cliente.telefono}</p>}
          {cliente?.activo === false && (
            <span className="text-xs px-2 py-0.5 rounded mt-1 inline-block" style={{ background: colors.borderLight, color: colors.textMuted }}>inactivo</span>
          )}
        </div>
      </div>

      {/* Próxima sesión */}
      <section className="mb-5">
        <p className="text-xs font-bold lowercase tracking-wide mb-2" style={{ color: colors.textMuted }}>próxima sesión</p>
        {proximaReserva ? (
          <div className="bg-white rounded-xl border p-4" style={{ borderColor: colors.border }}>
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-bold lowercase" style={{ color: colors.primary }}>
                {formatFecha(proximaReserva.fecha)} · {formatHora(proximaReserva.hora_inicio)}
              </p>
              <EstadoBadge estado={proximaReserva.estado} />
            </div>
            <p className="font-bold" style={{ color: colors.text }}>{proximaReserva.servicio || 'sesión'}</p>
            {proximaReserva.profesional_nombre && <p className="text-sm" style={{ color: colors.textSecondary }}>{proximaReserva.profesional_nombre}</p>}
          </div>
        ) : (
          <div className="bg-white rounded-xl border p-6 text-center" style={{ borderColor: colors.border }}>
            <Clock size={28} className="mx-auto mb-2" style={{ color: colors.border }} />
            <p className="text-sm" style={{ color: colors.textMuted }}>sin sesiones próximas</p>
          </div>
        )}
      </section>

      {/* Historial */}
      <section className="mb-5">
        <p className="text-xs font-bold lowercase tracking-wide mb-2" style={{ color: colors.textMuted }}>historial de sesiones</p>
        {historial.length === 0 ? (
          <div className="bg-white rounded-xl border p-6 text-center" style={{ borderColor: colors.border }}>
            <FileText size={28} className="mx-auto mb-2" style={{ color: colors.border }} />
            <p className="text-sm" style={{ color: colors.textMuted }}>sin sesiones anteriores</p>
          </div>
        ) : (
          <div className="space-y-0 pl-2">
            {historial.map((reserva: any, idx: number) => (
              <div key={reserva.id} className="flex gap-4 pb-4">
                <div className="flex flex-col items-center">
                  <div className="w-2.5 h-2.5 rounded-full mt-1 flex-shrink-0" style={{ background: colors.primaryLight }} />
                  {idx < historial.length - 1 && <div className="w-0.5 flex-1 mt-1" style={{ background: colors.borderLight }} />}
                </div>
                <div className="flex-1 pb-1">
                  <p className="text-xs" style={{ color: colors.textMuted }}>
                    {formatFecha(reserva.fecha)}{reserva.hora_inicio ? ` · ${formatHora(reserva.hora_inicio)}` : ''}
                  </p>
                  <p className="font-bold text-sm mt-0.5" style={{ color: colors.text }}>{reserva.servicio || 'sesión'}</p>
                  {reserva.profesional_nombre && <p className="text-xs" style={{ color: colors.textSecondary }}>{reserva.profesional_nombre}</p>}
                  <div className="mt-1.5">
                    <EstadoBadge estado={reserva.estado} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Notas clínicas */}
      <section>
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs font-bold lowercase tracking-wide" style={{ color: colors.textMuted }}>notas clínicas</p>
          <button
            onClick={() => { setNotaTexto(''); setErrorNota(''); setModalNota(true); }}
            className="flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-lg"
            style={{ background: colors.primaryFaded, color: colors.primary }}
          >
            <Plus size={14} /> nueva nota
          </button>
        </div>

        {fichas.length === 0 ? (
          <div className="bg-white rounded-xl border p-6 text-center" style={{ borderColor: colors.border }}>
            <FileText size={28} className="mx-auto mb-2" style={{ color: colors.border }} />
            <p className="text-sm" style={{ color: colors.textMuted }}>sin notas clínicas</p>
          </div>
        ) : (
          <div className="space-y-3">
            {fichas.map((ficha: any) => (
              <div key={ficha.id} className="bg-white rounded-xl border p-4" style={{ borderColor: colors.border }}>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-bold lowercase" style={{ color: colors.primary }}>{formatFecha(ficha.fecha)}</p>
                  {ficha.profesional_nombre && <p className="text-xs" style={{ color: colors.textMuted }}>{ficha.profesional_nombre}</p>}
                </div>
                <p className="text-sm leading-relaxed" style={{ color: colors.text }}>{ficha.nota}</p>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Modal editar datos */}
      {modalEdit && (
        <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold" style={{ color: colors.text }}>editar datos</h2>
              <button onClick={() => setModalEdit(false)}><X size={20} className="text-gray-400" /></button>
            </div>
            <label className="block text-xs font-bold mb-1 lowercase" style={{ color: colors.textSecondary }}>nombre</label>
            <input value={editNombre} onChange={e => setEditNombre(e.target.value)} className="w-full px-3 py-2.5 rounded-xl border text-sm mb-3 focus:outline-none" style={{ borderColor: colors.border }} placeholder="nombre completo" />
            <label className="block text-xs font-bold mb-1 lowercase" style={{ color: colors.textSecondary }}>teléfono</label>
            <input value={editTelefono} onChange={e => setEditTelefono(e.target.value)} className="w-full px-3 py-2.5 rounded-xl border text-sm mb-1 focus:outline-none" style={{ borderColor: colors.border }} placeholder="+54 11..." />
            <p className="text-xs mb-4" style={{ color: colors.textMuted }}>el email no se puede modificar desde aquí</p>
            {errorEdit && <p className="text-xs text-red-500 mb-3">{errorEdit}</p>}
            <div className="flex gap-3">
              <button onClick={() => setModalEdit(false)} className="flex-1 py-2.5 rounded-xl border text-sm font-medium" style={{ borderColor: colors.border, color: colors.text }}>Cancelar</button>
              <button onClick={handleGuardar} disabled={guardando} className="flex-1 py-2.5 rounded-xl text-sm font-medium text-white disabled:opacity-60" style={{ background: colors.primary }}>
                {guardando ? 'Guardando...' : 'Guardar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal nueva nota */}
      {modalNota && (
        <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold" style={{ color: colors.text }}>nueva nota clínica</h2>
              <button onClick={() => setModalNota(false)}><X size={20} className="text-gray-400" /></button>
            </div>
            <label className="block text-xs font-bold mb-1 lowercase" style={{ color: colors.textSecondary }}>nota</label>
            <textarea
              value={notaTexto}
              onChange={e => setNotaTexto(e.target.value)}
              rows={5}
              className="w-full px-3 py-2.5 rounded-xl border text-sm mb-4 focus:outline-none resize-none"
              style={{ borderColor: colors.border }}
              placeholder="escribí la nota clínica aquí..."
            />
            {errorNota && <p className="text-xs text-red-500 mb-3">{errorNota}</p>}
            <div className="flex gap-3">
              <button onClick={() => setModalNota(false)} className="flex-1 py-2.5 rounded-xl border text-sm font-medium" style={{ borderColor: colors.border, color: colors.text }}>Cancelar</button>
              <button onClick={handleGuardarNota} disabled={guardandoNota} className="flex-1 py-2.5 rounded-xl text-sm font-medium text-white disabled:opacity-60" style={{ background: colors.primary }}>
                {guardandoNota ? 'Guardando...' : 'Guardar nota'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
