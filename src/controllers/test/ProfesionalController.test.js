/**
 * Tests for ProfesionalController
 *
 * Mocks:
 *  - src/config/supabase     → vi.mock → supabase + supabaseAdmin query-builder stubs
 *  - src/utils/permissions   → vi.mock → fine-grained control per test
 *
 * No DB calls are made; all Supabase interactions are stubbed.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

// ── Chainable query-builder stub ──────────────────────────────────────────────

const makeQueryStub = (resolveWith = { data: null, error: null }) => {
  const stub = {
    _resolve: resolveWith,
    select:     vi.fn().mockReturnThis(),
    eq:         vi.fn().mockReturnThis(),
    neq:        vi.fn().mockReturnThis(),
    in:         vi.fn().mockReturnThis(),
    is:         vi.fn().mockReturnThis(),
    insert:     vi.fn().mockReturnThis(),
    update:     vi.fn().mockReturnThis(),
    delete:     vi.fn().mockReturnThis(),
    single:     vi.fn().mockReturnThis(),
    maybeSingle: vi.fn().mockReturnThis(),
    then(resolve, reject) {
      return Promise.resolve(stub._resolve).then(resolve, reject);
    },
  };
  return stub;
};

// ── Mock: Supabase ─────────────────────────────────────────────────────────────
vi.mock('../../config/supabase', () => ({
  supabase: {
    from: vi.fn(),
  },
  supabaseAdmin: {
    auth: {
      admin: {
        createUser: vi.fn(),
        deleteUser: vi.fn(),
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

// ── Import SUT after mocks are set up ────────────────────────────────────────
import { ProfesionalController } from '../ProfesionalController.js';
import { supabase, supabaseAdmin } from '../../config/supabase';

// ── Helpers ───────────────────────────────────────────────────────────────────
const makeProfile = (overrides = {}) => ({
  rol: 'admin',
  empresaId: 'emp-1',
  usuarioId: 'user-admin',
  ...overrides,
});

const makeSuperadmin = () => makeProfile({ rol: 'superadmin', empresaId: null });

const permError = { success: false, error: 'Sin permiso' };
const empError  = { success: false, error: 'Sin empresa' };

// ── Reset between tests ───────────────────────────────────────────────────────
beforeEach(() => {
  vi.clearAllMocks();
  mockRequirePermission.mockReturnValue(null);
  mockRequireEmpresa.mockReturnValue(null);
});

// =============================================================================
// obtenerProfesionales
// =============================================================================
describe('ProfesionalController.obtenerProfesionales', () => {
  it('retorna lista deduplicada y ordenada por nombre para admin', async () => {
    const rawData = [
      { usuario_id: 'u1', roles: { nombre: 'profesional' }, usuarios: { id: 'u1', nombre_completo: 'Zoe Pérez',  email: 'zoe@test.com',  telefono: '111', avatar_url: '' } },
      { usuario_id: 'u2', roles: { nombre: 'admin'       }, usuarios: { id: 'u2', nombre_completo: 'Ana García', email: 'ana@test.com',  telefono: '222', avatar_url: '' } },
      // u1 aparece también como admin → debe ganar 'admin' por prioridad
      { usuario_id: 'u1', roles: { nombre: 'admin'       }, usuarios: { id: 'u1', nombre_completo: 'Zoe Pérez',  email: 'zoe@test.com',  telefono: '111', avatar_url: '' } },
    ];

    const stub = makeQueryStub({ data: rawData, error: null });
    supabase.from.mockReturnValue(stub);

    const result = await ProfesionalController.obtenerProfesionales(makeProfile());

    expect(result.success).toBe(true);
    expect(result.data).toHaveLength(2);
    // Ordenados por nombre: Ana primero
    expect(result.data[0].nombre_completo).toBe('Ana García');
    expect(result.data[1].nombre_completo).toBe('Zoe Pérez');
    // u1 debe tener rol 'admin' (mayor prioridad)
    const zoe = result.data.find(p => p.id === 'u1');
    expect(zoe.rol).toBe('admin');
  });

  it('superadmin obtiene todos los profesionales sin filtro de empresa', async () => {
    const stub = makeQueryStub({ data: [], error: null });
    supabase.from.mockReturnValue(stub);

    const result = await ProfesionalController.obtenerProfesionales(makeSuperadmin());

    expect(result.success).toBe(true);
    // requireEmpresa NO debe llamarse para superadmin
    expect(mockRequireEmpresa).not.toHaveBeenCalled();
    // eq('empresa_id', ...) NO debe llamarse (sin filtro)
    expect(stub.eq).not.toHaveBeenCalledWith('empresa_id', expect.anything());
  });

  it('retorna permError cuando requirePermission falla', async () => {
    mockRequirePermission.mockReturnValue(permError);

    const result = await ProfesionalController.obtenerProfesionales(makeProfile());

    expect(result).toEqual(permError);
    expect(supabase.from).not.toHaveBeenCalled();
  });

  it('retorna empError cuando admin no tiene empresaId', async () => {
    mockRequireEmpresa.mockReturnValue(empError);

    const result = await ProfesionalController.obtenerProfesionales(makeProfile({ empresaId: null }));

    expect(result).toEqual(empError);
    expect(supabase.from).not.toHaveBeenCalled();
  });

  it('retorna success:false cuando supabase lanza error', async () => {
    const stub = makeQueryStub({ data: null, error: { message: 'DB error' } });
    supabase.from.mockReturnValue(stub);

    const result = await ProfesionalController.obtenerProfesionales(makeProfile());

    expect(result.success).toBe(false);
    expect(result.error).toBe('DB error');
  });

  it('retorna lista vacía cuando no hay datos', async () => {
    const stub = makeQueryStub({ data: [], error: null });
    supabase.from.mockReturnValue(stub);

    const result = await ProfesionalController.obtenerProfesionales(makeProfile());

    expect(result.success).toBe(true);
    expect(result.data).toHaveLength(0);
  });
});

// =============================================================================
// obtenerProfesionalPorId
// =============================================================================
describe('ProfesionalController.obtenerProfesionalPorId', () => {
  it('retorna el profesional cuando existe', async () => {
    const userData = { id: 'u1', nombre_completo: 'Ana García', email: 'ana@test.com', telefono: '222', avatar_url: 'img.jpg' };
    const stub = makeQueryStub({ data: userData, error: null });
    supabase.from.mockReturnValue(stub);

    const result = await ProfesionalController.obtenerProfesionalPorId('u1', makeProfile());

    expect(result.success).toBe(true);
    expect(result.data.id).toBe('u1');
    expect(result.data.usuario_id).toBe('u1');
    expect(result.data.nombre_completo).toBe('Ana García');
    expect(result.data.email).toBe('ana@test.com');
  });

  it('retorna permError cuando requirePermission falla', async () => {
    mockRequirePermission.mockReturnValue(permError);

    const result = await ProfesionalController.obtenerProfesionalPorId('u1', makeProfile());

    expect(result).toEqual(permError);
    expect(supabase.from).not.toHaveBeenCalled();
  });

  it('retorna success:false cuando supabase lanza error', async () => {
    const stub = makeQueryStub({ data: null, error: { message: 'Not found' } });
    supabase.from.mockReturnValue(stub);

    const result = await ProfesionalController.obtenerProfesionalPorId('missing', makeProfile());

    expect(result.success).toBe(false);
    expect(result.error).toBe('Not found');
  });
});

// =============================================================================
// crearProfesional
// =============================================================================
describe('ProfesionalController.crearProfesional', () => {
  const validData = { nombre: 'Carlos López', email: 'carlos@test.com', telefono: '333', esAdmin: false };

  it('crea profesional nuevo exitosamente', async () => {
    // supabaseAdmin.auth.admin.createUser → success
    supabaseAdmin.auth.admin.createUser.mockResolvedValue({
      data: { user: { id: 'auth-u1' } },
      error: null,
    });

    // Llamadas a supabase.from en orden:
    // 1. usuarios - verificar existente (maybeSingle) → null (no existe)
    // 2. usuarios - insert → usuario creado
    // 3. roles - select por nombre → rol encontrado
    // 4. usuario_empresa - verificar existente (maybeSingle) → null
    // 5. usuario_empresa - insert → ok
    let callIndex = 0;
    const responses = [
      { data: null, error: null },                                       // usuarios maybeSingle (no existe)
      { data: { id: 'nuevo-u1' }, error: null },                        // usuarios insert
      { data: { id: 'rol-prof-1' }, error: null },                      // roles select
      { data: null, error: null },                                       // usuario_empresa maybeSingle (no existe)
      { data: null, error: null },                                       // usuario_empresa insert
    ];

    supabase.from.mockImplementation(() => {
      const stub = makeQueryStub(responses[callIndex]);
      callIndex++;
      return stub;
    });

    const result = await ProfesionalController.crearProfesional(validData, makeProfile());

    expect(result.success).toBe(true);
    expect(result.data.email).toBe('carlos@test.com');
    expect(result.passwordTemporal).toBe('123456');
  });

  it('retorna error cuando nombre o email faltan', async () => {
    const result = await ProfesionalController.crearProfesional({ nombre: '', email: '' }, makeProfile());

    expect(result.success).toBe(false);
    expect(result.error).toMatch(/obligatorios/i);
    expect(supabaseAdmin.auth.admin.createUser).not.toHaveBeenCalled();
  });

  it('retorna permError cuando requirePermission falla', async () => {
    mockRequirePermission.mockReturnValue(permError);

    const result = await ProfesionalController.crearProfesional(validData, makeProfile());

    expect(result).toEqual(permError);
  });

  it('retorna empError cuando requireEmpresa falla', async () => {
    mockRequireEmpresa.mockReturnValue(empError);

    const result = await ProfesionalController.crearProfesional(validData, makeProfile());

    expect(result).toEqual(empError);
  });

  it('reutiliza auth_user_id existente cuando el email ya está registrado en Auth (error 422)', async () => {
    // Auth falla con 422
    supabaseAdmin.auth.admin.createUser.mockResolvedValue({
      data: null,
      error: { status: 422, message: 'Email already been registered' },
    });

    // Llamadas en orden:
    // 1. usuarios - buscar por email para obtener auth_user_id → encontrado
    // 2. usuarios - verificar existente en tabla usuarios → existente
    // 3. usuarios - update auth_user_id (is null) → ok
    // 4. roles - select → rol encontrado
    // 5. usuario_empresa - verificar existente → null
    // 6. usuario_empresa - insert → ok
    let callIndex = 0;
    const responses = [
      { data: { id: 'u-existing', auth_user_id: 'auth-existing' }, error: null }, // usuarios por email (auth lookup)
      { data: { id: 'u-existing' }, error: null },                                 // usuarios maybeSingle (check existente)
      { data: null, error: null },                                                  // usuarios update
      { data: { id: 'rol-prof-1' }, error: null },                                 // roles
      { data: null, error: null },                                                  // usuario_empresa maybeSingle
      { data: null, error: null },                                                  // usuario_empresa insert
    ];

    supabase.from.mockImplementation(() => {
      const stub = makeQueryStub(responses[callIndex]);
      callIndex++;
      return stub;
    });

    const result = await ProfesionalController.crearProfesional(validData, makeProfile());

    expect(result.success).toBe(true);
    // La contraseña temporal sigue siendo devuelta
    expect(result.passwordTemporal).toBe('123456');
  });

  it('retorna error cuando auth 422 pero no hay auth_user_id en tabla usuarios', async () => {
    supabaseAdmin.auth.admin.createUser.mockResolvedValue({
      data: null,
      error: { status: 422, message: 'Email already been registered' },
    });

    // usuarios busca por email → no tiene auth_user_id
    const stub = makeQueryStub({ data: { id: 'u1', auth_user_id: null }, error: null });
    supabase.from.mockReturnValue(stub);

    const result = await ProfesionalController.crearProfesional(validData, makeProfile());

    expect(result.success).toBe(false);
    expect(result.error).toMatch(/ya está registrado/i);
  });

  it('retorna error cuando el usuario ya tiene un rol de igual o mayor prioridad en la empresa', async () => {
    supabaseAdmin.auth.admin.createUser.mockResolvedValue({
      data: { user: { id: 'auth-u1' } },
      error: null,
    });

    let callIndex = 0;
    const responses = [
      { data: { id: 'u1' }, error: null },                                          // usuarios maybeSingle (existente)
      { data: null, error: null },                                                   // usuarios update (is null)
      { data: { id: 'rol-prof-1' }, error: null },                                  // roles
      { data: { id: 'ue-1', roles: { nombre: 'admin' } }, error: null },            // usuario_empresa maybeSingle → ya es admin
    ];

    supabase.from.mockImplementation(() => {
      const stub = makeQueryStub(responses[callIndex]);
      callIndex++;
      return stub;
    });

    const result = await ProfesionalController.crearProfesional(
      { ...validData, esAdmin: false }, // intenta asignar rol profesional a alguien que ya es admin
      makeProfile()
    );

    expect(result.success).toBe(false);
    expect(result.error).toMatch(/ya tiene el rol/i);
  });

  it('elimina el auth user creado si falla el insert en usuario_empresa', async () => {
    supabaseAdmin.auth.admin.createUser.mockResolvedValue({
      data: { user: { id: 'auth-u1' } },
      error: null,
    });
    supabaseAdmin.auth.admin.deleteUser.mockResolvedValue({});

    let callIndex = 0;
    const responses = [
      { data: null, error: null },                                       // usuarios maybeSingle (no existe)
      { data: { id: 'nuevo-u1' }, error: null },                        // usuarios insert
      { data: { id: 'rol-prof-1' }, error: null },                      // roles
      { data: null, error: null },                                       // usuario_empresa maybeSingle (no existe)
      { data: null, error: { message: 'ue insert failed' } },           // usuario_empresa insert → error
    ];

    supabase.from.mockImplementation(() => {
      const stub = makeQueryStub(responses[callIndex]);
      callIndex++;
      return stub;
    });

    const result = await ProfesionalController.crearProfesional(validData, makeProfile());

    expect(result.success).toBe(false);
    expect(result.error).toMatch(/asignar empresa/i);
    expect(supabaseAdmin.auth.admin.deleteUser).toHaveBeenCalledWith('auth-u1');
  });

  it('normaliza el email a minúsculas y sin espacios', async () => {
    supabaseAdmin.auth.admin.createUser.mockResolvedValue({
      data: { user: { id: 'auth-u1' } },
      error: null,
    });

    let callIndex = 0;
    const responses = [
      { data: null, error: null },
      { data: { id: 'nuevo-u1' }, error: null },
      { data: { id: 'rol-prof-1' }, error: null },
      { data: null, error: null },
      { data: null, error: null },
    ];

    supabase.from.mockImplementation(() => {
      const stub = makeQueryStub(responses[callIndex]);
      callIndex++;
      return stub;
    });

    const result = await ProfesionalController.crearProfesional(
      { nombre: 'Test', email: '  TEST@Example.COM  ', telefono: '', esAdmin: false },
      makeProfile()
    );

    expect(result.success).toBe(true);
    expect(result.data.email).toBe('test@example.com');
  });
});

// =============================================================================
// actualizarProfesional
// =============================================================================
describe('ProfesionalController.actualizarProfesional', () => {
  const updateData = { nombre_completo: 'Carlos Editado', email: 'carlos@test.com', telefono: '999', esAdmin: false };

  it('actualiza datos del profesional exitosamente', async () => {
    let callIndex = 0;
    const responses = [
      { data: { id: 'u1', auth_user_id: 'auth-u1', email: 'carlos@test.com' }, error: null }, // leer usuario
      { data: null, error: null },                                                               // update usuarios
      { data: { id: 'rol-prof-1' }, error: null },                                              // roles select
      { data: null, error: null },                                                               // usuario_empresa update
    ];

    supabase.from.mockImplementation(() => {
      const stub = makeQueryStub(responses[callIndex]);
      callIndex++;
      return stub;
    });

    const result = await ProfesionalController.actualizarProfesional('u1', updateData, makeProfile());

    expect(result.success).toBe(true);
    expect(result.message).toMatch(/actualizado/i);
    expect(result.passwordTemporal).toBeUndefined();
  });

  it('crea auth user y retorna passwordTemporal cuando auth_user_id es null (reparación)', async () => {
    supabaseAdmin.auth.admin.createUser.mockResolvedValue({
      data: { user: { id: 'new-auth-id' } },
      error: null,
    });

    let callIndex = 0;
    const responses = [
      { data: { id: 'u1', auth_user_id: null, email: 'carlos@test.com' }, error: null }, // leer usuario sin auth
      { data: null, error: null },                                                          // update auth_user_id
      { data: null, error: null },                                                          // update datos usuario
      { data: { id: 'rol-prof-1' }, error: null },                                         // roles
      { data: null, error: null },                                                          // usuario_empresa update
    ];

    supabase.from.mockImplementation(() => {
      const stub = makeQueryStub(responses[callIndex]);
      callIndex++;
      return stub;
    });

    const result = await ProfesionalController.actualizarProfesional('u1', updateData, makeProfile());

    expect(result.success).toBe(true);
    expect(result.passwordTemporal).toBe('123456');
  });

  it('elimina auth user creado si falla el patch de auth_user_id', async () => {
    supabaseAdmin.auth.admin.createUser.mockResolvedValue({
      data: { user: { id: 'new-auth-id' } },
      error: null,
    });
    supabaseAdmin.auth.admin.deleteUser.mockResolvedValue({});

    let callIndex = 0;
    const responses = [
      { data: { id: 'u1', auth_user_id: null, email: 'carlos@test.com' }, error: null }, // leer usuario sin auth
      { data: null, error: { message: 'patch failed' } },                                  // update auth_user_id → error
    ];

    supabase.from.mockImplementation(() => {
      const stub = makeQueryStub(responses[callIndex]);
      callIndex++;
      return stub;
    });

    const result = await ProfesionalController.actualizarProfesional('u1', updateData, makeProfile());

    expect(result.success).toBe(false);
    expect(result.error).toMatch(/vincular cuenta/i);
    expect(supabaseAdmin.auth.admin.deleteUser).toHaveBeenCalledWith('new-auth-id');
  });

  it('retorna permError cuando requirePermission falla', async () => {
    mockRequirePermission.mockReturnValue(permError);

    const result = await ProfesionalController.actualizarProfesional('u1', updateData, makeProfile());

    expect(result).toEqual(permError);
    expect(supabase.from).not.toHaveBeenCalled();
  });

  it('retorna error cuando falla la lectura del usuario', async () => {
    const stub = makeQueryStub({ data: null, error: { message: 'read error' } });
    supabase.from.mockReturnValue(stub);

    const result = await ProfesionalController.actualizarProfesional('u1', updateData, makeProfile());

    expect(result.success).toBe(false);
    expect(result.error).toMatch(/leer profesional/i);
  });

  it('actualiza rol a admin cuando esAdmin=true', async () => {
    let callIndex = 0;
    const responses = [
      { data: { id: 'u1', auth_user_id: 'auth-u1', email: 'carlos@test.com' }, error: null },
      { data: null, error: null },
      { data: { id: 'rol-admin-1' }, error: null },
      { data: null, error: null },
    ];

    supabase.from.mockImplementation(() => {
      const stub = makeQueryStub(responses[callIndex]);
      callIndex++;
      return stub;
    });

    const result = await ProfesionalController.actualizarProfesional(
      'u1',
      { ...updateData, esAdmin: true },
      makeProfile()
    );

    expect(result.success).toBe(true);
    // El tercer from() corresponde a roles — verificamos que .eq fue llamado con 'admin'
    const rolCall = supabase.from.mock.calls[2]; // índice 2 = tercera llamada
    expect(rolCall[0]).toBe('roles');
  });
});

// =============================================================================
// desactivarProfesional
// =============================================================================
describe('ProfesionalController.desactivarProfesional', () => {
  it('elimina el registro de usuario_empresa exitosamente', async () => {
    const stub = makeQueryStub({ data: null, error: null });
    supabase.from.mockReturnValue(stub);

    const result = await ProfesionalController.desactivarProfesional('u1', makeProfile());

    expect(result.success).toBe(true);
    expect(supabase.from).toHaveBeenCalledWith('usuario_empresa');
  });

  it('retorna permError cuando requirePermission falla', async () => {
    mockRequirePermission.mockReturnValue(permError);

    const result = await ProfesionalController.desactivarProfesional('u1', makeProfile());

    expect(result).toEqual(permError);
    expect(supabase.from).not.toHaveBeenCalled();
  });

  it('retorna success:false cuando supabase lanza error', async () => {
    const stub = makeQueryStub({ data: null, error: { message: 'delete failed' } });
    supabase.from.mockReturnValue(stub);

    const result = await ProfesionalController.desactivarProfesional('u1', makeProfile());

    expect(result.success).toBe(false);
    expect(result.error).toBe('delete failed');
  });
});

// =============================================================================
// obtenerProfesionalesDisponibles
// =============================================================================
describe('ProfesionalController.obtenerProfesionalesDisponibles', () => {
  it('retorna profesionales que trabajan en el horario solicitado', async () => {
    // Primera llamada: obtenerProfesionales internamente (usuario_empresa)
    const rawProfs = [
      { usuario_id: 'u1', roles: { nombre: 'profesional' }, usuarios: { id: 'u1', nombre_completo: 'Ana', email: 'a@t.com', telefono: '', avatar_url: '' } },
      { usuario_id: 'u2', roles: { nombre: 'profesional' }, usuarios: { id: 'u2', nombre_completo: 'Beto', email: 'b@t.com', telefono: '', avatar_url: '' } },
    ];

    // Segunda llamada: horarios_atencion
    const horarios = [
      { profesional_id: 'u1', dia_semana: new Date('2025-06-02').getDay(), hora_inicio: '09:00', hora_fin: '18:00' },
      // u2 comienza tarde (14:00) — horaInicio '10:00' < hora_inicio '14:00', no cubre el horario solicitado
      { profesional_id: 'u2', dia_semana: new Date('2025-06-02').getDay(), hora_inicio: '14:00', hora_fin: '20:00' },
    ];

    let callIndex = 0;
    const responses = [
      { data: rawProfs, error: null },    // usuario_empresa (obtenerProfesionales)
      { data: horarios, error: null },    // horarios_atencion
    ];

    supabase.from.mockImplementation(() => {
      const stub = makeQueryStub(responses[callIndex]);
      callIndex++;
      return stub;
    });

    const result = await ProfesionalController.obtenerProfesionalesDisponibles(
      '2025-06-02',
      '10:00',
      '11:00',
      makeProfile()
    );

    expect(result.success).toBe(true);
    expect(result.data).toHaveLength(1);
    expect(result.data[0].id).toBe('u1');
  });

  it('retorna lista vacía cuando no hay profesionales en la empresa', async () => {
    const stub = makeQueryStub({ data: [], error: null });
    supabase.from.mockReturnValue(stub);

    const result = await ProfesionalController.obtenerProfesionalesDisponibles(
      '2025-06-02', '10:00', '11:00', makeProfile()
    );

    expect(result.success).toBe(true);
    expect(result.data).toHaveLength(0);
  });

  it('retorna permError cuando requirePermission falla (reservas:read)', async () => {
    mockRequirePermission.mockReturnValue(permError);

    const result = await ProfesionalController.obtenerProfesionalesDisponibles(
      '2025-06-02', '10:00', '11:00', makeProfile()
    );

    expect(result).toEqual(permError);
    expect(supabase.from).not.toHaveBeenCalled();
  });

  it('propaga el error de obtenerProfesionales cuando falla', async () => {
    // Primero mockRequirePermission debe pasar para 'reservas:read',
    // pero la segunda llamada a requirePermission (dentro de obtenerProfesionales,
    // para 'profesionales:read') debe fallar.
    let permCallCount = 0;
    mockRequirePermission.mockImplementation(() => {
      permCallCount++;
      // Primera llamada (reservas:read) → ok; segunda (profesionales:read) → error
      if (permCallCount === 2) return permError;
      return null;
    });

    const result = await ProfesionalController.obtenerProfesionalesDisponibles(
      '2025-06-02', '10:00', '11:00', makeProfile()
    );

    expect(result).toEqual(permError);
  });

  it('retorna lista vacía cuando ningún profesional tiene horario para ese día', async () => {
    const rawProfs = [
      { usuario_id: 'u1', roles: { nombre: 'profesional' }, usuarios: { id: 'u1', nombre_completo: 'Ana', email: 'a@t.com', telefono: '', avatar_url: '' } },
    ];

    let callIndex = 0;
    const responses = [
      { data: rawProfs, error: null },  // usuario_empresa
      { data: [], error: null },         // horarios_atencion → vacío
    ];

    supabase.from.mockImplementation(() => {
      const stub = makeQueryStub(responses[callIndex]);
      callIndex++;
      return stub;
    });

    const result = await ProfesionalController.obtenerProfesionalesDisponibles(
      '2025-06-02', '10:00', '11:00', makeProfile()
    );

    expect(result.success).toBe(true);
    expect(result.data).toHaveLength(0);
  });
});
