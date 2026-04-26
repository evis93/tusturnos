'use server';

import { adminClient } from '@/src/lib/supabase/admin';
import { calcularSlots } from '@/src/utils/disponibilidad';
import type { HorarioDia, ExcepcionDisponibilidad } from '@/src/types/disponibilidad';

export type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string; code?: number };

export interface ObtenerDisponibilidadInput {
  profesionalId: string;
  empresaId: string;
  servicioId: string;
  fecha: string;
  duracionMinutos?: number;
}

export interface DisponibilidadResponse {
  fecha: string;
  slots: string[];
}

export async function obtenerDisponibilidad(
  input: ObtenerDisponibilidadInput
): Promise<ActionResult<DisponibilidadResponse>> {
  try {
    const { profesionalId, empresaId, servicioId, fecha, duracionMinutos } = input;

    if (!profesionalId || !empresaId || !servicioId || !fecha) {
      return {
        success: false,
        error: 'profesionalId, empresaId, servicioId y fecha son requeridos',
        code: 400,
      };
    }

    const fechaObj = new Date(fecha + 'T00:00:00');
    const sb = adminClient();

    // 1. Obtener duración del servicio
    let duracionServicio: number | null = null;
    const { data: servicio, error: servicioError } = await sb
      .from('servicios')
      .select('duracion_minutos')
      .eq('id', servicioId)
      .eq('empresa_id', empresaId)
      .eq('activo', true)
      .maybeSingle();

    if (servicioError) {
      const puedeUsarFallback =
        servicioError.message?.toLowerCase().includes('permission denied') &&
        duracionMinutos &&
        duracionMinutos > 0;

      if (puedeUsarFallback) {
        duracionServicio = duracionMinutos;
      } else {
        console.error('[obtenerDisponibilidad][servicio query]', servicioError.message);
        return {
          success: false,
          error: 'Error al consultar servicio',
          code: 500,
        };
      }
    }

    if (!duracionServicio && !servicio) {
      return {
        success: false,
        error: 'Servicio no encontrado',
        code: 404,
      };
    }

    if (!duracionServicio) {
      duracionServicio = servicio?.duracion_minutos ?? null;
    }

    if (!duracionServicio || duracionServicio <= 0) {
      return {
        success: false,
        error: 'Duración de servicio inválida',
        code: 400,
      };
    }

    // 2. Obtener horario base de la empresa
    const { data: horariosDB } = await sb
      .from('horarios_empresa')
      .select('*')
      .eq('empresa_id', empresaId)
      .eq('activo', true);

    const horarioBase: HorarioDia[] = (horariosDB ?? []).map((h: any) => ({
      id: h.id,
      empresaId: h.empresa_id,
      diaSemana: h.dia_semana,
      horaInicio: h.hora_inicio,
      horaFin: h.hora_fin,
      activo: h.activo,
    }));

    // 3. Obtener excepciones del profesional para esa fecha
    const { data: excepcionesDB } = await sb
      .from('disponibilidad_profesional')
      .select('*')
      .eq('usuario_id', profesionalId)
      .eq('empresa_id', empresaId)
      .eq('fecha', fecha);

    const excepciones: ExcepcionDisponibilidad[] = (excepcionesDB ?? []).map((e: any) => ({
      id: e.id,
      usuarioId: e.usuario_id,
      empresaId: e.empresa_id,
      fecha: e.fecha,
      tipo: e.tipo,
      horaInicio: e.hora_inicio,
      horaFin: e.hora_fin,
      motivo: e.motivo,
    }));

    // 4. Obtener reservas existentes del profesional ese día
    const diaInicio = fecha + 'T00:00:00.000Z';
    const diaFin = fecha + 'T23:59:59.999Z';

    const { data: reservasDB } = await sb
      .from('reservas')
      .select('hora_inicio')
      .eq('profesional_id', profesionalId)
      .in('estado', ['PENDIENTE', 'CONFIRMADA', 'CAMBIO_SOLICITADO'])
      .gte('hora_inicio', diaInicio)
      .lte('hora_inicio', diaFin);

    const reservasOcupadas = (reservasDB ?? []).map((r: any) => ({
      fechaHoraInicio: r.hora_inicio,
    }));

    // 5. Calcular slots disponibles
    const slots = calcularSlots(
      horarioBase,
      excepciones,
      reservasOcupadas,
      duracionServicio,
      fechaObj
    );

    return {
      success: true,
      data: {
        fecha,
        slots,
      },
    };
  } catch (e: any) {
    console.error('[obtenerDisponibilidad]', e.message);
    return {
      success: false,
      error: e.message,
      code: 500,
    };
  }
}
