'use client';

import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '@/src/context/AuthContext';
import { useTheme } from '@/src/context/ThemeContext';
import { supabase } from '@/src/config/supabase';
import { Download, Copy, Check, MessageCircle, Camera, Facebook, Mail, ChevronRight, X, Building2 } from 'lucide-react';

const SIZES = [
  { label: 'Pequeño', key: 'sm', px: 150, desc: 'Tarjeta / sticker' },
  { label: 'Mediano', key: 'md', px: 200, desc: 'Digital / redes' },
  { label: 'Grande',  key: 'lg', px: 300, desc: 'Cartel / impresión' },
];

function Toggle({ value, onChange }: { value: boolean; onChange: () => void }) {
  return (
    <button
      onClick={onChange}
      className="relative inline-flex h-6 w-11 rounded-full transition-colors flex-shrink-0"
      style={{ background: value ? 'var(--primary)' : '#d1d5db' }}
    >
      <span
        className="inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform mt-0.5"
        style={{ transform: value ? 'translateX(22px)' : 'translateX(2px)' }}
      />
    </button>
  );
}

export default function QRPage() {
  const { profile } = useAuth();
  const { colors, logoUrl } = useTheme();
  const primaryColor = profile?.colorPrimario || primaryColor;

  const [selectedSize, setSelectedSize] = useState('md');
  const [withLogo, setWithLogo] = useState(true);
  const [copied, setCopied] = useState(false);
  const [qrKey, setQrKey] = useState(0);

  const [modalRedes, setModalRedes] = useState(false);
  const [fbUrl, setFbUrl] = useState('');
  const [igUrl, setIgUrl] = useState('');
  const [emailContacto, setEmailContacto] = useState('');
  const [savingRedes, setSavingRedes] = useState(false);
  const [empresaSlug, setEmpresaSlug] = useState<string | null>(null);

  const empresaId = profile?.empresaId ?? 'mi-empresa';
  const empresaNombre = (profile as any)?.empresaNombre ?? 'Tu espacio';
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://tusturnos.ar';
  const deepLink = empresaSlug ? `${baseUrl}/e/${empresaSlug}` : baseUrl;
  const size = SIZES.find(s => s.key === selectedSize) || SIZES[1];
  const qrHex = primaryColor.replace('#', '');
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${size.px}x${size.px}&data=${encodeURIComponent(deepLink)}&bgcolor=ffffff&color=${qrHex}&margin=12`;

  useEffect(() => {
    if (!profile?.empresaId) return;
    supabase
      .from('empresas')
      .select('slug, facebook_url, instagram_url, email_contacto')
      .eq('id', profile.empresaId)
      .single()
      .then(({ data }) => {
        if (data) {
          setEmpresaSlug((data as any).slug || null);
          setFbUrl(data.facebook_url || '');
          setIgUrl(data.instagram_url || '');
          setEmailContacto(data.email_contacto || '');
        }
      });
  }, [profile?.empresaId]);

  const changeSize = (key: string) => {
    setSelectedSize(key);
    setQrKey(k => k + 1);
  };

  const handleCopy = useCallback(async () => {
    await navigator.clipboard.writeText(deepLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  }, [deepLink]);

  const handleDownload = useCallback(() => {
    const url = `https://api.qrserver.com/v1/create-qr-code/?size=600x600&data=${encodeURIComponent(deepLink)}&bgcolor=ffffff&color=${qrHex}&margin=20`;
    const a = document.createElement('a');
    a.href = url;
    a.download = `qr-${empresaId}.png`;
    a.target = '_blank';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }, [deepLink, qrHex, empresaId]);

  const handleWhatsApp = useCallback(() => {
    const mensaje = `¡Reservá en ${empresaNombre}! 📅\nEscaneá el código QR o ingresá en:\n${deepLink}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(mensaje)}`, '_blank');
  }, [deepLink, empresaNombre]);

  const handleGuardarRedes = useCallback(async () => {
    if (!profile?.empresaId) return;
    setSavingRedes(true);
    await supabase
      .from('empresas')
      .update({
        facebook_url: fbUrl.trim() || null,
        instagram_url: igUrl.trim() || null,
        email_contacto: emailContacto.trim() || null,
      })
      .eq('id', profile.empresaId);
    setSavingRedes(false);
    setModalRedes(false);
  }, [fbUrl, igUrl, emailContacto, profile?.empresaId]);

  const tieneRedes = fbUrl || igUrl || emailContacto;

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6" style={{ color: colors.text }}>Código QR</h1>

      {/* QR Card */}
      <div className="bg-white rounded-2xl border p-6 mb-4 flex flex-col items-center" style={{ borderColor: colors.border }}>
        <div className="relative mb-3 p-3 bg-white rounded-2xl shadow-md">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            key={qrKey}
            src={qrUrl}
            alt="QR de reserva"
            width={size.px}
            height={size.px}
            className="rounded-lg block"
          />
          {withLogo && (
            <div
              className="absolute flex items-center justify-center bg-white rounded-lg shadow"
              style={{
                width: 40, height: 40,
                top: '50%', left: '50%',
                transform: 'translate(-50%, -50%)',
              }}
            >
              {logoUrl
                ? <img src={logoUrl} alt="logo" className="w-8 h-8 object-contain rounded" />
                : <Building2 size={22} style={{ color: primaryColor }} />
              }
            </div>
          )}
        </div>
        <p className="font-bold text-sm mt-1" style={{ color: colors.text }}>{empresaNombre}</p>
        <p className="text-xs mt-0.5" style={{ color: colors.textMuted }}>{size.px}×{size.px}px · {size.desc}</p>
      </div>

      {/* Selector de tamaño */}
      <div className="bg-white rounded-2xl border p-4 mb-4" style={{ borderColor: colors.border }}>
        <p className="text-sm font-bold mb-3" style={{ color: colors.text }}>Tamaño</p>
        <div className="flex gap-2">
          {SIZES.map(s => {
            const active = selectedSize === s.key;
            return (
              <button
                key={s.key}
                onClick={() => changeSize(s.key)}
                className="flex-1 py-2.5 rounded-xl border-2 text-center transition"
                style={{
                  borderColor: active ? primaryColor : colors.borderLight,
                  background: active ? primaryColorFaded : 'transparent',
                }}
              >
                <p className="text-sm font-bold" style={{ color: active ? primaryColor : colors.textMuted }}>{s.label}</p>
                <p className="text-xs mt-0.5" style={{ color: colors.textMuted }}>{s.desc}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Logo toggle */}
      <div className="bg-white rounded-2xl border p-4 mb-4 flex items-center justify-between" style={{ borderColor: colors.border }}>
        <div>
          <p className="text-sm font-semibold" style={{ color: colors.text }}>Logo superpuesto</p>
          <p className="text-xs mt-0.5" style={{ color: colors.textMuted }}>Muestra tu logo en el centro del QR</p>
        </div>
        <button
          onClick={() => setWithLogo(v => !v)}
          className="relative inline-flex h-6 w-11 rounded-full transition-colors flex-shrink-0"
          style={{ background: withLogo ? primaryColor : '#d1d5db' }}
        >
          <span
            className="inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform mt-0.5"
            style={{ transform: withLogo ? 'translateX(22px)' : 'translateX(2px)' }}
          />
        </button>
      </div>

      {/* Acciones */}
      <div className="space-y-2 mb-4">
        {/* Copiar link */}
        <button
          onClick={handleCopy}
          className="w-full bg-white rounded-xl border p-4 flex items-center gap-3 text-left hover:bg-gray-50 transition"
          style={{ borderColor: colors.border }}
        >
          <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: primaryColorFaded }}>
            {copied ? <Check size={18} style={{ color: primaryColor }} /> : <Copy size={18} style={{ color: primaryColor }} />}
          </div>
          <div className="flex-1">
            <p className="text-sm font-bold" style={{ color: colors.text }}>{copied ? '¡Copiado!' : 'Copiar link de reserva'}</p>
            <p className="text-xs mt-0.5 truncate" style={{ color: colors.textMuted }}>{deepLink}</p>
          </div>
        </button>

        {/* Descargar */}
        <button
          onClick={handleDownload}
          className="w-full rounded-xl p-4 flex items-center gap-3 text-white font-bold text-sm"
          style={{ background: primaryColor }}
        >
          <Download size={18} />
          Descargar QR en alta resolución
        </button>

        {/* WhatsApp */}
        <button
          onClick={handleWhatsApp}
          className="w-full bg-white rounded-xl border p-4 flex items-center gap-3 hover:bg-gray-50 transition"
          style={{ borderColor: colors.border }}
        >
          <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center flex-shrink-0">
            <MessageCircle size={20} className="text-green-600" />
          </div>
          <div className="flex-1 text-left">
            <p className="text-sm font-bold" style={{ color: colors.text }}>Mandalo por WhatsApp</p>
            <p className="text-xs mt-0.5" style={{ color: colors.textMuted }}>Abre WhatsApp con el link listo para enviar</p>
          </div>
          <ChevronRight size={16} style={{ color: colors.textMuted }} />
        </button>

        {/* Redes sociales */}
        <button
          onClick={() => setModalRedes(true)}
          className="w-full bg-white rounded-xl border p-4 flex items-center gap-3 hover:bg-gray-50 transition"
          style={{ borderColor: colors.border }}
        >
          <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: primaryColorFaded }}>
            <Camera size={20} style={{ color: primaryColor }} />
          </div>
          <div className="flex-1 text-left">
            <p className="text-sm font-bold" style={{ color: colors.text }}>Redes sociales</p>
            <p className="text-xs mt-0.5" style={{ color: colors.textMuted }}>
              {tieneRedes
                ? [fbUrl && 'Facebook', igUrl && 'Instagram', emailContacto && 'Email'].filter(Boolean).join(' · ')
                : 'Configurar Facebook, Instagram y Email'}
            </p>
          </div>
          <ChevronRight size={16} style={{ color: colors.textMuted }} />
        </button>
      </div>

      <p className="text-center text-xs italic" style={{ color: colors.textMuted }}>
        El QR lleva al espacio exclusivo de tu empresa — tus clientes solo verán tu branding.
      </p>

      {/* Modal Redes Sociales */}
      {modalRedes && (
        <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm p-6">
            <div className="flex items-center justify-between mb-1">
              <h2 className="text-lg font-extrabold" style={{ color: colors.text }}>Redes sociales</h2>
              <button onClick={() => setModalRedes(false)}><X size={20} className="text-gray-400" /></button>
            </div>
            <p className="text-sm mb-5" style={{ color: colors.textMuted }}>Estos datos aparecen en tu perfil público</p>

            <label className="block text-xs font-bold uppercase tracking-wide mb-1.5" style={{ color: colors.textMuted }}>Facebook</label>
            <div className="flex items-center border rounded-xl px-3 mb-4" style={{ borderColor: colors.borderLight }}>
              <Facebook size={18} className="text-blue-600 mr-2 flex-shrink-0" />
              <input
                value={fbUrl}
                onChange={e => setFbUrl(e.target.value)}
                placeholder="facebook.com/tu-pagina"
                className="flex-1 py-3 text-sm focus:outline-none"
                style={{ color: colors.text }}
              />
            </div>

            <label className="block text-xs font-bold uppercase tracking-wide mb-1.5" style={{ color: colors.textMuted }}>Instagram</label>
            <div className="flex items-center border rounded-xl px-3 mb-4" style={{ borderColor: colors.borderLight }}>
              <Camera size={18} className="text-pink-500 mr-2 flex-shrink-0" />
              <input
                value={igUrl}
                onChange={e => setIgUrl(e.target.value)}
                placeholder="@tu-usuario o instagram.com/..."
                className="flex-1 py-3 text-sm focus:outline-none"
                style={{ color: colors.text }}
              />
            </div>

            <label className="block text-xs font-bold uppercase tracking-wide mb-1.5" style={{ color: colors.textMuted }}>Email de contacto</label>
            <div className="flex items-center border rounded-xl px-3 mb-6" style={{ borderColor: colors.borderLight }}>
              <Mail size={18} className="mr-2 flex-shrink-0" style={{ color: primaryColor }} />
              <input
                value={emailContacto}
                onChange={e => setEmailContacto(e.target.value)}
                type="email"
                placeholder="contacto@tu-empresa.com"
                className="flex-1 py-3 text-sm focus:outline-none"
                style={{ color: colors.text }}
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setModalRedes(false)}
                className="flex-1 py-3 rounded-xl border text-sm font-semibold"
                style={{ borderColor: colors.borderLight, color: colors.textMuted }}
              >
                Cancelar
              </button>
              <button
                onClick={handleGuardarRedes}
                disabled={savingRedes}
                className="flex-[2] py-3 rounded-xl text-sm font-bold text-white disabled:opacity-60"
                style={{ background: primaryColor }}
              >
                {savingRedes ? 'Guardando...' : 'Guardar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
