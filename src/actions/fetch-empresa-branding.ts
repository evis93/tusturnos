'use server';

import { findBySlug } from '@/src/repositories/EmpresaRepository';

export interface EmpresaBranding {
  colorPrimario: string;
  colorSecundario: string;
  colorBackground: string;
  logoUrl: string;
}

export async function fetchEmpresaBranding(slug: string): Promise<EmpresaBranding | null> {
  try {
    const empresa = await findBySlug(slug);

    if (!empresa) {
      console.warn('[fetchEmpresaBranding] No empresa found for slug:', slug);
      return null;
    }

    return {
      colorPrimario: empresa.color_primary,
      colorSecundario: empresa.color_secondary,
      colorBackground: empresa.color_background,
      logoUrl: empresa.logo_url,
    };
  } catch (error: any) {
    console.error('[fetchEmpresaBranding] Error:', error.message);
    return null;
  }
}
