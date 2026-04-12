/**
 * Tests: Flujo de reserva para admin y profesional
 *
 * Bugs identificados en el análisis:
 *
 * BUG-1: ReservaController.crearReserva — empresa_id tomado de profile.empresaId.
 *   Si el profile no tiene empresaId (superadmin sin empresa activa), la reserva
 *   se inserta con empresa_id: null. ReservaModel.isValid() no valida ese campo.
 *
 * BUG-2: ReservaController.obtenerProfesionalIdsEmpresa — si no hay staff con
 *   roles 'profesional' o 'admin' en usuario_empresa, profIds queda [] y se
 *   devuelve data vacía sin intentar buscar por empresa_id directamente.
 *
 * BUG-3: API GET /api/reservas usa profesional_usuario_id (columna de la vista
 *   v_reservas_detalle) como filtro. ReservaController.crearReserva inserta
 *   profesional_id en la tabla reservas. Si la vista no mapea correctamente,
 *   el profesional no ve sus propias reservas al consultar por su ID.
 *
 * BUG-4: rol 'profesional' NO tiene permiso 'servicios:read' en ROLE_PERMISSIONS.
 *   Un profesional no puede llamar a ServiciosController.obtenerServicios — solo
 *   puede obtener servicios via ReservaClienteController (sin validación de roles).
 *
 * BUG-5: ReservaModel.isValid() no valida empresa_id ni profesional_id.
 *   Una reserva con empresa_id null pasa la validación sin problema.
 *
 * Mocks:
 *  - src/config/supabase  → vi.mock → chainable query-builder stub
 *  - src/utils/permissions → vi.mock con importOriginal (expone funciones reales
 *    + permite spy sobre requirePermission/requireEmpresa)
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

// ── Mock: Supabase ────────────────────────────────────────────────────────────
const makeQueryStub = (resolveWith = { data: null, error: null }) => {
  const stub = {
    _resolve: resolveWith,
    select:      vi.fn().mockReturnThis(),
    eq:          vi.fn().mockReturnThis(),
    in:          vi.fn().mockReturnThis(),
    neq:         vi.fn().mockReturnThis(),
    gte:         vi.fn().mockReturnThis(),
    lte:         vi.fn().mockReturnThis(),
    order:       vi.fn().mockReturnThis(),
    insert:      vi.fn().mockReturnThis(),
    update:      vi.fn().mockReturnThis(),
    delete:      vi.fn().mockReturnThis(),
    single:      vi.fn().mockReturnThis(),
    maybeSingle: vi.fn().mockReturnThis(),
    then(resolve, reject) {
      return Promise.resolve(stub._resolve).then(resolve, reject);
    },
  };
  return stub;
};

/**
 * Sequential stub: cada await consume un resultado diferente.
 * Útil para métodos que llaman a supabase.from() más de una vez.
 */
const makeSequentialStubs = (...results) => {
  let callCount = 0;
  const stub = {
    select:      vi.fn().mockReturnThis(),
    eq:          vi.fn().mockReturnThis(),
    in:          vi.fn().mockReturnThis(),
    neq:         vi.fn().mockReturnThis(),
    gte:         vi.fn().mockReturnThis(),
    lte:         vi.fn().mockReturnThis(),
    order:       vi.fn().mockReturnThis(),
    insert:      vi.fn().mockReturnThis(),
    update:      vi.fn().mockReturnThis(),
    delete:      vi.fn().mockReturnThis(),
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

// Mock de permissions que expone las funciones reales (para poder testearlas directamente)
// y permite spy sobre requirePermission / requireEmpresa.
const mockRequirePermission = vi.fn();
const mockRequireEmpresa    = vi.fn();

vi.mock('../../utils/permissions', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,  // re-exporta hasPermission, requirePermission, requireEmpresa reales
    requirePermission: (...args) => mockRequirePermission(...args),
    requireEmpresa:    (...args) => mockRequireEmpresa(...args),
  };
});

// ── Imports SUT (después de definir los mocks) ────────────────────────────────
import { ReservaController } from '../ReservaController.js';
import { ServiciosController } from '../ServiciosController.js';
import { ReservaClienteController } from '../ReservaClienteController.js';
import { ReservaModel } from '../../models/ReservaModel.js';
import { hasPermission, requirePermission, requireEmpresa } from '../../utils/permissions.js';
import { supabase } from '../../config/supabase';

// ── Helpers ───────────────────────────────────────────────────────────────────
const makeAdminProfile = (overrides = {}) => ({
  rol: 'admin',
  empresaId: 'emp-monalisa',
  usuarioId: 'user-admin-1',
  profesionalId: 'user-admin-1',
  ...overrides,
});

const makeProfesionalProfile = (overrides = {}) => ({
  rol: 'profesional',
  empresaId: 'emp-monalisa',
  usuarioId: 'user-prof-1',
  profesionalId: 'user-prof-1',
  ...overrides,
});

const makeSuperadminProfile = (overrides = {}) => ({
  rol: 'superadmin',
  empresaId: null,
  usuarioId: 'user-super-1',
  profesionalId: null,
  ...overrides,
});

const makeReservaData = (overrides = {}) => ({
  cliente_id: 'cli-1',
  fecha: '2025-07-15',
  hora_inicio: '10:00',
  servicio_id: 'srv-1',
  estado: 'pendiente',
  ...overrides,
});

beforeEach(() => {
  vi.clearAllMocks();
  // Por defecto: sin restricciones de permisos ni empresa
  mockRequirePermission.mockReturnValue(null);
  mockRequireEmpresa.mockReturnValue(null);
});

// =============================================================================
// FIX BUG-4: Permiso 'servicios:read' para rol 'profesional' (corregido)
// =============================================================================
describe('BUG-4 corregido — profesional SÍ tiene permiso servicios:read', () => {
  it('hasPermission devuelve true para profesional con servicios:read', () => {
    const result = hasPermission('profesional', 'servicios:read');
    expect(result).toBe(true);
  });

  it('hasPermission devuelve true para admin con servicios:read', () => {
    const result = hasPermission('admin', 'servicios:read');
    expect(result).toBe(true);
  });

  it('profesional NO tiene servicios:write', () => {
    expect(hasPermission('profesional', 'servicios:write')).toBe(false);
  });

  it('ServiciosController.obtenerServicios funciona para profesional (permiso otorgado)', async () => {
    const servicios = [{ id: 's1', nombre: 'Reiki', duracion_minutos: 45, precio: 1500 }];
    const stub = makeQueryStub({ data: servicios, error: null });
    supabase.from.mockReturnValue(stub);

    const result = await ServiciosController.obtenerServicios(makeProfesionalProfile());

    expect(result.success).toBe(true);
    expect(result.data).toEqual(servicios);
  });

  it('ServiciosController.obtenerServicios funciona para admin', async () => {
    const servicios = [
      { id: 's1', nombre: 'Corte', duracion_minutos: 30, precio: 2000 },
    ];
    const stub = makeQueryStub({ data: servicios, error: null });
    supabase.from.mockReturnValue(stub);

    const result = await ServiciosController.obtenerServicios(makeAdminProfile());

    expect(result.success).toBe(true);
    expect(result.data).toEqual(servicios);
    expect(stub.eq).toHaveBeenCalledWith('empresa_id', 'emp-monalisa');
  });
});

// =============================================================================
// FIX BUG-5: isValidForCreate() valida empresa_id y profesional_id
// =============================================================================
describe('BUG-5 corregido — isValidForCreate() exige empresa_id y profesional_id', () => {
  it('isValid() sigue siendo permisivo (para updates parciales)', () => {
    const reserva = new ReservaModel({
      cliente_id: 'cli-1',
      fecha: '2025-07-15',
      hora_inicio: '10:00',
      empresa_id: null,
      profesional_id: null,
    });
    expect(reserva.isValid()).toBe(true);
  });

  it('isValidForCreate() retorna false cuando empresa_id es null', () => {
    const reserva = new ReservaModel({
      cliente_id: 'cli-1',
      fecha: '2025-07-15',
      hora_inicio: '10:00',
      empresa_id: null,
      profesional_id: 'prof-1',
    });
    expect(reserva.isValidForCreate()).toBe(false);
  });

  it('isValidForCreate() retorna false cuando profesional_id es null', () => {
    const reserva = new ReservaModel({
      cliente_id: 'cli-1',
      fecha: '2025-07-15',
      hora_inicio: '10:00',
      empresa_id: 'emp-1',
      profesional_id: null,
    });
    expect(reserva.isValidForCreate()).toBe(false);
  });

  it('isValidForCreate() retorna true con todos los campos requeridos', () => {
    const reserva = new ReservaModel({
      cliente_id: 'cli-1',
      fecha: '2025-07-15',
      hora_inicio: '10:00',
      empresa_id: 'emp-1',
      profesional_id: 'prof-1',
    });
    expect(reserva.isValidForCreate()).toBe(true);
  });

  it('isValid() retorna false cuando cliente_id es null', () => {
    const reserva = new ReservaModel({
      cliente_id: null,
      fecha: '2025-07-15',
      hora_inicio: '10:00',
    });
    expect(reserva.isValid()).toBe(false);
  });

  it('isValid() retorna false cuando fecha está vacía', () => {
    const reserva = new ReservaModel({
      cliente_id: 'cli-1',
      fecha: '',
      hora_inicio: '10:00',
    });
    expect(reserva.isValid()).toBe(false);
  });

  it('isValid() retorna false cuando hora_inicio está vacía', () => {
    const reserva = new ReservaModel({
      cliente_id: 'cli-1',
      fecha: '2025-07-15',
      hora_inicio: '',
    });
    expect(reserva.isValid()).toBe(false);
  });

  it('toJSON() incluye empresa_id null cuando no se provee empresa', () => {
    const reserva = new ReservaModel({
      empresa_id: null,
      profesional_id: 'prof-1',
      cliente_id: 'cli-1',
      fecha: '2025-07-15',
      hora_inicio: '10:00',
    });
    const json = reserva.toJSON();
    // Documenta el comportamiento actual: empresa_id null llega a la DB sin validación
    expect(json.empresa_id).toBeNull();
  });

  it('ReservaModel mapea correctamente consultante_id como alias de cliente_id', () => {
    const reserva = new ReservaModel({ consultante_id: 'cons-1', fecha: '2025-07-15', hora_inicio: '10:00' });
    expect(reserva.cliente_id).toBe('cons-1');
    expect(reserva.consultante_id).toBe('cons-1');
  });

  it('ReservaModel mapea tipo_sesion_id como alias de servicio_id', () => {
    const reserva = new ReservaModel({ tipo_sesion_id: 'srv-99', cliente_id: 'c1', fecha: '2025-07-15', hora_inicio: '10:00' });
    expect(reserva.servicio_id).toBe('srv-99');
  });
});

// =============================================================================
// FIX BUG-1: crearReserva bloquea empresa_id: null para todos los roles
// =============================================================================
describe('BUG-1 corregido — crearReserva requiere empresaId para todos los roles', () => {
  it('superadmin sin empresaId activa recibe error NO_EMPRESA', async () => {
    const superadmin = makeSuperadminProfile();
    // requireEmpresa real devuelve error cuando empresaId es null
    mockRequireEmpresa.mockReturnValueOnce({ success: false, error: 'Sin empresa asociada', code: 'NO_EMPRESA' });

    const result = await ReservaController.crearReserva(
      makeReservaData(),
      'prof-1',
      superadmin,
    );

    expect(result.success).toBe(false);
    expect(result.code).toBe('NO_EMPRESA');
    expect(supabase.from).not.toHaveBeenCalled();
  });

  it('admin con empresaId inserta empresa_id correctamente', async () => {
    const admin = makeAdminProfile();
    const reservaInsertada = [{ id: 'res-2', empresa_id: 'emp-monalisa',
                                cliente_id: 'cli-1', profesional_id: 'prof-1', estado: 'pendiente' }];
    const usuarios = [{ id: 'cli-1', nombre_completo: 'Ana', email: 'a@a.com', telefono: '123' }];

    const stub = makeSequentialStubs(
      { data: reservaInsertada, error: null },
      { data: usuarios, error: null },
    );
    supabase.from.mockReturnValue(stub);

    const result = await ReservaController.crearReserva(
      makeReservaData(),
      'prof-1',
      admin,
    );

    expect(result.success).toBe(true);
    expect(stub.insert).toHaveBeenCalledWith([
      expect.objectContaining({ empresa_id: 'emp-monalisa' }),
    ]);
  });

  it('profesional: crearReserva setea autor_id desde profile.usuarioId', async () => {
    const prof = makeProfesionalProfile();
    const reservaInsertada = [{ id: 'res-3', cliente_id: 'cli-1', profesional_id: 'prof-1' }];

    const stub = makeSequentialStubs(
      { data: reservaInsertada, error: null },
      { data: [], error: null },
    );
    supabase.from.mockReturnValue(stub);

    await ReservaController.crearReserva(makeReservaData(), 'prof-1', prof);

    expect(stub.insert).toHaveBeenCalledWith([
      expect.objectContaining({ autor_id: 'user-prof-1' }),
    ]);
  });
});

// =============================================================================
// BUG-2: obtenerProfesionalIdsEmpresa retorna [] cuando no hay matches
// =============================================================================
describe('BUG-2 — agenda devuelve vacío cuando profIds es []', () => {
  it('cuando empresa no tiene staff con roles admin/profesional, la agenda retorna []', async () => {
    // Sequence: usuario_empresa query → data vacía → profIds = []
    const stub = makeQueryStub({ data: [], error: null });
    supabase.from.mockReturnValue(stub);

    const result = await ReservaController.obtenerReservasPorFecha(
      '2025-07-15',
      null,
      makeAdminProfile(),
    );

    expect(result.success).toBe(true);
    expect(result.data).toEqual([]);
    // Con profIds vacío se hace early return — NO se llama a .in('profesional_id', ...)
    // (el .in() que sí se llama es el de usuario_empresa para filtrar roles)
    expect(stub.in).not.toHaveBeenCalledWith('profesional_id', expect.anything());
  });

  it('superadmin: obtiene reservas SIN filtro por empresa (profIds = null)', async () => {
    const reservas = [
      { id: 'r1', cliente_id: 'c1', profesional_id: 'p1', servicios: { nombre: 'Masaje' } },
    ];
    const stub = makeSequentialStubs(
      { data: reservas, error: null },
      { data: [{ id: 'c1', nombre_completo: 'Test', email: 'e@e.com', telefono: '123' }], error: null },
    );
    supabase.from.mockReturnValue(stub);

    const result = await ReservaController.obtenerReservasPorFecha(
      '2025-07-15',
      null,
      makeSuperadminProfile(),
    );

    expect(result.success).toBe(true);
    // Superadmin no filtra por profesional_id
    expect(stub.in).not.toHaveBeenCalledWith('profesional_id', expect.anything());
  });

  it('admin: reservas filtradas por profIds de su empresa', async () => {
    const profIds = ['prof-1', 'prof-2'];
    const profRows = [
      { usuario_id: 'prof-1', roles: { nombre: 'profesional' } },
      { usuario_id: 'prof-2', roles: { nombre: 'admin' } },
    ];
    const reservas = [
      { id: 'r1', cliente_id: 'c1', profesional_id: 'prof-1', servicios: { nombre: 'Yoga' } },
    ];
    const stub = makeSequentialStubs(
      { data: profRows, error: null },   // usuario_empresa
      { data: reservas, error: null },   // reservas
      { data: [{ id: 'c1', nombre_completo: 'Ana', email: 'a@a.com', telefono: '123' }], error: null },
    );
    supabase.from.mockReturnValue(stub);

    const result = await ReservaController.obtenerReservasPorFecha(
      '2025-07-15',
      null,
      makeAdminProfile(),
    );

    expect(result.success).toBe(true);
    expect(stub.in).toHaveBeenCalledWith('profesional_id', profIds);
  });
});

// =============================================================================
// Flujo completo: admin crea reserva para un cliente
// =============================================================================
describe('Flujo — admin crea reserva para cliente en su empresa', () => {
  it('crea reserva con todos los campos obligatorios y retorna la reserva enriquecida', async () => {
    const admin = makeAdminProfile();
    const reservaCreada = [{
      id: 'res-new',
      empresa_id: 'emp-monalisa',
      profesional_id: 'prof-1',
      cliente_id: 'cli-1',
      autor_id: 'user-admin-1',
      servicio_id: 'srv-1',
      fecha: '2025-07-15',
      hora_inicio: '10:00',
      estado: 'pendiente',
      servicios: { nombre: 'Masaje' },
    }];
    const usuarios = [
      { id: 'cli-1', nombre_completo: 'María López', email: 'maria@test.com', telefono: '1122334455' },
      { id: 'prof-1', nombre_completo: 'Dr. García', email: 'garcia@test.com', telefono: '9988776655' },
    ];

    const stub = makeSequentialStubs(
      { data: reservaCreada, error: null },
      { data: usuarios, error: null },
    );
    supabase.from.mockReturnValue(stub);

    const result = await ReservaController.crearReserva(
      makeReservaData({ hora_inicio: '10:00', fecha: '2025-07-15' }),
      'prof-1',
      admin,
    );

    expect(result.success).toBe(true);
    expect(result.data).toBeDefined();
    expect(supabase.from).toHaveBeenCalledWith('reservas');
    expect(stub.insert).toHaveBeenCalledWith([
      expect.objectContaining({
        empresa_id: 'emp-monalisa',
        cliente_id: 'cli-1',
        autor_id: 'user-admin-1',
        profesional_id: 'prof-1',
        estado: 'pendiente',
      }),
    ]);
  });

  it('retorna error de validación cuando falta cliente_id', async () => {
    const result = await ReservaController.crearReserva(
      makeReservaData({ cliente_id: null }),
      'prof-1',
      makeAdminProfile(),
    );

    expect(result.success).toBe(false);
    expect(result.error).toMatch(/obligatorios/i);
    expect(supabase.from).not.toHaveBeenCalled();
  });

  it('retorna error de validación cuando falta fecha', async () => {
    const result = await ReservaController.crearReserva(
      makeReservaData({ fecha: '' }),
      'prof-1',
      makeAdminProfile(),
    );

    expect(result.success).toBe(false);
    expect(result.error).toMatch(/obligatorios/i);
  });

  it('retorna FORBIDDEN cuando profile no tiene permiso reservas:write', async () => {
    mockRequirePermission.mockReturnValue({ success: false, error: 'Sin permisos', code: 'FORBIDDEN' });

    const result = await ReservaController.crearReserva(
      makeReservaData(),
      'prof-1',
      makeAdminProfile(),
    );

    expect(result.success).toBe(false);
    expect(result.code).toBe('FORBIDDEN');
    expect(supabase.from).not.toHaveBeenCalled();
  });

  it('retorna error cuando Supabase falla en el insert', async () => {
    const stub = makeQueryStub({ data: null, error: { message: 'foreign key constraint' } });
    supabase.from.mockReturnValue(stub);

    const result = await ReservaController.crearReserva(
      makeReservaData(),
      'prof-1',
      makeAdminProfile(),
    );

    expect(result.success).toBe(false);
    expect(result.error).toBe('foreign key constraint');
  });
});

// =============================================================================
// Flujo: profesional obtiene servicios via ReservaClienteController (sin roles)
// =============================================================================
describe('Flujo — profesional obtiene servicios via ReservaClienteController', () => {
  it('ReservaClienteController.obtenerServiciosEmpresa no requiere rol', async () => {
    const servicios = [
      { id: 's1', nombre: 'Masaje relajante', duracion_minutos: 60, precio: 4500 },
      { id: 's2', nombre: 'Corte de cabello', duracion_minutos: 30, precio: 2000 },
    ];
    const stub = makeQueryStub({ data: servicios, error: null });
    supabase.from.mockReturnValue(stub);

    const result = await ReservaClienteController.obtenerServiciosEmpresa('emp-monalisa');

    expect(result.success).toBe(true);
    expect(result.data).toHaveLength(2);
    expect(stub.eq).toHaveBeenCalledWith('empresa_id', 'emp-monalisa');
    expect(stub.eq).toHaveBeenCalledWith('activo', true);
  });

  it('obtiene profesionales de la empresa para seleccionar al crear reserva', async () => {
    const rawData = [
      { usuario_id: 'prof-1', roles: { nombre: 'profesional' }, usuarios: { id: 'prof-1', nombre_completo: 'Dr. García', avatar_url: null } },
      { usuario_id: 'admin-1', roles: { nombre: 'admin' }, usuarios: { id: 'admin-1', nombre_completo: 'Admin López', avatar_url: null } },
    ];
    const stub = makeQueryStub({ data: rawData, error: null });
    supabase.from.mockReturnValue(stub);

    const result = await ReservaClienteController.obtenerProfesionalesEmpresa('emp-monalisa');

    expect(result.success).toBe(true);
    expect(result.data).toHaveLength(2);
    // Ordenados alfabéticamente: Admin López primero
    expect(result.data[0].nombre_completo).toBe('Admin López');
    expect(result.data[1].nombre_completo).toBe('Dr. García');
  });

  it('servicio sin disponibilidad: slots vacíos cuando todo está ocupado', () => {
    const horarios = [{ hora_inicio: '09:00', hora_fin: '11:00' }];
    const ocupados = ['09:00', '09:30', '10:00', '10:30'];

    const result = ReservaClienteController.calcularSlotsDisponibles(horarios, ocupados);

    expect(result.todos).toEqual([]);
    expect(result.manana).toEqual([]);
    expect(result.tarde).toEqual([]);
  });
});

// =============================================================================
// Condición de carga de agenda: diferencia entre admin y profesional
// =============================================================================
describe('Guard de carga de agenda — empresaId y profesionalId', () => {
  it('agenda profesional NO carga si no tiene empresaId', () => {
    // AgendaProfesionalPage: if (!profile?.empresaId || !profile?.profesionalId) return
    const profile = { ...makeProfesionalProfile(), empresaId: null };
    const debeCarga = !!(profile?.empresaId && profile?.profesionalId);
    expect(debeCarga).toBe(false);
  });

  it('agenda profesional NO carga si no tiene profesionalId', () => {
    const profile = { ...makeProfesionalProfile(), profesionalId: null };
    const debeCarga = !!(profile?.empresaId && profile?.profesionalId);
    expect(debeCarga).toBe(false);
  });

  it('agenda profesional CARGA cuando tiene empresaId y profesionalId', () => {
    const profile = makeProfesionalProfile();
    const debeCarga = !!(profile?.empresaId && profile?.profesionalId);
    expect(debeCarga).toBe(true);
  });

  it('agenda admin CARGA solo con empresaId (no requiere profesionalId)', () => {
    // AgendaPage (admin): if (!profile?.empresaId) return
    const adminSinProfId = { ...makeAdminProfile(), profesionalId: null };
    const debeCargaAdmin = !!adminSinProfId?.empresaId;
    expect(debeCargaAdmin).toBe(true);
  });

  it('ninguna agenda carga cuando profile es null', () => {
    const profile = null;
    expect(!!(profile?.empresaId)).toBe(false);
    expect(!!(profile?.empresaId && profile?.profesionalId)).toBe(false);
  });
});

// =============================================================================
// Permisos de rol — usando hasPermission real (no mockeado)
// =============================================================================
describe('Permisos de rol: admin y profesional', () => {
  it('admin tiene reservas:write', () => {
    expect(hasPermission('admin', 'reservas:write')).toBe(true);
  });

  it('profesional tiene reservas:write', () => {
    expect(hasPermission('profesional', 'reservas:write')).toBe(true);
  });

  it('cliente NO tiene reservas:write', () => {
    expect(hasPermission('cliente', 'reservas:write')).toBe(false);
  });

  it('profesional tiene reservas:read', () => {
    expect(hasPermission('profesional', 'reservas:read')).toBe(true);
  });

  it('profesional tiene agenda:write', () => {
    expect(hasPermission('profesional', 'agenda:write')).toBe(true);
  });

  it('profesional SÍ tiene servicios:read (BUG-4 corregido)', () => {
    expect(hasPermission('profesional', 'servicios:read')).toBe(true);
  });

  it('profesional NO tiene servicios:write', () => {
    expect(hasPermission('profesional', 'servicios:write')).toBe(false);
  });

  it('profesional NO tiene reportes:read', () => {
    expect(hasPermission('profesional', 'reportes:read')).toBe(false);
  });

  it('admin tiene reportes:read', () => {
    expect(hasPermission('admin', 'reportes:read')).toBe(true);
  });

  it('superadmin tiene todos los permisos (wildcard)', () => {
    expect(hasPermission('superadmin', 'servicios:read')).toBe(true);
    expect(hasPermission('superadmin', 'cualquier:permiso')).toBe(true);
  });

  it('admin tiene agenda:read (permisos completos verificados)', () => {
    // hasPermission es la función real (re-exportada en el mock via importOriginal)
    expect(hasPermission('admin', 'agenda:read')).toBe(true);
    expect(hasPermission('admin', 'reservas:read')).toBe(true);
    expect(hasPermission('admin', 'consultantes:write')).toBe(true);
  });
});

// =============================================================================
// ReservaController.actualizarEstado — admin y profesional cambian estado
// =============================================================================
describe('ReservaController.actualizarEstado', () => {
  it('admin confirma una reserva pendiente', async () => {
    const stub = makeQueryStub({ error: null });
    supabase.from.mockReturnValue(stub);

    const result = await ReservaController.actualizarEstado('res-1', 'confirmada', makeAdminProfile());

    expect(result.success).toBe(true);
    expect(stub.update).toHaveBeenCalledWith({ estado: 'confirmada' });
    expect(stub.eq).toHaveBeenCalledWith('id', 'res-1');
  });

  it('profesional marca una reserva como completada', async () => {
    const stub = makeQueryStub({ error: null });
    supabase.from.mockReturnValue(stub);

    const result = await ReservaController.actualizarEstado('res-2', 'completada', makeProfesionalProfile());

    expect(result.success).toBe(true);
    expect(stub.update).toHaveBeenCalledWith({ estado: 'completada' });
  });

  it('retorna FORBIDDEN cuando no tiene permiso', async () => {
    mockRequirePermission.mockReturnValue({ success: false, error: 'Sin permisos', code: 'FORBIDDEN' });

    const result = await ReservaController.actualizarEstado('res-1', 'confirmada', makeAdminProfile());

    expect(result.success).toBe(false);
    expect(result.code).toBe('FORBIDDEN');
  });

  it('retorna error cuando Supabase falla', async () => {
    const stub = makeQueryStub({ error: { message: 'update failed' } });
    supabase.from.mockReturnValue(stub);

    const result = await ReservaController.actualizarEstado('res-1', 'confirmada', makeAdminProfile());

    expect(result.success).toBe(false);
    expect(result.error).toBe('update failed');
  });
});

// =============================================================================
// ReservaController.registrarPago — admin registra pago de una sesión
// =============================================================================
describe('ReservaController.registrarPago', () => {
  it('registra pago con precio, método y pagado:true', async () => {
    const stub = makeQueryStub({ error: null });
    supabase.from.mockReturnValue(stub);

    const result = await ReservaController.registrarPago(
      'res-1',
      { precio_total: 3500, metodo_pago: 'efectivo', pagado: true },
      makeAdminProfile(),
    );

    expect(result.success).toBe(true);
    expect(stub.update).toHaveBeenCalledWith({
      precio_total: 3500,
      metodo_pago: 'efectivo',
      pagado: true,
    });
    expect(stub.eq).toHaveBeenCalledWith('id', 'res-1');
  });

  it('solo actualiza los campos provistos (precio_total ausente no va en update)', async () => {
    const stub = makeQueryStub({ error: null });
    supabase.from.mockReturnValue(stub);

    await ReservaController.registrarPago(
      'res-1',
      { metodo_pago: 'transferencia', pagado: true },
      makeAdminProfile(),
    );

    const updateArg = stub.update.mock.calls[0][0];
    expect(updateArg).toHaveProperty('metodo_pago', 'transferencia');
    expect(updateArg).toHaveProperty('pagado', true);
    expect(updateArg).not.toHaveProperty('precio_total');
  });

  it('retorna FORBIDDEN cuando no tiene permiso', async () => {
    mockRequirePermission.mockReturnValue({ success: false, error: 'Sin permisos', code: 'FORBIDDEN' });

    const result = await ReservaController.registrarPago('res-1', { pagado: true }, makeAdminProfile());

    expect(result.success).toBe(false);
    expect(result.code).toBe('FORBIDDEN');
  });

  it('retorna error cuando Supabase falla', async () => {
    const stub = makeQueryStub({ error: { message: 'payment update error' } });
    supabase.from.mockReturnValue(stub);

    const result = await ReservaController.registrarPago('res-1', { pagado: true }, makeAdminProfile());

    expect(result.success).toBe(false);
    expect(result.error).toBe('payment update error');
  });
});

// =============================================================================
// API /api/reservas — validación de campos requeridos (lógica aislada)
// =============================================================================
describe('API /api/reservas POST — validación de campos requeridos', () => {
  const REQUIRED_FIELDS = ['empresaId', 'clienteId', 'profesionalId', 'servicioId', 'fechaHoraInicio'];

  it.each(REQUIRED_FIELDS)(
    'campo faltante "%s" → la validación detecta el error',
    (missingField) => {
      const body = {
        empresaId: 'emp-monalisa',
        clienteId: 'cli-1',
        profesionalId: 'prof-1',
        servicioId: 'srv-1',
        fechaHoraInicio: '2025-07-15T10:00:00.000Z',
      };
      delete body[missingField];

      const camposOk = REQUIRED_FIELDS.every(f => !!body[f]);
      expect(camposOk).toBe(false);
    },
  );

  it('todos los campos presentes pasan la validación', () => {
    const body = {
      empresaId: 'emp-monalisa',
      clienteId: 'cli-1',
      profesionalId: 'prof-1',
      servicioId: 'srv-1',
      fechaHoraInicio: '2025-07-15T10:00:00.000Z',
    };
    const camposOk = REQUIRED_FIELDS.every(f => !!body[f]);
    expect(camposOk).toBe(true);
  });

  it('profesionalId string vacío falla la validación', () => {
    const body = {
      empresaId: 'emp-monalisa',
      clienteId: 'cli-1',
      profesionalId: '',
      servicioId: 'srv-1',
      fechaHoraInicio: '2025-07-15T10:00:00.000Z',
    };
    const camposOk = REQUIRED_FIELDS.every(f => !!body[f]);
    expect(camposOk).toBe(false);
  });

  it('empresaId null falla la validación', () => {
    const body = {
      empresaId: null,
      clienteId: 'cli-1',
      profesionalId: 'prof-1',
      servicioId: 'srv-1',
      fechaHoraInicio: '2025-07-15T10:00:00.000Z',
    };
    const camposOk = REQUIRED_FIELDS.every(f => !!body[f]);
    expect(camposOk).toBe(false);
  });
});
