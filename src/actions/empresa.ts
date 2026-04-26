'use server';

import { adminClient } from '@/src/lib/supabase/admin';

export type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string; code?: number };

export async function unirseAEmpresa(
  usuarioId: string,
  empresaId: string
): Promise<ActionResult<void>> {
  try {
    if (!usuarioId || !empresaId) {
      return {
        success: false,
        error: 'usuarioId y empresaId son requeridos',
        code: 400,
      };
    }

    const sb = adminClient();

    const { data: rol } = await sb
      .from('roles')
      .select('id')
      .eq('rol', 'cliente')
      .maybeSingle();

    if (!rol) {
      return {
        success: false,
        error: 'Rol cliente no encontrado',
        code: 500,
      };
    }

    const { error } = await sb
      .from('usuario_empresa')
      .upsert(
        { usuario_id: usuarioId, empresa_id: empresaId, rol_id: rol.id },
        { onConflict: 'usuario_id,empresa_id' }
      );

    if (error) {
      return {
        success: false,
        error: error.message,
        code: 500,
      };
    }

    return {
      success: true,
      data: undefined,
    };
  } catch (e: any) {
    console.error('[unirseAEmpresa]', e.message);
    return {
      success: false,
      error: e.message,
      code: 500,
    };
  }
}
