'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Mail, ArrowRight, ChevronLeft } from 'lucide-react';
import { useTheme } from '@/src/context/ThemeContext';
import { supabase } from '@/src/config/supabase';

export default function RecuperarContrasenaPage() {
  const params = useParams();
  const slug = params.empresa as string;
  const { colors } = useTheme();

  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/auth/callback?type=recovery`,
    });

    setLoading(false);

    if (resetError) {
      setError(resetError.message);
    } else {
      setSent(true);
    }
  };

  return (
    <div
      className="relative flex min-h-screen w-full flex-col items-center justify-center p-4"
      style={{ background: `linear-gradient(180deg, ${colors.primaryLight} 0%, ${colors.primaryFaded} 100%)` }}
    >
      {/* Blobs de fondo */}
      <div className="fixed top-20 left-20 w-64 h-64 rounded-full blur-3xl -z-10" style={{ background: `${colors.primary}0D` }} />
      <div className="fixed bottom-20 right-20 w-96 h-96 rounded-full blur-3xl -z-10" style={{ background: `${colors.primary}1A` }} />

      <div
        className="w-full max-w-[440px] bg-white rounded-xl p-8 flex flex-col items-center"
        style={{ boxShadow: `0 10px 40px -10px ${colors.primary}26` }}
      >
        {/* Logo */}
        <div className="mb-10">
          <h1 className="text-2xl font-bold tracking-tight lowercase" style={{ color: colors.primary }}>
            mensana
          </h1>
        </div>

        {sent ? (
          /* Estado: enviado */
          <div className="flex flex-col items-center text-center gap-4 w-full">
            <div className="w-16 h-16 rounded-full flex items-center justify-center mb-2" style={{ background: colors.primaryFaded }}>
              <Mail size={32} style={{ color: colors.primary }} />
            </div>
            <h2 className="text-slate-900 text-2xl font-bold leading-tight lowercase">revisá tu correo</h2>
            <p className="text-slate-500 text-base leading-relaxed lowercase">
              enviamos un enlace de recuperación a <span className="font-semibold text-slate-700">{email}</span>.
              revisá tu bandeja de entrada y spam.
            </p>
            <Link
              href={`/tusturnos/${slug}/auth/login`}
              className="mt-6 flex items-center gap-1 text-sm font-semibold lowercase transition-colors"
              style={{ color: colors.primary }}
            >
              <ChevronLeft size={18} />
              volver al inicio de sesión
            </Link>
          </div>
        ) : (
          /* Estado: formulario */
          <>
            <div className="text-center mb-8">
              <h2 className="text-slate-900 text-2xl font-bold leading-tight mb-3 lowercase">recuperar contraseña</h2>
              <p className="text-slate-500 text-base font-normal leading-relaxed lowercase">
                ingresá tu correo electrónico para recibir un enlace de recuperación
              </p>
            </div>

            <form onSubmit={handleSubmit} className="w-full space-y-6">
              <div className="flex flex-col gap-2">
                <label className="text-slate-600 text-sm font-medium px-1 lowercase">correo electrónico</label>
                <div className="relative">
                  <Mail
                    size={20}
                    className="absolute left-4 top-1/2 -translate-y-1/2"
                    style={{ color: `${colors.primary}99` }}
                  />
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                    placeholder="ejemplo@correo.com"
                    className="w-full h-14 pl-12 pr-4 rounded-xl border text-slate-900 focus:outline-none focus:ring-2 transition-all placeholder:text-slate-400 lowercase"
                    style={{
                      borderColor: `${colors.primary}1A`,
                      background: `${colors.primaryFaded}`,
                    }}
                    onFocus={e => { e.currentTarget.style.borderColor = colors.primary; }}
                    onBlur={e => { e.currentTarget.style.borderColor = `${colors.primary}1A`; }}
                  />
                </div>
              </div>

              {error && (
                <p className="text-sm text-red-600 bg-red-50 px-4 py-3 rounded-lg">{error}</p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full h-14 text-white rounded-xl font-bold text-base tracking-wide transition-all flex items-center justify-center gap-2 lowercase disabled:opacity-60"
                style={{
                  backgroundColor: colors.primary,
                  boxShadow: `0 10px 40px -10px ${colors.primary}66`,
                }}
              >
                {loading ? 'enviando...' : (
                  <>enviar enlace <ArrowRight size={20} /></>
                )}
              </button>
            </form>

            {/* Ícono decorativo */}
            <div className="mt-12 mb-8 flex justify-center">
              <div className="relative w-24 h-24 flex items-center justify-center">
                <div className="absolute inset-0 rounded-full blur-2xl" style={{ background: `${colors.primary}0D` }} />
                <Mail size={64} className="relative" style={{ color: `${colors.primary}66` }} />
              </div>
            </div>

            <Link
              href={`/tusturnos/${slug}/auth/login`}
              className="flex items-center gap-1 text-sm font-semibold lowercase transition-colors"
              style={{ color: colors.primary }}
            >
              <ChevronLeft size={18} />
              volver al inicio de sesión
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
