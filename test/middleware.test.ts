/**
 * Tests for middleware.ts — multi-tenancy routing logic
 *
 * Strategy: vi.mock('next/server') replaces NextRequest / NextResponse with
 * minimal stubs that record which method was called and which URL / headers
 * were used, allowing us to assert on the routing decisions without needing
 * the actual Next.js runtime.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// ─── Stubs ────────────────────────────────────────────────────────────────────

/** Tracks the last call made to NextResponse */
const lastCall: {
  method: 'next' | 'rewrite' | null;
  url?: string;
  headers?: Record<string, string>;
} = { method: null };

function captureHeaders(init?: ResponseInit & { request?: { headers?: Headers } }): Record<string, string> {
  const out: Record<string, string> = {};
  if (init?.request?.headers) {
    init.request.headers.forEach((v, k) => { out[k] = v; });
  }
  return out;
}

vi.mock('next/server', () => {
  const NextResponse = {
    next: vi.fn((init?: ResponseInit & { request?: { headers?: Headers } }) => {
      lastCall.method = 'next';
      lastCall.url = undefined;
      lastCall.headers = captureHeaders(init);
      return { type: 'next', headers: lastCall.headers };
    }),
    rewrite: vi.fn((url: URL, init?: ResponseInit & { request?: { headers?: Headers } }) => {
      lastCall.method = 'rewrite';
      lastCall.url = url.pathname + (url.search || '');
      lastCall.headers = captureHeaders(init);
      return { type: 'rewrite', url: lastCall.url, headers: lastCall.headers };
    }),
  };

  /** Minimal NextRequest stub */
  class NextRequest {
    nextUrl: URL;
    headers: Headers;

    constructor(url: string, init?: { headers?: Record<string, string> }) {
      this.nextUrl = new URL(url);
      this.headers = new Headers(init?.headers ?? {});
    }
  }

  return { NextRequest, NextResponse };
});

// ─── Import after mock ────────────────────────────────────────────────────────

import { middleware } from '../middleware';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const DOMAIN = 'mensana.com.ar'; // matches the default MENSANA_DOMAIN

function makeRequest(
  pathname: string,
  host: string,
  extraHeaders: Record<string, string> = {},
): import('next/server').NextRequest {
  const url = `https://${host}${pathname}`;
  return new (require('next/server').NextRequest)(url, {
    headers: { host, ...extraHeaders },
  });
}

beforeEach(() => {
  lastCall.method = null;
  lastCall.url = undefined;
  lastCall.headers = {};
  vi.clearAllMocks();
});

afterEach(() => {
  delete process.env.MENSANA_DOMAIN;
});

// ─── shouldBypass ─────────────────────────────────────────────────────────────

describe('shouldBypass — paths that skip tenant routing', () => {
  const bypassPaths = [
    '/_next/static/chunk.js',
    '/_next/image?url=foo',
    '/api/auth/callback',
    '/api/reservas/nueva',
    '/admin',
    '/admin/dashboard',
    '/profesional',
    '/profesional/agenda',
    '/cliente',
    '/cliente/perfil',
    '/mensana',
    '/mensana/superadmin',
    '/favicon.ico',
    '/robots.txt',
    '/images/logo.png',
    '/icon.png',
    '/sw.js',
    '/manifest.webmanifest',
    '/cuenta',
    '/cuenta/perfil',
  ];

  it.each(bypassPaths)('returns NextResponse.next() for %s', (path) => {
    middleware(makeRequest(path, `empresa.${DOMAIN}`));
    expect(lastCall.method).toBe('next');
    expect(lastCall.url).toBeUndefined();
  });

  it('does NOT bypass path /auth/login (rewritten for subdomain)', () => {
    middleware(makeRequest('/auth/login', `empresa.${DOMAIN}`));
    expect(lastCall.method).toBe('rewrite');
  });

  it('does NOT bypass path / (tenant root)', () => {
    middleware(makeRequest('/', `empresa.${DOMAIN}`));
    expect(lastCall.method).toBe('rewrite');
  });
});

// ─── Subdomain routing ────────────────────────────────────────────────────────

describe('Subdomain routing — {slug}.mensana.com.ar', () => {
  it('rewrites / to /mensana/{slug}/auth/login', () => {
    middleware(makeRequest('/', `clinica-sol.${DOMAIN}`));
    expect(lastCall.method).toBe('rewrite');
    expect(lastCall.url).toBe('/mensana/clinica-sol/auth/login');
  });

  it('rewrites /catalogo to /mensana/{slug}/catalogo', () => {
    middleware(makeRequest('/catalogo', `clinica-sol.${DOMAIN}`));
    expect(lastCall.method).toBe('rewrite');
    expect(lastCall.url).toBe('/mensana/clinica-sol/catalogo');
  });

  it('rewrites /auth/login to /mensana/{slug}/auth/login', () => {
    middleware(makeRequest('/auth/login', `mi-empresa.${DOMAIN}`));
    expect(lastCall.method).toBe('rewrite');
    expect(lastCall.url).toBe('/mensana/mi-empresa/auth/login');
  });

  it('rewrites nested path /auth/callback to /mensana/{slug}/auth/callback', () => {
    middleware(makeRequest('/auth/callback', `mi-empresa.${DOMAIN}`));
    expect(lastCall.method).toBe('rewrite');
    expect(lastCall.url).toBe('/mensana/mi-empresa/auth/callback');
  });

  it('sets x-tenant-slug header to the slug', () => {
    middleware(makeRequest('/catalogo', `yoga-zen.${DOMAIN}`));
    expect(lastCall.headers?.['x-tenant-slug']).toBe('yoga-zen');
  });

  it('sets x-tenant-source header to "subdomain"', () => {
    middleware(makeRequest('/catalogo', `yoga-zen.${DOMAIN}`));
    expect(lastCall.headers?.['x-tenant-source']).toBe('subdomain');
  });

  it('www subdomain is treated as pass-through (NextResponse.next)', () => {
    middleware(makeRequest('/', `www.${DOMAIN}`));
    expect(lastCall.method).toBe('next');
    expect(lastCall.url).toBeUndefined();
  });

  it('reads host from x-original-host header (Cloudflare Worker)', () => {
    const req = makeRequest('/', `${DOMAIN}`, {
      'x-original-host': `peluqueria-style.${DOMAIN}`,
    });
    middleware(req);
    expect(lastCall.method).toBe('rewrite');
    expect(lastCall.url).toBe('/mensana/peluqueria-style/auth/login');
    expect(lastCall.headers?.['x-tenant-slug']).toBe('peluqueria-style');
  });

  it('strips port from host before matching (dev environment)', () => {
    // Simulate empresa.mensana.local:3000 with MENSANA_DOMAIN override
    process.env.MENSANA_DOMAIN = 'mensana.local';
    // Re-import is not needed — MENSANA_DOMAIN is read at module load.
    // Instead we use x-original-host with port to test the port-stripping logic.
    const req = makeRequest('/', `${DOMAIN}:3000`, {
      'x-original-host': `studio-fit.${DOMAIN}:3000`,
    });
    middleware(req);
    // port stripped → studio-fit.mensana.com.ar → subdomain match
    expect(lastCall.method).toBe('rewrite');
    expect(lastCall.headers?.['x-tenant-slug']).toBe('studio-fit');
  });
});

// ─── Path-based routing (/e/{slug}) ──────────────────────────────────────────

describe('Path-based routing — mensana.com.ar/e/{slug}', () => {
  it('rewrites /e/{slug} to /mensana/{slug}/auth/login', () => {
    middleware(makeRequest('/e/mi-spa', DOMAIN));
    expect(lastCall.method).toBe('rewrite');
    expect(lastCall.url).toBe('/mensana/mi-spa/auth/login');
  });

  it('rewrites /e/{slug}/catalogo to /mensana/{slug}/catalogo', () => {
    middleware(makeRequest('/e/mi-spa/catalogo', DOMAIN));
    expect(lastCall.method).toBe('rewrite');
    expect(lastCall.url).toBe('/mensana/mi-spa/catalogo');
  });

  it('rewrites /e/{slug}/auth/login to /mensana/{slug}/auth/login', () => {
    middleware(makeRequest('/e/mi-spa/auth/login', DOMAIN));
    expect(lastCall.method).toBe('rewrite');
    expect(lastCall.url).toBe('/mensana/mi-spa/auth/login');
  });

  it('sets x-tenant-slug header to the slug', () => {
    middleware(makeRequest('/e/salon-aurora', DOMAIN));
    expect(lastCall.headers?.['x-tenant-slug']).toBe('salon-aurora');
  });

  it('sets x-tenant-source header to "path"', () => {
    middleware(makeRequest('/e/salon-aurora', DOMAIN));
    expect(lastCall.headers?.['x-tenant-source']).toBe('path');
  });

  it('works from www.mensana.com.ar/e/{slug} too', () => {
    middleware(makeRequest('/e/centro-yoga', `www.${DOMAIN}`));
    expect(lastCall.method).toBe('rewrite');
    expect(lastCall.url).toBe('/mensana/centro-yoga/auth/login');
    expect(lastCall.headers?.['x-tenant-source']).toBe('path');
  });

  it('non-/e/ path on main domain falls through (NextResponse.next)', () => {
    middleware(makeRequest('/sobre-nosotros', DOMAIN));
    expect(lastCall.method).toBe('next');
    expect(lastCall.url).toBeUndefined();
  });

  it('root path on main domain falls through (NextResponse.next)', () => {
    middleware(makeRequest('/', DOMAIN));
    expect(lastCall.method).toBe('next');
  });
});

// ─── Custom domain (PRO) ──────────────────────────────────────────────────────

describe('Custom domain routing — PRO plan', () => {
  it('calls NextResponse.next() with x-custom-domain header for custom domain', () => {
    middleware(makeRequest('/', 'mi-clinica.com'));
    expect(lastCall.method).toBe('next');
    expect(lastCall.headers?.['x-custom-domain']).toBe('mi-clinica.com');
  });

  it('sets x-tenant-source to "custom-domain"', () => {
    middleware(makeRequest('/', 'spa-beleza.com.ar'));
    expect(lastCall.headers?.['x-tenant-source']).toBe('custom-domain');
  });

  it('handles subdomain of custom domain', () => {
    middleware(makeRequest('/reservas', 'reservas.mi-clinica.net'));
    expect(lastCall.method).toBe('next');
    expect(lastCall.headers?.['x-custom-domain']).toBe('reservas.mi-clinica.net');
  });

  it('does NOT treat .vercel.app preview URLs as custom domain', () => {
    middleware(makeRequest('/', 'mensanaweb-git-dev-team.vercel.app'));
    // .vercel.app → falls through to last NextResponse.next() (no headers set)
    expect(lastCall.method).toBe('next');
    expect(lastCall.headers?.['x-custom-domain']).toBeUndefined();
    expect(lastCall.headers?.['x-tenant-source']).toBeUndefined();
  });

  it('does NOT treat localhost as custom domain', () => {
    middleware(makeRequest('/', 'localhost:3000'));
    expect(lastCall.method).toBe('next');
    expect(lastCall.headers?.['x-custom-domain']).toBeUndefined();
  });

  it('does NOT treat localhost (no port) as custom domain', () => {
    middleware(makeRequest('/', 'localhost'));
    expect(lastCall.method).toBe('next');
    expect(lastCall.headers?.['x-custom-domain']).toBeUndefined();
  });

  it('bypass paths on a custom domain still short-circuit before custom-domain logic', () => {
    middleware(makeRequest('/api/healthz', 'mi-clinica.com'));
    expect(lastCall.method).toBe('next');
    // No custom-domain headers set because bypass fired first
    expect(lastCall.headers?.['x-custom-domain']).toBeUndefined();
  });
});

// ─── Edge / misc cases ────────────────────────────────────────────────────────

describe('Edge cases', () => {
  it('slug with hyphens is preserved exactly', () => {
    middleware(makeRequest('/', `mi-super-spa.${DOMAIN}`));
    expect(lastCall.url).toBe('/mensana/mi-super-spa/auth/login');
  });

  it('slug with numbers is preserved exactly', () => {
    middleware(makeRequest('/', `empresa123.${DOMAIN}`));
    expect(lastCall.url).toBe('/mensana/empresa123/auth/login');
  });

  it('deeply nested path is fully preserved after rewrite', () => {
    middleware(makeRequest('/auth/callback?code=abc', `empresa123.${DOMAIN}`));
    // URL stored by our mock includes search string
    expect(lastCall.url).toMatch(/^\/mensana\/empresa123\/auth\/callback/);
  });

  it('x-original-host takes priority over host header', () => {
    const req = makeRequest('/', `other-host.${DOMAIN}`, {
      'x-original-host': `priority-slug.${DOMAIN}`,
    });
    middleware(req);
    expect(lastCall.headers?.['x-tenant-slug']).toBe('priority-slug');
  });

  it('returns NextResponse.next() on bare mensana.com.ar root', () => {
    middleware(makeRequest('/', DOMAIN));
    expect(lastCall.method).toBe('next');
  });
});
