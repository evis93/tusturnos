/**
 * brand-utils.ts
 * Utilidades para manejar múltiples brands (mensana, tusturnos)
 * Los colores de cada subdominios vienen de la tabla empresas.
 */

export type BrandType = 'mensana' | 'tusturnos';

/**
 * Colores por defecto de cada brand (fallback si no hay colores en empresas)
 * Mensana y TusTurnos comparten estilos similares pero diferentes homes.
 */
export const BRAND_DEFAULTS: Record<BrandType, { primary: string; secondary: string; background: string; logo: string }> = {
  mensana: {
    primary: '#3498db',
    secondary: '#00d2ff',
    background: '#f8fbff',
    logo: '/logos/logoMensana.png',
  },
  tusturnos: {
    primary: '#005f9d',
    secondary: '#0679c4',
    background: '#f7f9fb',
    logo: '/logos/logoturnos.png',
  },
};

/**
 * Valida si un string es un brand válido
 */
export function isValidBrand(value: any): value is BrandType {
  return ['mensana', 'tusturnos'].includes(value);
}

/**
 * Tipo guard para Mensana
 */
export function isMensanaBrand(brand: string): brand is 'mensana' {
  return brand === 'mensana';
}

/**
 * Tipo guard para TusTurnos
 */
export function isTusTurnosBrand(brand: string): brand is 'tusturnos' {
  return brand === 'tusturnos';
}

/**
 * Retorna la ruta post-login basada en brand, subdominio y rol
 */
export function getPostLoginRoute(
  brand: BrandType,
  subdominio: string,
  userRol: 'admin' | 'superadmin' | 'profesional' | 'cliente',
): string {
  const basePath = `/${brand}/${subdominio}`;

  switch (userRol) {
    case 'admin':
    case 'superadmin':
      return `${basePath}/admin`;
    case 'profesional':
      return `${basePath}/profesional`;
    case 'cliente':
    default:
      return `${basePath}/cliente`;
  }
}

/**
 * Construye la URL de login para un brand/subdominio
 */
export function getLoginPath(brand: BrandType, subdominio: string, tab?: 'empresa' | 'cliente'): string {
  const path = `/${brand}/${subdominio}/auth/login`;
  return tab ? `${path}?tab=${tab}` : path;
}

/**
 * Extrae brand y subdominio de los parámetros de la ruta
 */
export function extractBrandAndSubdominio(
  params: Record<string, string | string[]>,
): { brand: BrandType; subdominio: string } | null {
  const brand = Array.isArray(params.brand) ? params.brand[0] : params.brand;
  const subdominio = Array.isArray(params.subdominio) ? params.subdominio[0] : params.subdominio;

  if (!brand || !subdominio || !isValidBrand(brand)) {
    return null;
  }

  return { brand, subdominio };
}

/**
 * Determina si un brand tiene home pública
 * Mensana: sí (landing page completa)
 * TusTurnos: no (va directo a login)
 */
export function hasBrandHomePage(brand: BrandType): boolean {
  return brand === 'mensana';
}
