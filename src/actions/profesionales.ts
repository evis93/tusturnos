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

export interface CrearProfesionalInput {
  nombre: string;
  email: string;
  telefono?: string;
  esAdmin?: boolean;
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

export async function crearProfesional(
  empresaId: string,
  datos: CrearProfesionalInput,
  callerRol?: string
): Promise<ActionResult<Profesional & { passwordTemporal?: string }>> {
  try {
    if (!empresaId || !datos.nombre || !datos.email) {
      return {
        success: false,
        error: 'Complete los campos obligatorios (nombre y email)',
      };
    }

    const sb = adminClient();
    const emailNormalizado = datos.email.trim().toLowerCase();
    const passwordTemporal = '123456';

    // 1. Crear auth user con contraseña temporal
    const { data: authData, error: authError } = await sb.auth.admin?.createUser({
      email: emailNormalizado,
      password: passwordTemporal,
      email_confirm: true,
      user_metadata: { nombre_completo: datos.nombre },
    }) ?? { data: null, error: new Error('Admin auth no disponible') };

    let authUserId: string;

    if (authError) {
      // Si el email ya existe, reusar el auth_user_id existente
      if (authError.status === 422 || authError.message?.includes('already been registered')) {
        const { data: byEmail } = await sb
          .from('usuarios')
          .select('id, auth_user_id')
          .eq('email', emailNormalizado)
          .maybeSingle();

        if (byEmail?.auth_user_id) {
          authUserId = byEmail.auth_user_id;
        } else {
          throw new Error('El email ya está registrado.');
        }
      } else {
        throw new Error(`Error al crear cuenta: ${authError.message}`);
      }
    } else {
      authUserId = authData?.user?.id || '';
      if (!authUserId) throw new Error('No se creó el auth user');
    }

    // 2. Verificar/crear registro en usuarios
    let usuarioId: string;
    const { data: usuarioExistente } = await sb
      .from('usuarios')
      .select('id')
      .eq('email', emailNormalizado)
      .maybeSingle();

    if (usuarioExistente) {
      usuarioId = usuarioExistente.id;
      await sb
        .from('usuarios')
        .update({ auth_user_id: authUserId, nombre_completo: datos.nombre })
        .eq('id', usuarioId);
    } else {
      const { data: usuarioData, error: usuarioError } = await sb
        .from('usuarios')
        .insert([{
          auth_user_id: authUserId,
          nombre_completo: datos.nombre,
          email: emailNormalizado,
          telefono: datos.telefono || null,
          activo: true,
        }])
        .select()
        .single();

      if (usuarioError) throw usuarioError;
      usuarioId = usuarioData.id;
    }

    // 3. Obtener el rol_id
    const rolCodigo = datos.esAdmin ? 'admin' : 'profesional';
    const { data: rolData, error: rolError } = await sb
      .from('roles')
      .select('id')
      .eq('rol', rolCodigo)
      .single();

    if (rolError || !rolData) {
      throw new Error(`No se encontró el rol: ${rolCodigo}`);
    }

    // 4. Crear/actualizar en usuario_empresa
    const { data: ueExistente } = await sb
      .from('usuario_empresa')
      .select('id, roles(rol)')
      .eq('usuario_id', usuarioId)
      .eq('empresa_id', empresaId)
      .maybeSingle();

    if (!ueExistente) {
      const { error: ueError } = await sb
        .from('usuario_empresa')
        .insert([{
          usuario_id: usuarioId,
          empresa_id: empresaId,
          rol_id: rolData.id,
        }]);

      if (ueError) throw ueError;
    }

    return {
      success: true,
      data: {
        id: usuarioId,
        usuario_id: usuarioId,
        nombre_completo: datos.nombre,
        email: emailNormalizado,
        telefono: datos.telefono || '',
        rol: rolCodigo,
        passwordTemporal,
      },
    };
  } catch (e: any) {
    console.error('[crearProfesional]', e.message);
    return {
      success: false,
      error: e.message,
      code: 500,
    };
  }
}

export async function actualizarProfesional(
  profesionalId: string,
  empresaId: string,
  datos: Partial<CrearProfesionalInput>
): Promise<ActionResult<{ message: string; passwordTemporal?: string }>> {
  try {
    const sb = adminClient();

    // 1. Leer registro actual
    const { data: usuarioActual, error: leerError } = await sb
      .from('usuarios')
      .select('id, auth_user_id, email')
      .eq('id', profesionalId)
      .maybeSingle();

    if (leerError || !usuarioActual) {
      throw new Error('Profesional no encontrado');
    }

    let passwordTemporal: string | null = null;

    // 2. Si auth_user_id es null, crear auth user (reparación)
    if (!usuarioActual.auth_user_id) {
      const emailParaAuth = datos.email?.trim().toLowerCase() || usuarioActual.email;
      if (!emailParaAuth) {
        throw new Error('No se puede crear acceso sin email');
      }
      const tempPassword = '123456';
      const { data: authData, error: authError } = await sb.auth.admin?.createUser({
        email: emailParaAuth,
        password: tempPassword,
        email_confirm: true,
        user_metadata: { nombre_completo: datos.nombre },
      }) ?? { data: null, error: new Error('Admin auth no disponible') };

      if (authError) {
        throw new Error(`Error al crear acceso: ${authError.message}`);
      }
      const { error: patchError } = await sb
        .from('usuarios')
        .update({ auth_user_id: authData?.user?.id })
        .eq('id', profesionalId);
      if (patchError) throw patchError;
      passwordTemporal = tempPassword;
    }

    // 3. Actualizar datos del usuario
    const updatePayload: any = {};
    if (datos.nombre) updatePayload.nombre_completo = datos.nombre;
    if (datos.email) updatePayload.email = datos.email.trim().toLowerCase();
    if (datos.telefono !== undefined) updatePayload.telefono = datos.telefono || null;

    if (Object.keys(updatePayload).length > 0) {
      const { error: usuarioError } = await sb
        .from('usuarios')
        .update(updatePayload)
        .eq('id', profesionalId);

      if (usuarioError) throw usuarioError;
    }

    // 4. Actualizar rol si corresponde
    if (datos.esAdmin !== undefined) {
      const rolCodigo = datos.esAdmin ? 'admin' : 'profesional';
      const { data: rolData } = await sb
        .from('roles')
        .select('id')
        .eq('rol', rolCodigo)
        .single();

      if (rolData) {
        await sb
          .from('usuario_empresa')
          .update({ rol_id: rolData.id })
          .eq('usuario_id', profesionalId)
          .eq('empresa_id', empresaId);
      }
    }

    return {
      success: true,
      data: {
        message: 'Profesional actualizado correctamente',
        ...(passwordTemporal && { passwordTemporal }),
      },
    };
  } catch (e: any) {
    console.error('[actualizarProfesional]', e.message);
    return {
      success: false,
      error: e.message,
      code: 500,
    };
  }
}

export async function desactivarProfesional(
  profesionalId: string,
  empresaId: string
): Promise<ActionResult<void>> {
  try {
    const sb = adminClient();

    const { error } = await sb
      .from('usuario_empresa')
      .delete()
      .eq('usuario_id', profesionalId)
      .eq('empresa_id', empresaId);

    if (error) throw error;

    return { success: true, data: undefined };
  } catch (e: any) {
    console.error('[desactivarProfesional]', e.message);
    return {
      success: false,
      error: e.message,
      code: 500,
    };
  }
}
