// @vitest-environment jsdom
/**
 * Tests for usePostLoginRouter
 *
 * Cubre las 5 reglas de routing post-login:
 *   1. Superadmin → /seleccionar-empresa
 *   2. Tiene TusTurnos (1 empresa) → ruta por rol
 *   3. TusTurnos + Mensana → TusTurnos tiene prioridad
 *   4. Solo 1 Mensana → ruta por rol de esa empresa
 *   5. Múltiples Mensana sin TusTurnos → /seleccionar-empresa
 *
 * También cubre las funciones puras (vía comportamiento del hook):
 *   - rutaPorRol: admin→/admin, profesional→/profesional/agenda, cliente→/cliente
 *   - mejorEmpresa: elige la empresa con mayor ROL_PRIORIDAD
 */

import { renderHook } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import type { UserEmpresa } from '../useUserEmpresas';

// ─── Mocks ────────────────────────────────────────────────────────────────────

const mockReplace = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace: mockReplace }),
}));

// AuthContext mock — valores inyectables por test
let mockAuthState: {
  profile: any;
  loading: boolean;
  setActiveEmpresa: ReturnType<typeof vi.fn>;
} = {
  profile: null,
  loading: false,
  setActiveEmpresa: vi.fn(),
};

vi.mock('../../context/AuthContext', () => ({
  useAuth: () => mockAuthState,
}));

// useUserEmpresas mock — valores inyectables por test
let mockEmpresasState: {
  empresas: UserEmpresa[];
  loading: boolean;
} = {
  empresas: [],
  loading: false,
};

vi.mock('../useUserEmpresas', () => ({
  useUserEmpresas: () => mockEmpresasState,
}));

// ─── Helpers ──────────────────────────────────────────────────────────────────

function makeProfile(overrides: Record<string, any> = {}) {
  return {
    usuarioId: 'user-1',
    authUserId: 'auth-1',
    nombre_completo: 'Test User',
    email: 'test@test.com',
    rol: 'admin',
    empresaId: 'empresa-1',
    empresaNombre: 'Empresa A',
    profesionalId: null,
    esAdmin: false,
    esProfesional: false,
    esCliente: false,
    esMensana: false,
    colorPrimario: null,
    colorSecundario: null,
    colorBackground: null,
    logoUrl: null,
    ...overrides,
  };
}

function makeEmpresa(overrides: Partial<UserEmpresa> = {}): UserEmpresa {
  return {
    empresaId: 'empresa-1',
    empresaNombre: 'Empresa A',
    logoUrl: null,
    colorPrimario: null,
    colorSecundario: null,
    colorBackground: null,
    rol: 'admin',
    appType: 'mensana',
    ...overrides,
  };
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('usePostLoginRouter', () => {
  beforeEach(() => {
    mockReplace.mockClear();
    mockAuthState.setActiveEmpresa = vi.fn();
  });

  // ── Estado de carga ──────────────────────────────────────────────────────

  it('no hace nada mientras authLoading es true', async () => {
    mockAuthState = { profile: makeProfile(), loading: true, setActiveEmpresa: vi.fn() };
    mockEmpresasState = { empresas: [makeEmpresa()], loading: false };

    const { usePostLoginRouter } = await import('../usePostLoginRouter');
    renderHook(() => usePostLoginRouter());

    expect(mockReplace).not.toHaveBeenCalled();
  });

  it('no hace nada cuando profile es null', async () => {
    mockAuthState = { profile: null, loading: false, setActiveEmpresa: vi.fn() };
    mockEmpresasState = { empresas: [makeEmpresa()], loading: false };

    const { usePostLoginRouter } = await import('../usePostLoginRouter');
    renderHook(() => usePostLoginRouter());

    expect(mockReplace).not.toHaveBeenCalled();
  });

  it('no hace nada mientras empresasLoading es true', async () => {
    mockAuthState = { profile: makeProfile(), loading: false, setActiveEmpresa: vi.fn() };
    mockEmpresasState = { empresas: [], loading: true };

    const { usePostLoginRouter } = await import('../usePostLoginRouter');
    renderHook(() => usePostLoginRouter());

    expect(mockReplace).not.toHaveBeenCalled();
  });

  it('no hace nada cuando empresas está vacío', async () => {
    mockAuthState = { profile: makeProfile(), loading: false, setActiveEmpresa: vi.fn() };
    mockEmpresasState = { empresas: [], loading: false };

    const { usePostLoginRouter } = await import('../usePostLoginRouter');
    renderHook(() => usePostLoginRouter());

    expect(mockReplace).not.toHaveBeenCalled();
  });

  // ── Regla 1: Superadmin ──────────────────────────────────────────────────

  it('Regla 1: superadmin → /seleccionar-empresa', async () => {
    mockAuthState = {
      profile: makeProfile({ rol: 'superadmin', empresaId: 'empresa-1' }),
      loading: false,
      setActiveEmpresa: vi.fn(),
    };
    mockEmpresasState = {
      empresas: [makeEmpresa({ rol: 'superadmin', appType: 'mensana' })],
      loading: false,
    };

    const { usePostLoginRouter } = await import('../usePostLoginRouter');
    renderHook(() => usePostLoginRouter());

    expect(mockReplace).toHaveBeenCalledWith('/seleccionar-empresa');
  });

  // ── Regla 2: TusTurnos (única empresa TusTurnos) ─────────────────────────

  it('Regla 2: única empresa TusTurnos con rol admin → /admin', async () => {
    const setActiveEmpresa = vi.fn();
    mockAuthState = {
      profile: makeProfile({ rol: 'profesional', empresaId: 'otro-empresa' }),
      loading: false,
      setActiveEmpresa,
    };
    mockEmpresasState = {
      empresas: [makeEmpresa({ empresaId: 'tt-1', rol: 'admin', appType: 'tusturnos' })],
      loading: false,
    };

    const { usePostLoginRouter } = await import('../usePostLoginRouter');
    renderHook(() => usePostLoginRouter());

    expect(mockReplace).toHaveBeenCalledWith('/admin');
    expect(setActiveEmpresa).toHaveBeenCalledWith(expect.objectContaining({ empresaId: 'tt-1', rol: 'admin' }));
  });

  it('Regla 2: única empresa TusTurnos con rol profesional → /profesional/agenda', async () => {
    const setActiveEmpresa = vi.fn();
    mockAuthState = {
      profile: makeProfile({ rol: 'cliente', empresaId: 'otro' }),
      loading: false,
      setActiveEmpresa,
    };
    mockEmpresasState = {
      empresas: [makeEmpresa({ empresaId: 'tt-1', rol: 'profesional', appType: 'tusturnos' })],
      loading: false,
    };

    const { usePostLoginRouter } = await import('../usePostLoginRouter');
    renderHook(() => usePostLoginRouter());

    expect(mockReplace).toHaveBeenCalledWith('/profesional/agenda');
  });

  it('Regla 2: única empresa TusTurnos con rol cliente → /cliente', async () => {
    const setActiveEmpresa = vi.fn();
    mockAuthState = {
      profile: makeProfile({ rol: 'admin', empresaId: 'otro' }),
      loading: false,
      setActiveEmpresa,
    };
    mockEmpresasState = {
      empresas: [makeEmpresa({ empresaId: 'tt-1', rol: 'cliente', appType: 'tusturnos' })],
      loading: false,
    };

    const { usePostLoginRouter } = await import('../usePostLoginRouter');
    renderHook(() => usePostLoginRouter());

    expect(mockReplace).toHaveBeenCalledWith('/cliente');
  });

  // ── Regla 3: TusTurnos + Mensana → TusTurnos tiene prioridad ────────────

  it('Regla 3: TusTurnos + Mensana → navega a TusTurnos (admin)', async () => {
    const setActiveEmpresa = vi.fn();
    mockAuthState = {
      profile: makeProfile({ rol: 'profesional', empresaId: 'mensana-1' }),
      loading: false,
      setActiveEmpresa,
    };
    mockEmpresasState = {
      empresas: [
        makeEmpresa({ empresaId: 'mensana-1', rol: 'profesional', appType: 'mensana' }),
        makeEmpresa({ empresaId: 'tt-1', rol: 'admin', appType: 'tusturnos' }),
      ],
      loading: false,
    };

    const { usePostLoginRouter } = await import('../usePostLoginRouter');
    renderHook(() => usePostLoginRouter());

    expect(mockReplace).toHaveBeenCalledWith('/admin');
    expect(setActiveEmpresa).toHaveBeenCalledWith(expect.objectContaining({ empresaId: 'tt-1' }));
  });

  // ── mejorEmpresa: elige la de mayor ROL_PRIORIDAD entre TusTurnos ────────

  it('mejorEmpresa: elige admin sobre profesional en lista TusTurnos', async () => {
    const setActiveEmpresa = vi.fn();
    mockAuthState = {
      profile: makeProfile({ rol: 'cliente', empresaId: 'otro' }),
      loading: false,
      setActiveEmpresa,
    };
    mockEmpresasState = {
      empresas: [
        makeEmpresa({ empresaId: 'tt-prof', rol: 'profesional', appType: 'tusturnos' }),
        makeEmpresa({ empresaId: 'tt-admin', rol: 'admin', appType: 'tusturnos' }),
      ],
      loading: false,
    };

    const { usePostLoginRouter } = await import('../usePostLoginRouter');
    renderHook(() => usePostLoginRouter());

    // admin > profesional → navega a /admin y setActiveEmpresa con tt-admin
    expect(mockReplace).toHaveBeenCalledWith('/admin');
    expect(setActiveEmpresa).toHaveBeenCalledWith(expect.objectContaining({ empresaId: 'tt-admin' }));
  });

  it('mejorEmpresa: elige profesional sobre cliente en lista TusTurnos', async () => {
    const setActiveEmpresa = vi.fn();
    mockAuthState = {
      profile: makeProfile({ rol: 'cliente', empresaId: 'otro' }),
      loading: false,
      setActiveEmpresa,
    };
    mockEmpresasState = {
      empresas: [
        makeEmpresa({ empresaId: 'tt-cliente', rol: 'cliente', appType: 'tusturnos' }),
        makeEmpresa({ empresaId: 'tt-prof', rol: 'profesional', appType: 'tusturnos' }),
      ],
      loading: false,
    };

    const { usePostLoginRouter } = await import('../usePostLoginRouter');
    renderHook(() => usePostLoginRouter());

    expect(mockReplace).toHaveBeenCalledWith('/profesional/agenda');
    expect(setActiveEmpresa).toHaveBeenCalledWith(expect.objectContaining({ empresaId: 'tt-prof' }));
  });

  // ── Regla 4: Solo 1 empresa Mensana ─────────────────────────────────────

  it('Regla 4: única empresa Mensana con rol admin → /admin', async () => {
    const setActiveEmpresa = vi.fn();
    mockAuthState = {
      profile: makeProfile({ rol: 'admin', empresaId: 'mensana-1' }),
      loading: false,
      setActiveEmpresa,
    };
    mockEmpresasState = {
      empresas: [makeEmpresa({ empresaId: 'mensana-1', rol: 'admin', appType: 'mensana' })],
      loading: false,
    };

    const { usePostLoginRouter } = await import('../usePostLoginRouter');
    renderHook(() => usePostLoginRouter());

    expect(mockReplace).toHaveBeenCalledWith('/admin');
    // empresaId ya coincide con profile → setActiveEmpresa NO debe llamarse
    expect(setActiveEmpresa).not.toHaveBeenCalled();
  });

  it('Regla 4: única empresa Mensana con rol profesional → /profesional/agenda', async () => {
    const setActiveEmpresa = vi.fn();
    mockAuthState = {
      profile: makeProfile({ rol: 'profesional', empresaId: 'mensana-1' }),
      loading: false,
      setActiveEmpresa,
    };
    mockEmpresasState = {
      empresas: [makeEmpresa({ empresaId: 'mensana-1', rol: 'profesional', appType: 'mensana' })],
      loading: false,
    };

    const { usePostLoginRouter } = await import('../usePostLoginRouter');
    renderHook(() => usePostLoginRouter());

    expect(mockReplace).toHaveBeenCalledWith('/profesional/agenda');
    expect(setActiveEmpresa).not.toHaveBeenCalled();
  });

  it('Regla 4: única empresa Mensana con empresaId diferente → llama setActiveEmpresa', async () => {
    const setActiveEmpresa = vi.fn();
    mockAuthState = {
      profile: makeProfile({ rol: 'admin', empresaId: 'otro-id' }),
      loading: false,
      setActiveEmpresa,
    };
    mockEmpresasState = {
      empresas: [makeEmpresa({ empresaId: 'mensana-1', rol: 'admin', appType: 'mensana' })],
      loading: false,
    };

    const { usePostLoginRouter } = await import('../usePostLoginRouter');
    renderHook(() => usePostLoginRouter());

    expect(setActiveEmpresa).toHaveBeenCalledWith(expect.objectContaining({ empresaId: 'mensana-1' }));
    expect(mockReplace).toHaveBeenCalledWith('/admin');
  });

  // ── Regla 5: Múltiples Mensana sin TusTurnos → /seleccionar-empresa ──────

  it('Regla 5: múltiples Mensana sin TusTurnos → /seleccionar-empresa', async () => {
    mockAuthState = {
      profile: makeProfile({ rol: 'admin', empresaId: 'mensana-1' }),
      loading: false,
      setActiveEmpresa: vi.fn(),
    };
    mockEmpresasState = {
      empresas: [
        makeEmpresa({ empresaId: 'mensana-1', rol: 'admin', appType: 'mensana' }),
        makeEmpresa({ empresaId: 'mensana-2', rol: 'profesional', appType: 'mensana' }),
      ],
      loading: false,
    };

    const { usePostLoginRouter } = await import('../usePostLoginRouter');
    renderHook(() => usePostLoginRouter());

    expect(mockReplace).toHaveBeenCalledWith('/seleccionar-empresa');
  });

  // ── Valor de retorno ─────────────────────────────────────────────────────

  it('retorna resolving:true cuando authLoading es true', async () => {
    mockAuthState = { profile: null, loading: true, setActiveEmpresa: vi.fn() };
    mockEmpresasState = { empresas: [], loading: false };

    const { usePostLoginRouter } = await import('../usePostLoginRouter');
    const { result } = renderHook(() => usePostLoginRouter());

    expect(result.current.resolving).toBe(true);
  });

  it('retorna resolving:true cuando empresasLoading es true', async () => {
    mockAuthState = { profile: makeProfile(), loading: false, setActiveEmpresa: vi.fn() };
    mockEmpresasState = { empresas: [], loading: true };

    const { usePostLoginRouter } = await import('../usePostLoginRouter');
    const { result } = renderHook(() => usePostLoginRouter());

    expect(result.current.resolving).toBe(true);
  });

  it('retorna resolving:false cuando ambos loadings son false', async () => {
    mockAuthState = { profile: makeProfile(), loading: false, setActiveEmpresa: vi.fn() };
    mockEmpresasState = {
      empresas: [makeEmpresa({ empresaId: 'mensana-1', rol: 'admin', appType: 'mensana' })],
      loading: false,
    };

    const { usePostLoginRouter } = await import('../usePostLoginRouter');
    const { result } = renderHook(() => usePostLoginRouter());

    expect(result.current.resolving).toBe(false);
  });
});
