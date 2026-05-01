'use server';

import { createClient } from '@supabase/supabase-js';

export async function fetchSessionContext(authUserId?: string) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } },
    );

    // Get user data
    let userQuery = supabase.from('usuarios').select('id, auth_user_id, nombre_completo, email');
    if (authUserId) {
      userQuery = userQuery.eq('auth_user_id', authUserId);
    }
    const { data: usuarios, error: userError } = await userQuery;

    if (userError || !usuarios || usuarios.length === 0) {
      console.error('[fetchSessionContext] User error:', userError?.message);
      return null;
    }

    const usuario = usuarios[0];

    // Get session context from view (includes empresa branding, rol, sucursales)
    let sucQuery = supabase
      .from('v_sesion_contexto')
      .select('*')
      .eq('usuario_id', usuario.id);

    const { data: filas, error } = await sucQuery;

    console.log('[fetchSessionContext] View query result:', { filas, error, usuarioId: usuario.id });

    if (error) {
      console.error('[fetchSessionContext] Sucursales error:', error.message, error.code);
      return null;
    }

    if (!filas || filas.length === 0) {
      console.warn('[fetchSessionContext] No sucursales found for user', { usuarioId: usuario.id, filas });
      return null;
    }

    console.log('[fetchSessionContext] Found sucursales:', filas.length, 'totalSucursales:', filas[0]?.total_sucursales_usuario);

    // Enrich with user data
    const filasConUsuario = filas.map(fila => ({
      ...fila,
      nombre_completo: usuario.nombre_completo,
      email: usuario.email,
      auth_user_id: usuario.auth_user_id,
    }));

    return filasConUsuario;
  } catch (error: any) {
    console.error('[fetchSessionContext] Unexpected error:', error.message);
    return null;
  }
}
