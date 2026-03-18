/**
 * ProfesionalController
 * Gestión de profesionales y admins de una empresa.
 * Usa /api/admin/usuarios (service role) para creación/actualización con auth.
 * Las lecturas van directo a Supabase desde el browser (con anon key + RLS).
 */

import { supabase } from '@/src/config/supabase';
import { requirePermission, requireEmpresa } from '@/src/utils/permissions';
import type { Profile } from '@/src/utils/permissions';

export class ProfesionalController {
  /**
   * Obtiene todos los profesionales y admins de la empresa del usuario logueado.
   * Retorna filas de public.usuarios filtradas por empresa y rol != 'cliente'.
   */
  static async obtenerProfesionales(profile: Profile | null) {
    const permError = requirePermission(profile, 'profesionales:read');
    if (permError) return permError;
    const empError = requireEmpresa(profile);
    if (empError) return empError;

    try {
      const { data, error } = await supabase
        .from('usuario_empresa')
        .select(`
          usuario_id,
          roles!inner(nombre),
          usuarios!inner(id, nombre_completo, email, telefono, activo, avatar_url)
        `)
        .eq('empresa_id', profile!.empresaId!)
        .neq('roles.nombre', 'cliente')
        .eq('usuarios.activo', true);

      if (error) throw error;

      const result = (data || []).map((row: any) => ({
        id: row.usuarios.id,
        nombre_completo: row.usuarios.nombre_completo,
        email: row.usuarios.email,
        telefono: row.usuarios.telefono,
        activo: row.usuarios.activo,
        avatar_url: row.usuarios.avatar_url,
        rol: row.roles.nombre,
      }));

      return { success: true, data: result };
    } catch (e: any) {
      return { success: false, error: e.message };
    }
  }

  /**
   * Crea un profesional o admin vía /api/admin/usuarios (service role).
   * El endpoint genera la password temporal y la devuelve.
   */
  static async crearProfesional(
    data: { nombre: string; nombre_completo?: string; email: string; telefono?: string; esAdmin?: boolean },
    profile: Profile | null,
  ) {
    const permError = requirePermission(profile, 'profesionales:write');
    if (permError) return permError;
    const empError = requireEmpresa(profile);
    if (empError) return empError;

    try {
      const res = await fetch('/api/admin/usuarios', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: data.email,
          nombre: data.nombre_completo || data.nombre,
          rol: data.esAdmin ? 'admin' : 'profesional',
          empresaId: profile!.empresaId,
        }),
      });

      const json = await res.json();
      if (!res.ok) return { success: false, error: json.error || 'Error al crear usuario' };

      return { success: true, passwordTemporal: json.passwordTemporal, usuarioId: json.usuarioId };
    } catch (e: any) {
      return { success: false, error: e.message };
    }
  }

  /**
   * Actualiza datos de un profesional.
   * nombre, telefono y rol se pueden cambiar vía /api/admin/usuarios (PUT).
   */
  static async actualizarProfesional(
    usuarioId: string,
    data: { nombre?: string; nombre_completo?: string; telefono?: string; esAdmin?: boolean },
    profile: Profile | null,
  ) {
    const permError = requirePermission(profile, 'profesionales:write');
    if (permError) return permError;
    const empError = requireEmpresa(profile);
    if (empError) return empError;

    try {
      const res = await fetch('/api/admin/usuarios', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          usuarioId,
          nombre: data.nombre_completo || data.nombre,
          telefono: data.telefono,
          rol: data.esAdmin !== undefined ? (data.esAdmin ? 'admin' : 'profesional') : undefined,
          empresaId: profile!.empresaId,
        }),
      });

      const json = await res.json();
      if (!res.ok) return { success: false, error: json.error || 'Error al actualizar usuario' };

      return { success: true };
    } catch (e: any) {
      return { success: false, error: e.message };
    }
  }

  /**
   * Desactiva un profesional (soft delete: activo = false).
   * No elimina el usuario de auth ni de la tabla.
   */
  static async desactivarProfesional(usuarioId: string, profile: Profile | null) {
    const permError = requirePermission(profile, 'profesionales:write');
    if (permError) return permError;
    const empError = requireEmpresa(profile);
    if (empError) return empError;

    try {
      const { error } = await supabase
        .from('usuarios')
        .update({ activo: false })
        .eq('id', usuarioId);

      if (error) throw error;
      return { success: true };
    } catch (e: any) {
      return { success: false, error: e.message };
    }
  }
}
