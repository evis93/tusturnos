'use server';

import { adminClient } from '@/src/lib/supabase/admin';

export type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string; code?: number };

export interface CrearUsuarioProfesionalInput {
  email: string;
  nombre: string;
  rol: 'admin' | 'profesional';
  empresaId: string;
}

export interface ActualizarUsuarioInput {
  usuarioId: string;
  nombre?: string;
  telefono?: string;
  rol?: string;
  empresaId?: string;
}

function generarPasswordTemporal(): string {
  const chars = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
  return Array.from({ length: 10 }, () =>
    chars[Math.floor(Math.random() * chars.length)]
  ).join('');
}

export async function crearUsuarioProfesional(
  input: CrearUsuarioProfesionalInput
): Promise<ActionResult<{ usuarioId: string; passwordTemporal: string }>> {
  try {
    const { email, nombre, rol, empresaId } = input;

    if (!email || !nombre || !rol || !empresaId) {
      return {
        success: false,
        error: 'email, nombre, rol y empresaId son requeridos',
        code: 400,
      };
    }

    if (!['admin', 'profesional'].includes(rol)) {
      return {
        success: false,
        error: 'rol debe ser "admin" o "profesional"',
        code: 400,
      };
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
      if (
        authError.message.includes('already been registered') ||
        authError.code === 'email_exists'
      ) {
        return {
          success: false,
          error: 'Ya existe un usuario con ese email',
          code: 409,
        };
      }
      console.error('[crearUsuarioProfesional] auth.admin.createUser:', authError.message);
      return {
        success: false,
        error: authError.message,
        code: 500,
      };
    }

    const authUserId = authData.user.id;

    // 2. Upsert en public.usuarios
    const { data: usuario, error: usuarioError } = await sb
      .from('usuarios')
      .upsert(
        { auth_user_id: authUserId, nombre_completo: nombre, email, activo: true },
        { onConflict: 'auth_user_id' }
      )
      .select('id')
      .single();

    if (usuarioError) {
      console.error('[crearUsuarioProfesional] upsert usuarios:', usuarioError.message);
      return {
        success: false,
        error: usuarioError.message,
        code: 500,
      };
    }

    // 3. Buscar rol_id
    const { data: rolData, error: rolError } = await sb
      .from('roles')
      .select('id')
      .eq('rol', rol)
      .maybeSingle();

    if (rolError || !rolData) {
      console.error('[crearUsuarioProfesional] rol no encontrado:', rol);
      return {
        success: false,
        error: `Rol "${rol}" no encontrado en la tabla roles`,
        code: 500,
      };
    }

    // 4. Vincular a empresa
    const { error: ueError } = await sb
      .from('usuario_empresa')
      .upsert(
        { usuario_id: usuario.id, empresa_id: empresaId, rol_id: rolData.id },
        { onConflict: 'usuario_id,empresa_id' }
      );

    if (ueError) {
      console.error('[crearUsuarioProfesional] upsert usuario_empresa:', ueError.message);
      return {
        success: false,
        error: ueError.message,
        code: 500,
      };
    }

    return {
      success: true,
      data: {
        usuarioId: usuario.id,
        passwordTemporal,
      },
    };
  } catch (e: any) {
    console.error('[crearUsuarioProfesional]', e.message);
    return {
      success: false,
      error: e.message,
      code: 500,
    };
  }
}

export async function actualizarUsuario(
  input: ActualizarUsuarioInput
): Promise<ActionResult<void>> {
  try {
    const { usuarioId, nombre, telefono, rol, empresaId } = input;

    if (!usuarioId) {
      return {
        success: false,
        error: 'usuarioId es requerido',
        code: 400,
      };
    }

    const sb = adminClient();

    // Actualizar datos básicos
    const updateData: Record<string, any> = {};
    if (nombre) updateData.nombre_completo = nombre;
    if (telefono !== undefined) updateData.telefono = telefono;

    if (Object.keys(updateData).length > 0) {
      const { error } = await sb
        .from('usuarios')
        .update(updateData)
        .eq('id', usuarioId);

      if (error) {
        console.error('[actualizarUsuario] update usuarios:', error.message);
        return {
          success: false,
          error: error.message,
          code: 500,
        };
      }
    }

    // Actualizar rol si se proporcionó
    if (rol && empresaId) {
      const { data: rolData } = await sb
        .from('roles')
        .select('id')
        .eq('rol', rol)
        .maybeSingle();

      if (rolData) {
        const { error: ueError } = await sb
          .from('usuario_empresa')
          .update({ rol_id: rolData.id })
          .eq('usuario_id', usuarioId)
          .eq('empresa_id', empresaId);

        if (ueError) {
          console.error('[actualizarUsuario] update usuario_empresa:', ueError.message);
          return {
            success: false,
            error: ueError.message,
            code: 500,
          };
        }
      }
    }

    return {
      success: true,
      data: undefined,
    };
  } catch (e: any) {
    console.error('[actualizarUsuario]', e.message);
    return {
      success: false,
      error: e.message,
      code: 500,
    };
  }
}
