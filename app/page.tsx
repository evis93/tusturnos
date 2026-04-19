'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/src/context/AuthContext';
import { Loader2 } from 'lucide-react';

export default function HomePage() {
  const { profile, loading: authLoading, login } = useAuth();
  const router = useRouter();

  const [tab, setTab] = useState<'empresa' | 'cliente'>('empresa');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (authLoading || !profile) return;
    if (profile.rol === 'superadmin') router.replace('/tusturnos');
    else if (profile.rol === 'admin') router.replace('/admin');
    else if (profile.rol === 'profesional') router.replace('/profesional');
    else if (profile.rol === 'cliente') router.replace('/cliente');
  }, [profile, authLoading, router]);

  if (authLoading || profile) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary" />
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Completá el email y la contraseña');
      return;
    }
    setError('');
    setLoading(true);
    const result = await login(email.trim().toLowerCase(), password);
    setLoading(false);
    if (!result.success) {
      setError(result.error?.message || 'Email o contraseña incorrectos');
    }
  };

  const isEmpresa = tab === 'empresa';

  return (
    <div className="bg-surface font-sans text-on-surface min-h-screen flex items-center justify-center p-4">

      {/* Fondo decorativo */}
      <div className="fixed inset-0 -z-10 overflow-hidden bg-surface pointer-events-none">
        <div className="absolute rounded-full bg-primary/5 blur-[120px]"
          style={{ top: '-20%', left: '-10%', width: '60%', height: '60%' }} />
        <div className="absolute rounded-full bg-tertiary/5 blur-[100px]"
          style={{ bottom: '10%', right: '5%', width: '40%', height: '40%' }} />
      </div>

      <main className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-12 gap-0 overflow-hidden rounded-[2rem] bg-surface-container-lowest shadow-2xl">

        {/* ── Panel izquierdo: branding ─────────────────────────────────── */}
        <section className="lg:col-span-5 relative hidden lg:flex flex-col justify-between p-12 signature-gradient text-white">
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-12">
              <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center overflow-hidden">
                <img
                  src="/images/logoturnos.png"
                  alt="Tus Turnos"
                  className="w-16 h-16 object-contain"
                />
              </div>

              <span className="text-2xl font-extrabold tracking-tight">
                Tus Turnos
              </span>
            </div>            <h1 className="text-5xl font-bold leading-tight mb-6">
              Gestionando el tiempo,{' '}
              <br />
              <span className="opacity-80">perfectamente compuesto.</span>
            </h1>

            <div className="space-y-8 mt-12">
              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0">
                  <span className="material-symbols-outlined text-white">business_center</span>
                </div>
                <div>
                  <h3 className="font-bold text-lg">Para Empresas</h3>
                  <p className="text-blue-100/80 text-sm leading-relaxed">
                    Accedé a tu Centro Profesional. Panel de control con análisis en tiempo real y gestión de personal.
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0">
                  <span className="material-symbols-outlined text-white">person_search</span>
                </div>
                <div>
                  <h3 className="font-bold text-lg">Para Clientes</h3>
                  <p className="text-blue-100/80 text-sm leading-relaxed">
                    Explorá profesionales y/o centros de cercanía, reservá turnos y gestioná todo desde un solo lugar.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Elementos decorativos */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
            <div className="absolute -bottom-20 -right-20 w-96 h-96 rounded-full border-[40px] border-white/20" />
            <div className="absolute top-40 -left-20 w-64 h-64 rounded-full border-[20px] border-white/10" />
          </div>

          <div className="relative z-10 pt-12 border-t border-white/10">
            <p className="text-xs font-medium tracking-widest uppercase opacity-60">Sistema de Gestión de Turnos</p>
          </div>
        </section>

        {/* ── Panel derecho: formulario ─────────────────────────────────── */}
        <section className="lg:col-span-7 bg-surface-container-lowest p-8 md:p-16 flex flex-col justify-center">

          {/* Header mobile */}
          <div className="lg:hidden flex items-center gap-3 mb-12">
            <div className="w-10 h-10 rounded-xl bg-surface-container flex items-center justify-center overflow-hidden">
              <img src="/images/logoturnos.png" alt="Tus Turnos" className="w-full h-full object-contain p-1" />
            </div>
            <span className="text-xl font-extrabold tracking-tight text-primary">Tus Turnos</span>
          </div>

          <div className="max-w-md mx-auto w-full">
            <header className="mb-10 text-center lg:text-left">
              <h2 className="text-3xl font-bold text-on-surface mb-3">Bienvenido de nuevo</h2>
              <p className="text-on-surface-variant font-medium">
                Por favor, seleccioná tu tipo de cuenta para continuar.
              </p>
            </header>

            {/* Tabs Empresa / Cliente */}
            <div className="grid grid-cols-2 gap-4 mb-10 bg-surface-container-low p-1.5 rounded-2xl">
              <button
                type="button"
                onClick={() => setTab('empresa')}
                className={`flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl font-semibold transition-all duration-300 ${
                  isEmpresa
                    ? 'signature-gradient text-white shadow-lg scale-[1.02]'
                    : 'text-on-surface-variant hover:bg-surface-container-high'
                }`}
              >
                <span className="material-symbols-outlined text-[20px]">storefront</span>
                Empresa
              </button>
              <button
                type="button"
                onClick={() => setTab('cliente')}
                className={`flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl font-semibold transition-all duration-300 ${
                  !isEmpresa
                    ? 'signature-gradient text-white shadow-lg scale-[1.02]'
                    : 'text-on-surface-variant hover:bg-surface-container-high'
                }`}
              >
                <span className="material-symbols-outlined text-[20px]">person</span>
                Cliente
              </button>
            </div>

            {/* Formulario */}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-on-surface-variant ml-1" htmlFor="email">
                  {isEmpresa ? 'Correo electrónico' : 'Correo electrónico'}
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <span className="material-symbols-outlined text-outline group-focus-within:text-primary transition-colors">mail</span>
                  </div>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder={isEmpresa ? 'nombre@empresa.com' : 'tu@email.com'}
                    autoComplete="email"
                    className="w-full pl-12 pr-4 py-4 bg-surface-container-low border-0 rounded-xl focus:ring-2 focus:ring-primary-fixed-dim focus:bg-surface-bright transition-all placeholder:text-outline-variant font-medium outline-none"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center ml-1">
                  <label className="text-sm font-semibold text-on-surface-variant" htmlFor="password">
                    Contraseña
                  </label>
                  <Link href="#" className="text-sm font-bold text-primary hover:text-primary-container transition-colors">
                    ¿Olvidaste tu contraseña?
                  </Link>
                </div>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <span className="material-symbols-outlined text-outline group-focus-within:text-primary transition-colors">lock</span>
                  </div>
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    autoComplete="current-password"
                    className="w-full pl-12 pr-12 py-4 bg-surface-container-low border-0 rounded-xl focus:ring-2 focus:ring-primary-fixed-dim focus:bg-surface-bright transition-all placeholder:text-outline-variant font-medium outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-outline-variant hover:text-on-surface-variant"
                  >
                    <span className="material-symbols-outlined">
                      {showPassword ? 'visibility_off' : 'visibility'}
                    </span>
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-3 py-2">
                <input
                  id="remember"
                  type="checkbox"
                  checked={remember}
                  onChange={e => setRemember(e.target.checked)}
                  className="w-5 h-5 rounded border-outline-variant text-primary focus:ring-primary accent-primary"
                />
                <label htmlFor="remember" className="text-sm font-medium text-on-surface-variant cursor-pointer">
                  Recordar mi sesión
                </label>
              </div>

              {error && (
                <p className="text-sm px-4 py-3 rounded-xl bg-error-container text-error font-medium">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 px-6 rounded-xl signature-gradient text-white font-bold text-lg shadow-xl shadow-primary/20 hover:scale-[1.01] active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed disabled:scale-100"
              >
                {loading ? (
                  <Loader2 size={20} className="animate-spin" />
                ) : (
                  <span className="material-symbols-outlined">arrow_forward</span>
                )}
                {loading ? 'Ingresando...' : isEmpresa ? 'Iniciar sesión en el Hub' : 'Ingresar'}
              </button>
            </form>

            {/* Separador OAuth */}
            <div className="mt-10 flex items-center gap-4">
              <div className="flex-1 h-px bg-outline-variant/30" />
              <span className="text-xs font-bold text-outline uppercase tracking-widest">O continuar con</span>
              <div className="flex-1 h-px bg-outline-variant/30" />
            </div>

            {/* Botones OAuth */}
            <div className="mt-3 grid grid-cols-1 gap-2">
              <button
                type="button"
                className="flex items-center justify-center gap-2 py-3 border border-outline-variant/30 rounded-xl hover:bg-surface-container-low transition-all font-semibold text-on-surface text-sm"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                Google
              </button>
            </div>
            <footer className="mt-10 text-center">
              <p className="text-on-surface-variant font-medium">
                ¿Nuevo en Tus Turnos?{' '}
                <Link href="/auth/register" className="text-primary font-bold ml-1 hover:underline decoration-2 underline-offset-4">
                  Crear una cuenta
                </Link>
              </p>
            </footer>
          </div>
        </section>
      </main>
    </div>
  );
}
