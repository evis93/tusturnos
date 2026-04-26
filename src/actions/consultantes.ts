'use server';

import { adminClient } from '@/src/lib/supabase/admin';

export type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string; code?: number };

export interface Consultante {
  id: string;
  nombre_completo: string;
  email: string;
  telefono: string;
  avatar_url?: string;
}

export async function obtenerConsultantePorId(
  clienteId: string
): Promise<ActionResult<Consultante>> {
  try {
    const sb = adminClient();

    const { data, error } = await sb
      .from('usuarios')
      .select('id, nombre_completo, email, telefono, avatar_url')
      .eq('id', clienteId)
      .single();

    if (error) throw error;

    return {
      success: true,
      data: {
        id: data.id,
        nombre_completo: data.nombre_completo,
        email: data.email,
        telefono: data.telefono,
        avatar_url: data.avatar_url,
      },
    };
  } catch (e: any) {
    console.error('[obtenerConsultantePorId]', e.message);
    return {
      success: false,
      error: e.message,
      code: 500,
    };
  }
}
