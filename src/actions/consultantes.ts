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

export interface ConsultanteListItem {
  id: string;
  usuario_id: string;
  usr_empresa_id: string;
  nombre_completo: string;
  email: string;
  telefono: string;
  activo: boolean;
  tiene_ficha?: boolean;
}

export interface ActualizarConsultanteInput {
  nombre_completo?: string;
  telefono?: string;
  activo?: boolean;
}

export interface CrearConsultanteInput {
  nombre_completo: string;
  email?: string;
  telefono?: string;
  autorizar_acceso_app?: boolean;
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

export async function obtenerConsultantes(
  empresaId: string
): Promise<ActionResult<ConsultanteListItem[]>> {
  try {
    if (!empresaId) {
      return { success: false, error: 'empresaId es requerido' };
    }

    const sb = adminClient();

    const { data, error } = await sb
      .from('usuario_empresa')
      .select(`
        id,
        usuario_id,
        usuarios!inner(
          id,
          nombre_completo,
          email,
          telefono,
          activo
        ),
        roles!inner(rol)
      `)
      .eq('roles.rol', 'cliente')
      .eq('empresa_id', empresaId);

    if (error) throw error;

    // Obtener fichas para marcar cuáles tienen
    const clienteIds = (data || []).map((d: any) => d.usuarios.id);
    const fichasSet = new Set<string>();
    if (clienteIds.length > 0) {
      const { data: fichas } = await sb
        .from('fichas')
        .select('cliente_id')
        .in('cliente_id', clienteIds);
      (fichas || []).forEach((f: any) => fichasSet.add(f.cliente_id));
    }

    const consultantes = (data || [])
      .map((item: any) => ({
        id: item.usuarios.id,
        usuario_id: item.usuarios.id,
        usr_empresa_id: item.id,
        nombre_completo: item.usuarios.nombre_completo || '',
        email: item.usuarios.email || '',
        telefono: item.usuarios.telefono || '',
        activo: item.usuarios.activo ?? true,
        tiene_ficha: fichasSet.has(item.usuarios.id),
      }))
      .sort((a: any, b: any) => a.nombre_completo.localeCompare(b.nombre_completo));

    return { success: true, data: consultantes };
  } catch (e: any) {
    console.error('[obtenerConsultantes]', e.message);
    return {
      success: false,
      error: e.message,
      code: 500,
    };
  }
}

export async function buscarConsultantes(
  empresaId: string,
  query: string
): Promise<ActionResult<ConsultanteListItem[]>> {
  try {
    if (!empresaId) {
      return { success: false, error: 'empresaId es requerido' };
    }

    if (!query || query.trim() === '') {
      return { success: true, data: [] };
    }

    const sb = adminClient();
    const searchTerm = `%${query.trim().toLowerCase()}%`;

    // Paso 1: obtener usuario_empresa con rol cliente en la empresa
    const { data: ueData, error: ueError } = await sb
      .from('usuario_empresa')
      .select('id, usuario_id, roles!inner(rol)')
      .eq('roles.rol', 'cliente')
      .eq('empresa_id', empresaId);

    if (ueError) throw ueError;

    const userIds = (ueData || []).map((u: any) => u.usuario_id);
    if (userIds.length === 0) return { success: true, data: [] };

    // Mapa usuario_id → usuario_empresa.id
    const ueMap = new Map((ueData || []).map((u: any) => [u.usuario_id, u.id]));

    // Paso 2: buscar por nombre o email entre esos IDs
    const { data: usuarios, error: usrError } = await sb
      .from('usuarios')
      .select('id, nombre_completo, email, telefono, activo')
      .in('id', userIds)
      .or(`nombre_completo.ilike.${searchTerm},email.ilike.${searchTerm}`)
      .limit(10);

    if (usrError) throw usrError;

    const consultantes = (usuarios || [])
      .map((u: any) => ({
        id: u.id,
        usuario_id: u.id,
        usr_empresa_id: ueMap.get(u.id) || null,
        nombre_completo: u.nombre_completo || '',
        email: u.email || '',
        telefono: u.telefono || '',
        activo: u.activo ?? true,
      }))
      .sort((a: any, b: any) => a.nombre_completo.localeCompare(b.nombre_completo));

    return { success: true, data: consultantes };
  } catch (e: any) {
    console.error('[buscarConsultantes]', e.message);
    return {
      success: false,
      error: e.message,
      code: 500,
    };
  }
}

export async function actualizarConsultante(
  consultanteId: string,
  datos: ActualizarConsultanteInput
): Promise<ActionResult<{ message: string }>> {
  try {
    if (!consultanteId) {
      return { success: false, error: 'consultanteId es requerido' };
    }

    const sb = adminClient();

    const updatePayload: any = {};
    if (datos.nombre_completo !== undefined) updatePayload.nombre_completo = datos.nombre_completo?.trim() || null;
    if (datos.telefono !== undefined) updatePayload.telefono = datos.telefono?.trim() || null;
    if (datos.activo !== undefined) updatePayload.activo = datos.activo;

    if (Object.keys(updatePayload).length === 0) {
      return { success: true, data: { message: 'No hay cambios' } };
    }

    const { error } = await sb
      .from('usuarios')
      .update(updatePayload)
      .eq('id', consultanteId);

    if (error) throw error;

    return {
      success: true,
      data: { message: 'Consultante actualizado correctamente' },
    };
  } catch (e: any) {
    console.error('[actualizarConsultante]', e.message);
    return {
      success: false,
      error: e.message,
      code: 500,
    };
  }
}

export async function eliminarConsultante(
  consultanteId: string
): Promise<ActionResult<{ message: string }>> {
  try {
    if (!consultanteId) {
      return { success: false, error: 'consultanteId es requerido' };
    }

    const sb = adminClient();

    const { error } = await sb
      .from('usuarios')
      .update({ activo: false })
      .eq('id', consultanteId);

    if (error) throw error;

    return {
      success: true,
      data: { message: 'Consultante desactivado correctamente' },
    };
  } catch (e: any) {
    console.error('[eliminarConsultante]', e.message);
    return {
      success: false,
      error: e.message,
      code: 500,
    };
  }
}

export async function crearConsultante(
  empresaId: string,
  datos: CrearConsultanteInput
): Promise<ActionResult<{ id: string; invitacionEnviada: boolean }>> {
  try {
    if (!empresaId) {
      return { success: false, error: 'empresaId es requerido' };
    }

    if (!datos.nombre_completo?.trim()) {
      return { success: false, error: 'El nombre es obligatorio' };
    }

    const sb = adminClient();
    const emailNorm = datos.email?.trim().toLowerCase() || null;
    const PASSWORD_CLIENTES = '123456';

    // Sin email → crear cliente directo sin cuenta auth
    if (!emailNorm) {
      const { data: inserted, error } = await sb
        .from('usuarios')
        .insert({
          nombre_completo: datos.nombre_completo.trim(),
          telefono: datos.telefono?.trim() || null,
          activo: true
        })
        .select('id')
        .single();

      if (error) throw error;

      const { data: rolData } = await sb.from('roles').select('id').eq('rol', 'cliente').maybeSingle();
      await sb.from('usuario_empresa').insert({
        usuario_id: inserted.id,
        empresa_id: empresaId,
        rol_id: rolData?.id,
      });

      return { success: true, data: { id: inserted.id, invitacionEnviada: false } };
    }

    // Con email → crear o reutilizar usuario auth
    let usuarioId: string;
    let authUserId: string;

    const { data: usuarioExistente } = await sb
      .from('usuarios')
      .select('id, auth_user_id')
      .eq('email', emailNorm)
      .maybeSingle();

    if (usuarioExistente) {
      usuarioId = usuarioExistente.id;

      if (usuarioExistente.auth_user_id) {
        authUserId = usuarioExistente.auth_user_id;
      } else {
        const { data: authData, error: authError } = await sb.auth.admin.createUser({
          email: emailNorm,
          password: PASSWORD_CLIENTES,
          email_confirmed: true,
          user_metadata: { full_name: datos.nombre_completo.trim() },
        });

        if (authError) {
          if (authError.message?.includes('already been registered') || authError.code === 'email_exists') {
            throw new Error('Email ya registrado en autenticación');
          }
          throw authError;
        }

        authUserId = authData.user.id;
        await sb
          .from('usuarios')
          .update({ auth_user_id: authUserId })
          .eq('id', usuarioId);
      }
    } else {
      const { data: authData, error: authError } = await sb.auth.admin.createUser({
        email: emailNorm,
        password: PASSWORD_CLIENTES,
        email_confirmed: true,
        user_metadata: { full_name: datos.nombre_completo.trim() },
      });

      if (authError) {
        if (authError.message?.includes('already been registered') || authError.code === 'email_exists') {
          throw new Error('Ya existe una cuenta con ese email');
        }
        throw authError;
      }

      authUserId = authData.user.id;

      const { data: usuarioPorAuth } = await sb
        .from('usuarios')
        .select('id')
        .eq('auth_user_id', authUserId)
        .maybeSingle();

      if (usuarioPorAuth) {
        usuarioId = usuarioPorAuth.id;
        await sb
          .from('usuarios')
          .update({
            nombre_completo: datos.nombre_completo.trim(),
            telefono: datos.telefono?.trim() || null,
            activo: true
          })
          .eq('id', usuarioId);
      } else {
        const { data: nuevoUsuario, error: usuarioError } = await sb
          .from('usuarios')
          .insert({
            auth_user_id: authUserId,
            nombre_completo: datos.nombre_completo.trim(),
            email: emailNorm,
            telefono: datos.telefono?.trim() || null,
            activo: true,
          })
          .select('id')
          .single();

        if (usuarioError) throw usuarioError;
        usuarioId = nuevoUsuario.id;
      }
    }

    const { data: rolData } = await sb
      .from('roles')
      .select('id')
      .eq('rol', 'cliente')
      .maybeSingle();

    if (!rolData) {
      throw new Error('Rol "cliente" no encontrado');
    }

    const { data: ueExistente } = await sb
      .from('usuario_empresa')
      .select('id')
      .eq('usuario_id', usuarioId)
      .eq('empresa_id', empresaId)
      .maybeSingle();

    if (!ueExistente) {
      const { error: ueError } = await sb
        .from('usuario_empresa')
        .insert({
          usuario_id: usuarioId,
          empresa_id: empresaId,
          rol_id: rolData.id,
        });

      if (ueError) throw ueError;
    }

    return {
      success: true,
      data: { id: usuarioId, invitacionEnviada: datos.autorizar_acceso_app === true }
    };
  } catch (e: any) {
    console.error('[crearConsultante]', e.message);
    return {
      success: false,
      error: e.message,
      code: 500,
    };
  }
}
