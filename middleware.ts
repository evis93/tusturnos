// middleware.ts

import { NextRequest, NextResponse } from 'next/server';

const DOMAINS = {
  mensana: process.env.MENSANA_DOMAIN ?? 'mensana.com.ar',
  tusturnos: process.env.TUSTURNOS_DOMAIN ?? 'tusturnos.ar',
};

const BYPASS_PREFIXES = [
  '/_next',
  '/api',
  '/admin',
  '/profesional',
  '/cliente',
  '/tusturnos',
  '/mensana',      // ← agregar
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

type Product = 'mensana' | 'tusturnos';

function detectProduct(hostname: string): { product: Product; slug: string | null } | null {
  for (const [product, domain] of Object.entries(DOMAINS) as [Product, string][]) {
    if (hostname === domain || hostname === `www.${domain}`) {
      return { product, slug: null };
    }
    if (hostname.endsWith(`.${domain}`)) {
      const slug = hostname.replace(`.${domain}`, '');
      if (slug === 'www') return { product, slug: null };
      return { product, slug };
    }
  }
  return null;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hostname =
    request.headers.get('x-original-host') ||
    request.headers.get('host') ||
    '';
  const cleanHostname = hostname.split(':')[0];

  if (shouldBypass(pathname)) return NextResponse.next();

  const detected = detectProduct(cleanHostname);

  // ── 1. Subdominio: {slug}.mensana.com.ar o {slug}.tusturnos.ar ──────
  if (detected?.slug) {
    const { product, slug } = detected;
    const tenantPath = pathname === '/' ? '/auth/login' : pathname;
    const url = request.nextUrl.clone();
    url.pathname = `/${product}/${slug}${tenantPath}`;

    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-tenant-slug', slug);
    requestHeaders.set('x-tenant-product', product);
    requestHeaders.set('x-tenant-source', 'subdomain');

    return NextResponse.rewrite(url, { request: { headers: requestHeaders } });
  }

  // ── 2. URL interna: /e/{slug} en apex de cualquier dominio ──────────
  if (detected && !detected.slug) {
    const { product } = detected;
    const match = pathname.match(/^\/e\/([^/]+)(\/.*)?$/);
    if (match) {
      const slug = match[1];
      const rest = match[2] ?? '/auth/login';
      const url = request.nextUrl.clone();
      url.pathname = `/${product}/${slug}${rest}`;

      const requestHeaders = new Headers(request.headers);
      requestHeaders.set('x-tenant-slug', slug);
      requestHeaders.set('x-tenant-product', product);
      requestHeaders.set('x-tenant-source', 'path');

      return NextResponse.rewrite(url, { request: { headers: requestHeaders } });
    }
    return NextResponse.next();
  }

  // ── 3. Dominio propio (plan PRO) ─────────────────────────────────────
  const isCustomDomain =
    !Object.values(DOMAINS).some((d) => cleanHostname.includes(d)) &&
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