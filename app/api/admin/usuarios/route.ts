/**
 * POST /api/admin/usuarios
 * Crea un usuario admin o profesional usando la service role key.
 * Flujo:
 *   1. supabase.auth.admin.createUser (email_confirm: true, password fija)
 *   2. El trigger handle_new_user sincroniza a public.usuarios
 *   3. Se vincula en usuario_empresa con el rol correspondiente
 *
 * Body: { email, nombre, rol: 'admin'|'profesional', empresaId }
 * Responde: { success, passwordTemporal } o { error }
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function adminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  if (!key) throw new Error('SUPABASE_SERVICE_ROLE_KEY no configurado');
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
}

function generarPasswordTemporal(): string {
  const chars = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
  return Array.from({ length: 10 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

export async function POST(req: NextRequest) {
  try {
    const { email, nombre, rol, empresaId } = await req.json();

    if (!email || !nombre || !rol || !empresaId) {
      return NextResponse.json({ error: 'email, nombre, rol y empresaId son requeridos' }, { status: 400 });
    }

    if (!['admin', 'profesional'].includes(rol)) {
      return NextResponse.json({ error: 'rol debe ser "admin" o "profesional"' }, { status: 400 });
    }

    const sb = adminClient();
    const passwordTemporal = generarPasswordTemporal();

    // 1. Crear usuario en auth.users
    const { data: authData, error: authError } = await sb.auth.admin.createUser({
      email,
      password: passwordTemporal,
      email_confirm: true,
      user_metadata: { full_name: nombre },
    });

    if (authError) {
      // Si el usuario ya existe en auth, intentar buscarlo en public.usuarios
      if (authError.message.includes('already been registered') || authError.code === 'email_exists') {
        return NextResponse.json({ error: 'Ya existe un usuario con ese email' }, { status: 409 });
      }
      console.error('[admin/usuarios] auth.admin.createUser:', authError.message);
      return NextResponse.json({ error: authError.message }, { status: 500 });
    }

    const authUserId = authData.user.id;

    // 2. Esperar a que el trigger handle_new_user sincronice a public.usuarios
    //    (el trigger es AFTER INSERT, usualmente instantáneo, pero hacemos upsert por seguridad)
    const { data: usuario, error: usuarioError } = await sb
      .from('usuarios')
      .upsert(
        { auth_user_id: authUserId, nombre_completo: nombre, email, activo: true },
        { onConflict: 'auth_user_id' }
      )
      .select('id')
      .single();

    if (usuarioError) {
      console.error('[admin/usuarios] upsert usuarios:', usuarioError.message);
      return NextResponse.json({ error: usuarioError.message }, { status: 500 });
    }

    // 3. Buscar rol_id por nombre
    const { data: rolData, error: rolError } = await sb
      .from('roles')
      .select('id')
      .eq('nombre', rol)
      .maybeSingle();

    if (rolError || !rolData) {
      console.error('[admin/usuarios] rol no encontrado:', rol);
      return NextResponse.json({ error: `Rol "${rol}" no encontrado en la tabla roles` }, { status: 500 });
    }

    // 4. Vincular usuario a empresa con el rol (upsert para evitar duplicados)
    const { error: ueError } = await sb
      .from('usuario_empresa')
      .upsert(
        { usuario_id: usuario.id, empresa_id: empresaId, rol_id: rolData.id },
        { onConflict: 'usuario_id,empresa_id' }
      );

    if (ueError) {
      console.error('[admin/usuarios] upsert usuario_empresa:', ueError.message);
      return NextResponse.json({ error: ueError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, passwordTemporal, usuarioId: usuario.id });
  } catch (e: any) {
    console.error('[admin/usuarios] Error inesperado:', e.message);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

// PUT /api/admin/usuarios — actualiza nombre, telefono y/o rol
export async function PUT(req: NextRequest) {
  try {
    const { usuarioId, nombre, telefono, rol, empresaId } = await req.json();

    if (!usuarioId) {
      return NextResponse.json({ error: 'usuarioId es requerido' }, { status: 400 });
    }

    const sb = adminClient();

    // Actualizar datos básicos
    const updateData: Record<string, any> = {};
    if (nombre) updateData.nombre_completo = nombre;
    if (telefono !== undefined) updateData.telefono = telefono;

    if (Object.keys(updateData).length > 0) {
      const { error } = await sb.from('usuarios').update(updateData).eq('id', usuarioId);
      if (error) {
        console.error('[admin/usuarios PUT] update usuarios:', error.message);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
    }

    // Actualizar rol si se proporcionó
    if (rol && empresaId) {
      const { data: rolData } = await sb
        .from('roles')
        .select('id')
        .eq('nombre', rol)
        .maybeSingle();

      if (rolData) {
        const { error: ueError } = await sb
          .from('usuario_empresa')
          .update({ rol_id: rolData.id })
          .eq('usuario_id', usuarioId)
          .eq('empresa_id', empresaId);

        if (ueError) {
          console.error('[admin/usuarios PUT] update usuario_empresa:', ueError.message);
          return NextResponse.json({ error: ueError.message }, { status: 500 });
        }
      }
    }

    return NextResponse.json({ success: true });
  } catch (e: any) {
    console.error('[admin/usuarios PUT] Error inesperado:', e.message);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
