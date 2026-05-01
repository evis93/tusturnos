'use client';

import { useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { useTheme } from '@/src/context/ThemeContext';
import { useAuth } from '@/src/context/AuthContext';

export default function ProfesionalPage() {
  const router = useRouter();
  const params = useParams();
  const brand = params.brand as string;
  const subdominio = params.subdominio as string;
  const { colors } = useTheme();
  const { logout, profile } = useAuth();
  const primaryColor = profile?.colorPrimario || colors.primary;
  const backgroundColor = profile?.colorBackground || colors.background;

  const handleLogout = useCallback(async () => {
    if (!window.confirm('¿Estás seguro que deseas cerrar sesión?')) return;
    await logout();
    router.replace(`/${brand}/${subdominio}/auth/login`);
  }, [logout, router, brand, subdominio]);

  return (
    <div className="flex flex-col" style={{ backgroundColor }}>
      <div className="px-4 pt-4 pb-1">
        <p className="text-xs font-bold uppercase tracking-widest" style={{ color: colors.textMuted }}>reporte de caja</p>
      </div>

      <div className="flex-1 px-4 py-5 space-y-5">
        {/* Selector periodo */}
        <div>
          <div className="flex justify-between items-center mb-3 px-1">
            <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Periodo</p>
            <button className="flex items-center gap-1 text-xs font-bold" style={{ color: primaryColor }}>
              Cambiar ⇕
            </button>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-hide">
            <div className="flex-shrink-0 min-w-[100px] py-4 px-5 rounded-2xl flex flex-col items-center shadow-md"
              style={{ background: `linear-gradient(135deg, ${primaryColor}, ${colors.accent || '#64d2ff'})` }}>
              <span className="text-xs font-bold uppercase tracking-widest text-white/70">Ene</span>
              <span className="text-xl font-bold text-white">2025</span>
            </div>
            {['Dic 2024', 'Nov 2024'].map(m => (
              <div key={m} className="flex-shrink-0 min-w-[100px] py-4 px-5 rounded-2xl flex flex-col items-center bg-white border border-gray-100">
                <span className="text-xs font-bold uppercase tracking-widest text-gray-400">{m.split(' ')[0]}</span>
                <span className="text-xl font-bold text-gray-400">{m.split(' ')[1]}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Card de ingresos */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-50">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-sm text-gray-500">Ingresos Totales Acumulados</p>
              <p className="text-4xl font-black text-gray-900 mt-1 tracking-tight">$15.240,00</p>
            </div>
            <div className="flex items-center gap-1 px-3 py-1.5 rounded-xl" style={{ backgroundColor: primaryColor + '15' }}>
              <span className="text-sm" style={{ color: primaryColor }}>↑</span>
              <span className="text-xs font-bold" style={{ color: primaryColor }}>+12.4%</span>
            </div>
          </div>
          <div className="h-16 flex items-end">
            <div className="w-full h-0.5 rounded-full" style={{ backgroundColor: primaryColor + '30' }} />
          </div>
          <div className="flex justify-between mt-2">
            {['Día 01', 'Día 15', 'Día 31'].map(l => (
              <span key={l} className="text-xs font-bold uppercase tracking-widest text-gray-400">{l}</span>
            ))}
          </div>
        </div>

        {/* Distribución de pagos */}
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3 px-1">Distribución de Pagos</p>
          <div className="flex gap-3">
            {[
              { label: 'Efectivo', pct: 45, color: primaryColor },
              { label: 'Tarjeta', pct: 30, color: '#64d2ff' },
              { label: 'Transf.', pct: 25, color: '#94a3b8' },
            ].map(p => (
              <div key={p.label} className="flex-1 bg-white rounded-2xl p-4 border border-gray-50">
                <p className="text-xs font-bold uppercase tracking-wide text-gray-400 mb-2">{p.label}</p>
                <p className="text-2xl font-black text-gray-900">{p.pct}%</p>
                <div className="h-1.5 bg-gray-100 rounded-full mt-3 overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${p.pct}%`, backgroundColor: p.color }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Botones de acción */}
        <div className="flex gap-4 pb-4">
          <Link href={`/${brand}/${subdominio}/profesional/agenda`}
            className="flex-1 rounded-3xl p-5 min-h-[160px] flex flex-col justify-between shadow-lg"
            style={{ background: `linear-gradient(135deg, ${primaryColor}, ${colors.accent || '#64d2ff'})` }}>
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-xl">+</div>
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-white/70">Nueva Reserva</p>
              <p className="text-base font-black text-white">Agendar Cita</p>
            </div>
          </Link>
          <Link href={`/${brand}/${subdominio}/profesional/agenda-mensual`}
            className="flex-1 rounded-3xl p-5 min-h-[160px] flex flex-col justify-between bg-gray-900 shadow-lg">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
              style={{ backgroundColor: primaryColor + '20' }}>📅</div>
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Agenda Diaria</p>
              <p className="text-base font-black text-white">Ver Calendario</p>
            </div>
          </Link>
        </div>
      </div>

      {/* Bottom Nav */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white/90 border-t flex justify-between px-6 py-4"
        style={{ borderColor: '#f1f5f9' }}>
        <button className="flex flex-col items-center gap-1">
          <span>🏠</span>
          <span className="text-xs font-bold uppercase text-gray-400">Inicio</span>
        </button>
        <Link href={`/${brand}/${subdominio}/profesional/agenda`} className="flex flex-col items-center gap-1">
          <span>📅</span>
          <span className="text-xs font-bold uppercase text-gray-400">Citas</span>
        </Link>
        <button className="flex flex-col items-center gap-1">
          <span style={{ color: primaryColor }}>📊</span>
          <span className="text-xs font-bold uppercase" style={{ color: primaryColor }}>Caja</span>
        </button>
        <button onClick={handleLogout} className="flex flex-col items-center gap-1">
          <span>🚪</span>
          <span className="text-xs font-bold uppercase text-red-400">Salir</span>
        </button>
      </nav>
    </div>
  );
}
