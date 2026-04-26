'use server';

import { adminClient } from '@/src/lib/supabase/admin';

export type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string; code?: number };

export interface Profesional {
  id: string;
  usuario_id: string;
  nombre_completo: string;
  email: string;
  telefono: string;
  avatar_url?: string;
  rol: string;
}

export async function obtenerProfesionales(
  empresaId?: string | null
): Promise<ActionResult<Profesional[]>> {
  try {
    const sb = adminClient();

    let query = sb
      .from('usuario_empresa')
      .select(`
        usuario_id,
        roles!inner(rol),
        usuarios!inner(
          id,
          nombre_completo,
          email,
          telefono,
          avatar_url
        )
      `)
      .in('roles.rol', ['profesional', 'admin']);

    if (empresaId) {
      query = query.eq('empresa_id', empresaId);
    }

    const { data, error } = await query;

    if (error) throw error;

    // Deduplicar por ID (puede tener múltiples roles)
    const ROL_PRIORIDAD = { superadmin: 4, admin: 3, profesional: 2, cliente: 1 };
    const profMap = new Map();

    (data || []).forEach((item: any) => {
      const id = item.usuarios.id;
      const rol = item.roles.rol;
      const existing = profMap.get(id);

      if (!existing || (ROL_PRIORIDAD[rol] || 0) > (ROL_PRIORIDAD[existing.rol] || 0)) {
        profMap.set(id, {
          id,
          usuario_id: id,
          nombre_completo: item.usuarios.nombre_completo || '',
          email: item.usuarios.email || '',
          telefono: item.usuarios.telefono || '',
          avatar_url: item.usuarios.avatar_url || '',
          rol,
        });
      }
    });

    const profesionales = Array.from(profMap.values()).sort((a: any, b: any) =>
      a.nombre_completo.localeCompare(b.nombre_completo)
    );

    return { success: true, data: profesionales };
  } catch (e: any) {
    console.error('[obtenerProfesionales]', e.message);
    return {
      success: false,
      error: e.message,
      code: 500,
    };
  }
}
