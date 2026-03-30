import { describe, it, expect } from 'vitest';
import { hasPermission, requirePermission, requireEmpresa, Profile } from '../permissions';

// ─── hasPermission ─────────────────────────────────────────────────────────────

describe('hasPermission', () => {
  // null / undefined / empty rol
  it('returns false when rol is null', () => {
    expect(hasPermission(null, 'agenda:read')).toBe(false);
  });

  it('returns false when rol is undefined', () => {
    expect(hasPermission(undefined, 'agenda:read')).toBe(false);
  });

  it('returns false when rol is empty string', () => {
    expect(hasPermission('', 'agenda:read')).toBe(false);
  });

  // unknown role
  it('returns false for an unrecognized role', () => {
    expect(hasPermission('guest', 'agenda:read')).toBe(false);
  });

  // superadmin wildcard
  it('superadmin has wildcard permission (*)', () => {
    expect(hasPermission('superadmin', 'agenda:read')).toBe(true);
  });

  it('superadmin can access any arbitrary permission', () => {
    expect(hasPermission('superadmin', 'nonexistent:permission')).toBe(true);
  });

  it('superadmin can access admin:dashboard', () => {
    expect(hasPermission('superadmin', 'admin:dashboard')).toBe(true);
  });

  // admin
  it('admin has agenda:read', () => {
    expect(hasPermission('admin', 'agenda:read')).toBe(true);
  });

  it('admin has agenda:write', () => {
    expect(hasPermission('admin', 'agenda:write')).toBe(true);
  });

  it('admin has reservas:read', () => {
    expect(hasPermission('admin', 'reservas:read')).toBe(true);
  });

  it('admin has reservas:write', () => {
    expect(hasPermission('admin', 'reservas:write')).toBe(true);
  });

  it('admin has reportes:read', () => {
    expect(hasPermission('admin', 'reportes:read')).toBe(true);
  });

  it('admin has profesionales:read', () => {
    expect(hasPermission('admin', 'profesionales:read')).toBe(true);
  });

  it('admin has profesionales:write', () => {
    expect(hasPermission('admin', 'profesionales:write')).toBe(true);
  });

  it('admin has horarios:read', () => {
    expect(hasPermission('admin', 'horarios:read')).toBe(true);
  });

  it('admin has horarios:write', () => {
    expect(hasPermission('admin', 'horarios:write')).toBe(true);
  });

  it('admin has consultantes:read', () => {
    expect(hasPermission('admin', 'consultantes:read')).toBe(true);
  });

  it('admin has consultantes:write', () => {
    expect(hasPermission('admin', 'consultantes:write')).toBe(true);
  });

  it('admin has servicios:read', () => {
    expect(hasPermission('admin', 'servicios:read')).toBe(true);
  });

  it('admin has servicios:write', () => {
    expect(hasPermission('admin', 'servicios:write')).toBe(true);
  });

  it('admin has admin:dashboard', () => {
    expect(hasPermission('admin', 'admin:dashboard')).toBe(true);
  });

  it('admin does NOT have explorar:read (cliente-only)', () => {
    expect(hasPermission('admin', 'explorar:read')).toBe(false);
  });

  it('admin does NOT have citas:read (cliente-only)', () => {
    expect(hasPermission('admin', 'citas:read')).toBe(false);
  });

  // profesional
  it('profesional has agenda:read', () => {
    expect(hasPermission('profesional', 'agenda:read')).toBe(true);
  });

  it('profesional has agenda:write', () => {
    expect(hasPermission('profesional', 'agenda:write')).toBe(true);
  });

  it('profesional has reservas:read', () => {
    expect(hasPermission('profesional', 'reservas:read')).toBe(true);
  });

  it('profesional has reservas:write', () => {
    expect(hasPermission('profesional', 'reservas:write')).toBe(true);
  });

  it('profesional has profesionales:read', () => {
    expect(hasPermission('profesional', 'profesionales:read')).toBe(true);
  });

  it('profesional has horarios:read', () => {
    expect(hasPermission('profesional', 'horarios:read')).toBe(true);
  });

  it('profesional has horarios:write', () => {
    expect(hasPermission('profesional', 'horarios:write')).toBe(true);
  });

  it('profesional has consultantes:read', () => {
    expect(hasPermission('profesional', 'consultantes:read')).toBe(true);
  });

  it('profesional has consultantes:write', () => {
    expect(hasPermission('profesional', 'consultantes:write')).toBe(true);
  });

  it('profesional does NOT have reportes:read (admin-only)', () => {
    expect(hasPermission('profesional', 'reportes:read')).toBe(false);
  });

  it('profesional does NOT have profesionales:write (admin-only)', () => {
    expect(hasPermission('profesional', 'profesionales:write')).toBe(false);
  });

  it('profesional HAS servicios:read (puede gestionar sus propios servicios)', () => {
    expect(hasPermission('profesional', 'servicios:read')).toBe(true);
  });

  it('profesional does NOT have admin:dashboard', () => {
    expect(hasPermission('profesional', 'admin:dashboard')).toBe(false);
  });

  it('profesional does NOT have explorar:read (cliente-only)', () => {
    expect(hasPermission('profesional', 'explorar:read')).toBe(false);
  });

  // cliente
  it('cliente has explorar:read', () => {
    expect(hasPermission('cliente', 'explorar:read')).toBe(true);
  });

  it('cliente has favoritos:read', () => {
    expect(hasPermission('cliente', 'favoritos:read')).toBe(true);
  });

  it('cliente has favoritos:write', () => {
    expect(hasPermission('cliente', 'favoritos:write')).toBe(true);
  });

  it('cliente has citas:read', () => {
    expect(hasPermission('cliente', 'citas:read')).toBe(true);
  });

  it('cliente does NOT have agenda:read', () => {
    expect(hasPermission('cliente', 'agenda:read')).toBe(false);
  });

  it('cliente does NOT have reservas:read', () => {
    expect(hasPermission('cliente', 'reservas:read')).toBe(false);
  });

  it('cliente does NOT have admin:dashboard', () => {
    expect(hasPermission('cliente', 'admin:dashboard')).toBe(false);
  });
});

// ─── requirePermission ────────────────────────────────────────────────────────

describe('requirePermission', () => {
  it('returns null when permission is granted', () => {
    const profile: Profile = { rol: 'admin' };
    expect(requirePermission(profile, 'agenda:read')).toBeNull();
  });

  it('returns FORBIDDEN error when permission is denied', () => {
    const profile: Profile = { rol: 'cliente' };
    expect(requirePermission(profile, 'agenda:read')).toEqual({
      success: false,
      error: 'Sin permisos',
      code: 'FORBIDDEN',
    });
  });

  it('returns FORBIDDEN error when profile is null', () => {
    expect(requirePermission(null, 'agenda:read')).toEqual({
      success: false,
      error: 'Sin permisos',
      code: 'FORBIDDEN',
    });
  });

  it('returns FORBIDDEN error when profile has no rol', () => {
    const profile: Profile = {};
    expect(requirePermission(profile, 'agenda:read')).toEqual({
      success: false,
      error: 'Sin permisos',
      code: 'FORBIDDEN',
    });
  });

  it('returns FORBIDDEN error when profile.rol is null', () => {
    const profile: Profile = { rol: null };
    expect(requirePermission(profile, 'agenda:read')).toEqual({
      success: false,
      error: 'Sin permisos',
      code: 'FORBIDDEN',
    });
  });

  it('superadmin always returns null (granted)', () => {
    const profile: Profile = { rol: 'superadmin' };
    expect(requirePermission(profile, 'any:permission')).toBeNull();
  });

  it('profesional gets FORBIDDEN for reportes:read', () => {
    const profile: Profile = { rol: 'profesional' };
    expect(requirePermission(profile, 'reportes:read')).toEqual({
      success: false,
      error: 'Sin permisos',
      code: 'FORBIDDEN',
    });
  });
});

// ─── requireEmpresa ───────────────────────────────────────────────────────────

describe('requireEmpresa', () => {
  it('returns null when empresaId is present', () => {
    const profile: Profile = { empresaId: 'empresa-uuid-123' };
    expect(requireEmpresa(profile)).toBeNull();
  });

  it('returns NO_EMPRESA error when profile is null', () => {
    expect(requireEmpresa(null)).toEqual({
      success: false,
      error: 'Sin empresa asociada',
      code: 'NO_EMPRESA',
    });
  });

  it('returns NO_EMPRESA error when profile has no empresaId', () => {
    const profile: Profile = { rol: 'admin' };
    expect(requireEmpresa(profile)).toEqual({
      success: false,
      error: 'Sin empresa asociada',
      code: 'NO_EMPRESA',
    });
  });

  it('returns NO_EMPRESA error when empresaId is null', () => {
    const profile: Profile = { empresaId: null };
    expect(requireEmpresa(profile)).toEqual({
      success: false,
      error: 'Sin empresa asociada',
      code: 'NO_EMPRESA',
    });
  });

  it('returns NO_EMPRESA error when empresaId is empty string (falsy)', () => {
    const profile: Profile = { empresaId: '' };
    expect(requireEmpresa(profile)).toEqual({
      success: false,
      error: 'Sin empresa asociada',
      code: 'NO_EMPRESA',
    });
  });

  it('returns null for a full profile with empresaId and rol', () => {
    const profile: Profile = {
      rol: 'admin',
      empresaId: 'empresa-uuid-456',
      nombre_completo: 'Ana García',
      email: 'ana@empresa.com',
    };
    expect(requireEmpresa(profile)).toBeNull();
  });
});
