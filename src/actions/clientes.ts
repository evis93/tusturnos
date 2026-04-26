'use server';

import { adminClient } from '@/src/lib/supabase/admin';

export type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string; code?: number };

const PASSWORD_CLIENTES = '123456';

export interface Cliente {
  id: string;
  nombre_completo: string;
  email: string;
  telefono: string;
}

export interface CrearClienteInput {
  email?: string;
  nombre: string;
  telefono?: string;
  empresaId: string;
  profesionalId?: string;
}

export interface ActualizarClienteInput {
  usuarioId: string;
  nombre?: string;
  telefono?: string;
  email?: string;
}

async function resolverSucursalId(
  sb: any,
  profesionalId: string | null,
  empresaId: string
): Promise<string | null> {
  if (profesionalId) {
    const { data } = await sb
      .from('usuario_empresa')
      .select('sucursal_id')
      .eq('usuario_id', profesionalId)
      .eq('empresa_id', empresaId)
      .not('sucursal_id', 'is', null)
      .maybeSingle();
    if (data?.sucursal_id) return data.sucursal_id;
  }

  const { data } = await sb
    .from('sucursales')
    .select('id')
    .eq('empresa_id', empresaId)
    .limit(1)
    .maybeSingle();

  return data?.id || null;
}

export async function obtenerClientes(empresaId: string): Promise<ActionResult<Cliente[]>> {
  try {
    if (!empresaId) {
      return {
        success: false,
        error: 'empresaId es requerido',
        code: 400,
      };
    }

    const sb = adminClient();

    const { data, error } = await sb
      .from('usuario_empresa')
      .select(
        `
        usuario_id,
        usuarios!inner(id, nombre_completo, email, telefono),
        roles!inner(rol)
      `
      )
      .eq('empresa_id', empresaId)
      .eq('roles.rol', 'cliente');

    if (error) throw error;

    const clientes = (data || [])
      .map((item: any) => ({
        id: item.usuarios.id,
        nombre_completo: item.usuarios.nombre_completo || '',
        email: item.usuarios.email || '',
        telefono: item.usuarios.telefono || '',
      }))
      .sort((a: any, b: any) => a.nombre_completo.localeCompare(b.nombre_completo));

    return {
      success: true,
      data: clientes,
    };
  } catch (e: any) {
    console.error('[obtenerClientes]', e.message);
    return {
      success: false,
      error: e.message,
      code: 500,
    };
  }
}

export async function crearCliente(
  input: CrearClienteInput
): Promise<ActionResult<{ usuarioId: string }>> {
  try {
    const { email, nombre, telefono, empresaId, profesionalId } = input;

    if (!nombre || !empresaId) {
      return {
        success: false,
        error: 'nombre y empresaId son requeridos',
        code: 400,
      };
    }

    const sb = adminClient();
    const emailNorm = email?.trim().toLowerCase() || null;

    // Sin email → crear cliente directo sin cuenta auth
    if (!emailNorm) {
      const { data: inserted, error } = await sb
        .from('usuarios')
        .insert({
          nombre_completo: nombre.trim(),
          telefono: telefono?.trim() || null,
          activo: true,
        })
        .select('id')
        .single();

      if (error) {
        return {
          success: false,
          error: error.message,
          code: 500,
        };
      }

      const { data: rolData } = await sb
        .from('roles')
        .select('id')
        .eq('rol', 'cliente')
        .maybeSingle();

      const sucursalId = await resolverSucursalId(sb, profesionalId || null, empresaId);

      await sb.from('usuario_empresa').insert({
        usuario_id: inserted.id,
        empresa_id: empresaId,
        rol_id: rolData?.id,
        sucursal_id: sucursalId,
      });

      return {
        success: true,
        data: { usuarioId: inserted.id },
      };
    }

    // Con email → flujo completo
    const { data: usuarioExistente } = await sb
      .from('usuarios')
      .select('id, auth_user_id, nombre_completo, email, telefono')
      .eq('email', emailNorm)
      .maybeSingle();

    let usuarioId: string;
    let authUserId: string;

    if (usuarioExistente) {
      usuarioId = usuarioExistente.id;

      if (usuarioExistente.auth_user_id) {
        authUserId = usuarioExistente.auth_user_id;
      } else {
        // Crear auth user
        const { data: authData, error: authError } = await sb.auth.admin.createUser({
          email: emailNorm,
          password: PASSWORD_CLIENTES,
          email_confirm: true,
          user_metadata: { full_name: nombre.trim() },
        });

        if (authError) {
          if (
            authError.message.includes('already been registered') ||
            authError.code === 'email_exists'
          ) {
            return {
              success: false,
              error: 'Email ya registrado en autenticación',
              code: 409,
            };
          }
          return {
            success: false,
            error: authError.message,
            code: 500,
          };
        }

        authUserId = authData.user.id;

        // Linkear auth_user_id
        await sb
          .from('usuarios')
          .update({ auth_user_id: authUserId })
          .eq('id', usuarioId);
      }
    } else {
      // Crear en auth.users
      const { data: authData, error: authError } = await sb.auth.admin.createUser({
        email: emailNorm,
        password: PASSWORD_CLIENTES,
        email_confirm: true,
        user_metadata: { full_name: nombre.trim() },
      });

      if (authError) {
        return {
          success: false,
          error: authError.message,
          code: 500,
        };
      }

      authUserId = authData.user.id;

      // Buscar si el trigger ya creó la fila
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
            nombre_completo: nombre.trim(),
            telefono: telefono?.trim() || null,
            activo: true,
          })
          .eq('id', usuarioId);
      } else {
        const { data: nuevoUsuario, error: usuarioError } = await sb
          .from('usuarios')
          .insert({
            auth_user_id: authUserId,
            nombre_completo: nombre.trim(),
            email: emailNorm,
            telefono: telefono?.trim() || null,
            activo: true,
          })
          .select('id')
          .single();

        if (usuarioError) {
          return {
            success: false,
            error: usuarioError.message,
            code: 500,
          };
        }

        usuarioId = nuevoUsuario.id;
      }
    }

    // Buscar rol 'cliente'
    const { data: rolData } = await sb
      .from('roles')
      .select('id')
      .eq('rol', 'cliente')
      .maybeSingle();

    if (!rolData) {
      return {
        success: false,
        error: 'Rol "cliente" no encontrado',
        code: 500,
      };
    }

    // Vincular a empresa
    const { data: ueExistente } = await sb
      .from('usuario_empresa')
      .select('id')
      .eq('usuario_id', usuarioId)
      .eq('empresa_id', empresaId)
      .maybeSingle();

    if (!ueExistente) {
      const sucursalId = await resolverSucursalId(sb, profesionalId || null, empresaId);
      const { error: ueError } = await sb
        .from('usuario_empresa')
        .insert({
          usuario_id: usuarioId,
          empresa_id: empresaId,
          rol_id: rolData.id,
          sucursal_id: sucursalId,
        });

      if (ueError) {
        return {
          success: false,
          error: ueError.message,
          code: 500,
        };
      }
    }

    return {
      success: true,
      data: { usuarioId },
    };
  } catch (e: any) {
    console.error('[crearCliente]', e.message);
    return {
      success: false,
      error: e.message,
      code: 500,
    };
  }
}

export async function actualizarCliente(
  input: ActualizarClienteInput
): Promise<ActionResult<void>> {
  try {
    const { usuarioId, nombre, telefono, email } = input;

    if (!usuarioId) {
      return {
        success: false,
        error: 'usuarioId es requerido',
        code: 400,
      };
    }

    const sb = adminClient();

    const updateData: Record<string, any> = {};
    if (nombre) updateData.nombre_completo = nombre.trim();
    if (telefono !== undefined) updateData.telefono = telefono?.trim() || null;
    if (email) updateData.email = email.trim().toLowerCase();

    if (Object.keys(updateData).length > 0) {
      const { error } = await sb.from('usuarios').update(updateData).eq('id', usuarioId);

      if (error) {
        return {
          success: false,
          error: error.message,
          code: 500,
        };
      }
    }

    return {
      success: true,
      data: undefined,
    };
  } catch (e: any) {
    console.error('[actualizarCliente]', e.message);
    return {
      success: false,
      error: e.message,
      code: 500,
    };
  }
}

export async function eliminarCliente(
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

    const { error } = await sb
      .from('usuario_empresa')
      .delete()
      .eq('usuario_id', usuarioId)
      .eq('empresa_id', empresaId);

    if (error) throw error;

    return {
      success: true,
      data: undefined,
    };
  } catch (e: any) {
    console.error('[eliminarCliente]', e.message);
    return {
      success: false,
      error: e.message,
      code: 500,
    };
  }
}
