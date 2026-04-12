import { supabase, supabaseAdmin } from '../config/supabase';
import { requireEmpresa, requirePermission } from '../utils/permissions';

// Resuelve el sucursal_id para asociar al nuevo cliente:
// 1) desde la sucursal del profesional que crea la reserva
// 2) fallback: primera sucursal de la empresa
async function resolverSucursalId(profesional_id, empresaId) {
  if (profesional_id) {
    const { data: ueProf } = await supabaseAdmin
      .from('usuario_empresa')
      .select('sucursal_id')
      .eq('usuario_id', profesional_id)
      .eq('empresa_id', empresaId)
      .not('sucursal_id', 'is', null)
      .maybeSingle();
    if (ueProf?.sucursal_id) return ueProf.sucursal_id;
  }
  const { data: sucRow } = await supabaseAdmin
    .from('sucursales')
    .select('id')
    .eq('empresa_id', empresaId)
    .limit(1)
    .maybeSingle();
  return sucRow?.id || null;
}

export class ConsultanteController {
  // Buscar consultantes (clientes) por nombre o email
  static async buscarConsultantes(query, profile) {
    const permError = requirePermission(profile, 'consultantes:read');
    if (permError) return permError;

    try {
      if (!query || query.trim() === '') {
        return { success: true, data: [] };
      }

      const searchTerm = `%${query.trim().toLowerCase()}%`;

      let empresaFilter = null;
      if (profile.rol !== 'superadmin') {
        const empError = requireEmpresa(profile);
        if (empError) return empError;
        empresaFilter = profile.empresaId;
      }

      // Paso 1: obtener usuario_empresa con rol cliente en la empresa
      let ueQuery = supabase
        .from('usuario_empresa')
        .select('id, usuario_id, roles!inner(rol)')
        .eq('roles.rol', 'cliente');

      if (empresaFilter) {
        ueQuery = ueQuery.eq('empresa_id', empresaFilter);
      }

      const { data: ueData, error: ueError } = await ueQuery;
      if (ueError) throw ueError;

      const userIds = (ueData || []).map(u => u.usuario_id);
      if (userIds.length === 0) return { success: true, data: [] };

      // Mapa usuario_id → usuario_empresa.id
      const ueMap = new Map((ueData || []).map(u => [u.usuario_id, u.id]));

      // Paso 2: buscar por nombre o email entre esos IDs
      const { data: usuarios, error: usrError } = await supabase
        .from('usuarios')
        .select('id, nombre_completo, email, telefono, activo')
        .in('id', userIds)
        .or(`nombre_completo.ilike.${searchTerm},email.ilike.${searchTerm}`)
        .limit(10);

      if (usrError) throw usrError;

      // Paso 3: obtener fichas por usr_empresa_id
      const usrEmpresaIds = (usuarios || [])
        .map(u => ueMap.get(u.id))
        .filter(Boolean);

      let fichasMap = new Map();
      if (usrEmpresaIds.length > 0) {
        const { data: fichas } = await supabase
          .from('fichas')
          .select('id, usuario_empresa_id')
          .in('usuario_empresa_id', usrEmpresaIds);

        (fichas || []).forEach(f => fichasMap.set(f.usuario_empresa_id, f.id));
      }

      const consultantes = (usuarios || []).map(u => {
        const usrEmpresaId = ueMap.get(u.id);
        return {
          id: u.id,
          usuario_id: u.id,
          usr_empresa_id: usrEmpresaId || null,
          ficha_id: fichasMap.get(usrEmpresaId) || null,
          nombre_completo: u.nombre_completo || '',
          email: u.email || '',
          telefono: u.telefono || '',
          activo: u.activo ?? true,
        };
      }).sort((a, b) => a.nombre_completo.localeCompare(b.nombre_completo));

      return { success: true, data: consultantes };
    } catch (error) {
      console.error('[buscarConsultantes] Error:', error);
      return { success: false, error: error.message, data: [] };
    }
  }

  // Obtener todos los consultantes (clientes)
  static async obtenerConsultantes(profile) {
    const permError = requirePermission(profile, 'consultantes:read');
    if (permError) return permError;

    try {
      let empresaFilter = null;
      if (profile.rol !== 'superadmin') {
        const empError = requireEmpresa(profile);
        if (empError) return empError;
        empresaFilter = profile.empresaId;
      }

      let query = supabase
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
        .eq('roles.rol', 'cliente');

      if (empresaFilter) {
        query = query.eq('empresa_id', empresaFilter);
      }

      const { data, error } = await query;
      if (error) throw error;

      // Obtener fichas por usr_empresa_id (usuario_empresa.id)
      const usrEmpresaIds = (data || []).map(d => d.id);
      let fichasMap = new Map();

      if (usrEmpresaIds.length > 0) {
        const { data: fichas } = await supabase
          .from('fichas')
          .select('id, usuario_empresa_id')
          .in('usuario_empresa_id', usrEmpresaIds);

        (fichas || []).forEach(f => fichasMap.set(f.usuario_empresa_id, f.id));
      }

      const consultantes = (data || []).map(item => ({
        id: item.usuarios.id,
        usuario_id: item.usuarios.id,
        usr_empresa_id: item.id,
        ficha_id: fichasMap.get(item.id) || null,
        nombre_completo: item.usuarios.nombre_completo || '',
        email: item.usuarios.email || '',
        telefono: item.usuarios.telefono || '',
        activo: item.usuarios.activo ?? true,
      })).sort((a, b) => a.nombre_completo.localeCompare(b.nombre_completo));

      return { success: true, data: consultantes };
    } catch (error) {
      console.error('[obtenerConsultantes] Error:', error);
      return { success: false, error: error.message, data: [] };
    }
  }

  // Crear nuevo consultante (cliente)
  static async crearConsultante(consultanteData, profile) {
    const permError = requirePermission(profile, 'consultantes:write');
    if (permError) return permError;

    const empError = requireEmpresa(profile);
    if (empError) return empError;

    try {
      const { nombre_completo, email, telefono, autorizar_acceso_app, profesional_id } = consultanteData;

      if (!nombre_completo || nombre_completo.trim() === '') {
        return { success: false, error: 'El nombre es obligatorio' };
      }

      if (autorizar_acceso_app && (!email || !email.trim())) {
        return { success: false, error: 'El email es obligatorio para habilitar el acceso a la app' };
      }

      // Verificar si ya existe un usuario con el mismo email
      if (email && email.trim() !== '') {
        const { data: usuarioExistente } = await supabase
          .from('usuarios')
          .select('id, nombre_completo, email, telefono')
          .eq('email', email.trim().toLowerCase())
          .maybeSingle();

        if (usuarioExistente) {
          // Verificar si ya tiene rol cliente en esta empresa
          const { data: ueExistente } = await supabase
            .from('usuario_empresa')
            .select('id, roles!inner(rol)')
            .eq('usuario_id', usuarioExistente.id)
            .eq('empresa_id', profile.empresaId)
            .eq('roles.rol', 'cliente')
            .maybeSingle();

          if (ueExistente) {
            return {
              success: true,
              data: {
                id: usuarioExistente.id,
                usuario_id: usuarioExistente.id,
                usr_empresa_id: ueExistente.id,
                nombre_completo: usuarioExistente.nombre_completo,
                email: usuarioExistente.email,
                telefono: usuarioExistente.telefono,
              },
              message: 'El usuario ya existe como cliente en esta empresa',
            };
          }

          // Agregar rol cliente a usuario existente
          const { data: rolData } = await supabase
            .from('roles')
            .select('id')
            .eq('rol', 'cliente')
            .single();

          if (rolData) {
            const sucursalId = await resolverSucursalId(profesional_id, profile.empresaId);
            const { data: ueNuevo, error: ueNuevoError } = await supabase
              .from('usuario_empresa')
              .insert([{
                usuario_id: usuarioExistente.id,
                empresa_id: profile.empresaId,
                rol_id: rolData.id,
                sucursal_id: sucursalId,
              }])
              .select('id')
              .single();

            if (ueNuevoError) throw new Error(`Error al vincular cliente a empresa: ${ueNuevoError.message}`);

            return {
              success: true,
              data: {
                id: usuarioExistente.id,
                usuario_id: usuarioExistente.id,
                usr_empresa_id: ueNuevo?.id || null,
                nombre_completo: usuarioExistente.nombre_completo,
                email: usuarioExistente.email,
                telefono: usuarioExistente.telefono,
              },
              message: 'Rol cliente agregado al usuario existente',
            };
          }
        }
      }

      // Crear cuenta en Supabase Auth si se autoriza acceso (envía email de invitación)
      let authUserId = null;
      let invitacionEnviada = false;

      if (autorizar_acceso_app && email?.trim()) {
        const emailNormalizado = email.trim().toLowerCase();

        // Obtener URL de la empresa para el redirectTo del mail de invitación
        const { data: empresaData } = await supabaseAdmin
          .from('empresas')
          .select('slug, custom_domain')
          .eq('id', profile.empresaId)
          .maybeSingle();

        const empresaLoginUrl = empresaData?.custom_domain
          ? `https://${empresaData.custom_domain}/auth/login`
          : empresaData?.slug
          ? `https://${empresaData.slug}.tusturnos.ar/auth/login`
          : 'https://tusturnos.ar/auth/login';

        const { data: authData, error: authError } = await supabaseAdmin.auth.admin.inviteUserByEmail(
          emailNormalizado,
          { data: { nombre_completo: nombre_completo.trim() }, redirectTo: empresaLoginUrl }
        );

        if (authError && !authError.message?.includes('already been registered')) {
          throw new Error(`Error al invitar al usuario: ${authError.message}`);
        }

        if (!authError && authData?.user) {
          authUserId = authData.user.id;
          invitacionEnviada = true;
          // Setear contraseña por defecto para que pueda ingresar sin esperar el email
          await supabaseAdmin.auth.admin.updateUserById(authUserId, { password: '123456' });
        }
      }

      // Crear o actualizar usuario en tabla usuarios (usar supabaseAdmin para evitar restricciones de RLS)
      // Si el trigger de auth ya creó el row, lo actualizamos en vez de insertar
      const emailNorm = email?.trim().toLowerCase() || null;
      let usuarioData = null;

      if (authUserId) {
        // El trigger puede haber creado el row — buscar por auth_user_id o email
        const { data: existente } = await supabaseAdmin
          .from('usuarios')
          .select('id')
          .or(`auth_user_id.eq.${authUserId},email.eq.${emailNorm}`)
          .maybeSingle();

        if (existente) {
          const { data: updated, error: updateError } = await supabaseAdmin
            .from('usuarios')
            .update({
              nombre_completo: nombre_completo.trim(),
              telefono: telefono?.trim() || null,
              activo: true,
              auth_user_id: authUserId,
            })
            .eq('id', existente.id)
            .select()
            .single();
          if (updateError) throw updateError;
          usuarioData = updated;
        }
      }

      if (!usuarioData) {
        const { data: inserted, error: insertError } = await supabaseAdmin
          .from('usuarios')
          .insert([{
            nombre_completo: nombre_completo.trim(),
            email: emailNorm,
            telefono: telefono?.trim() || null,
            activo: true,
            auth_user_id: authUserId,
          }])
          .select()
          .single();

        if (insertError) {
          if (authUserId) {
            await supabaseAdmin.auth.admin.deleteUser(authUserId).catch(() => {});
          }
          throw insertError;
        }
        usuarioData = inserted;
      }

      // Obtener rol_id de cliente
      const { data: rolData } = await supabaseAdmin
        .from('roles')
        .select('id')
        .eq('rol', 'cliente')
        .single();

      let usrEmpresaId = null;
      if (rolData) {
        const sucursalId = await resolverSucursalId(profesional_id, profile.empresaId);
        const { data: ueData, error: ueError } = await supabaseAdmin
          .from('usuario_empresa')
          .insert([{
            usuario_id: usuarioData.id,
            empresa_id: profile.empresaId,
            rol_id: rolData.id,
            sucursal_id: sucursalId,
          }])
          .select('id')
          .single();

        if (ueError) throw new Error(`Error al vincular cliente a empresa: ${ueError.message}`);
        usrEmpresaId = ueData?.id || null;
      }

      return {
        success: true,
        data: {
          id: usuarioData.id,
          usuario_id: usuarioData.id,
          usr_empresa_id: usrEmpresaId,
          nombre_completo: usuarioData.nombre_completo,
          email: usuarioData.email,
          telefono: usuarioData.telefono,
          activo: true,
        },
        invitacionEnviada,
        message: invitacionEnviada
          ? 'Cliente creado. Se envió un email de invitación para activar su cuenta.'
          : 'Cliente creado exitosamente',
      };
    } catch (error) {
      console.error('[crearConsultante] Error:', error);
      return { success: false, error: error.message };
    }
  }

  // Obtener consultante por ID (usuario_id)
  static async obtenerConsultantePorId(id, profile) {
    const permError = requirePermission(profile, 'consultantes:read');
    if (permError) return permError;

    try {
      const { data, error } = await supabase
        .from('usuarios')
        .select('id, nombre_completo, email, telefono, activo')
        .eq('id', id)
        .single();

      if (error) throw error;

      // Obtener usr_empresa_id para este usuario en la empresa actual
      let usrEmpresaId = null;
      let fichaId = null;

      if (profile.empresaId) {
        const { data: ue } = await supabase
          .from('usuario_empresa')
          .select('id')
          .eq('usuario_id', id)
          .eq('empresa_id', profile.empresaId)
          .maybeSingle();

        usrEmpresaId = ue?.id || null;

        if (usrEmpresaId) {
          const { data: ficha } = await supabase
            .from('fichas')
            .select('id')
            .eq('usuario_empresa_id', usrEmpresaId)
            .maybeSingle();

          fichaId = ficha?.id || null;
        }
      }

      return {
        success: true,
        data: {
          id: data.id,
          usuario_id: data.id,
          usr_empresa_id: usrEmpresaId,
          ficha_id: fichaId,
          nombre_completo: data.nombre_completo || '',
          email: data.email || '',
          telefono: data.telefono || '',
          activo: data.activo ?? true,
        },
      };
    } catch (error) {
      console.error('[obtenerConsultantePorId] Error:', error);
      return { success: false, error: error.message };
    }
  }

  // Actualizar consultante (nombre, telefono, activo)
  static async actualizarConsultante(id, consultanteData, profile) {
    const permError = requirePermission(profile, 'consultantes:write');
    if (permError) return permError;

    try {
      const { nombre_completo, telefono, activo } = consultanteData;

      const updatePayload = {};
      if (nombre_completo !== undefined) updatePayload.nombre_completo = nombre_completo?.trim() || null;
      if (telefono !== undefined) updatePayload.telefono = telefono?.trim() || null;
      if (activo !== undefined) updatePayload.activo = activo;

      const { error } = await supabase
        .from('usuarios')
        .update(updatePayload)
        .eq('id', id);

      if (error) throw error;

      return { success: true, message: 'Cliente actualizado correctamente' };
    } catch (error) {
      console.error('[actualizarConsultante] Error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Busca un usuario en todo el sistema por email exacto (cross-empresa).
   * Devuelve sus datos y si ya está vinculado a la empresa del perfil.
   * Usado para auto-completar el formulario de reserva cuando el cliente
   * es cliente de otra empresa pero no de la actual.
   */
  static async buscarPorEmail(email, profile) {
    const permError = requirePermission(profile, 'consultantes:read');
    if (permError) return permError;

    const empError = requireEmpresa(profile);
    if (empError) return empError;

    try {
      const emailNorm = email.trim().toLowerCase();
      if (!emailNorm || !emailNorm.includes('@')) return { success: true, data: null };

      // 1. Buscar en usuarios por email exacto (cualquier empresa)
      const { data: usuario, error } = await supabase
        .from('usuarios')
        .select('id, nombre_completo, email, telefono')
        .eq('email', emailNorm)
        .maybeSingle();

      if (error) throw error;
      if (!usuario) return { success: true, data: null };

      // 2. Verificar si ya está vinculado a esta empresa como cliente
      const { data: ue } = await supabase
        .from('usuario_empresa')
        .select('id, roles!inner(rol)')
        .eq('usuario_id', usuario.id)
        .eq('empresa_id', profile.empresaId)
        .eq('roles.rol', 'cliente')
        .maybeSingle();

      return {
        success: true,
        data: {
          id: usuario.id,
          nombre_completo: usuario.nombre_completo || '',
          email: usuario.email || '',
          telefono: usuario.telefono || '',
          yaVinculado: !!ue,
          usr_empresa_id: ue?.id || null,
        },
      };
    } catch (error) {
      console.error('[buscarPorEmail] Error:', error);
      return { success: false, error: error.message };
    }
  }

  // Desactivar cliente (soft delete: activo = false)
  static async eliminarConsultante(id, profile) {
    const permError = requirePermission(profile, 'consultantes:write');
    if (permError) return permError;

    try {
      const { error } = await supabase
        .from('usuarios')
        .update({ activo: false })
        .eq('id', id);

      if (error) throw error;

      return { success: true, message: 'Cliente desactivado correctamente' };
    } catch (error) {
      console.error('[eliminarConsultante] Error:', error);
      return { success: false, error: error.message };
    }
  }
}
