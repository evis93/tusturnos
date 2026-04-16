import { supabase, supabaseAdmin } from '../config/supabase';
import { requireEmpresa, requirePermission } from '../utils/permissions';

// Resuelve el sucursal_id para asociar al nuevo cliente:
// 1) desde la sucursal del profesional que crea la reserva
// 2) fallback: primera sucursal de la empresa
async function resolverSucursalId(profesional_id, empresaId) {
  if (profesional_id) {
    const { data: ueProf } = await supabase
      .from('usuario_empresa')
      .select('sucursal_id')
      .eq('usuario_id', profesional_id)
      .eq('empresa_id', empresaId)
      .not('sucursal_id', 'is', null)
      .maybeSingle();
    if (ueProf?.sucursal_id) return ueProf.sucursal_id;
  }
  const { data: sucRow } = await supabase
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

      const consultantes = (usuarios || []).map(u => ({
        id: u.id,
        usuario_id: u.id,
        usr_empresa_id: ueMap.get(u.id) || null,
        ficha_id: null,
        nombre_completo: u.nombre_completo || '',
        email: u.email || '',
        telefono: u.telefono || '',
        activo: u.activo ?? true,
      })).sort((a, b) => a.nombre_completo.localeCompare(b.nombre_completo));

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

      // Verificar qué clientes tienen al menos una ficha (por cliente_id)
      const clienteIds = (data || []).map(d => d.usuarios.id);
      const fichasSet = new Set();
      if (clienteIds.length > 0) {
        const { data: fichas } = await supabase
          .from('fichas')
          .select('cliente_id')
          .in('cliente_id', clienteIds);
        (fichas || []).forEach(f => fichasSet.add(f.cliente_id));
      }

      const consultantes = (data || []).map(item => ({
        id: item.usuarios.id,
        usuario_id: item.usuarios.id,
        usr_empresa_id: item.id,
        tiene_ficha: fichasSet.has(item.usuarios.id),
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
  // Delega a /api/admin/clientes para crear el auth_user server-side con contraseña 123456
  static async crearConsultante(consultanteData, profile) {
    const permError = requirePermission(profile, 'consultantes:write');
    if (permError) return permError;

    const empError = requireEmpresa(profile);
    if (empError) return empError;

    try {
      const { nombre_completo, email, telefono, profesional_id } = consultanteData;

      if (!nombre_completo || nombre_completo.trim() === '') {
        return { success: false, error: 'El nombre es obligatorio' };
      }

      const res  = await fetch('/api/admin/clientes', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          nombre:       nombre_completo.trim(),
          email:        email?.trim() || null,
          telefono:     telefono?.trim() || null,
          empresaId:    profile.empresaId,
          profesionalId: profesional_id || null,
        }),
      });

      const json = await res.json();
      if (!res.ok) return { success: false, error: json.error || 'Error al crear cliente' };

      return {
        success: true,
        data: {
          id:              json.usuarioId,
          usuario_id:      json.usuarioId,
          usr_empresa_id:  null,
          nombre_completo: nombre_completo.trim(),
          email:           email?.trim().toLowerCase() || null,
          telefono:        telefono?.trim() || null,
          activo:          true,
        },
        message: 'Cliente creado con acceso a la app (contraseña: 123456)',
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
