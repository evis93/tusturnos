/**
 * Tests for ReservaClienteController
 *
 * Mocks:
 *  - src/config/supabase → vi.mock → chainable query-builder stub
 *
 * No DB calls are made; all Supabase interactions are stubbed.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

// ── Chainable query-builder stub ──────────────────────────────────────────────

const makeQueryStub = (resolveWith = { data: [], error: null }) => {
  const stub = {
    _resolve: resolveWith,
    select: vi.fn().mockReturnThis(),
    eq:     vi.fn().mockReturnThis(),
    neq:    vi.fn().mockReturnThis(),
    gte:    vi.fn().mockReturnThis(),
    lte:    vi.fn().mockReturnThis(),
    in:     vi.fn().mockReturnThis(),
    order:  vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
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

// ── Import SUT after mocks ────────────────────────────────────────────────────
import { ReservaClienteController } from '../ReservaClienteController.js';
import { supabase } from '../../config/supabase';

// ── Reset between tests ───────────────────────────────────────────────────────
beforeEach(() => {
  vi.clearAllMocks();
});

// =============================================================================
// obtenerProfesionalesEmpresa
// =============================================================================
describe('ReservaClienteController.obtenerProfesionalesEmpresa', () => {
  it('retorna lista de profesionales deduplicada y ordenada por nombre', async () => {
    const rawData = [
      { usuario_id: 'u1', roles: { nombre: 'profesional' }, usuarios: { id: 'u1', nombre_completo: 'Zoe Pérez', avatar_url: 'z.jpg' } },
      { usuario_id: 'u2', roles: { nombre: 'admin' },       usuarios: { id: 'u2', nombre_completo: 'Ana García', avatar_url: 'a.jpg' } },
      // u1 aparece también como admin — debe ganar 'admin' por prioridad
      { usuario_id: 'u1', roles: { nombre: 'admin' },       usuarios: { id: 'u1', nombre_completo: 'Zoe Pérez', avatar_url: 'z.jpg' } },
    ];

    const stub = makeQueryStub({ data: rawData, error: null });
    supabase.from.mockReturnValue(stub);

    const result = await ReservaClienteController.obtenerProfesionalesEmpresa('emp-1');

    expect(result.success).toBe(true);
    // Solo 2 usuarios únicos
    expect(result.data).toHaveLength(2);
    // Ordenados por nombre: Ana primero, Zoe después
    expect(result.data[0].nombre_completo).toBe('Ana García');
    expect(result.data[1].nombre_completo).toBe('Zoe Pérez');
    // u1 debe tener rol 'admin' (prioridad > profesional)
    const zoe = result.data.find(p => p.id === 'u1');
    expect(zoe.rol).toBe('admin');
  });

  it('retorna lista vacía cuando no hay profesionales', async () => {
    const stub = makeQueryStub({ data: [], error: null });
    supabase.from.mockReturnValue(stub);

    const result = await ReservaClienteController.obtenerProfesionalesEmpresa('emp-vacia');

    expect(result.success).toBe(true);
    expect(result.data).toEqual([]);
  });

  it('retorna lista vacía cuando data es null', async () => {
    const stub = makeQueryStub({ data: null, error: null });
    supabase.from.mockReturnValue(stub);

    const result = await ReservaClienteController.obtenerProfesionalesEmpresa('emp-null');

    expect(result.success).toBe(true);
    expect(result.data).toEqual([]);
  });

  it('rellena con strings vacíos cuando nombre_completo y avatar_url son null', async () => {
    const rawData = [
      { usuario_id: 'u9', roles: { nombre: 'profesional' }, usuarios: { id: 'u9', nombre_completo: null, avatar_url: null } },
    ];
    const stub = makeQueryStub({ data: rawData, error: null });
    supabase.from.mockReturnValue(stub);

    const result = await ReservaClienteController.obtenerProfesionalesEmpresa('emp-1');

    expect(result.success).toBe(true);
    expect(result.data[0].nombre_completo).toBe('');
    expect(result.data[0].avatar_url).toBe('');
  });

  it('devuelve success:false cuando Supabase retorna error', async () => {
    const stub = makeQueryStub({ data: null, error: { message: 'DB error' } });
    supabase.from.mockReturnValue(stub);

    const result = await ReservaClienteController.obtenerProfesionalesEmpresa('emp-1');

    expect(result.success).toBe(false);
    expect(result.error).toBe('DB error');
  });

  it('consulta la tabla usuario_empresa con el empresaId correcto', async () => {
    const stub = makeQueryStub({ data: [], error: null });
    supabase.from.mockReturnValue(stub);

    await ReservaClienteController.obtenerProfesionalesEmpresa('emp-42');

    expect(supabase.from).toHaveBeenCalledWith('usuario_empresa');
    expect(stub.eq).toHaveBeenCalledWith('empresa_id', 'emp-42');
  });
});

// =============================================================================
// obtenerServiciosEmpresa
// =============================================================================
describe('ReservaClienteController.obtenerServiciosEmpresa', () => {
  it('retorna servicios activos de la empresa', async () => {
    const servicios = [
      { id: 's1', nombre: 'Masaje', duracion_minutos: 60, precio: 5000 },
      { id: 's2', nombre: 'Yoga',   duracion_minutos: 45, precio: 3000 },
    ];
    const stub = makeQueryStub({ data: servicios, error: null });
    supabase.from.mockReturnValue(stub);

    const result = await ReservaClienteController.obtenerServiciosEmpresa('emp-1');

    expect(result.success).toBe(true);
    expect(result.data).toEqual(servicios);
  });

  it('retorna array vacío cuando no hay servicios activos', async () => {
    const stub = makeQueryStub({ data: [], error: null });
    supabase.from.mockReturnValue(stub);

    const result = await ReservaClienteController.obtenerServiciosEmpresa('emp-1');

    expect(result.success).toBe(true);
    expect(result.data).toEqual([]);
  });

  it('retorna array vacío cuando data es null', async () => {
    const stub = makeQueryStub({ data: null, error: null });
    supabase.from.mockReturnValue(stub);

    const result = await ReservaClienteController.obtenerServiciosEmpresa('emp-1');

    expect(result.success).toBe(true);
    expect(result.data).toEqual([]);
  });

  it('devuelve success:false en error de Supabase', async () => {
    const stub = makeQueryStub({ data: null, error: { message: 'timeout' } });
    supabase.from.mockReturnValue(stub);

    const result = await ReservaClienteController.obtenerServiciosEmpresa('emp-1');

    expect(result.success).toBe(false);
    expect(result.error).toBe('timeout');
  });

  it('consulta tabla servicios con empresa_id y activo=true', async () => {
    const stub = makeQueryStub({ data: [], error: null });
    supabase.from.mockReturnValue(stub);

    await ReservaClienteController.obtenerServiciosEmpresa('emp-99');

    expect(supabase.from).toHaveBeenCalledWith('servicios');
    expect(stub.eq).toHaveBeenCalledWith('empresa_id', 'emp-99');
    expect(stub.eq).toHaveBeenCalledWith('activo', true);
  });
});

// =============================================================================
// obtenerHorariosDelDia
// =============================================================================
describe('ReservaClienteController.obtenerHorariosDelDia', () => {
  it('retorna horarios para el día solicitado', async () => {
    const horarios = [{ hora_inicio: '09:00', hora_fin: '13:00' }];
    const stub = makeQueryStub({ data: horarios, error: null });
    supabase.from.mockReturnValue(stub);

    const result = await ReservaClienteController.obtenerHorariosDelDia('prof-1', 1);

    expect(result.success).toBe(true);
    expect(result.data).toEqual(horarios);
  });

  it('retorna array vacío cuando no hay horarios configurados', async () => {
    const stub = makeQueryStub({ data: [], error: null });
    supabase.from.mockReturnValue(stub);

    const result = await ReservaClienteController.obtenerHorariosDelDia('prof-1', 0);

    expect(result.success).toBe(true);
    expect(result.data).toEqual([]);
  });

  it('retorna array vacío cuando data es null', async () => {
    const stub = makeQueryStub({ data: null, error: null });
    supabase.from.mockReturnValue(stub);

    const result = await ReservaClienteController.obtenerHorariosDelDia('prof-1', 3);

    expect(result.success).toBe(true);
    expect(result.data).toEqual([]);
  });

  it('devuelve success:false en error de Supabase', async () => {
    const stub = makeQueryStub({ data: null, error: { message: 'network error' } });
    supabase.from.mockReturnValue(stub);

    const result = await ReservaClienteController.obtenerHorariosDelDia('prof-1', 2);

    expect(result.success).toBe(false);
    expect(result.error).toBe('network error');
  });

  it('filtra por profesional_id, dia_semana y activo=true', async () => {
    const stub = makeQueryStub({ data: [], error: null });
    supabase.from.mockReturnValue(stub);

    await ReservaClienteController.obtenerHorariosDelDia('prof-7', 5);

    expect(supabase.from).toHaveBeenCalledWith('horarios_atencion');
    expect(stub.eq).toHaveBeenCalledWith('profesional_id', 'prof-7');
    expect(stub.eq).toHaveBeenCalledWith('dia_semana', 5);
    expect(stub.eq).toHaveBeenCalledWith('activo', true);
  });
});

// =============================================================================
// obtenerSlotsOcupados
// =============================================================================
describe('ReservaClienteController.obtenerSlotsOcupados', () => {
  it('retorna slots ocupados normalizados a HH:MM', async () => {
    const reservas = [
      { fecha_hora_inicio: '2025-06-10T12:00:00.000Z' }, // 09:00 AR = 12:00 UTC
      { fecha_hora_inicio: '2025-06-10T13:30:00.000Z' }, // 10:30 AR = 13:30 UTC
    ];
    const stub = makeQueryStub({ data: reservas, error: null });
    supabase.from.mockReturnValue(stub);

    const result = await ReservaClienteController.obtenerSlotsOcupados('prof-1', '2025-06-10');

    expect(result.success).toBe(true);
    expect(result.data).toEqual(['09:00', '10:30']);
  });

  it('retorna array vacío cuando no hay reservas', async () => {
    const stub = makeQueryStub({ data: [], error: null });
    supabase.from.mockReturnValue(stub);

    const result = await ReservaClienteController.obtenerSlotsOcupados('prof-1', '2025-06-10');

    expect(result.success).toBe(true);
    expect(result.data).toEqual([]);
  });

  it('retorna array vacío cuando data es null', async () => {
    const stub = makeQueryStub({ data: null, error: null });
    supabase.from.mockReturnValue(stub);

    const result = await ReservaClienteController.obtenerSlotsOcupados('prof-1', '2025-06-10');

    expect(result.success).toBe(true);
    expect(result.data).toEqual([]);
  });

  it('devuelve success:false cuando fecha_hora_inicio es inválido', async () => {
    const reservas = [{ fecha_hora_inicio: undefined }];
    const stub = makeQueryStub({ data: reservas, error: null });
    supabase.from.mockReturnValue(stub);

    const result = await ReservaClienteController.obtenerSlotsOcupados('prof-1', '2025-06-10');

    // new Date(undefined).toISOString() lanza RangeError → el catch devuelve success:false
    expect(result.success).toBe(false);
  });

  it('devuelve success:false en error de Supabase', async () => {
    const stub = makeQueryStub({ data: null, error: { message: 'forbidden' } });
    supabase.from.mockReturnValue(stub);

    const result = await ReservaClienteController.obtenerSlotsOcupados('prof-1', '2025-06-10');

    expect(result.success).toBe(false);
    expect(result.error).toBe('forbidden');
  });

  it('filtra slots por profesional_id, rango de fecha e in(estados activos)', async () => {
    const stub = makeQueryStub({ data: [], error: null });
    supabase.from.mockReturnValue(stub);

    await ReservaClienteController.obtenerSlotsOcupados('prof-3', '2025-07-01');

    expect(supabase.from).toHaveBeenCalledWith('reservas');
    expect(stub.eq).toHaveBeenCalledWith('profesional_id', 'prof-3');
    expect(stub.gte).toHaveBeenCalled();
    expect(stub.lte).toHaveBeenCalled();
    expect(stub.in).toHaveBeenCalledWith('estado', ['PENDIENTE', 'CONFIRMADA', 'CAMBIO_SOLICITADO']);
  });
});

// =============================================================================
// calcularSlotsDisponibles  (método puro — sin mocks)
// =============================================================================
describe('ReservaClienteController.calcularSlotsDisponibles', () => {
  it('genera correctamente slots de 30 min dentro del rango y separa mañana/tarde', () => {
    const horarios = [{ hora_inicio: '09:00', hora_fin: '13:30' }];
    const ocupados = ['10:00', '11:30'];

    const result = ReservaClienteController.calcularSlotsDisponibles(horarios, ocupados);

    // Todos los slots del rango son: 09:00 10:00 10:30 11:00 11:30 12:00 12:30 13:00
    // Ocupados: 10:00 y 11:30 → quedan 7 slots
    expect(result.todos).toHaveLength(7);
    expect(result.todos).not.toContain('10:00');
    expect(result.todos).not.toContain('11:30');
    expect(result.todos).toContain('09:00');
    expect(result.todos).toContain('13:00');
  });

  it('clasifica horas < 13 como mañana y >= 13 como tarde', () => {
    const horarios = [{ hora_inicio: '12:00', hora_fin: '15:00' }];
    const ocupados = [];

    const result = ReservaClienteController.calcularSlotsDisponibles(horarios, ocupados);

    // 12:00, 12:30 → mañana   |   13:00, 13:30, 14:00, 14:30 → tarde
    expect(result.manana).toEqual(['12:00', '12:30']);
    expect(result.tarde).toEqual(['13:00', '13:30', '14:00', '14:30']);
  });

  it('retorna arrays vacíos cuando todos los slots están ocupados', () => {
    const horarios = [{ hora_inicio: '09:00', hora_fin: '10:00' }];
    const ocupados = ['09:00', '09:30'];

    const result = ReservaClienteController.calcularSlotsDisponibles(horarios, ocupados);

    expect(result.todos).toEqual([]);
    expect(result.manana).toEqual([]);
    expect(result.tarde).toEqual([]);
  });

  it('retorna arrays vacíos cuando no hay horarios configurados', () => {
    const result = ReservaClienteController.calcularSlotsDisponibles([], []);

    expect(result.todos).toEqual([]);
    expect(result.manana).toEqual([]);
    expect(result.tarde).toEqual([]);
  });

  it('combina múltiples franjas horarias del día', () => {
    const horarios = [
      { hora_inicio: '09:00', hora_fin: '10:00' },
      { hora_inicio: '14:00', hora_fin: '15:00' },
    ];
    const ocupados = [];

    const result = ReservaClienteController.calcularSlotsDisponibles(horarios, ocupados);

    // 09:00 09:30 de mañana + 14:00 14:30 de tarde
    expect(result.manana).toEqual(['09:00', '09:30']);
    expect(result.tarde).toEqual(['14:00', '14:30']);
    expect(result.todos).toHaveLength(4);
  });

  it('no genera slots si hora_inicio == hora_fin', () => {
    const horarios = [{ hora_inicio: '10:00', hora_fin: '10:00' }];
    const result = ReservaClienteController.calcularSlotsDisponibles(horarios, []);
    expect(result.todos).toEqual([]);
  });
});

// =============================================================================
// solicitarReserva
// =============================================================================
describe('ReservaClienteController.solicitarReserva', () => {
  const baseParams = {
    empresaId: 'emp-1',
    profesionalId: 'prof-1',
    clienteId: 'cli-1',
    servicioId: 'srv-1',
    fecha: '2025-06-15',
    horaInicio: '10:00',
  };

  const mockFetch = (ok, jsonBody) => {
    global.fetch = vi.fn().mockResolvedValue({
      ok,
      json: vi.fn().mockResolvedValue(jsonBody),
    });
  };

  it('retorna success:true con los datos de la reserva creada', async () => {
    const nuevaReserva = { id: 'res-1', estado: 'pendiente' };
    mockFetch(true, { data: nuevaReserva });

    const result = await ReservaClienteController.solicitarReserva(baseParams);

    expect(result.success).toBe(true);
    expect(result.data).toEqual(nuevaReserva);
  });

  it('llama a fetch POST /api/reservas', async () => {
    mockFetch(true, { data: { id: 'res-2' } });

    await ReservaClienteController.solicitarReserva(baseParams);

    expect(global.fetch).toHaveBeenCalledWith(
      '/api/reservas',
      expect.objectContaining({ method: 'POST' })
    );
  });

  it('incluye fechaHoraInicio con hora y offset AR en el body', async () => {
    mockFetch(true, { data: { id: 'res-3' } });

    await ReservaClienteController.solicitarReserva({ ...baseParams, horaInicio: '14:30' });

    const [, options] = global.fetch.mock.calls[0];
    const body = JSON.parse(options.body);
    expect(body.fechaHoraInicio).toBe('2025-06-15T14:30:00-03:00');
  });

  it('envia todos los campos requeridos en el body', async () => {
    mockFetch(true, { data: { id: 'res-4' } });

    await ReservaClienteController.solicitarReserva(baseParams);

    const [, options] = global.fetch.mock.calls[0];
    const body = JSON.parse(options.body);
    expect(body).toMatchObject({
      empresaId: 'emp-1',
      profesionalId: 'prof-1',
      clienteId: 'cli-1',
      servicioId: 'srv-1',
    });
  });

  it('devuelve success:false con el error del servidor cuando res.ok=false', async () => {
    mockFetch(false, { error: 'conflict' });

    const result = await ReservaClienteController.solicitarReserva(baseParams);

    expect(result.success).toBe(false);
    expect(result.error).toBe('conflict');
  });

  it('usa mensaje genérico cuando el servidor no incluye error', async () => {
    mockFetch(false, {});

    const result = await ReservaClienteController.solicitarReserva(baseParams);

    expect(result.success).toBe(false);
    expect(result.error).toBe('Error al crear la reserva');
  });

  it('devuelve success:false cuando fetch lanza excepción de red', async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error('network failure'));

    const result = await ReservaClienteController.solicitarReserva(baseParams);

    expect(result.success).toBe(false);
    expect(result.error).toBe('network failure');
  });
});
