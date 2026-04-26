'use server';

import { adminClient } from '@/src/lib/supabase/admin';

export type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string; code?: number };

export interface HorarioEmpresa {
  id: string;
  empresa_id: string;
  dia_semana: number;
  hora_inicio: string;
  hora_fin: string;
  activo: boolean;
}

export interface ActualizarHorariosInput {
  empresaId: string;
  horarios: Array<{
    diaSemana: number;
    horaInicio: string;
    horaFin: string;
    activo: boolean;
  }>;
}

export async function obtenerHorarios(
  empresaId: string
): Promise<ActionResult<HorarioEmpresa[]>> {
  try {
    if (!empresaId) {
      return {
        success: false,
        error: 'empresaId es requerido',
        code: 400,
      };
    }

    const sb = adminClient();
    const { data, error } = await sb
      .from('horarios_empresa')
      .select('*')
      .eq('empresa_id', empresaId)
      .order('dia_semana');

    if (error) throw error;

    return {
      success: true,
      data: data ?? [],
    };
  } catch (e: any) {
    console.error('[obtenerHorarios]', e.message);
    return {
      success: false,
      error: e.message,
      code: 500,
    };
  }
}

export async function actualizarHorarios(
  input: ActualizarHorariosInput
): Promise<ActionResult<void>> {
  try {
    const { empresaId, horarios } = input;

    if (!empresaId || !Array.isArray(horarios)) {
      return {
        success: false,
        error: 'empresaId y horarios son requeridos',
        code: 400,
      };
    }

    const sb = adminClient();

    const rows = horarios.map((h) => ({
      empresa_id: empresaId,
      dia_semana: h.diaSemana,
      hora_inicio: h.horaInicio,
      hora_fin: h.horaFin,
      activo: h.activo,
    }));

    const { error } = await sb
      .from('horarios_empresa')
      .upsert(rows, { onConflict: 'empresa_id,dia_semana' });

    if (error) throw error;

    return {
      success: true,
      data: undefined,
    };
  } catch (e: any) {
    console.error('[actualizarHorarios]', e.message);
    return {
      success: false,
      error: e.message,
      code: 500,
    };
  }
}
