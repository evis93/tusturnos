/**
 * Tests for HorarioController
 *
 * Mocks:
 *  - src/config/supabase  → vi.mock → chainable query builder stub
 *  - src/utils/permissions → vi.mock → allows fine-grained control per test
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

vi.mock('../../config/supabase', () => ({
  supabase: {
    from: vi.fn(),
  },
}));

// ── Mock: permissions ─────────────────────────────────────────────────────────
const mockRequirePermission = vi.fn(() => null);

vi.mock('../../utils/permissions', () => ({
  requirePermission: (...args) => mockRequirePermission(...args),
  requireEmpresa:    vi.fn(() => null),
}));

// ── Import SUT after mocks ────────────────────────────────────────────────────
import { HorarioController } from '../HorarioController.js';
import { supabase } from '../../config/supabase';

// ── Helpers ───────────────────────────────────────────────────────────────────
const makeProfile = (overrides = {}) => ({
  rol: 'profesional',
  empresaId: 'emp-1',
  usuarioId: 'user-1',
  profesionalId: 'prof-1',
  ...overrides,
});

const makeAdminProfile = (overrides = {}) =>
  makeProfile({ rol: 'admin', ...overrides });

// ── Reset between tests ───────────────────────────────────────────────────────
beforeEach(() => {
  vi.clearAllMocks();
  mockRequirePermission.mockReturnValue(null);
});

// ═══════════════════════════════════════════════════════════════════════════════
// DIAS_SEMANA static property
// ═══════════════════════════════════════════════════════════════════════════════
describe('HorarioController.DIAS_SEMANA', () => {
  it('tiene 7 días en orden correcto', () => {
    expect(HorarioController.DIAS_SEMANA).toHaveLength(7);
    expect(HorarioController.DIAS_SEMANA[0]).toEqual({ id: 0, nombre: 'Domingo' });
    expect(HorarioController.DIAS_SEMANA[6]).toEqual({ id: 6, nombre: 'Sábado' });
  });

  it('contiene Lunes y Viernes', () => {
    const nombres = HorarioController.DIAS_SEMANA.map(d => d.nombre);
    expect(nombres).toContain('Lunes');
    expect(nombres).toContain('Viernes');
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// obtenerHorarios
// ═══════════════════════════════════════════════════════════════════════════════
describe('obtenerHorarios', () => {
  it('retorna los horarios del profesional correctamente', async () => {
    const horarios = [
      { id: 'h-1', profesional_id: 'prof-1', dia_semana: 1, hora_inicio: '09:00', hora_fin: '17:00', activo: true },
      { id: 'h-2', profesional_id: 'prof-1', dia_semana: 3, hora_inicio: '09:00', hora_fin: '17:00', activo: true },
    ];
    const stub = makeQueryStub({ data: horarios, error: null });
    supabase.from.mockReturnValue(stub);

    const result = await HorarioController.obtenerHorarios(makeProfile());

    expect(result.success).toBe(true);
    expect(result.data).toEqual(horarios);
    expect(supabase.from).toHaveBeenCalledWith('horarios_atencion');
    expect(stub.eq).toHaveBeenCalledWith('profesional_id', 'prof-1');
    expect(stub.order).toHaveBeenCalledWith('dia_semana', { ascending: true });
  });

  it('retorna array vacío cuando no hay horarios', async () => {
    const stub = makeQueryStub({ data: null, error: null });
    supabase.from.mockReturnValue(stub);

    const result = await HorarioController.obtenerHorarios(makeProfile());

    expect(result.success).toBe(true);
    expect(result.data).toEqual([]);
  });

  it('retorna error cuando no hay profesionalId en el perfil', async () => {
    const profile = makeProfile({ profesionalId: null });

    const result = await HorarioController.obtenerHorarios(profile);

    expect(result.success).toBe(false);
    expect(result.error).toBe('No se encontró ID de profesional');
    expect(supabase.from).not.toHaveBeenCalled();
  });

  it('retorna error de permiso cuando requirePermission falla', async () => {
    mockRequirePermission.mockReturnValue({ success: false, error: 'Sin permisos', code: 'FORBIDDEN' });

    const result = await HorarioController.obtenerHorarios(makeProfile({ rol: 'cliente' }));

    expect(result.success).toBe(false);
    expect(result.error).toBe('Sin permisos');
    expect(mockRequirePermission).toHaveBeenCalledWith(expect.any(Object), 'horarios:read');
    expect(supabase.from).not.toHaveBeenCalled();
  });

  it('captura errores de Supabase y los devuelve como { success: false }', async () => {
    const stub = makeQueryStub({ data: null, error: { message: 'DB connection failed' } });
    supabase.from.mockReturnValue(stub);

    const result = await HorarioController.obtenerHorarios(makeProfile());

    expect(result.success).toBe(false);
    expect(result.error).toBe('DB connection failed');
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// crearHorario
// ═══════════════════════════════════════════════════════════════════════════════
describe('crearHorario', () => {
  const horarioData = { dia_semana: 1, hora_inicio: '09:00', hora_fin: '17:00' };

  it('crea un horario y retorna el registro creado', async () => {
    const created = { id: 'h-new', profesional_id: 'prof-1', ...horarioData, activo: true };
    const stub = makeQueryStub({ data: created, error: null });
    supabase.from.mockReturnValue(stub);

    const result = await HorarioController.crearHorario(horarioData, makeProfile());

    expect(result.success).toBe(true);
    expect(result.data).toEqual(created);
    expect(supabase.from).toHaveBeenCalledWith('horarios_atencion');
    expect(stub.insert).toHaveBeenCalledWith([{
      profesional_id: 'prof-1',
      dia_semana: 1,
      hora_inicio: '09:00',
      hora_fin: '17:00',
    }]);
    expect(stub.single).toHaveBeenCalled();
  });

  it('retorna error cuando no hay profesionalId en el perfil', async () => {
    const profile = makeProfile({ profesionalId: undefined });

    const result = await HorarioController.crearHorario(horarioData, profile);

    expect(result.success).toBe(false);
    expect(result.error).toBe('No se encontró ID de profesional');
    expect(supabase.from).not.toHaveBeenCalled();
  });

  it('retorna error de permiso cuando requirePermission falla', async () => {
    mockRequirePermission.mockReturnValue({ success: false, error: 'Sin permisos', code: 'FORBIDDEN' });

    const result = await HorarioController.crearHorario(horarioData, makeProfile({ rol: 'cliente' }));

    expect(result.success).toBe(false);
    expect(result.error).toBe('Sin permisos');
    expect(mockRequirePermission).toHaveBeenCalledWith(expect.any(Object), 'horarios:write');
    expect(supabase.from).not.toHaveBeenCalled();
  });

  it('captura errores de Supabase en la inserción', async () => {
    const stub = makeQueryStub({ data: null, error: { message: 'unique constraint violation' } });
    supabase.from.mockReturnValue(stub);

    const result = await HorarioController.crearHorario(horarioData, makeProfile());

    expect(result.success).toBe(false);
    expect(result.error).toBe('unique constraint violation');
  });

  it('admin también puede crear horario con profesionalId', async () => {
    const created = { id: 'h-adm', profesional_id: 'prof-1', ...horarioData };
    const stub = makeQueryStub({ data: created, error: null });
    supabase.from.mockReturnValue(stub);

    const result = await HorarioController.crearHorario(horarioData, makeAdminProfile());

    expect(result.success).toBe(true);
    expect(result.data).toEqual(created);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// actualizarHorario
// ═══════════════════════════════════════════════════════════════════════════════
describe('actualizarHorario', () => {
  const horarioData = { hora_inicio: '10:00', hora_fin: '18:00' };

  it('actualiza hora_inicio y hora_fin del horario', async () => {
    const updated = { id: 'h-1', profesional_id: 'prof-1', dia_semana: 1, ...horarioData };
    const stub = makeQueryStub({ data: updated, error: null });
    supabase.from.mockReturnValue(stub);

    const result = await HorarioController.actualizarHorario('h-1', horarioData, makeProfile());

    expect(result.success).toBe(true);
    expect(result.data).toEqual(updated);
    expect(supabase.from).toHaveBeenCalledWith('horarios_atencion');
    expect(stub.update).toHaveBeenCalledWith({ hora_inicio: '10:00', hora_fin: '18:00' });
    expect(stub.eq).toHaveBeenCalledWith('id', 'h-1');
    expect(stub.single).toHaveBeenCalled();
  });

  it('retorna error de permiso cuando requirePermission falla', async () => {
    mockRequirePermission.mockReturnValue({ success: false, error: 'Sin permisos', code: 'FORBIDDEN' });

    const result = await HorarioController.actualizarHorario('h-1', horarioData, makeProfile({ rol: 'cliente' }));

    expect(result.success).toBe(false);
    expect(result.error).toBe('Sin permisos');
    expect(mockRequirePermission).toHaveBeenCalledWith(expect.any(Object), 'horarios:write');
    expect(supabase.from).not.toHaveBeenCalled();
  });

  it('captura errores de Supabase en la actualización', async () => {
    const stub = makeQueryStub({ data: null, error: { message: 'row not found' } });
    supabase.from.mockReturnValue(stub);

    const result = await HorarioController.actualizarHorario('h-999', horarioData, makeProfile());

    expect(result.success).toBe(false);
    expect(result.error).toBe('row not found');
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// toggleActivo
// ═══════════════════════════════════════════════════════════════════════════════
describe('toggleActivo', () => {
  it('invierte activo de true a false', async () => {
    const updated = { id: 'h-1', activo: false };
    const stub = makeQueryStub({ data: updated, error: null });
    supabase.from.mockReturnValue(stub);

    const result = await HorarioController.toggleActivo('h-1', true, makeProfile());

    expect(result.success).toBe(true);
    expect(result.data).toEqual(updated);
    expect(stub.update).toHaveBeenCalledWith({ activo: false });
    expect(stub.eq).toHaveBeenCalledWith('id', 'h-1');
  });

  it('invierte activo de false a true', async () => {
    const updated = { id: 'h-1', activo: true };
    const stub = makeQueryStub({ data: updated, error: null });
    supabase.from.mockReturnValue(stub);

    const result = await HorarioController.toggleActivo('h-1', false, makeProfile());

    expect(result.success).toBe(true);
    expect(stub.update).toHaveBeenCalledWith({ activo: true });
  });

  it('retorna error de permiso cuando requirePermission falla', async () => {
    mockRequirePermission.mockReturnValue({ success: false, error: 'Sin permisos', code: 'FORBIDDEN' });

    const result = await HorarioController.toggleActivo('h-1', true, makeProfile({ rol: 'cliente' }));

    expect(result.success).toBe(false);
    expect(result.error).toBe('Sin permisos');
    expect(mockRequirePermission).toHaveBeenCalledWith(expect.any(Object), 'horarios:write');
    expect(supabase.from).not.toHaveBeenCalled();
  });

  it('captura errores de Supabase en el toggle', async () => {
    const stub = makeQueryStub({ data: null, error: { message: 'toggle failed' } });
    supabase.from.mockReturnValue(stub);

    const result = await HorarioController.toggleActivo('h-1', true, makeProfile());

    expect(result.success).toBe(false);
    expect(result.error).toBe('toggle failed');
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// eliminarHorario
// ═══════════════════════════════════════════════════════════════════════════════
describe('eliminarHorario', () => {
  it('elimina el horario correctamente', async () => {
    const stub = makeQueryStub({ error: null });
    supabase.from.mockReturnValue(stub);

    const result = await HorarioController.eliminarHorario('h-1', makeProfile());

    expect(result.success).toBe(true);
    expect(result.data).toBeUndefined();
    expect(supabase.from).toHaveBeenCalledWith('horarios_atencion');
    expect(stub.delete).toHaveBeenCalled();
    expect(stub.eq).toHaveBeenCalledWith('id', 'h-1');
  });

  it('retorna error de permiso cuando requirePermission falla', async () => {
    mockRequirePermission.mockReturnValue({ success: false, error: 'Sin permisos', code: 'FORBIDDEN' });

    const result = await HorarioController.eliminarHorario('h-1', makeProfile({ rol: 'cliente' }));

    expect(result.success).toBe(false);
    expect(result.error).toBe('Sin permisos');
    expect(mockRequirePermission).toHaveBeenCalledWith(expect.any(Object), 'horarios:write');
    expect(supabase.from).not.toHaveBeenCalled();
  });

  it('captura errores de Supabase en la eliminación', async () => {
    const stub = makeQueryStub({ error: { message: 'foreign key constraint' } });
    supabase.from.mockReturnValue(stub);

    const result = await HorarioController.eliminarHorario('h-1', makeProfile());

    expect(result.success).toBe(false);
    expect(result.error).toBe('foreign key constraint');
  });

  it('llama a requirePermission con horarios:write', async () => {
    const stub = makeQueryStub({ error: null });
    supabase.from.mockReturnValue(stub);

    await HorarioController.eliminarHorario('h-1', makeAdminProfile());

    expect(mockRequirePermission).toHaveBeenCalledWith(expect.any(Object), 'horarios:write');
  });
});
