/**
 * Tests for ReservaController
 *
 * Mocks:
 *  - src/config/supabase  → vi.mock → supabase query builder stub
 *  - src/utils/permissions → vi.mock → allows fine-grained control per test
 *  - src/models/ReservaModel → real implementation (no side-effects, safe to use)
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

// ── Mock: Supabase ────────────────────────────────────────────────────────────
// Chainable query-builder stub.  The stub is a thenable so `await query`
// resolves with whatever `_resolve` holds at that moment.

const makeQueryStub = (resolveWith = { data: [], error: null }) => {
  const stub = {
    _resolve: resolveWith,
    select: vi.fn().mockReturnThis(),
    eq:     vi.fn().mockReturnThis(),
    in:     vi.fn().mockReturnThis(),
    gte:    vi.fn().mockReturnThis(),
    lte:    vi.fn().mockReturnThis(),
    order:  vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    single: vi.fn().mockReturnThis(),
    then(resolve, reject) {
      return Promise.resolve(stub._resolve).then(resolve, reject);
    },
  };
  return stub;
};

/**
 * Returns a stub where successive `await`s get different results.
 * Each time the stub is awaited it advances through the `results` array.
 */
const makeSequentialStubs = (...results) => {
  let callCount = 0;
  const stub = {
    select: vi.fn().mockReturnThis(),
    eq:     vi.fn().mockReturnThis(),
    in:     vi.fn().mockReturnThis(),
    gte:    vi.fn().mockReturnThis(),
    lte:    vi.fn().mockReturnThis(),
    order:  vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    single: vi.fn().mockReturnThis(),
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

// ── Mock: permissions ─────────────────────────────────────────────────────────
const mockRequirePermission = vi.fn(() => null);
const mockRequireEmpresa    = vi.fn(() => null);

vi.mock('../../utils/permissions', () => ({
  requirePermission: (...args) => mockRequirePermission(...args),
  requireEmpresa:    (...args) => mockRequireEmpresa(...args),
}));

// ── Import SUT after mocks are set up ────────────────────────────────────────
import { ReservaController } from '../ReservaController.js';
import { supabase } from '../../config/supabase';

// ── Helpers ───────────────────────────────────────────────────────────────────
const makeProfile = (overrides = {}) => ({
  rol: 'admin',
  empresaId: 'emp-1',
  usuarioId: 'user-1',
  ...overrides,
});

const makeSuperadmin = () => makeProfile({ rol: 'superadmin', empresaId: null });

// ── Reset between tests ───────────────────────────────────────────────────────
beforeEach(() => {
  vi.clearAllMocks();
  mockRequirePermission.mockReturnValue(null);
  mockRequireEmpresa.mockReturnValue(null);
});

// ═══════════════════════════════════════════════════════════════════════════════
// enriquecerReservas
// ═══════════════════════════════════════════════════════════════════════════════
describe('enriquecerReservas', () => {
  it('returns [] when called with empty array', async () => {
    const result = await ReservaController.enriquecerReservas([]);
    expect(result).toEqual([]);
  });

  it('returns [] when called with null', async () => {
    const result = await ReservaController.enriquecerReservas(null);
    expect(result).toEqual([]);
  });

  it('enriches reservas with user data from supabase', async () => {
    const reservas = [
      { id: 'r1', cliente_id: 'c1', profesional_id: 'p1', servicios: { nombre: 'Yoga' } },
    ];
    const usuarios = [
      { id: 'c1', nombre_completo: 'Ana Paz', email: 'ana@test.com', telefono: '123' },
      { id: 'p1', nombre_completo: 'Dr. López', email: 'lopez@test.com', telefono: '456' },
    ];

    const stub = makeQueryStub({ data: usuarios, error: null });
    supabase.from.mockReturnValue(stub);

    const result = await ReservaController.enriquecerReservas(reservas);

    expect(result).toHaveLength(1);
    expect(result[0].consultante_nombre).toBe('Ana Paz');
    expect(result[0].profesional_nombre).toBe('Dr. López');
    expect(result[0].servicio_nombre).toBe('Yoga');
  });

  it('leaves enriched fields empty when users not found in DB', async () => {
    const reservas = [
      { id: 'r1', cliente_id: 'c-unknown', profesional_id: 'p-unknown', servicios: null },
    ];

    const stub = makeQueryStub({ data: [], error: null });
    supabase.from.mockReturnValue(stub);

    const result = await ReservaController.enriquecerReservas(reservas);

    expect(result[0].consultante_nombre).toBe('');
    expect(result[0].profesional_nombre).toBe('');
    expect(result[0].servicio_nombre).toBe('');
  });

  it('handles reservas without cliente_id or profesional_id', async () => {
    const reservas = [{ id: 'r2', cliente_id: null, profesional_id: null }];
    const stub = makeQueryStub({ data: [], error: null });
    supabase.from.mockReturnValue(stub);

    const result = await ReservaController.enriquecerReservas(reservas);
    expect(result).toHaveLength(1);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// obtenerProfesionalIdsEmpresa
// ═══════════════════════════════════════════════════════════════════════════════
describe('obtenerProfesionalIdsEmpresa', () => {
  it('returns null for superadmin (no filter)', async () => {
    const result = await ReservaController.obtenerProfesionalIdsEmpresa(makeSuperadmin());
    expect(result).toBeNull();
  });

  it('returns array of usuario_ids for admin profile', async () => {
    const rows = [{ usuario_id: 'u1' }, { usuario_id: 'u2' }];
    const stub = makeQueryStub({ data: rows, error: null });
    supabase.from.mockReturnValue(stub);

    const result = await ReservaController.obtenerProfesionalIdsEmpresa(makeProfile());
    expect(result).toEqual(['u1', 'u2']);
  });

  it('returns empty array when no professionals found', async () => {
    const stub = makeQueryStub({ data: null, error: null });
    supabase.from.mockReturnValue(stub);

    const result = await ReservaController.obtenerProfesionalIdsEmpresa(makeProfile());
    expect(result).toEqual([]);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// obtenerReservasPorFecha
// ═══════════════════════════════════════════════════════════════════════════════
describe('obtenerReservasPorFecha', () => {
  it('returns FORBIDDEN when no permission', async () => {
    mockRequirePermission.mockReturnValueOnce({ success: false, error: 'Sin permisos', code: 'FORBIDDEN' });
    const result = await ReservaController.obtenerReservasPorFecha('2025-01-01', null, makeProfile());
    expect(result).toEqual({ success: false, error: 'Sin permisos', code: 'FORBIDDEN' });
  });

  it('returns empty array with warning when profIds is empty (no professionals in company)', async () => {
    // obtenerProfesionalIdsEmpresa → []  ⇒ short-circuit, no reservas query
    const stub = makeQueryStub({ data: [], error: null });
    supabase.from.mockReturnValue(stub);

    const result = await ReservaController.obtenerReservasPorFecha('2025-01-01', null, makeProfile());
    expect(result.success).toBe(true);
    expect(result.data).toEqual([]);
    expect(result.warning).toBeDefined();
  });

  it('returns reservas for a given date (superadmin, no scoping)', async () => {
    const rawReservas = [
      { id: 'r1', cliente_id: 'c1', profesional_id: 'p1', servicios: { nombre: 'Meditación' } },
    ];
    const usuarios = [
      { id: 'c1', nombre_completo: 'Cliente Uno', email: 'c@test.com', telefono: '' },
      { id: 'p1', nombre_completo: 'Prof Uno', email: 'p@test.com', telefono: '' },
    ];

    // superadmin path: reservas query → then usuarios query (in enriquecer)
    const stub = makeSequentialStubs(
      { data: rawReservas, error: null },
      { data: usuarios, error: null },
    );
    supabase.from.mockReturnValue(stub);

    const result = await ReservaController.obtenerReservasPorFecha('2025-01-01', null, makeSuperadmin());

    expect(result.success).toBe(true);
    expect(result.data).toHaveLength(1);
    expect(result.data[0].consultante_nombre).toBe('Cliente Uno');
  });

  it('returns { success: false, error } on DB error (non-superadmin)', async () => {
    // Call sequence: obtenerProfesionalIdsEmpresa → reservas query (error)
    const stub = makeSequentialStubs(
      { data: [{ usuario_id: 'p1' }], error: null },
      { data: null, error: { message: 'DB error' } },
    );
    supabase.from.mockReturnValue(stub);

    const result = await ReservaController.obtenerReservasPorFecha('2025-01-01', null, makeProfile());
    expect(result.success).toBe(false);
    expect(result.error).toBe('DB error');
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// obtenerFechasConReservas
// ═══════════════════════════════════════════════════════════════════════════════
describe('obtenerFechasConReservas', () => {
  it('returns FORBIDDEN when no permission', async () => {
    mockRequirePermission.mockReturnValueOnce({ success: false, error: 'Sin permisos', code: 'FORBIDDEN' });
    const result = await ReservaController.obtenerFechasConReservas('2025-01-01', '2025-01-31', null, makeProfile());
    expect(result).toEqual({ success: false, error: 'Sin permisos', code: 'FORBIDDEN' });
  });

  it('converts UTC timestamps to AR local dates (UTC-3)', async () => {
    // 2025-01-02T02:30:00Z → UTC-3 = 2025-01-01T23:30:00 → date 2025-01-01
    const rawData = [{ fecha_hora_inicio: '2025-01-02T02:30:00Z' }];
    const stub = makeQueryStub({ data: rawData, error: null });
    supabase.from.mockReturnValue(stub);

    const result = await ReservaController.obtenerFechasConReservas('2025-01-01', '2025-01-31', null, makeProfile());

    expect(result.success).toBe(true);
    expect(result.data[0].fecha).toBe('2025-01-01');
  });

  it('keeps date as-is for timestamps that remain on the same AR day', async () => {
    // 2025-01-15T15:00:00Z → UTC-3 = 2025-01-15T12:00:00 → date 2025-01-15
    const rawData = [{ fecha_hora_inicio: '2025-01-15T15:00:00Z' }];
    const stub = makeQueryStub({ data: rawData, error: null });
    supabase.from.mockReturnValue(stub);

    const result = await ReservaController.obtenerFechasConReservas('2025-01-01', '2025-01-31', null, makeProfile());
    expect(result.data[0].fecha).toBe('2025-01-15');
  });

  it('filters by profesionalId when provided', async () => {
    const stub = makeQueryStub({ data: [], error: null });
    supabase.from.mockReturnValue(stub);

    await ReservaController.obtenerFechasConReservas('2025-01-01', '2025-01-31', 'prof-99', makeProfile());

    expect(stub.eq).toHaveBeenCalledWith('profesional_id', 'prof-99');
  });

  it('does NOT filter by profesional_id when profesionalId is falsy', async () => {
    const stub = makeQueryStub({ data: [], error: null });
    supabase.from.mockReturnValue(stub);

    await ReservaController.obtenerFechasConReservas('2025-01-01', '2025-01-31', null, makeProfile());

    const eqCalls = stub.eq.mock.calls.map(c => c[0]);
    expect(eqCalls).not.toContain('profesional_id');
  });

  it('returns { success: false } on DB error', async () => {
    const stub = makeQueryStub({ data: null, error: { message: 'timeout' } });
    supabase.from.mockReturnValue(stub);

    const result = await ReservaController.obtenerFechasConReservas('2025-01-01', '2025-01-31', null, makeProfile());
    expect(result.success).toBe(false);
    expect(result.error).toBe('timeout');
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// crearReserva
// ═══════════════════════════════════════════════════════════════════════════════
describe('crearReserva', () => {
  const validReservaData = {
    cliente_id: 'c1',
    fecha: '2025-01-15',
    hora_inicio: '10:00',
    servicio_id: 'svc-1',
  };

  it('returns FORBIDDEN when no permission', async () => {
    mockRequirePermission.mockReturnValueOnce({ success: false, error: 'Sin permisos', code: 'FORBIDDEN' });
    const result = await ReservaController.crearReserva(validReservaData, 'p1', makeProfile());
    expect(result).toEqual({ success: false, error: 'Sin permisos', code: 'FORBIDDEN' });
  });

  it('returns error when reserva is invalid (missing required fields)', async () => {
    const result = await ReservaController.crearReserva(
      { cliente_id: null, fecha: '', hora_inicio: '' },
      'p1',
      makeProfile(),
    );
    expect(result.success).toBe(false);
    expect(result.error).toMatch(/obligatorios/i);
  });

  it('creates a reserva and returns enriched data', async () => {
    const inserted = [{ ...validReservaData, id: 'new-r', profesional_id: 'p1', empresa_id: 'emp-1' }];
    const usuarios = [
      { id: 'c1', nombre_completo: 'Nuevo Cliente', email: 'nc@test.com', telefono: '' },
    ];

    // insert().select() → then usuarios query (enriquecer)
    const stub = makeSequentialStubs(
      { data: inserted, error: null },
      { data: usuarios, error: null },
    );
    supabase.from.mockReturnValue(stub);

    const result = await ReservaController.crearReserva(validReservaData, 'p1', makeProfile());

    expect(result.success).toBe(true);
    expect(result.data).toBeDefined();
    expect(result.data.consultante_nombre).toBe('Nuevo Cliente');
  });

  it('uses consultante_id as fallback when cliente_id is missing', async () => {
    const dataWithConsultante = {
      consultante_id: 'c2',
      fecha: '2025-01-15',
      hora_inicio: '11:00',
    };
    const inserted = [{ ...dataWithConsultante, cliente_id: 'c2', id: 'r-new' }];

    const stub = makeSequentialStubs(
      { data: inserted, error: null },
      { data: [], error: null },
    );
    supabase.from.mockReturnValue(stub);

    const result = await ReservaController.crearReserva(dataWithConsultante, 'p1', makeProfile());
    expect(result.success).toBe(true);
  });

  it('returns { success: false } on DB insert error', async () => {
    const stub = makeQueryStub({ data: null, error: { message: 'insert failed' } });
    supabase.from.mockReturnValue(stub);

    const result = await ReservaController.crearReserva(validReservaData, 'p1', makeProfile());
    expect(result.success).toBe(false);
    expect(result.error).toBe('insert failed');
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// eliminarReserva
// ═══════════════════════════════════════════════════════════════════════════════
describe('eliminarReserva', () => {
  it('returns FORBIDDEN when no permission', async () => {
    mockRequirePermission.mockReturnValueOnce({ success: false, error: 'Sin permisos', code: 'FORBIDDEN' });
    const result = await ReservaController.eliminarReserva('r1', makeProfile());
    expect(result).toEqual({ success: false, error: 'Sin permisos', code: 'FORBIDDEN' });
  });

  it('returns { success: true } on successful delete', async () => {
    const stub = makeQueryStub({ error: null });
    supabase.from.mockReturnValue(stub);

    const result = await ReservaController.eliminarReserva('r1', makeProfile());
    expect(result).toEqual({ success: true });
    expect(stub.eq).toHaveBeenCalledWith('id', 'r1');
  });

  it('returns { success: false } on DB error', async () => {
    const stub = makeQueryStub({ error: { message: 'foreign key violation' } });
    supabase.from.mockReturnValue(stub);

    const result = await ReservaController.eliminarReserva('r1', makeProfile());
    expect(result.success).toBe(false);
    expect(result.error).toBe('foreign key violation');
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// actualizarEstado
// ═══════════════════════════════════════════════════════════════════════════════
describe('actualizarEstado', () => {
  it('returns FORBIDDEN when no permission', async () => {
    mockRequirePermission.mockReturnValueOnce({ success: false, error: 'Sin permisos', code: 'FORBIDDEN' });
    const result = await ReservaController.actualizarEstado('r1', 'confirmada', makeProfile());
    expect(result).toEqual({ success: false, error: 'Sin permisos', code: 'FORBIDDEN' });
  });

  it('updates the estado field and returns { success: true }', async () => {
    const stub = makeQueryStub({ error: null });
    supabase.from.mockReturnValue(stub);

    const result = await ReservaController.actualizarEstado('r1', 'confirmada', makeProfile());
    expect(result).toEqual({ success: true });
    expect(stub.update).toHaveBeenCalledWith({ estado: 'confirmada' });
    expect(stub.eq).toHaveBeenCalledWith('id', 'r1');
  });

  it('returns { success: false } on DB error', async () => {
    const stub = makeQueryStub({ error: { message: 'network error' } });
    supabase.from.mockReturnValue(stub);

    const result = await ReservaController.actualizarEstado('r1', 'cancelada', makeProfile());
    expect(result.success).toBe(false);
    expect(result.error).toBe('network error');
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// registrarPago
// ═══════════════════════════════════════════════════════════════════════════════
describe('registrarPago', () => {
  it('returns FORBIDDEN when no permission', async () => {
    mockRequirePermission.mockReturnValueOnce({ success: false, error: 'Sin permisos', code: 'FORBIDDEN' });
    const result = await ReservaController.registrarPago('r1', {}, makeProfile());
    expect(result).toEqual({ success: false, error: 'Sin permisos', code: 'FORBIDDEN' });
  });

  it('updates only the provided pago fields', async () => {
    const stub = makeQueryStub({ error: null });
    supabase.from.mockReturnValue(stub);

    const pagoData = { precio_total: 5000, metodo_pago: 'transferencia', pagado: true };
    const result = await ReservaController.registrarPago('r1', pagoData, makeProfile());

    expect(result).toEqual({ success: true });
    expect(stub.update).toHaveBeenCalledWith({
      precio_total: 5000,
      metodo_pago: 'transferencia',
      pagado: true,
    });
  });

  it('ignores undefined pago fields', async () => {
    const stub = makeQueryStub({ error: null });
    supabase.from.mockReturnValue(stub);

    const pagoData = { pagado: true };
    await ReservaController.registrarPago('r1', pagoData, makeProfile());

    const updateArg = stub.update.mock.calls[0][0];
    expect(updateArg).toEqual({ pagado: true });
    expect(updateArg).not.toHaveProperty('precio_total');
    expect(updateArg).not.toHaveProperty('metodo_pago');
  });

  it('returns { success: false } on DB error', async () => {
    const stub = makeQueryStub({ error: { message: 'pago error' } });
    supabase.from.mockReturnValue(stub);

    const result = await ReservaController.registrarPago('r1', { pagado: true }, makeProfile());
    expect(result.success).toBe(false);
    expect(result.error).toBe('pago error');
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// obtenerReservaPorId
// ═══════════════════════════════════════════════════════════════════════════════
describe('obtenerReservaPorId', () => {
  it('returns FORBIDDEN when no permission', async () => {
    mockRequirePermission.mockReturnValueOnce({ success: false, error: 'Sin permisos', code: 'FORBIDDEN' });
    const result = await ReservaController.obtenerReservaPorId('r1', makeProfile());
    expect(result).toEqual({ success: false, error: 'Sin permisos', code: 'FORBIDDEN' });
  });

  it('returns enriched reserva with ficha data', async () => {
    const rawReserva = {
      id: 'r1',
      cliente_id: 'c1',
      profesional_id: 'p1',
      servicios: { nombre: 'Terapia' },
      fichas: [{ id: 'f1', nota: 'Primera sesión' }],
    };

    const stub = makeSequentialStubs(
      { data: rawReserva, error: null },
      { data: [{ id: 'c1', nombre_completo: 'Carlos', email: 'c@test.com', telefono: '' }], error: null },
    );
    supabase.from.mockReturnValue(stub);

    const result = await ReservaController.obtenerReservaPorId('r1', makeProfile());

    expect(result.success).toBe(true);
    expect(result.data.ficha).toEqual({ id: 'f1', nota: 'Primera sesión' });
    expect(result.data.consultante_nombre).toBe('Carlos');
  });

  it('returns ficha: null when fichas array is empty', async () => {
    const rawReserva = { id: 'r1', cliente_id: 'c1', profesional_id: null, servicios: null, fichas: [] };

    const stub = makeSequentialStubs(
      { data: rawReserva, error: null },
      { data: [], error: null },
    );
    supabase.from.mockReturnValue(stub);

    const result = await ReservaController.obtenerReservaPorId('r1', makeProfile());
    expect(result.data.ficha).toBeNull();
  });

  it('returns { success: false } on DB error', async () => {
    const stub = makeQueryStub({ data: null, error: { message: 'not found' } });
    supabase.from.mockReturnValue(stub);

    const result = await ReservaController.obtenerReservaPorId('r1', makeProfile());
    expect(result.success).toBe(false);
    expect(result.error).toBe('not found');
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// obtenerReservasPorCliente
// ═══════════════════════════════════════════════════════════════════════════════
describe('obtenerReservasPorCliente', () => {
  it('returns FORBIDDEN when no permission', async () => {
    mockRequirePermission.mockReturnValueOnce({ success: false, error: 'Sin permisos', code: 'FORBIDDEN' });
    const result = await ReservaController.obtenerReservasPorCliente('c1', makeProfile());
    expect(result).toEqual({ success: false, error: 'Sin permisos', code: 'FORBIDDEN' });
  });

  it('returns reservas filtered by clienteId and empresaId', async () => {
    const reservas = [
      { id: 'r2', cliente_id: 'c1', fecha: '2025-02-01' },
      { id: 'r1', cliente_id: 'c1', fecha: '2025-01-01' },
    ];
    const stub = makeQueryStub({ data: reservas, error: null });
    supabase.from.mockReturnValue(stub);

    const result = await ReservaController.obtenerReservasPorCliente('c1', makeProfile());

    expect(result.success).toBe(true);
    expect(result.data).toHaveLength(2);
    expect(stub.eq).toHaveBeenCalledWith('cliente_id', 'c1');
    expect(stub.eq).toHaveBeenCalledWith('empresa_id', 'emp-1');
  });

  it('returns [] when no reservas found', async () => {
    const stub = makeQueryStub({ data: null, error: null });
    supabase.from.mockReturnValue(stub);

    const result = await ReservaController.obtenerReservasPorCliente('c1', makeProfile());
    expect(result.success).toBe(true);
    expect(result.data).toEqual([]);
  });

  it('returns { success: false } on DB error', async () => {
    const stub = makeQueryStub({ data: null, error: { message: 'query failed' } });
    supabase.from.mockReturnValue(stub);

    const result = await ReservaController.obtenerReservasPorCliente('c1', makeProfile());
    expect(result.success).toBe(false);
    expect(result.error).toBe('query failed');
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// actualizarReserva
// ═══════════════════════════════════════════════════════════════════════════════
describe('actualizarReserva', () => {
  const validData = { cliente_id: 'c1', fecha: '2025-01-15', hora_inicio: '10:00' };

  it('returns FORBIDDEN when no permission', async () => {
    mockRequirePermission.mockReturnValueOnce({ success: false, error: 'Sin permisos', code: 'FORBIDDEN' });
    const result = await ReservaController.actualizarReserva('r1', validData, makeProfile());
    expect(result).toEqual({ success: false, error: 'Sin permisos', code: 'FORBIDDEN' });
  });

  it('returns error when updated reserva is invalid', async () => {
    const result = await ReservaController.actualizarReserva(
      'r1',
      { cliente_id: null, fecha: '', hora_inicio: '' },
      makeProfile(),
    );
    expect(result.success).toBe(false);
    expect(result.error).toMatch(/obligatorios/i);
  });

  it('updates and returns enriched reserva', async () => {
    const updated = [{ id: 'r1', cliente_id: 'c1', profesional_id: 'p1', ...validData }];
    const usuarios = [
      { id: 'c1', nombre_completo: 'Updated Client', email: 'uc@test.com', telefono: '' },
    ];

    const stub = makeSequentialStubs(
      { data: updated, error: null },
      { data: usuarios, error: null },
    );
    supabase.from.mockReturnValue(stub);

    const result = await ReservaController.actualizarReserva('r1', validData, makeProfile());

    expect(result.success).toBe(true);
    expect(result.data.consultante_nombre).toBe('Updated Client');
  });

  it('uses consultante_id as fallback for cliente_id', async () => {
    const dataWithConsultante = { consultante_id: 'c2', fecha: '2025-01-15', hora_inicio: '09:00' };
    const updated = [{ id: 'r1', cliente_id: 'c2', profesional_id: null, ...dataWithConsultante }];

    const stub = makeSequentialStubs(
      { data: updated, error: null },
      { data: [], error: null },
    );
    supabase.from.mockReturnValue(stub);

    const result = await ReservaController.actualizarReserva('r1', dataWithConsultante, makeProfile());
    expect(result.success).toBe(true);
  });

  it('returns { success: false } on DB error', async () => {
    const stub = makeQueryStub({ data: null, error: { message: 'update error' } });
    supabase.from.mockReturnValue(stub);

    const result = await ReservaController.actualizarReserva('r1', validData, makeProfile());
    expect(result.success).toBe(false);
    expect(result.error).toBe('update error');
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// obtenerTodas
// ═══════════════════════════════════════════════════════════════════════════════
describe('obtenerTodas', () => {
  it('returns FORBIDDEN when no permission', async () => {
    mockRequirePermission.mockReturnValueOnce({ success: false, error: 'Sin permisos', code: 'FORBIDDEN' });
    const result = await ReservaController.obtenerTodas(makeProfile());
    expect(result).toEqual({ success: false, error: 'Sin permisos', code: 'FORBIDDEN' });
  });

  it('returns empty array when reservas query returns empty', async () => {
    // non-superadmin: profIds query → reservas query (empty)
    const stub = makeSequentialStubs(
      { data: [{ usuario_id: 'p1' }], error: null },
      { data: [], error: null },
    );
    supabase.from.mockReturnValue(stub);

    const result = await ReservaController.obtenerTodas(makeProfile());
    expect(result).toEqual({ success: true, data: [] });
  });

  it('returns empty array with warning when profIds is empty', async () => {
    const stub = makeSequentialStubs(
      { data: [], error: null }, // obtenerProfesionalIdsEmpresa → empty
    );
    supabase.from.mockReturnValue(stub);

    const result = await ReservaController.obtenerTodas(makeProfile());
    expect(result.success).toBe(true);
    expect(result.data).toEqual([]);
    expect(result.warning).toBeDefined();
  });

  it('returns enriched reservas with consultante/profesional objects', async () => {
    const reservas = [
      { id: 'r1', cliente_id: 'c1', profesional_id: 'p1' },
    ];
    const usuarios = [
      { id: 'c1', nombre_completo: 'Consultante A', email: 'a@test.com', telefono: '111' },
      { id: 'p1', nombre_completo: 'Profesional B', email: 'b@test.com', telefono: '222' },
    ];

    // superadmin path: reservas query → usuarios query
    const stub = makeSequentialStubs(
      { data: reservas, error: null },
      { data: usuarios, error: null },
    );
    supabase.from.mockReturnValue(stub);

    const result = await ReservaController.obtenerTodas(makeSuperadmin());

    expect(result.success).toBe(true);
    expect(result.data[0].consultante).toEqual({
      nombre: 'Consultante A',
      email: 'a@test.com',
      telefono: '111',
    });
    expect(result.data[0].profesional).toEqual({ nombre: 'Profesional B' });
  });

  it('sets consultante/profesional to null when not found in usuarios', async () => {
    const reservas = [{ id: 'r1', cliente_id: 'c-missing', profesional_id: 'p-missing' }];
    const stub = makeSequentialStubs(
      { data: reservas, error: null },
      { data: [], error: null },
    );
    supabase.from.mockReturnValue(stub);

    const result = await ReservaController.obtenerTodas(makeSuperadmin());
    expect(result.data[0].consultante).toBeNull();
    expect(result.data[0].profesional).toBeNull();
  });

  it('returns { success: false, data: [] } on DB error', async () => {
    // non-superadmin: profIds ok → reservas query fails
    const stub = makeSequentialStubs(
      { data: [{ usuario_id: 'p1' }], error: null },
      { data: null, error: { message: 'query error' } },
    );
    supabase.from.mockReturnValue(stub);

    const result = await ReservaController.obtenerTodas(makeProfile());
    expect(result.success).toBe(false);
    expect(result.error).toBe('query error');
    expect(result.data).toEqual([]);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// obtenerResumenCajaDiario
// ═══════════════════════════════════════════════════════════════════════════════
describe('obtenerResumenCajaDiario', () => {
  it('returns FORBIDDEN when no permission', async () => {
    mockRequirePermission.mockReturnValueOnce({ success: false, error: 'Sin permisos', code: 'FORBIDDEN' });
    const result = await ReservaController.obtenerResumenCajaDiario('2025-01-15', makeProfile());
    expect(result).toEqual({ success: false, error: 'Sin permisos', code: 'FORBIDDEN' });
  });

  it('returns zero-filled summary when profIds is empty', async () => {
    const stub = makeQueryStub({ data: [], error: null });
    supabase.from.mockReturnValue(stub);

    const result = await ReservaController.obtenerResumenCajaDiario('2025-01-15', makeProfile());
    expect(result.success).toBe(true);
    expect(result.data.totalRecaudado).toBe(0);
  });

  it('calculates totalRecaudado from pagadas reservas', async () => {
    const reservas = [
      { id: 'r1', pagado: true,  precio_total: 3000, metodo_pago: 'efectivo',      cliente_id: null, profesional_id: null },
      { id: 'r2', pagado: true,  precio_total: 2000, metodo_pago: 'transferencia', cliente_id: null, profesional_id: null },
      { id: 'r3', pagado: false, precio_total: 1500, metodo_pago: null,            cliente_id: null, profesional_id: null },
    ];

    // non-superadmin: profIds query → reservas query → enriquecer pendientes (usuarios)
    const stub = makeSequentialStubs(
      { data: [{ usuario_id: 'p1' }], error: null },
      { data: reservas, error: null },
      { data: [], error: null },
    );
    supabase.from.mockReturnValue(stub);

    const result = await ReservaController.obtenerResumenCajaDiario('2025-01-15', makeProfile());

    expect(result.success).toBe(true);
    expect(result.data.totalRecaudado).toBe(5000);
    expect(result.data.cantidadPagadas).toBe(2);
    expect(result.data.cantidadPendientes).toBe(1);
  });

  it('groups desglosePagos by metodo_pago', async () => {
    const reservas = [
      { id: 'r1', pagado: true, precio_total: 1000, metodo_pago: 'efectivo', cliente_id: null, profesional_id: null },
      { id: 'r2', pagado: true, precio_total: 2000, metodo_pago: 'efectivo', cliente_id: null, profesional_id: null },
      { id: 'r3', pagado: true, precio_total: 500,  metodo_pago: null,       cliente_id: null, profesional_id: null },
    ];

    const stub = makeSequentialStubs(
      { data: [{ usuario_id: 'p1' }], error: null },
      { data: reservas, error: null },
      { data: [], error: null },
    );
    supabase.from.mockReturnValue(stub);

    const result = await ReservaController.obtenerResumenCajaDiario('2025-01-15', makeProfile());

    expect(result.data.desglosePagos['efectivo']).toBe(3000);
    expect(result.data.desglosePagos['sin_especificar']).toBe(500);
  });

  it('returns { success: false } on DB error', async () => {
    const stub = makeSequentialStubs(
      { data: [{ usuario_id: 'p1' }], error: null },
      { data: null, error: { message: 'caja error' } },
    );
    supabase.from.mockReturnValue(stub);

    const result = await ReservaController.obtenerResumenCajaDiario('2025-01-15', makeProfile());
    expect(result.success).toBe(false);
    expect(result.error).toBe('caja error');
  });
});
