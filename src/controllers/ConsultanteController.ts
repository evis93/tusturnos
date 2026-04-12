/**
 * ConsultanteController
 * Gestión de consultantes/pacientes (rol 'cliente') de la empresa.
 * No requiere auth admin — los clientes no tienen credenciales obligatorias.
 * Las operaciones van directo a Supabase con anon key + RLS.
 */

import { supabase } from '@/src/config/supabase';
import { requirePermission, requireEmpresa } from '@/src/utils/permissions';
import type { Profile } from '@/src/utils/permissions';

export class ConsultanteController {
  /**
   * Busca consultantes por nombre o email dentro de la empresa.
   * Se usa para el autocomplete en ModalReserva.
   */
  static async buscarConsultantes(query: string, profile: Profile | null) {
    const permError = requirePermission(profile, 'consultantes:read');
    if (permError) return permError;
    const empError = requireEmpresa(profile);
    if (empError) return empError;

    if (!query.trim()) return { success: true, data: [] };

    try {
      const termino = `%${query.trim()}%`;

      const { data, error } = await supabase
        .from('usuario_empresa')
        .select(`
          usuario_id,
          roles!inner(nombre),
          usuarios!inner(id, nombre_completo, email, telefono)
        `)
        .eq('empresa_id', profile!.empresaId!)
        .eq('roles.nombre', 'cliente')
        .or(`usuarios.nombre_completo.ilike.${termino},usuarios.email.ilike.${termino}`)
        .limit(10);

      if (error) throw error;

      const result = (data || []).map((row: any) => ({
        id: row.usuarios.id,
        nombre_completo: row.usuarios.nombre_completo,
        email: row.usuarios.email,
        telefono: row.usuarios.telefono,
      }));

      return { success: true, data: result };
    } catch (e: any) {
      return { success: false, error: e.message };
    }
  }

  /**
   * Crea un consultante en public.usuarios y lo vincula a la empresa como cliente.
   * No crea usuario en auth.users — el cliente puede registrarse solo más adelante.
   */
  static async crearConsultante(
    data: { nombre_completo: string; email?: string; telefono?: string },
    profile: Profile | null,
  ) {
    const permError = requirePermission(profile, 'consultantes:write');
    if (permError) return permError;
    const empError = requireEmpresa(profile);
    if (empError) return empError;

    try {
      // 1. Upsert en public.usuarios (por email si existe, sino crea nuevo)
      const upsertData: Record<string, any> = {
        nombre_completo: data.nombre_completo,
        activo: true,
      };
      if (data.email) upsertData.email = data.email;
      if (data.telefono) upsertData.telefono = data.telefono;

      let usuarioId: string;

      if (data.email) {
        const { data: usuario, error } = await supabase
          .from('usuarios')
          .upsert(upsertData, { onConflict: 'email' })
          .select('id')
          .single();

        if (error) throw error;
        usuarioId = usuario.id;
      } else {
        const { data: usuario, error } = await supabase
          .from('usuarios')
          .insert(upsertData)
          .select('id')
          .single();

        if (error) throw error;
        usuarioId = usuario.id;
      }

      // 2. Buscar rol_id de 'cliente'
      const { data: rolData, error: rolError } = await supabase
        .from('roles')
        .select('id')
        .eq('rol', 'cliente')
        .maybeSingle();

      if (rolError || !rolData) throw new Error('Rol cliente no encontrado');

      // 3. Vincular a la empresa
      const { error: ueError } = await supabase
        .from('usuario_empresa')
        .upsert(
          { usuario_id: usuarioId, empresa_id: profile!.empresaId!, rol_id: rolData.id },
          { onConflict: 'usuario_id,empresa_id' }
        );

      if (ueError) throw ueError;

      return {
        success: true,
        data: { id: usuarioId, nombre_completo: data.nombre_completo, email: data.email, telefono: data.telefono },
      };
    } catch (e: any) {
      return { success: false, error: e.message };
    }
  }
}
