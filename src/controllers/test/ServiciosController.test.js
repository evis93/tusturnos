/**
 * Tests for ServiciosController
 *
 * Mocks:
 *  - src/config/supabase  → vi.mock → chainable query-builder stub
 *  - src/utils/permissions → vi.mock → fine-grained control per test
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

// ── Mock: Supabase ────────────────────────────────────────────────────────────
const makeQueryStub = (resolveWith = { data: [], error: null }) => {
  const stub = {
    _resolve: resolveWith,
    select: vi.fn().mockReturnThis(),
    eq:     vi.fn().mockReturnThis(),
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
 * Sequential stub: each await advances through the results array.
 * Useful for methods that call supabase twice (delete then insert).
 */
const makeSequentialStubs = (...results) => {
  let callCount = 0;
  const stub = {
    select: vi.fn().mockReturnThis(),
    eq:     vi.fn().mockReturnThis(),
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

// ── Import SUT after mocks ────────────────────────────────────────────────────
import { ServiciosController } from '../ServiciosController.js';
import { supabase } from '../../config/supabase';

// ── Helpers ───────────────────────────────────────────────────────────────────
const makeProfile = (overrides = {}) => ({
  rol: 'admin',
  empresaId: 'emp-1',
  usuarioId: 'user-1',
  ...overrides,
});

const PERM_ERROR   = { success: false, error: 'Sin permisos', code: 'FORBIDDEN' };
const EMPRESA_ERROR = { success: false, error: 'Sin empresa asociada', code: 'NO_EMPRESA' };

const makeServicio = (overrides = {}) => ({
  nombre: 'Yoga',
  descripcion: 'Clase de yoga',
  duracion_minutos: 60,
  precio: 1500,
  sena_tipo: 'monto',
  sena_valor: 300,
  modalidad: 'presencial',
  ...overrides,
});

// ── Reset between tests ───────────────────────────────────────────────────────
beforeEach(() => {
  vi.clearAllMocks();
  mockRequirePermission.mockReturnValue(null);
  mockRequireEmpresa.mockReturnValue(null);
});

// ═══════════════════════════════════════════════════════════════════════════════
// obtenerServicios
// ═══════════════════════════════════════════════════════════════════════════════
describe('obtenerServicios', () => {
  it('returns services list on success', async () => {
    const servicios = [{ id: 's1', nombre: 'Yoga' }, { id: 's2', nombre: 'Meditación' }];
    const stub = makeQueryStub({ data: servicios, error: null });
    supabase.from.mockReturnValue(stub);

    const result = await ServiciosController.obtenerServicios(makeProfile());

    expect(result).toEqual({ success: true, data: servicios });
    expect(supabase.from).toHaveBeenCalledWith('servicios');
    expect(stub.eq).toHaveBeenCalledWith('empresa_id', 'emp-1');
    expect(stub.order).toHaveBeenCalledWith('nombre');
  });

  it('returns empty array when no services exist', async () => {
    const stub = makeQueryStub({ data: null, error: null });
    supabase.from.mockReturnValue(stub);

    const result = await ServiciosController.obtenerServicios(makeProfile());

    expect(result).toEqual({ success: true, data: [] });
  });

  it('returns permission error when requirePermission fails', async () => {
    mockRequirePermission.mockReturnValue(PERM_ERROR);

    const result = await ServiciosController.obtenerServicios(makeProfile({ rol: 'cliente' }));

    expect(result).toEqual(PERM_ERROR);
    expect(supabase.from).not.toHaveBeenCalled();
  });

  it('returns empresa error when requireEmpresa fails', async () => {
    mockRequireEmpresa.mockReturnValue(EMPRESA_ERROR);

    const result = await ServiciosController.obtenerServicios(makeProfile({ empresaId: null }));

    expect(result).toEqual(EMPRESA_ERROR);
    expect(supabase.from).not.toHaveBeenCalled();
  });

  it('returns success:false on supabase error', async () => {
    const stub = makeQueryStub({ data: null, error: { message: 'DB error' } });
    supabase.from.mockReturnValue(stub);

    const result = await ServiciosController.obtenerServicios(makeProfile());

    expect(result).toEqual({ success: false, error: 'DB error' });
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// crearServicio
// ═══════════════════════════════════════════════════════════════════════════════
describe('crearServicio', () => {
  it('creates a service successfully', async () => {
    const created = { id: 's1', nombre: 'Yoga', empresa_id: 'emp-1' };
    const stub = makeQueryStub({ data: created, error: null });
    supabase.from.mockReturnValue(stub);

    const result = await ServiciosController.crearServicio(makeServicio(), makeProfile());

    expect(result).toEqual({ success: true, data: created });
    expect(supabase.from).toHaveBeenCalledWith('servicios');
    expect(stub.insert).toHaveBeenCalledWith([
      expect.objectContaining({
        empresa_id: 'emp-1',
        nombre: 'Yoga',
        activo: true,
      }),
    ]);
  });

  it('trims whitespace from nombre', async () => {
    const created = { id: 's1', nombre: 'Yoga' };
    const stub = makeQueryStub({ data: created, error: null });
    supabase.from.mockReturnValue(stub);

    await ServiciosController.crearServicio(makeServicio({ nombre: '  Yoga  ' }), makeProfile());

    expect(stub.insert).toHaveBeenCalledWith([
      expect.objectContaining({ nombre: 'Yoga' }),
    ]);
  });

  it('returns error when nombre is empty string', async () => {
    const result = await ServiciosController.crearServicio(
      makeServicio({ nombre: '' }),
      makeProfile(),
    );

    expect(result).toEqual({ success: false, error: 'El nombre es obligatorio' });
    expect(supabase.from).not.toHaveBeenCalled();
  });

  it('returns error when nombre is only whitespace', async () => {
    const result = await ServiciosController.crearServicio(
      makeServicio({ nombre: '   ' }),
      makeProfile(),
    );

    expect(result).toEqual({ success: false, error: 'El nombre es obligatorio' });
  });

  it('returns error when nombre is missing (undefined)', async () => {
    const result = await ServiciosController.crearServicio(
      makeServicio({ nombre: undefined }),
      makeProfile(),
    );

    expect(result).toEqual({ success: false, error: 'El nombre es obligatorio' });
  });

  it('applies defaults for optional fields', async () => {
    const stub = makeQueryStub({ data: { id: 's1', nombre: 'Test' }, error: null });
    supabase.from.mockReturnValue(stub);

    await ServiciosController.crearServicio({ nombre: 'Test' }, makeProfile());

    expect(stub.insert).toHaveBeenCalledWith([
      expect.objectContaining({
        descripcion: null,
        duracion_minutos: null,
        precio: null,
        sena_tipo: 'monto',
        sena_valor: 0,
        modalidad: 'presencial',
        activo: true,
      }),
    ]);
  });

  it('parses numeric fields from strings', async () => {
    const stub = makeQueryStub({ data: { id: 's1' }, error: null });
    supabase.from.mockReturnValue(stub);

    await ServiciosController.crearServicio(
      makeServicio({ duracion_minutos: '90', precio: '2500.50', sena_valor: '500' }),
      makeProfile(),
    );

    expect(stub.insert).toHaveBeenCalledWith([
      expect.objectContaining({
        duracion_minutos: 90,
        precio: 2500.50,
        sena_valor: 500,
      }),
    ]);
  });

  it('returns permission error when requirePermission fails', async () => {
    mockRequirePermission.mockReturnValue(PERM_ERROR);

    const result = await ServiciosController.crearServicio(makeServicio(), makeProfile());

    expect(result).toEqual(PERM_ERROR);
    expect(supabase.from).not.toHaveBeenCalled();
  });

  it('returns empresa error when requireEmpresa fails', async () => {
    mockRequireEmpresa.mockReturnValue(EMPRESA_ERROR);

    const result = await ServiciosController.crearServicio(makeServicio(), makeProfile());

    expect(result).toEqual(EMPRESA_ERROR);
    expect(supabase.from).not.toHaveBeenCalled();
  });

  it('returns success:false on supabase error', async () => {
    const stub = makeQueryStub({ data: null, error: { message: 'insert failed' } });
    supabase.from.mockReturnValue(stub);

    const result = await ServiciosController.crearServicio(makeServicio(), makeProfile());

    expect(result).toEqual({ success: false, error: 'insert failed' });
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// actualizarServicio
// ═══════════════════════════════════════════════════════════════════════════════
describe('actualizarServicio', () => {
  it('updates a service successfully', async () => {
    const stub = makeQueryStub({ error: null });
    supabase.from.mockReturnValue(stub);

    const result = await ServiciosController.actualizarServicio('s1', makeServicio(), makeProfile());

    expect(result).toEqual({ success: true });
    expect(supabase.from).toHaveBeenCalledWith('servicios');
    expect(stub.update).toHaveBeenCalledWith(
      expect.objectContaining({ nombre: 'Yoga' }),
    );
    expect(stub.eq).toHaveBeenCalledWith('id', 's1');
  });

  it('trims nombre on update', async () => {
    const stub = makeQueryStub({ error: null });
    supabase.from.mockReturnValue(stub);

    await ServiciosController.actualizarServicio('s1', makeServicio({ nombre: '  Pilates  ' }), makeProfile());

    expect(stub.update).toHaveBeenCalledWith(
      expect.objectContaining({ nombre: 'Pilates' }),
    );
  });

  it('returns error when nombre is empty on update', async () => {
    const result = await ServiciosController.actualizarServicio(
      's1',
      makeServicio({ nombre: '' }),
      makeProfile(),
    );

    expect(result).toEqual({ success: false, error: 'El nombre es obligatorio' });
    expect(supabase.from).not.toHaveBeenCalled();
  });

  it('returns permission error when requirePermission fails', async () => {
    mockRequirePermission.mockReturnValue(PERM_ERROR);

    const result = await ServiciosController.actualizarServicio('s1', makeServicio(), makeProfile());

    expect(result).toEqual(PERM_ERROR);
    expect(supabase.from).not.toHaveBeenCalled();
  });

  it('returns success:false on supabase error', async () => {
    const stub = makeQueryStub({ error: { message: 'update failed' } });
    supabase.from.mockReturnValue(stub);

    const result = await ServiciosController.actualizarServicio('s1', makeServicio(), makeProfile());

    expect(result).toEqual({ success: false, error: 'update failed' });
  });

  it('sets descripcion to null when not provided', async () => {
    const stub = makeQueryStub({ error: null });
    supabase.from.mockReturnValue(stub);

    await ServiciosController.actualizarServicio('s1', { nombre: 'Test' }, makeProfile());

    expect(stub.update).toHaveBeenCalledWith(
      expect.objectContaining({ descripcion: null }),
    );
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// toggleActivo
// ═══════════════════════════════════════════════════════════════════════════════
describe('toggleActivo', () => {
  it('sets activo to false (deactivate)', async () => {
    const stub = makeQueryStub({ error: null });
    supabase.from.mockReturnValue(stub);

    const result = await ServiciosController.toggleActivo('s1', false, makeProfile());

    expect(result).toEqual({ success: true });
    expect(stub.update).toHaveBeenCalledWith({ activo: false });
    expect(stub.eq).toHaveBeenCalledWith('id', 's1');
  });

  it('sets activo to true (activate)', async () => {
    const stub = makeQueryStub({ error: null });
    supabase.from.mockReturnValue(stub);

    const result = await ServiciosController.toggleActivo('s1', true, makeProfile());

    expect(result).toEqual({ success: true });
    expect(stub.update).toHaveBeenCalledWith({ activo: true });
  });

  it('returns permission error when requirePermission fails', async () => {
    mockRequirePermission.mockReturnValue(PERM_ERROR);

    const result = await ServiciosController.toggleActivo('s1', false, makeProfile());

    expect(result).toEqual(PERM_ERROR);
    expect(supabase.from).not.toHaveBeenCalled();
  });

  it('returns success:false on supabase error', async () => {
    const stub = makeQueryStub({ error: { message: 'toggle failed' } });
    supabase.from.mockReturnValue(stub);

    const result = await ServiciosController.toggleActivo('s1', false, makeProfile());

    expect(result).toEqual({ success: false, error: 'toggle failed' });
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// eliminarServicio
// ═══════════════════════════════════════════════════════════════════════════════
describe('eliminarServicio', () => {
  it('deletes a service successfully', async () => {
    const stub = makeQueryStub({ error: null });
    supabase.from.mockReturnValue(stub);

    const result = await ServiciosController.eliminarServicio('s1', makeProfile());

    expect(result).toEqual({ success: true });
    expect(supabase.from).toHaveBeenCalledWith('servicios');
    expect(stub.delete).toHaveBeenCalled();
    expect(stub.eq).toHaveBeenCalledWith('id', 's1');
  });

  it('returns permission error when requirePermission fails', async () => {
    mockRequirePermission.mockReturnValue(PERM_ERROR);

    const result = await ServiciosController.eliminarServicio('s1', makeProfile());

    expect(result).toEqual(PERM_ERROR);
    expect(supabase.from).not.toHaveBeenCalled();
  });

  it('returns success:false on supabase error', async () => {
    const stub = makeQueryStub({ error: { message: 'delete failed' } });
    supabase.from.mockReturnValue(stub);

    const result = await ServiciosController.eliminarServicio('s1', makeProfile());

    expect(result).toEqual({ success: false, error: 'delete failed' });
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// obtenerServiciosProfesional
// ═══════════════════════════════════════════════════════════════════════════════
describe('obtenerServiciosProfesional', () => {
  it('returns list of servicio_ids for a profesional', async () => {
    const rows = [{ servicio_id: 's1' }, { servicio_id: 's2' }];
    const stub = makeQueryStub({ data: rows, error: null });
    supabase.from.mockReturnValue(stub);

    const result = await ServiciosController.obtenerServiciosProfesional('p1', makeProfile());

    expect(result).toEqual({ success: true, data: ['s1', 's2'] });
    expect(supabase.from).toHaveBeenCalledWith('profesional_servicio');
    expect(stub.eq).toHaveBeenCalledWith('profesional_id', 'p1');
  });

  it('returns empty array when profesional has no services', async () => {
    const stub = makeQueryStub({ data: null, error: null });
    supabase.from.mockReturnValue(stub);

    const result = await ServiciosController.obtenerServiciosProfesional('p1', makeProfile());

    expect(result).toEqual({ success: true, data: [] });
  });

  it('returns permission error when requirePermission fails', async () => {
    mockRequirePermission.mockReturnValue(PERM_ERROR);

    const result = await ServiciosController.obtenerServiciosProfesional('p1', makeProfile());

    expect(result).toEqual(PERM_ERROR);
    expect(supabase.from).not.toHaveBeenCalled();
  });

  it('returns success:false on supabase error', async () => {
    const stub = makeQueryStub({ data: null, error: { message: 'query failed' } });
    supabase.from.mockReturnValue(stub);

    const result = await ServiciosController.obtenerServiciosProfesional('p1', makeProfile());

    expect(result).toEqual({ success: false, error: 'query failed' });
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// guardarServiciosProfesional
// ═══════════════════════════════════════════════════════════════════════════════
describe('guardarServiciosProfesional', () => {
  it('deletes existing and inserts new servicios', async () => {
    const stub = makeSequentialStubs(
      { error: null },  // delete
      { error: null },  // insert
    );
    supabase.from.mockReturnValue(stub);

    const result = await ServiciosController.guardarServiciosProfesional(
      'p1',
      ['s1', 's2'],
      makeProfile(),
    );

    expect(result).toEqual({ success: true });
    expect(stub.delete).toHaveBeenCalled();
    expect(stub.eq).toHaveBeenCalledWith('profesional_id', 'p1');
    expect(stub.insert).toHaveBeenCalledWith([
      { profesional_id: 'p1', servicio_id: 's1' },
      { profesional_id: 'p1', servicio_id: 's2' },
    ]);
  });

  it('skips insert when servicioIds is empty', async () => {
    const stub = makeQueryStub({ error: null });
    supabase.from.mockReturnValue(stub);

    const result = await ServiciosController.guardarServiciosProfesional('p1', [], makeProfile());

    expect(result).toEqual({ success: true });
    expect(stub.delete).toHaveBeenCalled();
    expect(stub.insert).not.toHaveBeenCalled();
  });

  it('returns permission error when requirePermission fails', async () => {
    mockRequirePermission.mockReturnValue(PERM_ERROR);

    const result = await ServiciosController.guardarServiciosProfesional('p1', ['s1'], makeProfile());

    expect(result).toEqual(PERM_ERROR);
    expect(supabase.from).not.toHaveBeenCalled();
  });

  it('returns success:false when delete fails', async () => {
    const stub = makeSequentialStubs(
      { error: { message: 'delete failed' } },
    );
    supabase.from.mockReturnValue(stub);

    const result = await ServiciosController.guardarServiciosProfesional(
      'p1',
      ['s1'],
      makeProfile(),
    );

    expect(result).toEqual({ success: false, error: 'delete failed' });
  });

  it('returns success:false when insert fails', async () => {
    const stub = makeSequentialStubs(
      { error: null },                           // delete ok
      { error: { message: 'insert failed' } },   // insert fails
    );
    supabase.from.mockReturnValue(stub);

    const result = await ServiciosController.guardarServiciosProfesional(
      'p1',
      ['s1'],
      makeProfile(),
    );

    expect(result).toEqual({ success: false, error: 'insert failed' });
  });
});
