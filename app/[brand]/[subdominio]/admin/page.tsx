'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useTheme } from '@/src/context/ThemeContext';
import { useAuth } from '@/src/context/AuthContext';
import { supabase } from '@/src/config/supabase';
import { TrendingUp, ChevronRight, Clock, Users, UserRound, Sparkles, LoaderCircle, QrCode } from 'lucide-react';

const METODOS_LABEL: Record<string, string> = {
  efectivo:        'Efectivo',
  transferencia:   'Transferencia',
  tarjeta_debito:  'Tarjeta de Débito',
  tarjeta_credito: 'Tarjeta de Crédito',
  mercadopago:     'Mercado Pago',
  obra_social:     'Obra Social',
  otro:            'Otro',
};

export default function AdminPage() {
  const params = useParams();
  const brand = params.brand as string;
  const subdominio = params.subdominio as string;
  const { colors } = useTheme();
  const primaryColor = profile?.colorPrimario || primaryColor;
  const { profile, loading } = useAuth();

  const hoy = new Date().toISOString().split('T')[0];
  const [desglose, setDesglose]   = useState<{ metodo: string; total: number }[]>([]);
  const [totalDia, setTotalDia]   = useState(0);
  const [totalMes, setTotalMes]   = useState(0);
  const [cargando, setCargando]   = useState(false);

  const empresaId = profile?.empresaId;

  useEffect(() => {
    if (!empresaId) return;
    setCargando(true);

    const [año, mes] = hoy.split('-');
    const inicio = `${año}-${mes}-01`;
    const ultimoDia = new Date(parseInt(año), parseInt(mes), 0).getDate();
    const fin = `${año}-${mes}-${ultimoDia.toString().padStart(2, '0')}`;

    Promise.all([
      // Pagos de hoy
      supabase
        .from('pagos_reservas')
        .select('monto, metodo_pago')
        .gte('created_at', `${hoy}T00:00:00`)
        .lte('created_at', `${hoy}T23:59:59`),

      // Pagos del mes
      supabase
        .from('pagos_reservas')
        .select('monto')
        .gte('created_at', `${inicio}T00:00:00`)
        .lte('created_at', `${fin}T23:59:59`),
    ]).then(([{ data: hoyData }, { data: mesData }]) => {
      // Desglose diario
      const mapa: Record<string, number> = {};
      for (const r of hoyData || []) {
        if (!r.monto) continue;
        const metodo = r.metodo_pago || 'otro';
        mapa[metodo] = (mapa[metodo] || 0) + parseFloat(r.monto);
      }
      const filas = Object.entries(mapa)
        .map(([metodo, total]) => ({ metodo, total }))
        .sort((a, b) => b.total - a.total);
      setDesglose(filas);
      setTotalDia(filas.reduce((s, f) => s + f.total, 0));

      // Total mes
      const mes_ = (mesData || [])
        .filter(r => r.monto)
        .reduce((s, r) => s + parseFloat(r.monto), 0);
      setTotalMes(mes_);

      setCargando(false);
    });
  }, [empresaId]);

  const fechaDisplay = new Date(hoy + 'T12:00:00').toLocaleDateString('es-AR', {
    weekday: 'long', day: 'numeric', month: 'long',
  });

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6" style={{ color: colors.text }}>
        Administración
        {loading && <LoaderCircle size={16} className="animate-spin inline ml-2" />}
      </h1>

      {/* Accesos rápidos */}
      <div className="bg-white rounded-xl p-5 shadow-sm border mb-6" style={{ borderColor: colors.border }}>
        <h2 className="text-base font-semibold mb-4" style={{ color: colors.text }}>Configuración rápida</h2>
        <div className="space-y-1">
          {[
            { href: `/${brand}/${subdominio}/admin/horarios-empresa`, icon: <Clock size={18} />,     label: 'Horarios de Atención de la Empresa' },
            { href: `/${brand}/${subdominio}/admin/horarios`,      icon: <Clock size={18} />,     label: 'Horarios de Atención del Profesional' },
            { href: `/${brand}/${subdominio}/admin/profesionales`, icon: <Users size={18} />,     label: 'Profesionales' },
            { href: `/${brand}/${subdominio}/admin/servicios`,     icon: <Sparkles size={18} />,  label: 'Servicios' },
            { href: `/${brand}/${subdominio}/admin/clientes`,      icon: <UserRound size={18} />, label: 'Clientes' },
            { href: `/${brand}/${subdominio}/admin/qr`,            icon: <QrCode size={18} />,    label: 'Código QR' },
          ].map(item => (
            <a
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-gray-50 transition group"
            >
              <span style={{ color: primaryColor }}>{item.icon}</span>
              <span className="flex-1 text-sm font-medium" style={{ color: colors.text }}>{item.label}</span>
              <ChevronRight size={16} className="text-gray-400 group-hover:text-gray-600 transition" />
            </a>
          ))}
        </div>
      </div>

      {/* Totales rápidos */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-white rounded-xl p-5 shadow-sm border" style={{ borderColor: colors.border }}>
          <p className="text-sm font-medium mb-1" style={{ color: colors.textSecondary }}>Total hoy</p>
          <p className="text-3xl font-bold" style={{ color: primaryColor }}>
            ${totalDia.toFixed(2)}
          </p>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border" style={{ borderColor: colors.border }}>
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp size={16} style={{ color: primaryColor }} />
            <p className="text-sm font-medium" style={{ color: colors.textSecondary }}>Total del mes</p>
          </div>
          <p className="text-3xl font-bold" style={{ color: primaryColor }}>
            ${totalMes.toFixed(2)}
          </p>
        </div>
      </div>

      {/* Desglose diario por tipo de pago */}
      <div className="bg-white rounded-xl p-5 shadow-sm border" style={{ borderColor: colors.border }}>
        <p className="text-sm font-semibold mb-4 capitalize" style={{ color: colors.text }}>
          Desglose de hoy · <span className="font-normal" style={{ color: colors.textSecondary }}>{fechaDisplay}</span>
        </p>

        {cargando ? (
          <div className="flex justify-center py-6">
            <LoaderCircle size={20} className="animate-spin" style={{ color: primaryColor }} />
          </div>
        ) : desglose.length === 0 ? (
          <p className="text-sm italic text-center py-4" style={{ color: colors.textSecondary }}>
            Sin pagos registrados hoy
          </p>
        ) : (
          <div className="space-y-2">
            {desglose.map(({ metodo, total }) => (
              <div
                key={metodo}
                className="flex items-center justify-between px-4 py-3 rounded-xl"
                style={{ background: primaryColorFaded }}
              >
                <span className="text-sm font-medium" style={{ color: colors.text }}>
                  {METODOS_LABEL[metodo] ?? metodo}
                </span>
                <span className="text-sm font-bold" style={{ color: primaryColor }}>
                  ${total.toFixed(2)}
                </span>
              </div>
            ))}
            <div
              className="flex items-center justify-between px-4 py-3 rounded-xl mt-1"
              style={{ background: primaryColor }}
            >
              <span className="text-sm font-bold text-white">Total</span>
              <span className="text-sm font-bold text-white">${totalDia.toFixed(2)}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
