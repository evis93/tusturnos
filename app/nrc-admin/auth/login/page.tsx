'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Mail, Lock, ArrowRight, CheckCircle } from 'lucide-react';

const COLORS = {
  primary: '#002442',
  secondary: '#006876',
  primaryContainer: '#1a3a5a',
  primaryFixed: '#d1e4ff',
  primaryFixedDim: '#abc9f0',
  secondaryFixed: '#a1efff',
};

export default function NrcLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // TODO: Implement actual authentication logic
      // Placeholder for now
      console.log('Login attempt:', { email, password });
      // router.push('/nrc-admin/dashboard');
    } catch (err) {
      setError('Error de autenticación. Por favor, intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden"
      style={{
        background: `radial-gradient(circle at top left, #f0f3ff 0%, #d1e4ff 50%, ${COLORS.primaryFixedDim} 100%)`,
      }}
    >
      {/* Decorative Background Blobs */}
      <div
        className="fixed -bottom-32 -left-32 w-96 h-96 rounded-full blur-[100px] pointer-events-none"
        style={{ backgroundColor: `${COLORS.primary}0D` }}
      />
      <div
        className="fixed -top-32 -right-32 w-96 h-96 rounded-full blur-[100px] pointer-events-none"
        style={{ backgroundColor: `${COLORS.secondary}10` }}
      />

      <div className="w-full max-w-[480px] relative z-10">
        {/* Brand Header */}
        <div className="mb-8 text-center">
          <div className="flex justify-center mb-4">
            <div
              className="w-16 h-16 rounded-lg shadow-lg flex items-center justify-center"
              style={{ backgroundColor: COLORS.primaryContainer }}
            >
              <span
                className="material-symbols-outlined text-white"
                style={{ fontSize: '48px' }}
              >
                terminal
              </span>
            </div>
          </div>
          <h1
            className="text-4xl font-bold tracking-tight"
            style={{ color: COLORS.primary }}
          >
            NCR Console
          </h1>
          <p
            className="text-xs uppercase tracking-widest mt-2"
            style={{ color: '#666' }}
          >
            Empresa de Soluciones en Sistemas
          </p>
        </div>

        {/* Login Card */}
        <div
          className="rounded-xl shadow-[0px_4px_24px_rgba(26,58,90,0.1)] p-8 relative overflow-hidden border border-white/40"
          style={{
            background: 'rgba(255, 255, 255, 0.85)',
            backdropFilter: 'blur(12px)',
          }}
        >
          {/* Top Accent Bar */}
          <div
            className="absolute top-0 left-0 right-0 h-1"
            style={{ backgroundColor: COLORS.secondary }}
          />

          <div className="space-y-6">
            <header className="text-center">
              <h2
                className="text-2xl font-bold mb-2"
                style={{ color: COLORS.primary }}
              >
                Bienvenido
              </h2>
              <p className="text-sm text-gray-600">
                Inicie sesión para gestionar su infraestructura
              </p>
            </header>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email Field */}
              <div className="space-y-1">
                <label
                  className="text-xs font-bold uppercase tracking-wide"
                  style={{ color: '#666' }}
                >
                  Correo Electrónico
                </label>
                <div className="relative flex items-center">
                  <Mail
                    size={20}
                    className="absolute left-4"
                    style={{ color: '#999' }}
                  />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="usuario@empresa.com"
                    className="w-full pl-12 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-offset-0 focus:outline-none transition-all text-sm placeholder:text-gray-400"
                    style={{
                      borderColor: '#ccc',
                      background: '#fff',
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = COLORS.secondary;
                      e.currentTarget.style.boxShadow = `0 0 0 3px ${COLORS.secondary}20`;
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = '#ccc';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <label
                    className="text-xs font-bold uppercase tracking-wide"
                    style={{ color: '#666' }}
                  >
                    Contraseña
                  </label>
                  <Link
                    href="#"
                    className="text-xs font-bold uppercase tracking-wide hover:underline"
                    style={{ color: COLORS.secondary }}
                  >
                    ¿Olvidó su clave?
                  </Link>
                </div>
                <div className="relative flex items-center">
                  <Lock
                    size={20}
                    className="absolute left-4"
                    style={{ color: '#999' }}
                  />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="••••••••"
                    className="w-full pl-12 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-offset-0 focus:outline-none transition-all text-sm placeholder:text-gray-400"
                    style={{
                      borderColor: '#ccc',
                      background: '#fff',
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = COLORS.secondary;
                      e.currentTarget.style.boxShadow = `0 0 0 3px ${COLORS.secondary}20`;
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = '#ccc';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  />
                </div>
              </div>

              {error && (
                <p className="text-xs text-red-600 bg-red-50 px-3 py-2 rounded">
                  {error}
                </p>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 text-white rounded-lg font-bold text-sm tracking-wide transition-all flex items-center justify-center gap-2 disabled:opacity-60 hover:opacity-90"
                style={{
                  backgroundColor: COLORS.primaryContainer,
                  boxShadow: `0 10px 40px -10px ${COLORS.primaryContainer}66`,
                }}
              >
                {loading ? 'Ingresando...' : (
                  <>
                    Entrar a la Consola
                    <ArrowRight size={18} />
                  </>
                )}
              </button>
            </form>

            {/* Footer */}
            <div
              className="pt-4 border-t flex items-center justify-between"
              style={{ borderColor: '#ddd' }}
            >
              <span
                className="text-xs italic opacity-70"
                style={{ color: COLORS.primary }}
              >
                Powered by mensana
              </span>
              <div className="flex items-center gap-1" style={{ color: COLORS.secondary }}>
                <CheckCircle size={16} />
                <span className="text-[10px] font-bold uppercase">
                  Seguridad Encriptada RSA
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Links */}
        <footer className="mt-8 text-center space-y-3">
          <p className="text-xs opacity-60" style={{ color: COLORS.primary }}>
            © 2024 NCR Corporation. Todos los derechos reservados.
          </p>
          <div className="flex justify-center gap-4 text-[11px] font-bold uppercase tracking-wide opacity-70">
            <Link href="#" className="hover:opacity-100" style={{ color: COLORS.primary }}>
              Términos
            </Link>
            <span>•</span>
            <Link href="#" className="hover:opacity-100" style={{ color: COLORS.primary }}>
              Privacidad
            </Link>
            <span>•</span>
            <Link href="#" className="hover:opacity-100" style={{ color: COLORS.primary }}>
              Soporte Técnico
            </Link>
          </div>
        </footer>
      </div>
    </div>
  );
}
