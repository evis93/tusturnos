'use client';

import { useEffect, useState } from 'react';
import { useTheme } from '@/src/context/ThemeContext';
import { supabase } from '@/src/config/supabase';
import { X, Lock, CheckCircle } from 'lucide-react';

interface Props {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  reserva: any;   // from v_reservas_detalle: hora_inicio, profesional_usuario_id, empresa_id, cliente_usuario_id, etc.
  profile: any;
}

export default function ModalFicha({ open, onClose, onSaved, reserva, profile }: Props) {
  const { colors } = useTheme();

  const [notas, setNotas]             = useState('');
  const [notaReserva, setNotaReserva] = useState('');
  const [fichaId, setFichaId]         = useState<string | null>(null);
  const [historial, setHistorial]     = useState<any[]>([]);
  const [verTodo, setVerTodo]         = useState(false);
  const [guardando, setGuardando]     = useState(false);
  const [guardandoNota, setGuardandoNota] = useState(false);
  const [cargando, setCargando]       = useState(false);
  const [error, setError]             = useState<string | null>(null);

  // Soporta tanto ReservaModel (fecha + hora_inicio) como v_reservas_detalle (hora_inicio)
  const fechaLocal = reserva?.fecha || null;
  const horaLocal  = reserva?.hora_inicio?.substring(0, 5) || null;

  useEffect(() => {
    if (!open || !reserva || !fechaLocal || !horaLocal) return;
    (async () => {

    setCargando(true);
    setError(null);
    setNotas('');
    setNotaReserva('');
    setFichaId(null);
    setHistorial([]);
    setVerTodo(false);

    const profesionalId = reserva.profesional_id || reserva.profesional_usuario_id;
    const empresaId     = reserva.empresa_id;

    // Traer nota de la reserva directo de la BD (ReservaModel no la mapea)
    const [{ data: reservaDB }, fichaResult] = await Promise.all([
      supabase.from('reservas').select('nota').eq('id', reserva.id).single(),
      supabase
        .from('fichas')
        .select('id, nota, usuario_empresa_id')
        .eq('profesional_id', profesionalId)
        .eq('empresa_id', empresaId)
        .eq('fecha', fechaLocal)
        .eq('hora', horaLocal)
        .maybeSingle(),
    ]);

    setNotaReserva(reservaDB?.nota || '');

    const ficha = fichaResult.data;
    if (ficha) {
      setFichaId(ficha.id);
      setNotas(ficha.nota || '');

      if (ficha.usuario_empresa_id) {
        const { data: hist } = await supabase
          .from('fichas')
          .select('id, fecha, hora, servicio_nombre, nota, usuarios!profesional_id(nombre_completo)')
          .eq('usuario_empresa_id', ficha.usuario_empresa_id)
          .eq('empresa_id', empresaId)
          .neq('id', ficha.id)
          .order('fecha', { ascending: false })
          .order('hora', { ascending: false })
          .limit(50);

        setHistorial(hist || []);
      }
    }

    setCargando(false);
    })();
  }, [open, reserva]);

  const handleGuardarNota = async () => {
    if (!reserva?.id) return;
    setGuardandoNota(true);
    setError(null);
    const { error: err } = await supabase
      .from('reservas')
      .update({ nota: notaReserva })
      .eq('id', reserva.id);
    setGuardandoNota(false);
    if (err) { setError(err.message); return; }
    onSaved();
  };

  const handleGuardar = async () => {
    if (!fichaId) { setError('No hay ficha para guardar. La ficha se crea automáticamente al confirmar la reserva.'); return; }
    setGuardando(true);
    setError(null);

    const { error: err } = await supabase
      .from('fichas')
      .update({ nota: notas })
      .eq('id', fichaId);

    setGuardando(false);
    if (err) { setError(err.message); return; }
    onSaved();
  };

  if (!open) return null;

  const horaDisplay = horaLocal || '';

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md flex flex-col overflow-hidden" style={{ maxHeight: '90vh' }}>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: colors.borderLight }}>
          <button onClick={onClose} className="p-1.5 rounded-full hover:bg-gray-100 transition">
            <X size={18} style={{ color: colors.textSecondary }} />
          </button>
          <div className="flex-1 text-center">
            <h2 className="text-base font-bold lowercase" style={{ color: colors.text }}>
              Reserva de  {reserva?.consultante_nombre || reserva?.cliente_nombre || 'sin nombre'}
            </h2>
            <p className="text-xs lowercase" style={{ color: colors.textSecondary }}>
              {fechaLocal} · {horaDisplay}
            </p>
          </div>
          <div className="w-8" />
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6 space-y-5">

          {/* Resumen */}
          {reserva?.servicio_nombre && (
            <div className="rounded-xl px-4 py-3" style={{ background: colors.primaryFaded }}>
              <p className="text-xs lowercase" style={{ color: colors.textSecondary }}>
                {reserva.servicio_nombre}
              </p>
            </div>
          )}

          {cargando ? (
            <div className="flex justify-center py-6">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2" style={{ borderColor: colors.primary }} />
            </div>
          ) : !fichaId ? (
            <section className="space-y-1.5">
              <h3 className="text-xs font-semibold lowercase tracking-wide" style={{ color: colors.primary }}>
                nota de la reserva
              </h3>
              <div className="relative">
                <textarea
                  value={notaReserva}
                  onChange={e => setNotaReserva(e.target.value)}
                  placeholder="anotá algo sobre esta reserva..."
                  rows={3}
                  className="w-full rounded-xl p-4 text-sm resize-none focus:outline-none"
                  style={{
                    background: colors.primaryFaded,
                    border: `1px solid ${colors.borderLight}`,
                    color: colors.text,
                  }}
                />
                <div className="absolute bottom-3 right-3 pointer-events-none">
                  <Lock size={14} style={{ color: colors.borderLight }} />
                </div>
              </div>
            </section>
          ) : (
            <>
              {/* Nota de esta visita */}
              <section className="space-y-1.5">
                <h3 className="text-xs font-semibold lowercase tracking-wide" style={{ color: colors.primary }}>
                  nota de esta visita
                </h3>
                <div className="relative">
                  <textarea
                    value={notas}
                    onChange={e => setNotas(e.target.value)}
                    placeholder="observaciones clínicas o notas privadas..."
                    rows={3}
                    className="w-full rounded-xl p-4 text-sm resize-none focus:outline-none"
                    style={{
                      background: colors.primaryFaded,
                      border: `1px solid ${colors.borderLight}`,
                      color: colors.text,
                    }}
                  />
                  <div className="absolute bottom-3 right-3 pointer-events-none">
                    <Lock size={14} style={{ color: colors.borderLight }} />
                  </div>
                </div>
              </section>

              {/* Historial */}
              <section className="space-y-2">
                <h3 className="text-xs font-semibold lowercase tracking-wide" style={{ color: colors.primary }}>
                  fichas anteriores
                </h3>
                {historial.length === 0 ? (
                  <p className="text-xs italic px-1" style={{ color: colors.textSecondary }}>
                    no hay fichas anteriores del cliente
                  </p>
                ) : (
                  <>
                    <div className="rounded-xl overflow-hidden border" style={{ borderColor: colors.borderLight }}>
                      <table className="w-full text-xs">
                        <thead>
                          <tr style={{ background: colors.primaryFaded }}>
                            <th className="text-left px-3 py-2 font-semibold lowercase" style={{ color: colors.textSecondary }}>fecha</th>
                            <th className="text-left px-3 py-2 font-semibold lowercase" style={{ color: colors.textSecondary }}>nota</th>
                            <th className="text-left px-3 py-2 font-semibold lowercase whitespace-nowrap" style={{ color: colors.textSecondary }}>profesional</th>
                          </tr>
                        </thead>
                        <tbody>
                          {(verTodo ? historial : historial.slice(0, 3)).map((h, i) => (
                            <tr key={h.id} style={{ background: i % 2 === 0 ? '#fff' : colors.primaryFaded }}>
                              <td className="px-3 py-2 whitespace-nowrap align-top" style={{ color: colors.text }}>{h.fecha}</td>
                              <td className="px-3 py-2 italic align-top" style={{ color: colors.textSecondary }}>{h.nota || '—'}</td>
                              <td className="px-3 py-2 whitespace-nowrap align-top lowercase" style={{ color: colors.text }}>
                                {(h.usuarios as any)?.nombre_completo || '—'}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    {historial.length > 3 && (
                      <button
                        onClick={() => setVerTodo(v => !v)}
                        className="w-full text-xs py-2 rounded-lg mt-1"
                        style={{ color: colors.primary, background: colors.primaryFaded }}
                      >
                        {verTodo ? 'ver menos' : `ver más (${historial.length - 3} más)`}
                      </button>
                    )}
                  </>
                )}
              </section>

            </>
          )}

          {error && <p className="text-xs text-red-500 text-center">{error}</p>}
        </div>

        {/* Footer */}
        {(fichaId || !cargando) && (
          <div className="px-6 py-4 border-t" style={{ borderColor: colors.borderLight, background: colors.primaryFaded }}>
            <button
              onClick={fichaId ? handleGuardar : handleGuardarNota}
              disabled={fichaId ? guardando : guardandoNota}
              className="w-full py-3.5 rounded-xl text-sm font-bold text-white flex items-center justify-center gap-2 transition disabled:opacity-60"
              style={{ background: colors.primary }}
            >
              <CheckCircle size={18} />
              {(fichaId ? guardando : guardandoNota) ? 'guardando...' : 'guardar nota'}
            </button>
            <p className="text-center text-[10px] mt-3 italic" style={{ color: colors.textMuted }}>
              esta información es confidencial y solo para uso profesional
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
