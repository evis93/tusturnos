'use server';

import { adminClient } from '@/src/lib/supabase/admin';

export type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string; code?: number };

export interface Servicio {
  id: string;
  empresa_id: string;
  nombre: string;
  descripcion?: string;
  duracion_minutos?: number;
  precio?: number;
  sena_tipo: string;
  sena_valor: number;
  modalidad: string;
  activo: boolean;
  created_at?: string;
}

export interface CrearServicioInput {
  nombre: string;
  descripcion?: string;
  duracion_minutos?: string | number;
  precio?: string | number;
  sena_tipo?: string;
  sena_valor?: string | number;
  modalidad?: string;
}

export async function obtenerServicios(
  empresaId: string
): Promise<ActionResult<Servicio[]>> {
  try {
    if (!empresaId) {
      return { success: false, error: 'empresaId es requerido' };
    }

    const sb = adminClient();

    const { data, error } = await sb
      .from('servicios')
      .select('*')
      .eq('empresa_id', empresaId)
      .order('nombre');

    if (error) throw error;

    return { success: true, data: data || [] };
  } catch (e: any) {
    console.error('[obtenerServicios]', e.message);
    return {
      success: false,
      error: e.message,
      code: 500,
    };
  }
}

export async function crearServicio(
  empresaId: string,
  datos: CrearServicioInput
): Promise<ActionResult<Servicio>> {
  try {
    if (!empresaId) {
      return { success: false, error: 'empresaId es requerido' };
    }

    if (!datos.nombre?.trim()) {
      return { success: false, error: 'El nombre es obligatorio' };
    }

    const sb = adminClient();

    const { data, error } = await sb
      .from('servicios')
      .insert([{
        empresa_id: empresaId,
        nombre: datos.nombre.trim(),
        descripcion: datos.descripcion?.toString().trim() || null,
        duracion_minutos: datos.duracion_minutos ? parseInt(String(datos.duracion_minutos)) : null,
        precio: datos.precio ? parseFloat(String(datos.precio)) : null,
        sena_tipo: datos.sena_tipo || 'monto',
        sena_valor: datos.sena_valor ? parseFloat(String(datos.sena_valor)) : 0,
        modalidad: datos.modalidad || 'presencial',
        activo: true,
      }])
      .select()
      .single();

    if (error) throw error;

    return { success: true, data };
  } catch (e: any) {
    console.error('[crearServicio]', e.message);
    return {
      success: false,
      error: e.message,
      code: 500,
    };
  }
}

export async function actualizarServicio(
  servicioId: string,
  datos: Partial<CrearServicioInput>
): Promise<ActionResult<void>> {
  try {
    if (!servicioId) {
      return { success: false, error: 'servicioId es requerido' };
    }

    if (datos.nombre !== undefined && !datos.nombre?.trim()) {
      return { success: false, error: 'El nombre es obligatorio' };
    }

    const sb = adminClient();

    const updatePayload: any = {};
    if (datos.nombre !== undefined) updatePayload.nombre = datos.nombre.trim();
    if (datos.descripcion !== undefined) updatePayload.descripcion = datos.descripcion?.toString().trim() || null;
    if (datos.duracion_minutos !== undefined) updatePayload.duracion_minutos = datos.duracion_minutos ? parseInt(String(datos.duracion_minutos)) : null;
    if (datos.precio !== undefined) updatePayload.precio = datos.precio ? parseFloat(String(datos.precio)) : null;
    if (datos.sena_tipo !== undefined) updatePayload.sena_tipo = datos.sena_tipo;
    if (datos.sena_valor !== undefined) updatePayload.sena_valor = datos.sena_valor ? parseFloat(String(datos.sena_valor)) : 0;
    if (datos.modalidad !== undefined) updatePayload.modalidad = datos.modalidad;

    const { error } = await sb
      .from('servicios')
      .update(updatePayload)
      .eq('id', servicioId);

    if (error) throw error;

    return { success: true, data: undefined };
  } catch (e: any) {
    console.error('[actualizarServicio]', e.message);
    return {
      success: false,
      error: e.message,
      code: 500,
    };
  }
}

export async function toggleActivo(
  servicioId: string,
  activo: boolean
): Promise<ActionResult<void>> {
  try {
    if (!servicioId) {
      return { success: false, error: 'servicioId es requerido' };
    }

    const sb = adminClient();

    const { error } = await sb
      .from('servicios')
      .update({ activo })
      .eq('id', servicioId);

    if (error) throw error;

    return { success: true, data: undefined };
  } catch (e: any) {
    console.error('[toggleActivo]', e.message);
    return {
      success: false,
      error: e.message,
      code: 500,
    };
  }
}

export async function eliminarServicio(
  servicioId: string
): Promise<ActionResult<void>> {
  try {
    if (!servicioId) {
      return { success: false, error: 'servicioId es requerido' };
    }

    const sb = adminClient();

    const { error } = await sb
      .from('servicios')
      .delete()
      .eq('id', servicioId);

    if (error) throw error;

    return { success: true, data: undefined };
  } catch (e: any) {
    console.error('[eliminarServicio]', e.message);
    return {
      success: false,
      error: e.message,
      code: 500,
    };
  }
}
