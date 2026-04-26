'use server';

import { adminClient } from '@/src/lib/supabase/admin';

export type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string; code?: number };

export interface Profesional {
  id: string;
  nombre_completo: string;
  avatar_url?: string;
  rol: string;
}

export interface Servicio {
  id: string;
  nombre: string;
  duracion_minutos?: number;
  precio?: number;
}

export interface Horario {
  hora_inicio: string;
  hora_fin: string;
}

export async function obtenerProfesionalesEmpresa(
  empresaId: string
): Promise<ActionResult<Profesional[]>> {
  try {
    if (!empresaId) {
      return { success: false, error: 'empresaId es requerido' };
    }

    const sb = adminClient();

    const { data, error } = await sb
      .from('usuario_empresa')
      .select(`
        usuario_id,
        roles!inner(rol),
        usuarios!inner(id, nombre_completo, avatar_url)
      `)
      .eq('empresa_id', empresaId)
      .in('roles.rol', ['profesional', 'admin']);

    if (error) throw error;

    // Deduplicar por usuario_id, priorizar 'admin' sobre 'profesional'
    const ROL_PRIORIDAD: Record<string, number> = { admin: 2, profesional: 1 };
    const profMap = new Map<string, any>();

    (data || []).forEach((item: any) => {
      const id = item.usuarios.id;
      const rol = item.roles.rol;
      const existing = profMap.get(id);

      if (!existing || (ROL_PRIORIDAD[rol] || 0) > (ROL_PRIORIDAD[existing.rol] || 0)) {
        profMap.set(id, {
          id,
          nombre_completo: item.usuarios.nombre_completo || '',
          avatar_url: item.usuarios.avatar_url || '',
          rol,
        });
      }
    });

    const profesionales = Array.from(profMap.values())
      .sort((a: any, b: any) => a.nombre_completo.localeCompare(b.nombre_completo));

    return { success: true, data: profesionales };
  } catch (e: any) {
    console.error('[obtenerProfesionalesEmpresa]', e.message);
    return {
      success: false,
      error: e.message,
      code: 500,
    };
  }
}

export async function obtenerServiciosEmpresa(
  empresaId: string
): Promise<ActionResult<Servicio[]>> {
  try {
    if (!empresaId) {
      return { success: false, error: 'empresaId es requerido' };
    }

    const sb = adminClient();

    const { data, error } = await sb
      .from('servicios')
      .select('id, nombre, duracion_minutos, precio')
      .eq('empresa_id', empresaId)
      .eq('activo', true)
      .order('nombre');

    if (error) throw error;

    return { success: true, data: data || [] };
  } catch (e: any) {
    console.error('[obtenerServiciosEmpresa]', e.message);
    return {
      success: false,
      error: e.message,
      code: 500,
    };
  }
}

export async function obtenerHorariosDelDia(
  profesionalId: string,
  diaSemana: number,
  empresaId?: string
): Promise<ActionResult<Horario[]>> {
  try {
    if (!profesionalId || diaSemana === undefined) {
      return { success: false, error: 'profesionalId y diaSemana son requeridos' };
    }

    const sb = adminClient();

    let query = sb
      .from('horarios_atencion')
      .select('hora_inicio, hora_fin')
      .eq('profesional_id', profesionalId)
      .eq('dia_semana', diaSemana)
      .eq('activo', true);

    if (empresaId) {
      query = query.eq('empresa_id', empresaId);
    }

    const { data, error } = await query;

    if (error) throw error;

    return { success: true, data: data || [] };
  } catch (e: any) {
    console.error('[obtenerHorariosDelDia]', e.message);
    return {
      success: false,
      error: e.message,
      code: 500,
    };
  }
}

export async function obtenerSlotsOcupados(
  profesionalId: string,
  fecha: string,
  sucursalId?: string | null
): Promise<ActionResult<string[]>> {
  try {
    if (!profesionalId || !fecha) {
      return { success: false, error: 'profesionalId y fecha son requeridos' };
    }

    const sb = adminClient();

    const estadosCancelados = ['cancelada', 'rechazada', 'CANCELADA', 'RECHAZADA', 'CANCELADO', 'RECHAZADO'];

    const queries = [
      sb
        .from('reservas')
        .select('hora_inicio')
        .eq('profesional_id', profesionalId)
        .eq('fecha', fecha)
        .not('estado', 'in', `(${estadosCancelados.map(s => `"${s}"`).join(',')})`)
    ];

    if (sucursalId) {
      queries.push(
        sb
          .from('reservas')
          .select('hora_inicio')
          .eq('sucursal_id', sucursalId)
          .eq('fecha', fecha)
          .not('estado', 'in', `(${estadosCancelados.map(s => `"${s}"`).join(',')})`)
      );
    }

    const results = await Promise.all(queries);

    for (const result of results) {
      if (result.error) throw result.error;
    }

    const ocupados = [...new Set(
      results.flatMap(({ data }: any) =>
        (data || []).map((r: any) => {
          if (!r.hora_inicio) return null;
          // Extract HH:MM from timestamp
          const horaStr = r.hora_inicio.substring(11, 16);
          return horaStr;
        }).filter(Boolean)
      )
    )];

    return { success: true, data: ocupados };
  } catch (e: any) {
    console.error('[obtenerSlotsOcupados]', e.message);
    return {
      success: false,
      error: e.message,
      code: 500,
    };
  }
}

// Helper function (no Server Action needed) — calcular slots disponibles
function generarSlotsDelRango(horaInicio: string, horaFin: string): string[] {
  const slots: string[] = [];
  let [h, m] = horaInicio.split(':').map(Number);
  const [hFin, mFin] = horaFin.split(':').map(Number);
  const finTotal = hFin * 60 + mFin;

  while (h * 60 + m < finTotal) {
    slots.push(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`);
    m += 30;
    if (m >= 60) {
      h += 1;
      m -= 60;
    }
  }
  return slots;
}

export function calcularSlotsDisponibles(
  horarios: Horario[],
  ocupados: string[]
): { manana: string[]; tarde: string[]; todos: string[] } {
  const todosLosSlots: string[] = [];
  horarios.forEach((h) => {
    todosLosSlots.push(...generarSlotsDelRango(h.hora_inicio, h.hora_fin));
  });

  const disponibles = todosLosSlots.filter((s) => !ocupados.includes(s));

  const manana = disponibles.filter((s) => {
    const [h] = s.split(':').map(Number);
    return h < 13;
  });

  const tarde = disponibles.filter((s) => {
    const [h] = s.split(':').map(Number);
    return h >= 13;
  });

  return { manana, tarde, todos: disponibles };
}
