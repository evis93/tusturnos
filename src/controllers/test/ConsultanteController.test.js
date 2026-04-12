/**
 * Tests for ConsultanteController
 *
 * Mocks:
 *  - src/config/supabase  → vi.mock → chainable query-builder stub
 *  - src/utils/permissions → vi.mock → allows fine-grained control per test
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

// ── Mock: Supabase ─────────────────────────────────────────────────────────────
// Chainable query-builder stub. The stub is a thenable so `await query`
// resolves with whatever `_resolve` holds at that moment.

const makeQueryStub = (resolveWith = { data: [], error: null }) => {
  const stub = {
    _resolve: resolveWith,
    select:         vi.fn().mockReturnThis(),
    eq:             vi.fn().mockReturnThis(),
    or:             vi.fn().mockReturnThis(),
    limit:          vi.fn().mockReturnThis(),
    insert:         vi.fn().mockReturnThis(),
    update:         vi.fn().mockReturnThis(),
    delete:         vi.fn().mockReturnThis(),
    single:         vi.fn().mockReturnThis(),
    maybeSingle:    vi.fn().mockReturnThis(),
    then(resolve, reject) {
      return Promise.resolve(stub._resolve).then(resolve, reject);
    },
  };
  return stub;
};

/**
 * Sequential stub: each await advances through the results array.
 */
const makeSequentialStubs = (...results) => {
  let callCount = 0;
  const stub = {
    select:         vi.fn().mockReturnThis(),
    eq:             vi.fn().mockReturnThis(),
    or:             vi.fn().mockReturnThis(),
    limit:          vi.fn().mockReturnThis(),
    insert:         vi.fn().mockReturnThis(),
    update:         vi.fn().mockReturnThis(),
    delete:         vi.fn().mockReturnThis(),
    single:         vi.fn().mockReturnThis(),
    maybeSingle:    vi.fn().mockReturnThis(),
    then(resolve, reject) {
      const result = results[Math.min(callCount, results.length - 1)];
      callCount++;
      return Promise.resolve(result).then(resolve, reject);
    },
  };
  return stub;
};

vi.mock('../../config/supabase', () => ({
  supabase: {
    from: vi.fn(),
  },
}));

// ── Mock: permissions ──────────────────────────────────────────────────────────
const mockRequirePermission = vi.fn(() => null);
const mockRequireEmpresa    = vi.fn(() => null);

vi.mock('../../utils/permissions', () => ({
  requirePermission: (...args) => mockRequirePermission(...args),
  requireEmpresa:    (...args) => mockRequireEmpresa(...args),
}));

// ── Import SUT after mocks are set up ─────────────────────────────────────────
import { ConsultanteController } from '../ConsultanteController.js';
import { supabase } from '../../config/supabase';

// ── Helpers ────────────────────────────────────────────────────────────────────
const makeProfile = (overrides = {}) => ({
  rol: 'admin',
  empresaId: 'emp-1',
  usuarioId: 'user-1',
  ...overrides,
});

const makeSuperadmin = () => makeProfile({ rol: 'superadmin', empresaId: null });

// Sample usuario row returned from DB
const makeUsuarioRow = (overrides = {}) => ({
  usuario_id: 'u-1',
  usuarios: {
    id: 'u-1',
    nombre_completo: 'Ana García',
    email: 'ana@test.com',
    telefono: '1234567890',
  },
  roles: { nombre: 'cliente' },
  ...overrides,
});

// ── Reset between tests ────────────────────────────────────────────────────────
beforeEach(() => {
  vi.clearAllMocks();
  mockRequirePermission.mockReturnValue(null);
  mockRequireEmpresa.mockReturnValue(null);
});

// ═══════════════════════════════════════════════════════════════════════════════
// buscarConsultantes
// ═══════════════════════════════════════════════════════════════════════════════

describe('ConsultanteController.buscarConsultantes', () => {
  it('returns FORBIDDEN when requirePermission fails', async () => {
    mockRequirePermission.mockReturnValue({ success: false, error: 'Sin permisos', code: 'FORBIDDEN' });

    const result = await ConsultanteController.buscarConsultantes('ana', makeProfile());

    expect(result).toEqual({ success: false, error: 'Sin permisos', code: 'FORBIDDEN' });
    expect(supabase.from).not.toHaveBeenCalled();
  });

  it('returns empty array when query is empty string', async () => {
    const result = await ConsultanteController.buscarConsultantes('', makeProfile());

    expect(result).toEqual({ success: true, data: [] });
    expect(supabase.from).not.toHaveBeenCalled();
  });

  it('returns empty array when query is only whitespace', async () => {
    const result = await ConsultanteController.buscarConsultantes('   ', makeProfile());

    expect(result).toEqual({ success: true, data: [] });
  });

  it('returns empty array when query is null', async () => {
    const result = await ConsultanteController.buscarConsultantes(null, makeProfile());

    expect(result).toEqual({ success: true, data: [] });
  });

  it('filters by empresa_id for non-superadmin profile', async () => {
    const stub = makeQueryStub({ data: [makeUsuarioRow()], error: null });
    supabase.from.mockReturnValue(stub);

    const profile = makeProfile({ rol: 'admin', empresaId: 'emp-1' });
    const result = await ConsultanteController.buscarConsultantes('ana', profile);

    expect(result.success).toBe(true);
    expect(stub.eq).toHaveBeenCalledWith('empresa_id', 'emp-1');
  });

  it('does NOT filter by empresa_id for superadmin', async () => {
    const stub = makeQueryStub({ data: [makeUsuarioRow()], error: null });
    supabase.from.mockReturnValue(stub);

    const result = await ConsultanteController.buscarConsultantes('ana', makeSuperadmin());

    expect(result.success).toBe(true);
    // eq should NOT have been called with 'empresa_id'
    const empresaCalls = stub.eq.mock.calls.filter(c => c[0] === 'empresa_id');
    expect(empresaCalls).toHaveLength(0);
  });

  it('returns NO_EMPRESA error when non-superadmin has no empresaId', async () => {
    mockRequireEmpresa.mockReturnValue({ success: false, error: 'Sin empresa asociada', code: 'NO_EMPRESA' });

    const profile = makeProfile({ empresaId: null });
    const result = await ConsultanteController.buscarConsultantes('ana', profile);

    expect(result).toEqual({ success: false, error: 'Sin empresa asociada', code: 'NO_EMPRESA' });
  });

  it('maps and sorts results by nombre_completo', async () => {
    const rows = [
      makeUsuarioRow({ usuarios: { id: 'u-2', nombre_completo: 'Zoe López', email: 'zoe@test.com', telefono: '' } }),
      makeUsuarioRow({ usuarios: { id: 'u-1', nombre_completo: 'Ana García', email: 'ana@test.com', telefono: '111' } }),
    ];
    const stub = makeQueryStub({ data: rows, error: null });
    supabase.from.mockReturnValue(stub);

    const result = await ConsultanteController.buscarConsultantes('a', makeProfile());

    expect(result.success).toBe(true);
    expect(result.data[0].nombre_completo).toBe('Ana García');
    expect(result.data[1].nombre_completo).toBe('Zoe López');
  });

  it('returns success:false and empty data on DB error', async () => {
    const stub = makeQueryStub({ data: null, error: { message: 'DB failure' } });
    supabase.from.mockReturnValue(stub);

    const result = await ConsultanteController.buscarConsultantes('ana', makeProfile());

    expect(result.success).toBe(false);
    expect(result.error).toBe('DB failure');
    expect(result.data).toEqual([]);
  });

  it('fills missing fields with empty strings', async () => {
    const stub = makeQueryStub({
      data: [makeUsuarioRow({ usuarios: { id: 'u-3', nombre_completo: null, email: null, telefono: null } })],
      error: null,
    });
    supabase.from.mockReturnValue(stub);

    const result = await ConsultanteController.buscarConsultantes('x', makeProfile());

    expect(result.data[0].nombre_completo).toBe('');
    expect(result.data[0].email).toBe('');
    expect(result.data[0].telefono).toBe('');
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// obtenerConsultantes
// ═══════════════════════════════════════════════════════════════════════════════

describe('ConsultanteController.obtenerConsultantes', () => {
  it('returns FORBIDDEN when requirePermission fails', async () => {
    mockRequirePermission.mockReturnValue({ success: false, error: 'Sin permisos', code: 'FORBIDDEN' });

    const result = await ConsultanteController.obtenerConsultantes(makeProfile());

    expect(result).toEqual({ success: false, error: 'Sin permisos', code: 'FORBIDDEN' });
    expect(supabase.from).not.toHaveBeenCalled();
  });

  it('returns NO_EMPRESA when non-superadmin has no empresaId', async () => {
    mockRequireEmpresa.mockReturnValue({ success: false, error: 'Sin empresa asociada', code: 'NO_EMPRESA' });

    const result = await ConsultanteController.obtenerConsultantes(makeProfile({ empresaId: null }));

    expect(result).toEqual({ success: false, error: 'Sin empresa asociada', code: 'NO_EMPRESA' });
  });

  it('returns all consultantes for admin (filtered by empresa)', async () => {
    const stub = makeQueryStub({ data: [makeUsuarioRow()], error: null });
    supabase.from.mockReturnValue(stub);

    const result = await ConsultanteController.obtenerConsultantes(makeProfile());

    expect(result.success).toBe(true);
    expect(result.data).toHaveLength(1);
    expect(result.data[0].id).toBe('u-1');
    expect(stub.eq).toHaveBeenCalledWith('empresa_id', 'emp-1');
  });

  it('returns all consultantes for superadmin without empresa filter', async () => {
    const stub = makeQueryStub({ data: [makeUsuarioRow()], error: null });
    supabase.from.mockReturnValue(stub);

    const result = await ConsultanteController.obtenerConsultantes(makeSuperadmin());

    expect(result.success).toBe(true);
    const empresaCalls = stub.eq.mock.calls.filter(c => c[0] === 'empresa_id');
    expect(empresaCalls).toHaveLength(0);
  });

  it('returns sorted results', async () => {
    const rows = [
      makeUsuarioRow({ usuarios: { id: 'u-2', nombre_completo: 'Zoe', email: '', telefono: '' } }),
      makeUsuarioRow({ usuarios: { id: 'u-1', nombre_completo: 'Ana', email: '', telefono: '' } }),
    ];
    const stub = makeQueryStub({ data: rows, error: null });
    supabase.from.mockReturnValue(stub);

    const result = await ConsultanteController.obtenerConsultantes(makeProfile());

    expect(result.data[0].nombre_completo).toBe('Ana');
    expect(result.data[1].nombre_completo).toBe('Zoe');
  });

  it('returns success:false on DB error', async () => {
    const stub = makeQueryStub({ data: null, error: { message: 'connection error' } });
    supabase.from.mockReturnValue(stub);

    const result = await ConsultanteController.obtenerConsultantes(makeProfile());

    expect(result.success).toBe(false);
    expect(result.error).toBe('connection error');
    expect(result.data).toEqual([]);
  });

  it('handles null data gracefully returning empty array', async () => {
    const stub = makeQueryStub({ data: null, error: null });
    supabase.from.mockReturnValue(stub);

    const result = await ConsultanteController.obtenerConsultantes(makeProfile());

    expect(result.success).toBe(true);
    expect(result.data).toEqual([]);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// crearConsultante
// ═══════════════════════════════════════════════════════════════════════════════

describe('ConsultanteController.crearConsultante', () => {
  const profile = makeProfile();

  it('returns FORBIDDEN when requirePermission fails', async () => {
    mockRequirePermission.mockReturnValue({ success: false, error: 'Sin permisos', code: 'FORBIDDEN' });

    const result = await ConsultanteController.crearConsultante({ nombre_completo: 'Ana' }, profile);

    expect(result).toEqual({ success: false, error: 'Sin permisos', code: 'FORBIDDEN' });
    expect(supabase.from).not.toHaveBeenCalled();
  });

  it('returns NO_EMPRESA when profile has no empresaId', async () => {
    mockRequireEmpresa.mockReturnValue({ success: false, error: 'Sin empresa asociada', code: 'NO_EMPRESA' });

    const result = await ConsultanteController.crearConsultante({ nombre_completo: 'Ana' }, profile);

    expect(result).toEqual({ success: false, error: 'Sin empresa asociada', code: 'NO_EMPRESA' });
  });

  it('returns error when nombre_completo is missing', async () => {
    const result = await ConsultanteController.crearConsultante({ email: 'a@b.com' }, profile);

    expect(result.success).toBe(false);
    expect(result.error).toBe('El nombre es obligatorio');
  });

  it('returns error when nombre_completo is only whitespace', async () => {
    const result = await ConsultanteController.crearConsultante({ nombre_completo: '   ' }, profile);

    expect(result.success).toBe(false);
    expect(result.error).toBe('El nombre es obligatorio');
  });

  it('returns existing consultante when usuario already has cliente role in empresa', async () => {
    const usuarioExistente = { id: 'u-exist', nombre_completo: 'Ana', email: 'ana@test.com', telefono: '111' };
    const ueExistente = { id: 'ue-1', roles: { nombre: 'cliente' } };

    // from('usuarios') → maybeSingle → usuarioExistente
    // from('usuario_empresa') → maybeSingle → ueExistente
    const stub = makeSequentialStubs(
      { data: usuarioExistente, error: null },
      { data: ueExistente, error: null },
    );
    supabase.from.mockReturnValue(stub);

    const result = await ConsultanteController.crearConsultante(
      { nombre_completo: 'Ana', email: 'ana@test.com' },
      profile,
    );

    expect(result.success).toBe(true);
    expect(result.message).toBe('Usuario ya existe como cliente');
    expect(result.data.id).toBe('u-exist');
  });

  it('adds cliente role when usuario exists but lacks it in empresa', async () => {
    const usuarioExistente = { id: 'u-exist', nombre_completo: 'Ana', email: 'ana@test.com', telefono: '' };
    const rolData = { id: 'rol-cliente' };

    // Sequence: find usuario → null for ueExistente → find rol → insert usuario_empresa
    const stub = makeSequentialStubs(
      { data: usuarioExistente, error: null }, // find user by email
      { data: null, error: null },              // check ue — not found
      { data: rolData, error: null },           // get rol id
      { data: null, error: null },              // insert usuario_empresa
    );
    supabase.from.mockReturnValue(stub);

    const result = await ConsultanteController.crearConsultante(
      { nombre_completo: 'Ana', email: 'ana@test.com' },
      profile,
    );

    expect(result.success).toBe(true);
    expect(result.message).toBe('Rol cliente agregado');
    expect(result.data.id).toBe('u-exist');
  });

  it('creates a new usuario and links to empresa when email not found', async () => {
    const nuevoUsuario = { id: 'u-new', nombre_completo: 'Carlos', email: 'carlos@test.com', telefono: '999' };
    const rolData = { id: 'rol-cliente' };

    // Sequence: no existing user → insert usuario → get rol → insert usuario_empresa
    const stub = makeSequentialStubs(
      { data: null, error: null },              // find user by email → not found
      { data: nuevoUsuario, error: null },      // insert new usuario
      { data: rolData, error: null },           // get rol id
      { data: null, error: null },              // insert usuario_empresa
    );
    supabase.from.mockReturnValue(stub);

    const result = await ConsultanteController.crearConsultante(
      { nombre_completo: 'Carlos', email: 'carlos@test.com', telefono: '999' },
      profile,
    );

    expect(result.success).toBe(true);
    expect(result.message).toBe('Consultante creado exitosamente');
    expect(result.data.id).toBe('u-new');
  });

  it('creates a new usuario without email (no email lookup)', async () => {
    const nuevoUsuario = { id: 'u-nomail', nombre_completo: 'Sin Email', email: null, telefono: null };
    const rolData = { id: 'rol-cliente' };

    // No email lookup — sequence: insert usuario → get rol → insert usuario_empresa
    const stub = makeSequentialStubs(
      { data: nuevoUsuario, error: null }, // insert usuario
      { data: rolData, error: null },      // get rol
      { data: null, error: null },         // insert usuario_empresa
    );
    supabase.from.mockReturnValue(stub);

    const result = await ConsultanteController.crearConsultante(
      { nombre_completo: 'Sin Email' },
      profile,
    );

    expect(result.success).toBe(true);
    expect(result.data.id).toBe('u-nomail');
  });

  it('returns success:false on DB error when inserting usuario', async () => {
    // No existing user, then insert fails
    const stub = makeSequentialStubs(
      { data: null, error: null },                          // find user → not found
      { data: null, error: { message: 'insert error' } },  // insert usuario fails
    );
    supabase.from.mockReturnValue(stub);

    const result = await ConsultanteController.crearConsultante(
      { nombre_completo: 'Carlos', email: 'carlos@test.com' },
      profile,
    );

    expect(result.success).toBe(false);
    expect(result.error).toBe('insert error');
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// obtenerConsultantePorId
// ═══════════════════════════════════════════════════════════════════════════════

describe('ConsultanteController.obtenerConsultantePorId', () => {
  it('returns FORBIDDEN when requirePermission fails', async () => {
    mockRequirePermission.mockReturnValue({ success: false, error: 'Sin permisos', code: 'FORBIDDEN' });

    const result = await ConsultanteController.obtenerConsultantePorId('u-1', makeProfile());

    expect(result).toEqual({ success: false, error: 'Sin permisos', code: 'FORBIDDEN' });
    expect(supabase.from).not.toHaveBeenCalled();
  });

  it('returns consultante data with ficha_id when ficha exists', async () => {
    const usuarioData = { id: 'u-1', nombre_completo: 'Ana', email: 'ana@test.com', telefono: '111' };
    const fichaData = { id: 'ficha-1' };

    const stub = makeSequentialStubs(
      { data: usuarioData, error: null },
      { data: fichaData, error: null },
    );
    supabase.from.mockReturnValue(stub);

    const result = await ConsultanteController.obtenerConsultantePorId('u-1', makeProfile());

    expect(result.success).toBe(true);
    expect(result.data.id).toBe('u-1');
    expect(result.data.ficha_id).toBe('ficha-1');
    expect(result.data.nombre_completo).toBe('Ana');
  });

  it('returns ficha_id as null when no ficha exists', async () => {
    const usuarioData = { id: 'u-1', nombre_completo: 'Ana', email: 'ana@test.com', telefono: '' };

    const stub = makeSequentialStubs(
      { data: usuarioData, error: null },
      { data: null, error: null }, // no ficha
    );
    supabase.from.mockReturnValue(stub);

    const result = await ConsultanteController.obtenerConsultantePorId('u-1', makeProfile());

    expect(result.success).toBe(true);
    expect(result.data.ficha_id).toBeNull();
  });

  it('skips ficha lookup when profile has no empresaId', async () => {
    const usuarioData = { id: 'u-1', nombre_completo: 'Ana', email: 'ana@test.com', telefono: '' };

    // Only one from() call expected (usuarios), no ficha lookup
    const stub = makeQueryStub({ data: usuarioData, error: null });
    supabase.from.mockReturnValue(stub);

    const result = await ConsultanteController.obtenerConsultantePorId('u-1', makeSuperadmin());

    expect(result.success).toBe(true);
    expect(result.data.ficha_id).toBeNull();
    // Only called once (usuarios table)
    expect(supabase.from).toHaveBeenCalledTimes(1);
  });

  it('fills missing fields with empty strings', async () => {
    const usuarioData = { id: 'u-1', nombre_completo: null, email: null, telefono: null };

    const stub = makeSequentialStubs(
      { data: usuarioData, error: null },
      { data: null, error: null },
    );
    supabase.from.mockReturnValue(stub);

    const result = await ConsultanteController.obtenerConsultantePorId('u-1', makeProfile());

    expect(result.data.nombre_completo).toBe('');
    expect(result.data.email).toBe('');
    expect(result.data.telefono).toBe('');
  });

  it('returns success:false on DB error', async () => {
    const stub = makeQueryStub({ data: null, error: { message: 'not found' } });
    supabase.from.mockReturnValue(stub);

    const result = await ConsultanteController.obtenerConsultantePorId('u-999', makeProfile());

    expect(result.success).toBe(false);
    expect(result.error).toBe('not found');
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// actualizarConsultante
// ═══════════════════════════════════════════════════════════════════════════════

describe('ConsultanteController.actualizarConsultante', () => {
  it('returns FORBIDDEN when requirePermission fails', async () => {
    mockRequirePermission.mockReturnValue({ success: false, error: 'Sin permisos', code: 'FORBIDDEN' });

    const result = await ConsultanteController.actualizarConsultante('u-1', { nombre_completo: 'Ana' }, makeProfile());

    expect(result).toEqual({ success: false, error: 'Sin permisos', code: 'FORBIDDEN' });
    expect(supabase.from).not.toHaveBeenCalled();
  });

  it('updates and returns success message', async () => {
    const stub = makeQueryStub({ data: null, error: null });
    supabase.from.mockReturnValue(stub);

    const result = await ConsultanteController.actualizarConsultante(
      'u-1',
      { nombre_completo: 'Ana García', email: 'ana@test.com', telefono: '111' },
      makeProfile(),
    );

    expect(result.success).toBe(true);
    expect(result.message).toBe('Consultante actualizado correctamente');
    expect(stub.update).toHaveBeenCalledWith({
      nombre_completo: 'Ana García',
      email: 'ana@test.com',
      telefono: '111',
    });
    expect(stub.eq).toHaveBeenCalledWith('id', 'u-1');
  });

  it('trims whitespace from fields before updating', async () => {
    const stub = makeQueryStub({ data: null, error: null });
    supabase.from.mockReturnValue(stub);

    await ConsultanteController.actualizarConsultante(
      'u-1',
      { nombre_completo: '  Ana  ', email: '  ana@test.com  ', telefono: '  111  ' },
      makeProfile(),
    );

    expect(stub.update).toHaveBeenCalledWith({
      nombre_completo: 'Ana',
      email: 'ana@test.com',
      telefono: '111',
    });
  });

  it('sets null for empty fields', async () => {
    const stub = makeQueryStub({ data: null, error: null });
    supabase.from.mockReturnValue(stub);

    await ConsultanteController.actualizarConsultante(
      'u-1',
      { nombre_completo: '', email: '', telefono: '' },
      makeProfile(),
    );

    expect(stub.update).toHaveBeenCalledWith({
      nombre_completo: null,
      email: null,
      telefono: null,
    });
  });

  it('returns success:false on DB error', async () => {
    const stub = makeQueryStub({ data: null, error: { message: 'update failed' } });
    supabase.from.mockReturnValue(stub);

    const result = await ConsultanteController.actualizarConsultante(
      'u-1',
      { nombre_completo: 'Ana' },
      makeProfile(),
    );

    expect(result.success).toBe(false);
    expect(result.error).toBe('update failed');
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// desactivarConsultante
// ═══════════════════════════════════════════════════════════════════════════════

describe('ConsultanteController.desactivarConsultante', () => {
  it('returns FORBIDDEN when requirePermission fails', async () => {
    mockRequirePermission.mockReturnValue({ success: false, error: 'Sin permisos', code: 'FORBIDDEN' });

    const result = await ConsultanteController.desactivarConsultante('u-1', makeProfile());

    expect(result).toEqual({ success: false, error: 'Sin permisos', code: 'FORBIDDEN' });
    expect(supabase.from).not.toHaveBeenCalled();
  });

  it('deletes from usuario_empresa and returns success message', async () => {
    const stub = makeQueryStub({ data: null, error: null });
    supabase.from.mockReturnValue(stub);

    const result = await ConsultanteController.desactivarConsultante('u-1', makeProfile());

    expect(result.success).toBe(true);
    expect(result.message).toBe('Consultante desactivado correctamente');
    expect(supabase.from).toHaveBeenCalledWith('usuario_empresa');
    expect(stub.delete).toHaveBeenCalled();
    expect(stub.eq).toHaveBeenCalledWith('usuario_id', 'u-1');
    expect(stub.eq).toHaveBeenCalledWith('empresa_id', 'emp-1');
  });

  it('returns success:false on DB error', async () => {
    const stub = makeQueryStub({ data: null, error: { message: 'delete failed' } });
    supabase.from.mockReturnValue(stub);

    const result = await ConsultanteController.desactivarConsultante('u-1', makeProfile());

    expect(result.success).toBe(false);
    expect(result.error).toBe('delete failed');
  });
});
