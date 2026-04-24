'use client';

import { ChevronDown } from 'lucide-react';
import { useTheme } from '@/src/context/ThemeContext';

const PAISES = [
  { code: 'AR', prefix: '+54', flag: '🇦🇷' },
  { code: 'ES', prefix: '+34', flag: '🇪🇸' },
  { code: 'MX', prefix: '+52', flag: '🇲🇽' },
  { code: 'CO', prefix: '+57', flag: '🇨🇴' },
  { code: 'CL', prefix: '+56', flag: '🇨🇱' },
  { code: 'US', prefix: '+1',  flag: '🇺🇸' },
];

/** Limpia un string dejando solo dígitos */
function soloDigitos(s: string) {
  return s.replace(/\D/g, '');
}

/**
 * Recibe el valor almacenado (+54XXXXXXXXX) y devuelve prefix y la parte local.
 * Si no reconoce prefijo, asume +54.
 */
function parseTelefono(value: string): { prefix: string; local: string } {
  const digits = value.startsWith('+') ? value.slice(1) : value;
  for (const p of PAISES) {
    const prefixDigits = p.prefix.slice(1); // sin el "+"
    if (digits.startsWith(prefixDigits)) {
      return { prefix: p.prefix, local: digits.slice(prefixDigits.length) };
    }
  }
  return { prefix: '+54', local: soloDigitos(value) };
}

interface Props {
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export default function TelefonoInput({ value, onChange, className }: Props) {
  const { colors } = useTheme();
  const { prefix, local } = parseTelefono(value);

  /** Emite siempre "+{prefixDigits}{localDigits}" */
  const emit = (p: string, l: string) => {
    const digits = soloDigitos(p) + soloDigitos(l);
    onChange(digits ? `+${digits}` : '');
  };

  const handlePrefix = (newPrefix: string) => emit(newPrefix, local);
  const handleLocal  = (newLocal: string)  => emit(prefix,    newLocal);

  const inputStyle = {
    borderColor: colors.border,
    color: colors.text,
    background: 'transparent',
  };

  return (
    <div className={`flex gap-2 ${className ?? ''}`}>
      <div className="relative w-28 shrink-0">
        <select
          value={prefix}
          onChange={e => handlePrefix(e.target.value)}
          className="w-full px-3 py-2.5 rounded-xl border text-sm focus:outline-none appearance-none"
          style={inputStyle}
        >
          {PAISES.map(p => (
            <option key={p.code} value={p.prefix}>
              {p.flag} {p.prefix}
            </option>
          ))}
        </select>
        <ChevronDown
          size={14}
          className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none"
          style={{ color: colors.textSecondary }}
        />
      </div>
      <input
        type="tel"
        value={local}
        onChange={e => handleLocal(e.target.value)}
        placeholder="911 1234-5678"
        className="flex-1 px-3 py-2.5 rounded-xl border text-sm focus:outline-none"
        style={inputStyle}
      />
    </div>
  );
}
