/**
 * Tests for FichaController
 *
 * Mocks:
 *  - src/config/supabase  → vi.mock → supabase query builder stub
 *  - src/models/FichaModel → real implementation (no side-effects, safe to use)
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

// ── Mock: Supabase ────────────────────────────────────────────────────────────
// Chainable query-builder stub. The stub is a thenable so `await query`
// resolves with whatever `_resolve` holds at that moment.

const makeQueryStub = (resolveWith = { data: null, error: null }) => {
  const stub = {
    _resolve: resolveWith,
    select:      vi.fn().mockReturnThis(),
    eq:          vi.fn().mockReturnThis(),
    order:       vi.fn().mockReturnThis(),
    insert:      vi.fn().mockReturnThis(),
    update:      vi.fn().mockReturnThis(),
    single:      vi.fn().mockReturnThis(),
    maybeSingle: vi.fn().mockReturnThis(),
    then(resolve, reject) {
      return Promise.resolve(stub._resolve).then(resolve, reject);
    },
  };
  return stub;
};

/**
 * Returns a stub where successive `await`s get different results.
 * Each call to `from()` advances through the `results` array.
 */
const makeSequentialStubs = (...results) => {
  let callCount = 0;
  const stub = {
    select:      vi.fn().mockReturnThis(),
    eq:          vi.fn().mockReturnThis(),
    order:       vi.fn().mockReturnThis(),
    insert:      vi.fn().mockReturnThis(),
    update:      vi.fn().mockReturnThis(),
    single:      vi.fn().mockReturnThis(),
    maybeSingle: vi.fn().mockReturnThis(),
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

// ── Import SUT after mocks are set up ────────────────────────────────────────
import { FichaController } from '../FichaController.js';
import { supabase } from '../../config/supabase';

// ── Helpers ───────────────────────────────────────────────────────────────────
const makeFichaData = (overrides = {}) => ({
  consultante_id: 'cons-1',
  profesional_id: 'prof-1',
  fecha_atencion: '2026-03-29',
  notas_atencion: 'Notas de prueba',
  ...overrides,
});

const makeFichaRow = (overrides = {}) => ({
  id: 'ficha-1',
  consultante_id: 'cons-1',
  profesional_id: 'prof-1',
  fecha_atencion: '2026-03-29',
  notas_atencion: 'Notas de prueba',
  created_at: '2026-03-29T10:00:00Z',
  updated_at: '2026-03-29T10:00:00Z',
  ...overrides,
});

// ── Reset between tests ───────────────────────────────────────────────────────
beforeEach(() => {
  vi.clearAllMocks();
});

// ═══════════════════════════════════════════════════════════════════════════════
// crearFicha
// ═══════════════════════════════════════════════════════════════════════════════

describe('FichaController.crearFicha', () => {
  it('crea una ficha con datos válidos y retorna success:true', async () => {
    const row = makeFichaRow();
    const stub = makeQueryStub({ data: row, error: null });
    supabase.from.mockReturnValue(stub);

    const result = await FichaController.crearFicha(makeFichaData());

    expect(result.success).toBe(true);
    expect(result.data).toBeDefined();
    expect(result.data.id).toBe('ficha-1');
    expect(result.data.consultante_id).toBe('cons-1');
    expect(supabase.from).toHaveBeenCalledWith('fichas');
    expect(stub.insert).toHaveBeenCalled();
    expect(stub.select).toHaveBeenCalled();
    expect(stub.single).toHaveBeenCalled();
  });

  it('retorna success:false si falta consultante_id', async () => {
    const result = await FichaController.crearFicha(
      makeFichaData({ consultante_id: '' })
    );

    expect(result.success).toBe(false);
    expect(result.error).toMatch(/campos obligatorios/i);
    expect(supabase.from).not.toHaveBeenCalled();
  });

  it('retorna success:false si falta profesional_id', async () => {
    const result = await FichaController.crearFicha(
      makeFichaData({ profesional_id: '' })
    );

    expect(result.success).toBe(false);
    expect(result.error).toMatch(/campos obligatorios/i);
  });

  it('retorna success:false si falta fecha_atencion', async () => {
    const result = await FichaController.crearFicha(
      makeFichaData({ fecha_atencion: '' })
    );

    expect(result.success).toBe(false);
    expect(result.error).toMatch(/campos obligatorios/i);
  });

  it('retorna success:false si consultante_id === profesional_id (misma persona)', async () => {
    const result = await FichaController.crearFicha(
      makeFichaData({ consultante_id: 'mismo-id', profesional_id: 'mismo-id' })
    );

    expect(result.success).toBe(false);
    expect(result.error).toMatch(/campos obligatorios/i);
  });

  it('retorna success:false si Supabase devuelve error', async () => {
    const stub = makeQueryStub({ data: null, error: { message: 'DB insert failed' } });
    supabase.from.mockReturnValue(stub);

    const result = await FichaController.crearFicha(makeFichaData());

    expect(result.success).toBe(false);
    expect(result.error).toBe('DB insert failed');
  });

  it('retorna la ficha como instancia de FichaModel con los datos correctos', async () => {
    const row = makeFichaRow({ notas_atencion: 'Sesión inicial' });
    const stub = makeQueryStub({ data: row, error: null });
    supabase.from.mockReturnValue(stub);

    const result = await FichaController.crearFicha(makeFichaData());

    expect(result.success).toBe(true);
    expect(result.data.notas_atencion).toBe('Sesión inicial');
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// obtenerFichaPorId
// ═══════════════════════════════════════════════════════════════════════════════

describe('FichaController.obtenerFichaPorId', () => {
  it('retorna la ficha con joins cuando existe', async () => {
    const row = makeFichaRow({
      consultante: { id: 'cons-1', usuarios: { nombre_completo: 'Ana García', email: 'ana@test.com', telefono: '1234' } },
      profesional: { id: 'prof-1', usuarios: { nombre_completo: 'Dr. López', email: 'lopez@test.com' } },
    });
    const stub = makeQueryStub({ data: row, error: null });
    supabase.from.mockReturnValue(stub);

    const result = await FichaController.obtenerFichaPorId('ficha-1');

    expect(result.success).toBe(true);
    expect(result.data.id).toBe('ficha-1');
    expect(result.data.consultante).toBeDefined();
    expect(result.data.profesional).toBeDefined();
    expect(supabase.from).toHaveBeenCalledWith('fichas');
    expect(stub.eq).toHaveBeenCalledWith('id', 'ficha-1');
    expect(stub.single).toHaveBeenCalled();
  });

  it('retorna success:false si Supabase devuelve error', async () => {
    const stub = makeQueryStub({ data: null, error: { message: 'Row not found' } });
    supabase.from.mockReturnValue(stub);

    const result = await FichaController.obtenerFichaPorId('ficha-inexistente');

    expect(result.success).toBe(false);
    expect(result.error).toBe('Row not found');
  });

  it('llama al select con los joins correctos (consultante y profesional)', async () => {
    const stub = makeQueryStub({ data: makeFichaRow(), error: null });
    supabase.from.mockReturnValue(stub);

    await FichaController.obtenerFichaPorId('ficha-1');

    expect(stub.select).toHaveBeenCalled();
    const selectArg = stub.select.mock.calls[0][0];
    expect(selectArg).toMatch(/consultante/);
    expect(selectArg).toMatch(/profesional/);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// obtenerFichasPorConsultante
// ═══════════════════════════════════════════════════════════════════════════════

describe('FichaController.obtenerFichasPorConsultante', () => {
  it('retorna array de fichas para el consultante', async () => {
    const rows = [
      makeFichaRow({ id: 'ficha-1', fecha_atencion: '2026-03-29' }),
      makeFichaRow({ id: 'ficha-2', fecha_atencion: '2026-03-15' }),
    ];
    const stub = makeQueryStub({ data: rows, error: null });
    supabase.from.mockReturnValue(stub);

    const result = await FichaController.obtenerFichasPorConsultante('cons-1');

    expect(result.success).toBe(true);
    expect(result.data).toHaveLength(2);
    expect(result.data[0].id).toBe('ficha-1');
    expect(result.data[1].id).toBe('ficha-2');
    expect(stub.eq).toHaveBeenCalledWith('consultante_id', 'cons-1');
    expect(stub.order).toHaveBeenCalledWith('fecha_atencion', { ascending: false });
  });

  it('retorna array vacío cuando el consultante no tiene fichas', async () => {
    const stub = makeQueryStub({ data: [], error: null });
    supabase.from.mockReturnValue(stub);

    const result = await FichaController.obtenerFichasPorConsultante('cons-sin-fichas');

    expect(result.success).toBe(true);
    expect(result.data).toEqual([]);
  });

  it('maneja data:null retornando array vacío', async () => {
    const stub = makeQueryStub({ data: null, error: null });
    supabase.from.mockReturnValue(stub);

    const result = await FichaController.obtenerFichasPorConsultante('cons-1');

    expect(result.success).toBe(true);
    expect(result.data).toEqual([]);
  });

  it('retorna success:false con data:[] si Supabase devuelve error', async () => {
    const stub = makeQueryStub({ data: null, error: { message: 'Query failed' } });
    supabase.from.mockReturnValue(stub);

    const result = await FichaController.obtenerFichasPorConsultante('cons-1');

    expect(result.success).toBe(false);
    expect(result.error).toBe('Query failed');
    expect(result.data).toEqual([]);
  });

  it('retorna cada elemento como instancia con los campos correctos', async () => {
    const rows = [makeFichaRow({ notas_atencion: 'Primera sesión' })];
    const stub = makeQueryStub({ data: rows, error: null });
    supabase.from.mockReturnValue(stub);

    const result = await FichaController.obtenerFichasPorConsultante('cons-1');

    expect(result.data[0].notas_atencion).toBe('Primera sesión');
    expect(result.data[0].consultante_id).toBe('cons-1');
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// actualizarNotas
// ═══════════════════════════════════════════════════════════════════════════════

describe('FichaController.actualizarNotas', () => {
  it('actualiza las notas y retorna success:true con mensaje', async () => {
    const row = makeFichaRow({ notas_atencion: 'Nuevas notas' });
    const stub = makeQueryStub({ data: row, error: null });
    supabase.from.mockReturnValue(stub);

    const result = await FichaController.actualizarNotas('ficha-1', 'Nuevas notas');

    expect(result.success).toBe(true);
    expect(result.message).toMatch(/actualizadas correctamente/i);
    expect(result.data.notas_atencion).toBe('Nuevas notas');
    expect(supabase.from).toHaveBeenCalledWith('fichas');
    expect(stub.update).toHaveBeenCalled();
    expect(stub.eq).toHaveBeenCalledWith('id', 'ficha-1');
    expect(stub.select).toHaveBeenCalled();
    expect(stub.single).toHaveBeenCalled();
  });

  it('incluye updated_at en el objeto de update', async () => {
    const stub = makeQueryStub({ data: makeFichaRow(), error: null });
    supabase.from.mockReturnValue(stub);

    await FichaController.actualizarNotas('ficha-1', 'Notas');

    const updateArg = stub.update.mock.calls[0][0];
    expect(updateArg).toHaveProperty('notas_atencion', 'Notas');
    expect(updateArg).toHaveProperty('updated_at');
    expect(typeof updateArg.updated_at).toBe('string');
  });

  it('retorna success:false si Supabase devuelve error', async () => {
    const stub = makeQueryStub({ data: null, error: { message: 'Update failed' } });
    supabase.from.mockReturnValue(stub);

    const result = await FichaController.actualizarNotas('ficha-1', 'Notas');

    expect(result.success).toBe(false);
    expect(result.error).toBe('Update failed');
  });

  it('permite actualizar con notas vacías (string vacío)', async () => {
    const row = makeFichaRow({ notas_atencion: '' });
    const stub = makeQueryStub({ data: row, error: null });
    supabase.from.mockReturnValue(stub);

    const result = await FichaController.actualizarNotas('ficha-1', '');

    expect(result.success).toBe(true);
    expect(result.data.notas_atencion).toBe('');
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// obtenerFichaPorReserva
// ═══════════════════════════════════════════════════════════════════════════════

describe('FichaController.obtenerFichaPorReserva', () => {
  it('retorna la ficha cuando la reserva tiene ficha_id', async () => {
    const fichaRow = makeFichaRow();
    // First call: reservas table → returns ficha_id
    // Second call: fichas table (via obtenerFichaPorId) → returns the ficha
    const stub = makeSequentialStubs(
      { data: { ficha_id: 'ficha-1' }, error: null },
      { data: fichaRow, error: null }
    );
    supabase.from.mockReturnValue(stub);

    const result = await FichaController.obtenerFichaPorReserva('reserva-1');

    expect(result.success).toBe(true);
    expect(result.data.id).toBe('ficha-1');
    expect(supabase.from).toHaveBeenCalledWith('reservas');
    expect(supabase.from).toHaveBeenCalledWith('fichas');
  });

  it('retorna success:false cuando la reserva no tiene ficha_id', async () => {
    const stub = makeQueryStub({ data: { ficha_id: null }, error: null });
    supabase.from.mockReturnValue(stub);

    const result = await FichaController.obtenerFichaPorReserva('reserva-sin-ficha');

    expect(result.success).toBe(false);
    expect(result.error).toMatch(/no tiene ficha asociada/i);
  });

  it('retorna success:false cuando la reserva no existe (error de Supabase)', async () => {
    const stub = makeQueryStub({ data: null, error: { message: 'Reserva not found' } });
    supabase.from.mockReturnValue(stub);

    const result = await FichaController.obtenerFichaPorReserva('reserva-inexistente');

    expect(result.success).toBe(false);
    expect(result.error).toBe('Reserva not found');
  });

  it('propaga el error si falla la obtención de la ficha (segundo query)', async () => {
    const stub = makeSequentialStubs(
      { data: { ficha_id: 'ficha-1' }, error: null },
      { data: null, error: { message: 'Ficha not found' } }
    );
    supabase.from.mockReturnValue(stub);

    const result = await FichaController.obtenerFichaPorReserva('reserva-1');

    expect(result.success).toBe(false);
    expect(result.error).toBe('Ficha not found');
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// existeFicha
// ═══════════════════════════════════════════════════════════════════════════════

describe('FichaController.existeFicha', () => {
  it('retorna existe:true con fichaId cuando la ficha existe', async () => {
    const stub = makeQueryStub({ data: { id: 'ficha-1' }, error: null });
    supabase.from.mockReturnValue(stub);

    const result = await FichaController.existeFicha('cons-1', 'prof-1', '2026-03-29');

    expect(result.success).toBe(true);
    expect(result.existe).toBe(true);
    expect(result.fichaId).toBe('ficha-1');
    expect(stub.eq).toHaveBeenCalledWith('consultante_id', 'cons-1');
    expect(stub.eq).toHaveBeenCalledWith('profesional_id', 'prof-1');
    expect(stub.eq).toHaveBeenCalledWith('fecha_atencion', '2026-03-29');
    expect(stub.maybeSingle).toHaveBeenCalled();
  });

  it('retorna existe:false con fichaId:null cuando no existe', async () => {
    const stub = makeQueryStub({ data: null, error: null });
    supabase.from.mockReturnValue(stub);

    const result = await FichaController.existeFicha('cons-1', 'prof-1', '2026-03-29');

    expect(result.success).toBe(true);
    expect(result.existe).toBe(false);
    expect(result.fichaId).toBeNull();
  });

  it('retorna success:false con existe:false si Supabase devuelve error', async () => {
    const stub = makeQueryStub({ data: null, error: { message: 'DB error' } });
    supabase.from.mockReturnValue(stub);

    const result = await FichaController.existeFicha('cons-1', 'prof-1', '2026-03-29');

    expect(result.success).toBe(false);
    expect(result.error).toBe('DB error');
    expect(result.existe).toBe(false);
  });

  it('usa maybeSingle (no single) para no lanzar error si no hay resultados', async () => {
    const stub = makeQueryStub({ data: null, error: null });
    supabase.from.mockReturnValue(stub);

    await FichaController.existeFicha('cons-1', 'prof-1', '2026-03-29');

    expect(stub.maybeSingle).toHaveBeenCalled();
    expect(stub.single).not.toHaveBeenCalled();
  });

  it('aplica los tres filtros eq correctamente', async () => {
    const stub = makeQueryStub({ data: null, error: null });
    supabase.from.mockReturnValue(stub);

    await FichaController.existeFicha('cons-X', 'prof-Y', '2026-01-01');

    const eqCalls = stub.eq.mock.calls;
    expect(eqCalls).toContainEqual(['consultante_id', 'cons-X']);
    expect(eqCalls).toContainEqual(['profesional_id', 'prof-Y']);
    expect(eqCalls).toContainEqual(['fecha_atencion', '2026-01-01']);
  });
});
