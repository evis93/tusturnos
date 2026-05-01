'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Clock, Users, Sparkles, UserRound, QrCode, LogOut, ChevronDown } from 'lucide-react';
import { useState } from 'react';
import Image from 'next/image';

const MENU_ITEMS = [
  { href: '/admin/agenda', icon: Clock, label: 'Agenda' },
  { href: '/admin/horarios-empresa', icon: Clock, label: 'Horarios de Empresa' },
  { href: '/admin/horarios', icon: Clock, label: 'Horarios del Profesional' },
  { href: '/admin/profesionales', icon: Users, label: 'Profesionales' },
  { href: '/admin/servicios', icon: Sparkles, label: 'Servicios' },
  { href: '/admin/clientes', icon: UserRound, label: 'Clientes' },
  { href: '/admin/qr', icon: QrCode, label: 'Código QR' },
];

export default function AdminMenu() {
  const pathname = usePathname();
  const router = useRouter();
  const { profile, logout } = useAuth();
  const { colors } = useTheme();
  const [showLogout, setShowLogout] = useState(false);

  const handleLogout = async () => {
    await logout();
    router.replace('/auth/login');
  };

  // Colores de la empresa (si existen) o fallback a colores por defecto
  const empresaPrimary = profile?.colorPrimario || colors.primary;
  const empresaSecondary = profile?.colorSecundario || colors.secondary;
  const empresaBackground = profile?.colorBackground || colors.background;

  return (
    <div
      className="w-56 border-r flex flex-col h-screen"
      style={{
        borderColor: colors.border,
        background: colors.surface,
      }}
    >
      {/* Header con Logo */}
      <div
        className="p-6 border-b flex flex-col items-center justify-center"
        style={{
          borderColor: colors.border,
          background: empresaBackground,
        }}
      >
        {/* Logo */}
        {profile?.logoUrl && (
          <div className="mb-4 h-12 w-full flex items-center justify-center">
            <Image
              src={profile.logoUrl}
              alt={profile.empresaNombre || 'Logo'}
              width={150}
              height={48}
              style={{ maxWidth: '100%', height: 'auto' }}
              priority
            />
          </div>
        )}
        <h1 className="text-xs font-bold uppercase tracking-widest text-center" style={{ color: empresaPrimary }}>
          Administración
        </h1>
        {profile?.empresaNombre && (
          <p className="text-xs mt-2 lowercase text-center" style={{ color: empresaPrimary }}>
            {profile.empresaNombre}
          </p>
        )}
      </div>

      {/* Menu Items */}
      <nav className="flex-1 overflow-y-auto py-4">
        {MENU_ITEMS.map(item => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors"
              style={{
                color: isActive ? empresaPrimary : colors.text,
                background: isActive ? empresaBackground : 'transparent',
                borderLeft: isActive ? `3px solid ${empresaPrimary}` : '3px solid transparent',
              }}
            >
              <Icon size={18} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* User Info + Logout */}
      <div className="p-4 border-t space-y-3" style={{ borderColor: colors.border }}>
        <div>
          <p className="text-xs font-medium uppercase" style={{ color: colors.textSecondary }}>
            Sesión
          </p>
          <p className="text-xs mt-1 lowercase" style={{ color: colors.text }}>
            {profile?.nombre_completo}
          </p>
        </div>
        <button
          onClick={() => setShowLogout(!showLogout)}
          className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition"
          style={{
            background: empresaBackground,
            color: empresaPrimary,
          }}
        >
          <span className="flex items-center gap-2">
            <LogOut size={16} />
            Salir
          </span>
          <ChevronDown size={16} className={`transition-transform ${showLogout ? 'rotate-180' : ''}`} />
        </button>
        {showLogout && (
          <div className="space-y-2 pt-2">
            <p className="text-xs" style={{ color: colors.textSecondary }}>
              ¿Seguro que deseas salir?
            </p>
            <button
              onClick={handleLogout}
              className="w-full px-3 py-2 rounded-lg text-xs font-medium transition"
              style={{
                background: '#dc2626',
                color: '#fff',
              }}
            >
              Sí, salir
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
