'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Lock, ChevronLeft, ArrowRight } from 'lucide-react';
import { useAuth } from '@/src/context/AuthContext';
import { useTheme } from '@/src/context/ThemeContext';

function PasswordField({
  label,
  value,
  onChange,
  placeholder,
  primary,
  primaryFaded,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  primary: string;
  primaryFaded: string;
}) {
  const [show, setShow] = useState(false);
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-slate-600 text-sm font-medium px-1 lowercase">{label}</label>
      <div className="relative flex items-center">
        <input
          type={show ? 'text' : 'password'}
          value={value}
          onChange={e => onChange(e.target.value)}
          required
          placeholder={placeholder}
          className="w-full h-14 pl-5 pr-12 rounded-xl border text-slate-900 placeholder:text-slate-400 text-sm outline-none transition-all"
          style={{ borderColor: `${primary}1A`, background: primaryFaded }}
          onFocus={e => { e.currentTarget.style.borderColor = primary; e.currentTarget.style.boxShadow = `0 0 0 4px ${primary}1A`; }}
          onBlur={e => { e.currentTarget.style.borderColor = `${primary}1A`; e.currentTarget.style.boxShadow = 'none'; }}
        />
        <button
          type="button"
          onClick={() => setShow(v => !v)}
          className="absolute right-4 text-slate-400 hover:text-slate-600 transition-colors"
        >
          {show ? <EyeOff size={20} /> : <Eye size={20} />}
        </button>
      </div>
    </div>
  );
}

export default function CambiarContrasenaPage() {
  const router = useRouter();
  const { profile, changePassword } = useAuth();
  const { colors, empresaNombre, logoUrl } = useTheme();

  const [actual, setActual] = useState('');
  const [nueva, setNueva] = useState('');
  const [confirmar, setConfirmar] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');

    if (nueva !== confirmar) {
      setError('Las contraseñas nuevas no coinciden.');
      return;
    }
    if (nueva.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    setLoading(true);
    const result = await changePassword(profile?.email || '', actual, nueva);
    setLoading(false);

    if ((result as any).success) {
      setSuccess(true);
    } else {
      setError((result as any).error?.message || 'No se pudo cambiar la contraseña.');
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
        <div className="mb-8">
          {logoUrl ? (
            <img src={logoUrl} alt={empresaNombre || 'logo'} className="h-10 w-auto object-contain" />
          ) : (
            <h1 className="text-2xl font-bold tracking-tight lowercase" style={{ color: colors.primary }}>
              {empresaNombre || 'Tus Turnos'}
            </h1>
          )}
        </div>

        {success ? (
          /* Estado: éxito */
          <div className="flex flex-col items-center text-center gap-4 w-full">
            <div className="w-16 h-16 rounded-full flex items-center justify-center mb-2" style={{ background: colors.primaryFaded }}>
              <Lock size={32} style={{ color: colors.primary }} />
            </div>
            <h2 className="text-slate-900 text-2xl font-bold lowercase">contraseña actualizada</h2>
            <p className="text-slate-500 text-base leading-relaxed lowercase">
              tu contraseña fue cambiada correctamente.
            </p>
            <button
              onClick={() => router.back()}
              className="mt-6 flex items-center gap-1 text-sm font-semibold lowercase transition-colors"
              style={{ color: colors.primary }}
            >
              <ChevronLeft size={18} />
              volver
            </button>
          </div>
        ) : (
          <>
            <div className="text-center mb-8 w-full">
              <h2 className="text-slate-900 text-2xl font-bold leading-tight mb-2 lowercase">cambiar contraseña</h2>
              <p className="text-slate-500 text-sm font-normal leading-relaxed lowercase">
                seguridad de tu cuenta
              </p>
            </div>

            <form onSubmit={handleSubmit} className="w-full space-y-5">
              <PasswordField
                label="contraseña actual"
                value={actual}
                onChange={setActual}
                placeholder="ingresá tu contraseña actual"
                primary={colors.primary}
                primaryFaded={colors.primaryFaded}
              />
              <PasswordField
                label="nueva contraseña"
                value={nueva}
                onChange={setNueva}
                placeholder="ingresá tu nueva contraseña"
                primary={colors.primary}
                primaryFaded={colors.primaryFaded}
              />
              <PasswordField
                label="confirmar nueva contraseña"
                value={confirmar}
                onChange={setConfirmar}
                placeholder="repetí tu nueva contraseña"
                primary={colors.primary}
                primaryFaded={colors.primaryFaded}
              />

              {error && (
                <p className="text-sm text-red-600 bg-red-50 px-4 py-3 rounded-lg">{error}</p>
              )}

              <div className="pt-2 flex flex-col gap-3">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full h-14 text-white rounded-xl font-bold text-base tracking-wide transition-all flex items-center justify-center gap-2 lowercase disabled:opacity-60"
                  style={{
                    backgroundColor: colors.primary,
                    boxShadow: `0 10px 40px -10px ${colors.primary}66`,
                  }}
                >
                  {loading ? 'actualizando...' : <> actualizar contraseña <ArrowRight size={20} /></>}
                </button>
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="w-full h-12 rounded-xl font-semibold text-sm border transition-all lowercase"
                  style={{ borderColor: `${colors.primary}1A`, color: colors.primary }}
                >
                  cancelar y volver
                </button>
              </div>
            </form>

            {/* Decorativo */}
            <div className="mt-10 mb-6 flex justify-center">
              <div className="relative w-20 h-20 flex items-center justify-center">
                <div className="absolute inset-0 rounded-full blur-2xl" style={{ background: `${colors.primary}0D` }} />
                <Lock size={52} className="relative" strokeWidth={1.2} style={{ color: `${colors.primary}66` }} />
              </div>
            </div>

            <button
              onClick={() => router.back()}
              className="flex items-center gap-1 text-sm font-semibold lowercase transition-colors"
              style={{ color: colors.primary }}
            >
              <ChevronLeft size={18} />
              volver sin cambiar
            </button>
          </>
        )}

        <div className="mt-8 flex items-center justify-center gap-2 text-slate-400 text-xs">
          <Lock size={13} />
          <span>tus datos están protegidos con cifrado de extremo a extremo</span>
        </div>
      </div>
    </div>
  );
}
