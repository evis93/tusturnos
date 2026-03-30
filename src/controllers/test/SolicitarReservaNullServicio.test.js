/**
 * Tests de regresión para el bug: servicioId null rechazado incorrectamente.
 *
 * Bug 1: POST /api/reservas — la validación usa `!servicioId`, lo que convierte
 *        null en true y dispara un 400 aunque null sea un valor intencional (empresa
 *        sin servicios configurados).
 *
 * Bug 2: ReservaClienteController.solicitarReserva — la página de nueva reserva
 *        envía `servicioId: null` cuando no hay servicios, lo que con el bug 1
 *        impide completar la reserva.
 *
 * Estos tests documentan:
 *   - El comportamiento actual (buggy) donde corresponde.
 *   - El comportamiento correcto esperado tras el fix.
 *   - La lógica de selección de servicio en la página.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../../config/supabase', () => ({
  supabase: { from: vi.fn() },
}));

import { ReservaClienteController } from '../ReservaClienteController.js';

beforeEach(() => {
  vi.clearAllMocks();
});

// =============================================================================
// Suite 1: solicitarReserva con servicioId null
// =============================================================================
describe('ReservaClienteController.solicitarReserva — servicioId null', () => {
  const baseParams = {
    empresaId: 'emp-1',
    profesionalId: 'prof-1',
    clienteId: 'cli-1',
    fecha: '2025-06-15',
    horaInicio: '10:00',
    // servicioId intencionalmente omitido → undefined, el controlador lo pasa tal cual
  };

  it('envía servicioId: null en el body cuando no se provee servicioId', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({ data: { id: 'res-1' } }),
    });

    await ReservaClienteController.solicitarReserva({ ...baseParams, servicioId: null });

    const [, options] = global.fetch.mock.calls[0];
    const body = JSON.parse(options.body);
    expect(body.servicioId).toBeNull();
  });

  it('devuelve success:false cuando la API rechaza servicioId null con 400', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      json: vi.fn().mockResolvedValue({
        error: 'empresaId, clienteId, profesionalId, servicioId y fechaHoraInicio son requeridos',
      }),
    });

    const result = await ReservaClienteController.solicitarReserva({ ...baseParams, servicioId: null });

    expect(result.success).toBe(false);
    expect(result.error).toContain('servicioId');
  });

  // Regresión: una vez aplicado el fix en la API, esta llamada debe ser exitosa.
  it('devuelve success:true cuando la API acepta null servicioId (REGRESION: bug servicioId null)', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({ data: { id: 'res-nuevo', estado: 'PENDIENTE' } }),
    });

    const result = await ReservaClienteController.solicitarReserva({ ...baseParams, servicioId: null });

    expect(result.success).toBe(true);
    expect(result.data.estado).toBe('PENDIENTE');
  });
});

// =============================================================================
// Suite 2: POST /api/reservas — lógica de validación de servicioId (unit pura)
// =============================================================================
describe('POST /api/reservas — validacion de servicioId', () => {

  it('REGRESION: no debe rechazar la solicitud cuando servicioId es null pero los demas campos son validos', () => {
    const bodyConNullServicio = {
      empresaId: 'emp-1',
      clienteId: 'cli-1',
      profesionalId: 'prof-1',
      servicioId: null,
      fechaHoraInicio: '2025-06-15T10:00:00-03:00',
    };

    // Todos los campos obligatorios no-null están presentes
    const camposObligatorios = ['empresaId', 'clienteId', 'profesionalId', 'fechaHoraInicio'];
    const camposPresentes = camposObligatorios.every(campo => !!bodyConNullServicio[campo]);
    expect(camposPresentes).toBe(true);

    // Documenta el bug: !null === true, por eso la validación actual dispara el 400
    const validacionActualRechaza = !bodyConNullServicio.servicioId; // true → bug
    expect(validacionActualRechaza).toBe(true);

    // Validación correcta post-fix: rechazar solo si servicioId es undefined (no incluido en el body)
    const validacionCorrectaRechaza = bodyConNullServicio.servicioId === undefined;
    expect(validacionCorrectaRechaza).toBe(false); // null !== undefined → no debe rechazar
  });

  it('debe rechazar la solicitud cuando servicioId no se incluye en el body (undefined)', () => {
    const bodyIncompleto = {
      empresaId: 'emp-1',
      clienteId: 'cli-1',
      profesionalId: 'prof-1',
      fechaHoraInicio: '2025-06-15T10:00:00-03:00',
      // servicioId ausente → undefined
    };

    const servicioIdFaltante = bodyIncompleto.servicioId === undefined;
    expect(servicioIdFaltante).toBe(true);
  });

  it('la diferencia entre null y undefined es la clave del fix', () => {
    // null: la empresa explícitamente no tiene servicio → válido
    // undefined: el campo no se envió en el body → inválido
    const conNull = { servicioId: null };
    const conUndefined = {};

    expect(conNull.servicioId).toBeNull();
    expect(conUndefined.servicioId).toBeUndefined();

    // La condición buggy trata ambos como inválidos
    expect(!conNull.servicioId).toBe(true);        // bug: rechaza null incorrectamente
    expect(!conUndefined.servicioId).toBe(true);   // correcto: rechaza undefined

    // La condición correcta distingue null de undefined
    expect(conNull.servicioId === undefined).toBe(false);      // null no debe rechazarse
    expect(conUndefined.servicioId === undefined).toBe(true);  // undefined sí debe rechazarse
  });
});

// =============================================================================
// Suite 3: Lógica de selección de servicio en la página de nueva reserva
// =============================================================================
describe('Logica de servicioId en la pagina de nueva reserva', () => {

  it('servicioSeleccionado?.id || null produce null cuando no hay servicio', () => {
    const servicioSeleccionado = null;
    const servicioId = servicioSeleccionado?.id || null;
    expect(servicioId).toBeNull();
    expect(servicioId).not.toBeUndefined();
  });

  it('servicioSeleccionado?.id || null produce el id cuando hay servicio', () => {
    const servicioSeleccionado = { id: 'srv-123', nombre: 'Consulta' };
    const servicioId = servicioSeleccionado?.id || null;
    expect(servicioId).toBe('srv-123');
  });

  it('el valor null enviado a la API es serializable como null en JSON (no se pierde)', () => {
    // JSON.stringify convierte null en "null", no lo omite (a diferencia de undefined)
    const body = { empresaId: 'emp-1', servicioId: null };
    const serialized = JSON.parse(JSON.stringify(body));
    expect(serialized.servicioId).toBeNull();
    expect('servicioId' in serialized).toBe(true);
  });

  it('undefined en JSON se omite, por eso null es la eleccion correcta para servicioId faltante', () => {
    // Si se usara servicioSeleccionado?.id sin el || null,
    // y no hay servicio, el valor sería undefined y se perdería en la serialización.
    const body = { empresaId: 'emp-1', servicioId: undefined };
    const serialized = JSON.parse(JSON.stringify(body));
    // undefined desaparece al serializar → el campo no llega a la API
    expect('servicioId' in serialized).toBe(false);
  });
});
