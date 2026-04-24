'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/src/context/AuthContext';
import { Store, User, Mail, Lock, Eye, EyeOff, ArrowRight, Loader2 } from 'lucide-react';

// Colores del diseño
const C = {
  primary: '#005f9d',
  primaryContainer: '#0679c4',
  surface: '#f7f9fb',
  surfaceContainer: '#eceef0',
  surfaceContainerLow: '#f2f4f6',
  surfaceContainerLowest: '#ffffff',
  onSurface: '#191c1e',
  onSurfaceVariant: '#3f4850',
  outline: '#6f7881',
  outlineVariant: '#bec8d2',
  primaryFixedDim: '#9ccaff',
};

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();

  const [tab, setTab] = useState<'empresa' | 'cliente'>('empresa');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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
      return;
    }
    router.replace('/');
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ backgroundColor: C.surface, fontFamily: 'Manrope, sans-serif' }}
    >
      {/* Decoración de fondo */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none" style={{ backgroundColor: C.surface }}>
        <div
          className="absolute rounded-full"
          style={{
            top: '-20%', left: '-10%', width: '60%', height: '60%',
            background: `${C.primary}0d`, filter: 'blur(120px)',
          }}
        />
        <div
          className="absolute rounded-full"
          style={{
            bottom: '10%', right: '5%', width: '40%', height: '40%',
            background: '#00628a0d', filter: 'blur(100px)',
          }}
        />
      </div>

      <main
        className="w-full overflow-hidden"
        style={{
          maxWidth: '72rem',
          display: 'grid',
          gridTemplateColumns: '1fr',
          borderRadius: '2rem',
          backgroundColor: C.surfaceContainerLowest,
          boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
        }}
      >
        <style>{`@media(min-width:1024px){.login-grid{grid-template-columns:5fr 7fr!important}}.panel-left{display:none}@media(min-width:1024px){.panel-left{display:flex!important}}.mobile-header{display:flex}@media(min-width:1024px){.mobile-header{display:none!important}}`}</style>

        <div className="login-grid" style={{ display: 'grid' }}>
          {/* ── Panel izquierdo: branding ────────────────────────────────── */}
          <section
            className="panel-left"
            style={{
              position: 'relative',
              flexDirection: 'column',
              justifyContent: 'space-between',
              padding: '3rem',
              background: `linear-gradient(135deg, ${C.primary} 0%, ${C.primaryContainer} 100%)`,
              color: 'white',
            }}
          >
            <div style={{ position: 'relative', zIndex: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '3rem' }}>
                <span style={{ fontWeight: 800, fontSize: '1.5rem', letterSpacing: '-0.02em' }}>Tus Turnos</span>
              </div>

              <h1 style={{ fontSize: '2.75rem', fontWeight: 700, lineHeight: 1.2, marginBottom: '1.5rem' }}>
                Gestionando el tiempo,{' '}
                <span style={{ opacity: 0.8 }}>perfectamente compuesto.</span>
              </h1>

              <div style={{ marginTop: '3rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                {[
                  {
                    icon: <Store size={20} />,
                    title: 'Para Empresas o Profesionales',
                    desc: 'Accedé a tu Centro Profesional. Panel de control con análisis en tiempo real y programación de personal.',
                  },
                  {
                    icon: <User size={20} />,
                    title: 'Para Clientes',
                    desc: 'Reservá turnos fácilmente con los profesionales de tu confianza, cuando y donde quieras.',
                  },
                ].map(item => (
                  <div key={item.title} style={{ display: 'flex', gap: '1rem' }}>
                    <div style={{
                      width: '3rem', height: '3rem', borderRadius: '0.75rem',
                      background: 'rgba(255,255,255,0.1)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                    }}>
                      {item.icon}
                    </div>
                    <div>
                      <h3 style={{ fontWeight: 700, fontSize: '1.1rem' }}>{item.title}</h3>
                      <p style={{ color: 'rgba(219,234,254,0.8)', fontSize: '0.875rem', lineHeight: 1.6 }}>{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Decoración */}
            <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none', opacity: 0.2 }}>
              <div style={{ position: 'absolute', bottom: '-5rem', right: '-5rem', width: '24rem', height: '24rem', borderRadius: '9999px', border: '40px solid rgba(255,255,255,0.2)' }} />
              <div style={{ position: 'absolute', top: '10rem', left: '-5rem', width: '16rem', height: '16rem', borderRadius: '9999px', border: '20px solid rgba(255,255,255,0.1)' }} />
            </div>

            <div style={{ position: 'relative', zIndex: 10, paddingTop: '3rem', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
              <p style={{ fontSize: '0.75rem', fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase', opacity: 0.6 }}>
                Sistema de gestión de turnos
              </p>
            </div>
          </section>

          {/* ── Panel derecho: formulario ────────────────────────────────── */}
          <section style={{
            backgroundColor: C.surfaceContainerLowest,
            padding: '2rem',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
          }}
            className="md:p-16"
          >
            {/* Header móvil */}
            <div className="mobile-header" style={{ alignItems: 'center', gap: '0.75rem', marginBottom: '3rem' }}>
              <span style={{ fontWeight: 800, fontSize: '1.25rem', color: C.primary, letterSpacing: '-0.02em' }}>Tus Turnos</span>
            </div>

            <div style={{ maxWidth: '28rem', margin: '0 auto', width: '100%' }}>
              <header style={{ marginBottom: '2.5rem', textAlign: 'left' }}>
                <h2 style={{ fontSize: '1.875rem', fontWeight: 700, color: C.onSurface, marginBottom: '0.75rem' }}>
                  Bienvenido de nuevo
                </h2>
                <p style={{ color: C.onSurfaceVariant, fontWeight: 500 }}>
                  Por favor, seleccioná tu tipo de cuenta para continuar.
                </p>
              </header>

              {/* Tabs Empresa / Cliente */}
              <div style={{
                display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem',
                marginBottom: '2.5rem', backgroundColor: C.surfaceContainerLow,
                padding: '0.375rem', borderRadius: '1rem',
              }}>
                {(['empresa', 'cliente'] as const).map(t => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setTab(t)}
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                      padding: '0.875rem 1rem', borderRadius: '0.75rem', fontWeight: 600,
                      transition: 'all 0.3s',
                      ...(tab === t
                        ? { background: `linear-gradient(135deg, ${C.primary} 0%, ${C.primaryContainer} 100%)`, color: 'white', boxShadow: '0 4px 12px rgba(0,95,157,0.3)', transform: 'scale(1.02)' }
                        : { background: 'transparent', color: C.onSurfaceVariant }),
                    }}
                  >
                    {t === 'empresa' ? <Store size={20} /> : <User size={20} />}
                    {t === 'empresa' ? 'Empresa' : 'Cliente'}
                  </button>
                ))}
              </div>

              {/* Formulario */}
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {/* Email */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <label htmlFor="email" style={{ fontSize: '0.875rem', fontWeight: 600, color: C.onSurfaceVariant, marginLeft: '0.25rem' }}>
                    Correo electrónico
                  </label>
                  <div style={{ position: 'relative' }}>
                    <div style={{ position: 'absolute', inset: '0 auto 0 0', paddingLeft: '1rem', display: 'flex', alignItems: 'center', pointerEvents: 'none' }}>
                      <Mail size={20} color={C.outline} />
                    </div>
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="nombre@empresa.com"
                      autoComplete="email"
                      style={{
                        width: '100%', paddingLeft: '3rem', paddingRight: '1rem', paddingTop: '1rem', paddingBottom: '1rem',
                        backgroundColor: C.surfaceContainerLow, border: 'none', borderRadius: '0.75rem',
                        outline: 'none', fontFamily: 'inherit', fontSize: '0.95rem', fontWeight: 500,
                        color: C.onSurface, boxSizing: 'border-box',
                      }}
                      onFocus={e => { e.currentTarget.style.boxShadow = `0 0 0 2px ${C.primaryFixedDim}`; e.currentTarget.style.backgroundColor = C.surfaceContainerLowest; }}
                      onBlur={e => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.backgroundColor = C.surfaceContainerLow; }}
                    />
                  </div>
                </div>

                {/* Contraseña */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginLeft: '0.25rem' }}>
                    <label htmlFor="password" style={{ fontSize: '0.875rem', fontWeight: 600, color: C.onSurfaceVariant }}>
                      Contraseña
                    </label>
                    <Link href="/auth/recuperar-contrasena" style={{ fontSize: '0.875rem', fontWeight: 700, color: C.primary, textDecoration: 'none' }}>
                      ¿Olvidaste tu contraseña?
                    </Link>
                  </div>
                  <div style={{ position: 'relative' }}>
                    <div style={{ position: 'absolute', inset: '0 auto 0 0', paddingLeft: '1rem', display: 'flex', alignItems: 'center', pointerEvents: 'none' }}>
                      <Lock size={20} color={C.outline} />
                    </div>
                    <input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="••••••••"
                      autoComplete="current-password"
                      style={{
                        width: '100%', paddingLeft: '3rem', paddingRight: '3rem', paddingTop: '1rem', paddingBottom: '1rem',
                        backgroundColor: C.surfaceContainerLow, border: 'none', borderRadius: '0.75rem',
                        outline: 'none', fontFamily: 'inherit', fontSize: '0.95rem', fontWeight: 500,
                        color: C.onSurface, boxSizing: 'border-box',
                      }}
                      onFocus={e => { e.currentTarget.style.boxShadow = `0 0 0 2px ${C.primaryFixedDim}`; e.currentTarget.style.backgroundColor = C.surfaceContainerLowest; }}
                      onBlur={e => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.backgroundColor = C.surfaceContainerLow; }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      style={{ position: 'absolute', inset: '0 0 0 auto', paddingRight: '1rem', display: 'flex', alignItems: 'center', color: C.outlineVariant, background: 'none', border: 'none', cursor: 'pointer' }}
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>

                {/* Recordarme */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.5rem 0' }}>
                  <input
                    id="remember"
                    type="checkbox"
                    checked={remember}
                    onChange={e => setRemember(e.target.checked)}
                    style={{ width: '1.25rem', height: '1.25rem', borderRadius: '0.25rem', accentColor: C.primary, cursor: 'pointer' }}
                  />
                  <label htmlFor="remember" style={{ fontSize: '0.875rem', fontWeight: 500, color: C.onSurfaceVariant, cursor: 'pointer' }}>
                    Mantener sesión iniciada por 30 días
                  </label>
                </div>

                {/* Error */}
                {error && (
                  <p style={{ fontSize: '0.875rem', padding: '0.75rem', borderRadius: '0.75rem', color: '#ba1a1a', backgroundColor: '#ffdad6' }}>
                    {error}
                  </p>
                )}

                {/* Botón submit */}
                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    width: '100%', padding: '1rem 1.5rem', borderRadius: '0.75rem',
                    background: `linear-gradient(135deg, ${C.primary} 0%, ${C.primaryContainer} 100%)`,
                    color: 'white', fontWeight: 700, fontSize: '1.1rem',
                    border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                    boxShadow: '0 8px 24px rgba(0,95,157,0.2)',
                    opacity: loading ? 0.7 : 1,
                    transition: 'transform 0.15s, opacity 0.15s',
                  }}
                  onMouseEnter={e => { if (!loading) e.currentTarget.style.transform = 'scale(1.01)'; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; }}
                >
                  {loading ? <Loader2 size={20} className="animate-spin" /> : null}
                  {loading ? 'Ingresando...' : 'Iniciar sesión'}
                  {!loading && <ArrowRight size={20} />}
                </button>
              </form>

              {/* Divider */}
              <div style={{ marginTop: '2.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ flex: 1, height: '1px', backgroundColor: `${C.outlineVariant}4d` }} />
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: C.outline, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                  o continuar con
                </span>
                <div style={{ flex: 1, height: '1px', backgroundColor: `${C.outlineVariant}4d` }} />
              </div>

              {/* Social buttons */}
              <div style={{ marginTop: '1rem', display: 'grid', gridTemplateColumns: '1fr', gap: '1rem', justifyContent: 'center' }}>
                {[
                  { label: 'Google', icon: 'https://www.google.com/favicon.ico' },
                ].map(s => (
                  <button
                    key={s.label}
                    type="button"
                    style={{
                      marginTop: '2rem', display: 'grid', gap: '1rem',
                      justifyItems: 'center',padding: '0.75rem', border: `1px solid ${C.outlineVariant}33`,
                      borderRadius: '0.75rem', fontWeight: 600, color: C.onSurface,
                      background: 'white', cursor: 'pointer', transition: 'background 0.2s',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.backgroundColor = C.surfaceContainerLow; }}
                    onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'white'; }}
                  >
                    <img src={s.icon} alt={s.label} style={{ width: '1.25rem', height: '1.25rem' }} />
                    {s.label}
                  </button>
                ))}
              </div>

              {/* Footer */}
              <footer style={{ marginTop: '3rem', textAlign: 'center' }}>
                <p style={{ color: C.onSurfaceVariant, fontWeight: 500 }}>
                  ¿Nuevo en Tus Turnos?{' '}
                  <Link
                    href="/auth/register"
                    style={{ color: C.primary, fontWeight: 700, marginLeft: '0.25rem', textDecoration: 'none' }}
                  >
                    Crear una cuenta
                  </Link>
                </p>
              </footer>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
