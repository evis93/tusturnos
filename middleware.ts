import { NextRequest, NextResponse } from 'next/server';

// En producción: tusturnos.ar
// En local (con /etc/hosts): sobreescribir con TUSTURNOS_DOMAIN=tusturnos.local en .env.local
const TUSTURNOS_DOMAIN = process.env.TUSTURNOS_DOMAIN ?? 'tusturnos.ar';

/**
 * Paths que nunca se reescriben para routing de tenant.
 * Los dashboards autenticados, rutas internas de Next.js y APIs
 * se sirven tal cual incluso en subdominios.
 * /auth NO está aquí — en subdominios se reescribe a /tusturnos/[slug]/auth/...
 */
const BYPASS_PREFIXES = [
  '/_next',
  '/api',
  '/admin',
  '/profesional',
  '/cliente',
  '/tusturnos',
  '/favicon.ico',
  '/robots.txt',
  '/images',
  '/icon.png',
  '/sw.js',
  '/manifest.webmanifest',
  '/cuenta',
];

function shouldBypass(pathname: string): boolean {
  return BYPASS_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(prefix + '/'),
  );
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  // x-original-host lo inyecta el Cloudflare Worker (preserva el subdominio real)
  const hostname = request.headers.get('x-original-host') || request.headers.get('host') || '';
  const cleanHostname = hostname.split(':')[0]; // quitar puerto en dev

  if (shouldBypass(pathname)) return NextResponse.next();

  // ── 1. Subdominio: {slug}.tusturnos.ar ──────────────────────────────
  if (cleanHostname.endsWith(`.${TUSTURNOS_DOMAIN}`)) {
    const slug = cleanHostname.replace(`.${TUSTURNOS_DOMAIN}`, '');
    if (slug === 'www') return NextResponse.next();

    const tenantPath = pathname === '/' ? '/auth/login' : pathname;
    const url = request.nextUrl.clone();
    url.pathname = `/tusturnos/${slug}${tenantPath}`;

    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-tenant-slug', slug);
    requestHeaders.set('x-tenant-source', 'subdomain');

    return NextResponse.rewrite(url, { request: { headers: requestHeaders } });
  }

  // ── 2. URL interna: tusturnos.ar/e/{slug} ───────────────────────────
  if (
    cleanHostname === TUSTURNOS_DOMAIN ||
    cleanHostname === `www.${TUSTURNOS_DOMAIN}`
  ) {
    const match = pathname.match(/^\/e\/([^/]+)(\/.*)?$/);
    if (match) {
      const slug = match[1];
      const rest = match[2] ?? '/auth/login';
      const url = request.nextUrl.clone();
      url.pathname = `/tusturnos/${slug}${rest}`;

      const requestHeaders = new Headers(request.headers);
      requestHeaders.set('x-tenant-slug', slug);
      requestHeaders.set('x-tenant-source', 'path');

      return NextResponse.rewrite(url, { request: { headers: requestHeaders } });
    }
    return NextResponse.next();
  }

  // ── 3. Dominio propio (plan PRO / PRO-WEB) ────────────────────────────
  // No es tusturnos.ar, no es localhost, no es preview de Vercel.
  // La validación del plan ocurre en tenant-server.ts (requiere Supabase).
  const isCustomDomain =
    !cleanHostname.includes(TUSTURNOS_DOMAIN) &&
    !cleanHostname.includes('localhost') &&
    !cleanHostname.endsWith('.vercel.app');

  if (isCustomDomain) {
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-custom-domain', cleanHostname);
    requestHeaders.set('x-tenant-source', 'custom-domain');

    return NextResponse.next({ request: { headers: requestHeaders } });
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
