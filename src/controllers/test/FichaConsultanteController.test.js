/**
 * Tests for FichaConsultanteController
 *
 * Mocks:
 *  - src/config/supabase  → vi.mock → supabase + supabaseAdmin stubs
 *  - src/utils/permissions → vi.mock → controlled per test
 *  - src/models/FichaConsultanteModel → real implementation (pure class, no side-effects)
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

// ── Mock: Supabase ────────────────────────────────────────────────────────────
// Chainable query-builder stub that resolves with `_resolve`.
const makeQueryStub = (resolveWith = { data: null, error: null }) => {
  const stub = {
    _resolve: resolveWith,
    select:      vi.fn().mockReturnThis(),
    eq:          vi.fn().mockReturnThis(),
    maybeSingle: vi.fn().mockReturnThis(),
    single:      vi.fn().mockReturnThis(),
    insert:      vi.fn().mockReturnThis(),
    update:      vi.fn().mockReturnThis(),
    order:       vi.fn().mockReturnThis(),
    then(resolve, reject) {
      return Promise.resolve(stub._resolve).then(resolve, reject);
    },
  };
  return stub;
};

/**
 * Sequential stub: each await advances through `results`.
 * Useful when `supabase.from` is called multiple times in one controller method.
 */
const makeSequentialStubs = (...results) => {
  let callCount = 0;
  const stub = {
    select:      vi.fn().mockReturnThis(),
    eq:          vi.fn().mockReturnThis(),
    maybeSingle: vi.fn().mockReturnThis(),
    single:      vi.fn().mockReturnThis(),
    insert:      vi.fn().mockReturnThis(),
    update:      vi.fn().mockReturnThis(),
    order:       vi.fn().mockReturnThis(),
    then(resolve, reject) {
      const result = results[Math.min(callCount, results.length - 1)];
      callCount++;
      return Promise.resolve(result).then(resolve, reject);
    },
  };
  return stub;
};

// supabaseAdmin.auth.admin stub
const mockCreateUser = vi.fn();
const mockDeleteUser = vi.fn();

vi.mock('../../config/supabase', () => ({
  supabase: {
    from: vi.fn(),
  },
  supabaseAdmin: {
    auth: {
      admin: {
        createUser: (...args) => mockCreateUser(...args),
        deleteUser: (...args) => mockDeleteUser(...args),
      },
    },
  },
}));

// ── Mock: permissions ─────────────────────────────────────────────────────────
const mockRequirePermission = vi.fn(() => null);
const mockRequireEmpresa    = vi.fn(() => null);

vi.mock('../../utils/permissions', () => ({
  requirePermission: (...args) => mockRequirePermission(...args),
  requireEmpresa:    (...args) => mockRequireEmpresa(...args),
}));

// ── Import SUT after mocks ────────────────────────────────────────────────────
import { FichaConsultanteController } from '../FichaConsultanteController.js';
import { supabase } from '../../config/supabase';

// ── Helpers ───────────────────────────────────────────────────────────────────
const makeProfile = (overrides = {}) => ({
  rol: 'admin',
  empresaId: 'emp-1',
  usuarioId: 'user-1',
  ...overrides,
});

const makeSuperadmin = () => makeProfile({ rol: 'superadmin', empresaId: null });

const FORBIDDEN = { success: false, error: 'Sin permisos', code: 'FORBIDDEN' };
const NO_EMPRESA = { success: false, error: 'Sin empresa asociada', code: 'NO_EMPRESA' };

// ── Reset between tests ───────────────────────────────────────────────────────
beforeEach(() => {
  vi.clearAllMocks();
  mockRequirePermission.mockReturnValue(null);
  mockRequireEmpresa.mockReturnValue(null);
  mockCreateUser.mockResolvedValue({ data: { user: { id: 'auth-new-1' } }, error: null });
  mockDeleteUser.mockResolvedValue({ error: null });
});

// ═══════════════════════════════════════════════════════════════════════════════
// crearFichaConsultante
// ═══════════════════════════════════════════════════════════════════════════════
describe('FichaConsultanteController.crearFichaConsultante', () => {
  it('retorna error de permiso cuando no tiene consultantes:write', async () => {
    mockRequirePermission.mockReturnValue(FORBIDDEN);

    const result = await FichaConsultanteController.crearFichaConsultante(
      { nombre_completo: 'Ana' },
      makeProfile({ rol: 'cliente' }),
    );

    expect(result).toEqual(FORBIDDEN);
    expect(supabase.from).not.toHaveBeenCalled();
  });

  it('retorna error de empresa cuando no hay empresaId', async () => {
    mockRequireEmpresa.mockReturnValue(NO_EMPRESA);

    const result = await FichaConsultanteController.crearFichaConsultante(
      { nombre_completo: 'Ana' },
      makeProfile({ empresaId: null }),
    );

    expect(result).toEqual(NO_EMPRESA);
  });

  it('retorna error cuando falta nombre_completo', async () => {
    const result = await FichaConsultanteController.crearFichaConsultante(
      { email: 'ana@test.com' },
      makeProfile(),
    );

    expect(result).toEqual({ success: false, error: 'El nombre es obligatorio' });
    expect(supabase.from).not.toHaveBeenCalled();
  });

  it('retorna error cuando nombre_completo es string vacío', async () => {
    const result = await FichaConsultanteController.crearFichaConsultante(
      { nombre_completo: '' },
      makeProfile(),
    );

    expect(result).toEqual({ success: false, error: 'El nombre es obligatorio' });
  });

  // --- Con email: usuario existente ----------------------------------------
  it('devuelve error si el usuario con ese email ya tiene ficha en la empresa', async () => {
    const existingUser = makeSequentialStubs(
      { data: { id: 'user-existing', auth_user_id: 'auth-existing' }, error: null }, // usuarios lookup
      { data: { id: 'ficha-existing' }, error: null },                               // fichas lookup
    );
    supabase.from.mockReturnValue(existingUser);

    const result = await FichaConsultanteController.crearFichaConsultante(
      { nombre_completo: 'Ana', email: 'ana@test.com' },
      makeProfile(),
    );

    expect(result).toEqual({
      success: false,
      error: 'Este usuario ya tiene una ficha en esta empresa',
    });
  });

  it('crea ficha para usuario existente sin ficha previa', async () => {
    const fichaCreada = { id: 'ficha-new', cliente_id: 'user-existing', empresa_id: 'emp-1', estado: 'abierta', activo: true };
    const stub = makeSequentialStubs(
      { data: { id: 'user-existing', auth_user_id: 'auth-existing' }, error: null }, // usuarios lookup
      { data: null, error: null },                                                    // fichas lookup (no existe)
      { data: fichaCreada, error: null },                                             // fichas insert
    );
    supabase.from.mockReturnValue(stub);

    const result = await FichaConsultanteController.crearFichaConsultante(
      { nombre_completo: 'Ana', email: 'ana@test.com', telefono: '123' },
      makeProfile(),
    );

    expect(result.success).toBe(true);
    expect(result.data).toMatchObject({ cliente_id: 'user-existing', empresa_id: 'emp-1' });
    expect(result.message).toContain('exitosamente');
  });

  // --- Con email: usuario nuevo --------------------------------------------
  it('crea usuario auth, inserta usuarios, asigna rol y crea ficha', async () => {
    const usuarioInsertado = { id: 'user-new' };
    const fichaCreada = { id: 'ficha-new', cliente_id: 'user-new', empresa_id: 'emp-1', estado: 'abierta', activo: true };

    const stub = makeSequentialStubs(
      { data: null, error: null },          // usuarios lookup → no existe
      { data: usuarioInsertado, error: null }, // usuarios insert
      { data: { id: 'rol-cliente' }, error: null }, // roles lookup
      { data: null, error: null },           // usuario_empresa insert
      { data: fichaCreada, error: null },    // fichas insert
    );
    supabase.from.mockReturnValue(stub);

    const result = await FichaConsultanteController.crearFichaConsultante(
      { nombre_completo: 'Nuevo', email: 'nuevo@test.com', telefono: '555' },
      makeProfile(),
    );

    expect(mockCreateUser).toHaveBeenCalledOnce();
    expect(result.success).toBe(true);
    expect(result.message).toContain('perfil de consultante creados exitosamente');
  });

  it('hace rollback del usuario auth si falla la inserción en usuarios', async () => {
    const stub = makeSequentialStubs(
      { data: null, error: null },                                   // usuarios lookup
      { data: null, error: { message: 'DB insert failed' } },        // usuarios insert → error
    );
    supabase.from.mockReturnValue(stub);

    const result = await FichaConsultanteController.crearFichaConsultante(
      { nombre_completo: 'Nuevo', email: 'nuevo@test.com' },
      makeProfile(),
    );

    expect(mockDeleteUser).toHaveBeenCalledWith('auth-new-1');
    expect(result.success).toBe(false);
    expect(result.error).toContain('Error al crear registro de usuario');
  });

  it('retorna error si supabaseAdmin.auth.admin.createUser falla', async () => {
    mockCreateUser.mockResolvedValue({ data: null, error: { message: 'Auth service down' } });
    supabase.from.mockReturnValue(
      makeQueryStub({ data: null, error: null }) // usuarios lookup → no existe
    );

    const result = await FichaConsultanteController.crearFichaConsultante(
      { nombre_completo: 'Nuevo', email: 'nuevo@test.com' },
      makeProfile(),
    );

    expect(result.success).toBe(false);
    expect(result.error).toContain('Error al crear cuenta de usuario');
  });

  // --- Sin email -----------------------------------------------------------
  it('crea usuario sin auth (sin email) y ficha correctamente', async () => {
    const usuarioSinEmail = { id: 'user-noemail' };
    const fichaCreada = { id: 'ficha-noemail', cliente_id: 'user-noemail', empresa_id: 'emp-1', estado: 'abierta', activo: true };

    const stub = makeSequentialStubs(
      { data: usuarioSinEmail, error: null },      // usuarios insert
      { data: { id: 'rol-cliente' }, error: null }, // roles lookup
      { data: null, error: null },                  // usuario_empresa insert
      { data: fichaCreada, error: null },           // fichas insert
    );
    supabase.from.mockReturnValue(stub);

    const result = await FichaConsultanteController.crearFichaConsultante(
      { nombre_completo: 'Sin Email', telefono: '999' },
      makeProfile(),
    );

    expect(mockCreateUser).not.toHaveBeenCalled();
    expect(result.success).toBe(true);
    expect(result.message).toContain('sin usuario de acceso');
  });

  it('retorna error si falla insert usuario sin email', async () => {
    const stub = makeQueryStub({ data: null, error: { message: 'Falla usuarios' } });
    supabase.from.mockReturnValue(stub);

    const result = await FichaConsultanteController.crearFichaConsultante(
      { nombre_completo: 'Sin Email' },
      makeProfile(),
    );

    expect(result.success).toBe(false);
    expect(result.error).toBe('Falla usuarios');
  });

  it('retorna error si falla insert de la ficha final', async () => {
    const stub = makeSequentialStubs(
      { data: { id: 'user-noemail' }, error: null },   // usuarios insert
      { data: { id: 'rol-cliente' }, error: null },     // roles lookup
      { data: null, error: null },                       // usuario_empresa insert
      { data: null, error: { message: 'Error al crear ficha: Falla fichas' } }, // fichas insert
    );
    supabase.from.mockReturnValue(stub);

    const result = await FichaConsultanteController.crearFichaConsultante(
      { nombre_completo: 'Sin Email' },
      makeProfile(),
    );

    expect(result.success).toBe(false);
  });

  it('trata email vacío (solo espacios) como sin email', async () => {
    const usuarioSinEmail = { id: 'user-spaces' };
    const fichaCreada = { id: 'ficha-spaces', cliente_id: 'user-spaces', empresa_id: 'emp-1', estado: 'abierta', activo: true };

    const stub = makeSequentialStubs(
      { data: usuarioSinEmail, error: null },
      { data: { id: 'rol-cliente' }, error: null },
      { data: null, error: null },
      { data: fichaCreada, error: null },
    );
    supabase.from.mockReturnValue(stub);

    const result = await FichaConsultanteController.crearFichaConsultante(
      { nombre_completo: 'Espacios', email: '   ' },
      makeProfile(),
    );

    expect(mockCreateUser).not.toHaveBeenCalled();
    expect(result.success).toBe(true);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// obtenerFichasConsultantes
// ═══════════════════════════════════════════════════════════════════════════════
describe('FichaConsultanteController.obtenerFichasConsultantes', () => {
  it('retorna error de permiso cuando no tiene consultantes:read', async () => {
    mockRequirePermission.mockReturnValue(FORBIDDEN);

    const result = await FichaConsultanteController.obtenerFichasConsultantes(null, makeProfile({ rol: 'cliente' }));

    expect(result).toEqual(FORBIDDEN);
    expect(supabase.from).not.toHaveBeenCalled();
  });

  it('retorna array de fichas enriquecidas para admin', async () => {
    const rawFichas = [
      {
        id: 'f1',
        cliente_id: 'u1',
        empresa_id: 'emp-1',
        activo: true,
        usuarios: { id: 'u1', nombre_completo: 'Ana García', email: 'ana@x.com', telefono: '111' },
      },
    ];

    const stub = makeQueryStub({ data: rawFichas, error: null });
    supabase.from.mockReturnValue(stub);

    const result = await FichaConsultanteController.obtenerFichasConsultantes(null, makeProfile());

    expect(result.success).toBe(true);
    expect(result.data).toHaveLength(1);
    expect(result.data[0]).toMatchObject({
      id: 'f1',
      nombre_completo: 'Ana García',
      email: 'ana@x.com',
      telefono: '111',
    });
  });

  it('filtra por profesionalId cuando se pasa', async () => {
    const stub = makeQueryStub({ data: [], error: null });
    supabase.from.mockReturnValue(stub);

    await FichaConsultanteController.obtenerFichasConsultantes('prof-5', makeProfile());

    // eq debe haber sido llamado con profesional_id
    expect(stub.eq).toHaveBeenCalledWith('profesional_id', 'prof-5');
  });

  it('no aplica filtro de empresa para superadmin', async () => {
    const stub = makeQueryStub({ data: [], error: null });
    supabase.from.mockReturnValue(stub);

    await FichaConsultanteController.obtenerFichasConsultantes(null, makeSuperadmin());

    // eq no debe haber sido llamado con empresa_id
    const eqCalls = stub.eq.mock.calls.map(c => c[0]);
    expect(eqCalls).not.toContain('empresa_id');
  });

  it('aplica filtro de empresa para rol admin', async () => {
    const stub = makeQueryStub({ data: [], error: null });
    supabase.from.mockReturnValue(stub);

    await FichaConsultanteController.obtenerFichasConsultantes(null, makeProfile());

    const eqCalls = stub.eq.mock.calls.map(c => c[0]);
    expect(eqCalls).toContain('empresa_id');
  });

  it('retorna error de empresa para admin sin empresaId', async () => {
    mockRequireEmpresa.mockReturnValue(NO_EMPRESA);

    const result = await FichaConsultanteController.obtenerFichasConsultantes(
      null,
      makeProfile({ empresaId: null }),
    );

    expect(result).toEqual(NO_EMPRESA);
  });

  it('usa "Sin nombre" cuando usuarios es null', async () => {
    const rawFichas = [
      { id: 'f2', cliente_id: 'u2', empresa_id: 'emp-1', activo: true, usuarios: null },
    ];

    const stub = makeQueryStub({ data: rawFichas, error: null });
    supabase.from.mockReturnValue(stub);

    const result = await FichaConsultanteController.obtenerFichasConsultantes(null, makeProfile());

    expect(result.data[0].nombre_completo).toBe('Sin nombre');
    expect(result.data[0].email).toBeNull();
    expect(result.data[0].telefono).toBeNull();
  });

  it('retorna error cuando la query falla', async () => {
    const stub = makeQueryStub({ data: null, error: { message: 'DB error' } });
    supabase.from.mockReturnValue(stub);

    const result = await FichaConsultanteController.obtenerFichasConsultantes(null, makeProfile());

    expect(result).toEqual({ success: false, error: 'DB error' });
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// obtenerFichaPorId
// ═══════════════════════════════════════════════════════════════════════════════
describe('FichaConsultanteController.obtenerFichaPorId', () => {
  it('retorna error de permiso cuando no tiene consultantes:read', async () => {
    mockRequirePermission.mockReturnValue(FORBIDDEN);

    const result = await FichaConsultanteController.obtenerFichaPorId('f1', makeProfile({ rol: 'cliente' }));

    expect(result).toEqual(FORBIDDEN);
    expect(supabase.from).not.toHaveBeenCalled();
  });

  it('retorna ficha como instancia de FichaConsultanteModel', async () => {
    const rawFicha = {
      id: 'f1',
      cliente_id: 'u1',
      empresa_id: 'emp-1',
      estado: 'abierta',
      activo: true,
      usuarios: { id: 'u1', nombre_completo: 'Ana', email: 'ana@x.com', telefono: '111' },
    };

    const stub = makeQueryStub({ data: rawFicha, error: null });
    supabase.from.mockReturnValue(stub);

    const result = await FichaConsultanteController.obtenerFichaPorId('f1', makeProfile());

    expect(result.success).toBe(true);
    expect(result.data).toBeInstanceOf(Object);
    expect(result.data.id).toBe('f1');
    expect(result.data.nombre_completo).toBe('Ana');
    expect(result.data.email).toBe('ana@x.com');
  });

  it('usa "Sin nombre" y vacíos cuando usuarios es null', async () => {
    const rawFicha = {
      id: 'f2',
      cliente_id: 'u2',
      empresa_id: 'emp-1',
      estado: 'abierta',
      activo: true,
      usuarios: null,
    };

    const stub = makeQueryStub({ data: rawFicha, error: null });
    supabase.from.mockReturnValue(stub);

    const result = await FichaConsultanteController.obtenerFichaPorId('f2', makeProfile());

    expect(result.success).toBe(true);
    expect(result.data.nombre_completo).toBe('Sin nombre');
    expect(result.data.email).toBe('');
  });

  it('retorna error cuando la query falla', async () => {
    const stub = makeQueryStub({ data: null, error: { message: 'Not found' } });
    supabase.from.mockReturnValue(stub);

    const result = await FichaConsultanteController.obtenerFichaPorId('f-invalid', makeProfile());

    expect(result).toEqual({ success: false, error: 'Not found' });
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// actualizarFicha
// ═══════════════════════════════════════════════════════════════════════════════
describe('FichaConsultanteController.actualizarFicha', () => {
  it('retorna error de permiso cuando no tiene consultantes:write', async () => {
    mockRequirePermission.mockReturnValue(FORBIDDEN);

    const result = await FichaConsultanteController.actualizarFicha('f1', {}, makeProfile({ rol: 'cliente' }));

    expect(result).toEqual(FORBIDDEN);
    expect(supabase.from).not.toHaveBeenCalled();
  });

  it('actualiza ficha correctamente', async () => {
    const stub = makeQueryStub({ error: null });
    supabase.from.mockReturnValue(stub);

    const result = await FichaConsultanteController.actualizarFicha(
      'f1',
      { edad: 30, profesional_id: 'prof-1', estado: 'cerrada' },
      makeProfile(),
    );

    expect(result).toEqual({ success: true, message: 'Ficha actualizada correctamente' });
    expect(stub.update).toHaveBeenCalledWith({
      edad: 30,
      profesional_id: 'prof-1',
      estado: 'cerrada',
    });
    expect(stub.eq).toHaveBeenCalledWith('id', 'f1');
  });

  it('usa estado "abierta" por defecto cuando no se pasa estado', async () => {
    const stub = makeQueryStub({ error: null });
    supabase.from.mockReturnValue(stub);

    await FichaConsultanteController.actualizarFicha('f1', { edad: 25 }, makeProfile());

    expect(stub.update).toHaveBeenCalledWith(
      expect.objectContaining({ estado: 'abierta' })
    );
  });

  it('retorna error cuando la actualización falla', async () => {
    const stub = makeQueryStub({ error: { message: 'Update failed' } });
    supabase.from.mockReturnValue(stub);

    const result = await FichaConsultanteController.actualizarFicha('f1', {}, makeProfile());

    expect(result).toEqual({ success: false, error: 'Update failed' });
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// desactivarFicha
// ═══════════════════════════════════════════════════════════════════════════════
describe('FichaConsultanteController.desactivarFicha', () => {
  it('retorna error de permiso cuando no tiene consultantes:write', async () => {
    mockRequirePermission.mockReturnValue(FORBIDDEN);

    const result = await FichaConsultanteController.desactivarFicha('f1', makeProfile({ rol: 'cliente' }));

    expect(result).toEqual(FORBIDDEN);
    expect(supabase.from).not.toHaveBeenCalled();
  });

  it('realiza soft delete (activo: false, estado: inactivo)', async () => {
    const stub = makeQueryStub({ error: null });
    supabase.from.mockReturnValue(stub);

    const result = await FichaConsultanteController.desactivarFicha('f1', makeProfile());

    expect(result).toEqual({ success: true });
    expect(stub.update).toHaveBeenCalledWith({ activo: false, estado: 'inactivo' });
    expect(stub.eq).toHaveBeenCalledWith('id', 'f1');
  });

  it('retorna error cuando el update falla', async () => {
    const stub = makeQueryStub({ error: { message: 'Delete failed' } });
    supabase.from.mockReturnValue(stub);

    const result = await FichaConsultanteController.desactivarFicha('f1', makeProfile());

    expect(result).toEqual({ success: false, error: 'Delete failed' });
  });
});
