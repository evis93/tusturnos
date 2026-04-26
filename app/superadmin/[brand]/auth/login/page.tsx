'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/src/context/AuthContext';
import { SUPERADMIN_COLORS } from '@/src/lib/brand-colors';

export default function SuperadminLoginPage({
  params,
}: {
  params: { brand: 'mensana' | 'tusturnos' };
}) {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      router.push(`/superadmin/${params.brand}/dashboard`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  const colors = SUPERADMIN_COLORS;

  return (
    <div
      className="min-h-screen flex items-center justify-center relative overflow-hidden"
      style={{
        background: `radial-gradient(circle at top left, ${colors.secondary}20, ${colors.primary}10, ${colors.background})`,
      }}
    >
      {/* Decorative blurred circles */}
      <div
        className="absolute bottom-0 left-0 w-96 h-96 rounded-full blur-3xl opacity-20 pointer-events-none"
        style={{ backgroundColor: colors.secondary }}
      />
      <div
        className="absolute top-0 right-0 w-80 h-80 rounded-full blur-3xl opacity-15 pointer-events-none"
        style={{ backgroundColor: colors.primary }}
      />

      {/* Glassmorphic Card */}
      <div className="relative z-10 w-full max-w-md mx-auto px-6">
        <div
          className="backdrop-blur-xl border border-white border-opacity-20 rounded-2xl p-8 shadow-2xl"
          style={{ backgroundColor: 'rgba(255, 255, 255, 0.85)' }}
        >
          {/* Top Accent Bar */}
          <div
            className="h-1 w-12 rounded-full mb-8"
            style={{ backgroundColor: colors.secondary }}
          />

          {/* Icon Container */}
          <div
            className="w-16 h-16 rounded-xl flex items-center justify-center mb-6"
            style={{ backgroundColor: `${colors.primary}15` }}
          >
            <span
              className="material-symbols-outlined text-3xl"
              style={{ color: colors.primary }}
            >
              terminal
            </span>
          </div>

          {/* Title & Subtitle */}
          <h1 className="text-3xl font-bold mb-2" style={{ color: colors.primary }}>
            NCR Console
          </h1>
          <p className="text-gray-600 text-sm mb-8">
            Empresa de Soluciones en Sistemas
          </p>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            {/* Email Field */}
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg">
                alternate_email
              </span>
              <input
                type="email"
                placeholder="Correo electrónico"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 transition"
                style={{ focusRingColor: colors.primary }}
              />
            </div>

            {/* Password Field */}
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg">
                lock
              </span>
              <input
                type="password"
                placeholder="Contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 transition"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-lg font-semibold text-white transition-all duration-200 hover:shadow-lg disabled:opacity-70"
              style={{
                backgroundColor: colors.primary,
              }}
            >
              {loading ? 'Iniciando sesión...' : 'Iniciar sesión'}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-center text-xs text-gray-500 mb-3">
              Powered by <span className="font-semibold">mensana</span>
            </p>
            <div className="flex items-center justify-center gap-2 text-xs">
              <span
                className="material-symbols-outlined text-green-600"
                style={{ fontSize: '14px' }}
              >
                verified_user
              </span>
              <span className="text-gray-600">SEGURIDAD ENCRIPTADA RSA</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}