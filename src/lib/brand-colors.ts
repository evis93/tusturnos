/**
 * brand-colors.ts
 * Define colors for each brand (fallback and superadmin colors)
 * Empresa colors come from database, these are defaults and superadmin theme
 */

export type BrandType = 'mensana' | 'tusturnos';

export interface BrandColors {
  primary: string;
  secondary: string;
  background: string;
  logo?: string;
}

/** Default colors per brand (fallback if empresa has no custom colors) */
export const BRAND_DEFAULTS: Record<BrandType, BrandColors> = {
  mensana: {
    primary: '#3498db',
    secondary: '#00d2ff',
    background: '#f8fbff',
    logo: '/images/logoMensana.png',
  },
  tusturnos: {
    primary: '#005f9d',
    secondary: '#0679c4',
    background: '#f7f9fb',
    logo: '/images/logoturnos.png',
  },
};

/** Corporate colors for NRC (Superadmin) - easily customizable */
export const SUPERADMIN_COLORS: BrandColors = {
  primary: '#1f2937',      // Dark gray
  secondary: '#3b82f6',    // Blue
  background: '#f3f4f6',   // Light gray
};

export function getBrandColors(brand: BrandType): BrandColors {
  return BRAND_DEFAULTS[brand];
}

export function getSuperadminColors(): BrandColors {
  return SUPERADMIN_COLORS;
}
