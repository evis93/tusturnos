/**
 * POST /api/auth/register-profile
 * Crea la fila en `usuarios` y la vinculación en `usuario_empresa` (rol cliente)
 * para un usuario recién registrado vía supabase.auth.signUp().
 *
 * Usa service role key para bypassear RLS.
 * Body: { userId, nombre, empresaSlug }
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function adminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  if (!key) throw new Error('SUPABASE_SERVICE_ROLE_KEY no configurado');
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
}

export async function POST(req: NextRequest) {
  try {
    const { userId, nombre, empresaSlug } = await req.json();

    if (!userId || !empresaSlug) {
      return NextResponse.json({ error: 'userId y empresaSlug son requeridos' }, { status: 400 });
    }

    const sb = adminClient();

    // 1. Crear fila en usuarios (upsert por si ya existe)
    const { data: usuario, error: usuarioError } = await sb
      .from('usuarios')
      .upsert(
        { auth_user_id: userId, nombre_completo: nombre || '', activo: true },
        { onConflict: 'auth_user_id' }
      )
      .select('id')
      .single();

    if (usuarioError) {
      console.error('[register-profile] Error creando usuario:', usuarioError.message);
      return NextResponse.json({ error: usuarioError.message }, { status: 500 });
    }

    // 2. Buscar empresa por slug (o nombre)
    const { data: empresa } = await sb
      .from('empresas')
      .select('id')
      .eq('slug', empresaSlug)
      .maybeSingle();

    if (!empresa) {
      // No bloquear el registro si no se encuentra la empresa — el usuario quedó creado igual
      console.warn('[register-profile] Empresa no encontrada para slug:', empresaSlug);
      return NextResponse.json({ success: true, warning: 'empresa no encontrada' });
    }

    // 3. Buscar rol_id de 'cliente'
    const { data: rol } = await sb
      .from('roles')
      .select('id')
      .eq('nombre', 'cliente')
      .maybeSingle();

    if (!rol) {
      console.warn('[register-profile] Rol cliente no encontrado');
      return NextResponse.json({ success: true, warning: 'rol cliente no encontrado' });
    }

    // 4. Vincular usuario a empresa como cliente (upsert para evitar duplicados)
    const { error: ueError } = await sb
      .from('usuario_empresa')
      .upsert(
        { usuario_id: usuario.id, empresa_id: empresa.id, rol_id: rol.id },
        { onConflict: 'usuario_id,empresa_id' }
      );

    if (ueError) {
      console.error('[register-profile] Error vinculando usuario_empresa:', ueError.message);
      return NextResponse.json({ error: ueError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (e: any) {
    console.error('[register-profile] Error inesperado:', e.message);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
