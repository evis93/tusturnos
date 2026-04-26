'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/src/context/AuthContext';
import { useTenant } from '@/src/context/TenantContext';
import { BRAND_DEFAULTS } from '@/src/lib/brand-colors';

type LoginTab = 'empresa' | 'cliente';

export default function LoginPage({
  params,
}: {
  params: { brand: 'mensana' | 'tusturnos'; subdominio: string };
}) {
  const router = useRouter();
  const { login } = useAuth();
  const tenant = useTenant();

  const [activeTab, setActiveTab] = useState<LoginTab>('empresa');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const colors = tenant?.colors || BRAND_DEFAULTS[params.brand];
  const gradient = `linear-gradient(135deg, ${colors.primary} 0%, ${colors.secondary} 100%)`;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      router.push(`/${params.brand}/${params.subdominio}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-white">
      {/* Left Panel - Brand Story (hidden on mobile) */}
      <div
        className="hidden md:flex md:w-5/12 flex-col items-center justify-center px-8 text-white relative"
        style={{ background: gradient }}
      >
        <div className="max-w-sm text-center">
          <h1 className="text-4xl font-bold mb-6">
            {params.brand === 'mensana' ? 'Mensana' : 'Tus Turnos'}
          </h1>
          <p className="text-lg opacity-90 mb-8">
            Plataforma integral de reservas y agendamiento profesional
          </p>

          {/* Benefits */}
          <div className="space-y-4 text-left">
            {[
              { icon: 'check_circle', label: 'Gestión completa de reservas' },
              { icon: 'check_circle', label: 'Profesionales verificados' },
              { icon: 'check_circle', label: 'Pagos seguros integrados' },
            ].map((benefit) => (
              <div key={benefit.label} className="flex items-start gap-3">
                <span className="material-symbols-outlined flex-shrink-0">
                  {benefit.icon}
                </span>
                <span>{benefit.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="w-full md:w-7/12 flex flex-col items-center justify-center px-6 py-12 md:px-16">
        {/* Tab Switcher */}
        <div className="w-full max-w-sm mb-8">
          <div className="flex gap-4 border-b border-gray-200">
            {(['empresa', 'cliente'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-3 text-sm font-semibold border-b-2 transition ${
                  activeTab === tab
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
                style={
                  activeTab === tab ? { borderBottomColor: colors.primary } : {}
                }
              >
                {tab === 'empresa' ? 'Empresa' : 'Cliente'}
              </button>
            ))}
          </div>
        </div>

        {/* Login Form */}
        <form onSubmit={handleLogin} className="w-full max-w-sm space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Correo electrónico
            </label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-3 text-gray-400">
                mail
              </span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="tu@email.com"
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 transition"
                style={{ focusRingColor: colors.primary }}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Contraseña
            </label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-3 text-gray-400">
                lock
              </span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 transition"
              />
            </div>
          </div>

          {/* Remember Me */}
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="w-4 h-4 border border-gray-300 rounded"
            />
            <span className="text-gray-700">Recordarme por 30 días</span>
          </label>

          {/* Error */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-lg font-semibold text-white transition-all duration-200 hover:shadow-lg disabled:opacity-70"
            style={{ background: gradient }}
          >
            {loading ? 'Iniciando sesión...' : 'Iniciar sesión en el Hub'}
          </button>
        </form>

        {/* Social Auth Divider */}
        <div className="w-full max-w-sm my-6">
          <div className="flex items-center gap-4">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-xs text-gray-500">O continúa con</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>
        </div>

        {/* Social Buttons */}
        <div className="w-full max-w-sm flex gap-4">
          <button className="flex-1 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition flex items-center justify-center gap-2">
            <span className="text-lg">🔵</span>
            <span className="text-sm font-medium text-gray-700">Google</span>
          </button>
          <button className="flex-1 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition flex items-center justify-center gap-2">
            <span className="text-lg">🍎</span>
            <span className="text-sm font-medium text-gray-700">Apple</span>
          </button>
        </div>

        {/* Footer */}
        <div className="w-full max-w-sm text-center mt-8 pt-8 border-t border-gray-200">
          <p className="text-gray-600 text-sm">
            ¿Nuevo en{' '}
            <span className="font-semibold">
              {params.brand === 'mensana' ? 'Mensana' : 'Tus Turnos'}
            </span>
            ?{' '}
            <button
              type="button"
              onClick={() =>
                router.push(
                  `/${params.brand}/${params.subdominio}/auth/register`
                )
              }
              className="font-semibold transition"
              style={{ color: colors.primary }}
            >
              Crear cuenta
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}