'use server';

import { adminClient } from '@/src/lib/supabase/admin';

export type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string; code?: number };

export interface Ficha {
  id: string;
  cliente_id: string;
  profesional_id?: string | null;
  profesional_nombre?: string;
  sucursal_id?: string;
  servicio_id?: string;
  servicio_nombre?: string;
  fecha: string;
  hora?: string;
  nota?: string;
  created_at?: string;
}

export interface CrearFichaInput {
  cliente_id: string;
  nota: string;
  profesional_id?: string | null;
  fecha?: string;
  hora?: string;
  sucursal_id?: string;
}

export async function obtenerFichasPorCliente(
  clienteId: string
): Promise<ActionResult<Ficha[]>> {
  try {
    const sb = adminClient();

    const { data, error } = await sb
      .from('fichas')
      .select(`
        id,
        nota,
        fecha,
        hora,
        cliente_id,
        sucursal_id,
        profesional_id,
        servicio_id,
        profesional:usuarios!profesional_id(nombre_completo),
        servicio:servicios!servicio_id(nombre)
      `)
      .eq('cliente_id', clienteId)
      .order('fecha', { ascending: false });

    if (error) throw error;

    const fichas = (data || []).map((f: any) => ({
      id: f.id,
      nota: f.nota || '',
      fecha: f.fecha,
      hora: f.hora || '',
      cliente_id: f.cliente_id,
      sucursal_id: f.sucursal_id,
      profesional_id: f.profesional_id,
      profesional_nombre: f.profesional?.nombre_completo || '',
      servicio_id: f.servicio_id,
      servicio_nombre: f.servicio?.nombre || '',
    }));

    return { success: true, data: fichas };
  } catch (e: any) {
    console.error('[obtenerFichasPorCliente]', e.message);
    return {
      success: false,
      error: e.message,
      code: 500,
    };
  }
}

export async function crearFicha(
  input: CrearFichaInput
): Promise<ActionResult<Ficha>> {
  try {
    if (!input.cliente_id) {
      return { success: false, error: 'cliente_id es obligatorio' };
    }
    if (!input.nota || input.nota.trim() === '') {
      return { success: false, error: 'La nota es obligatoria' };
    }

    const sb = adminClient();

    // Resolver sucursal_id: si no se proporciona, obtener la primera de cualquier empresa
    let sucursalId = input.sucursal_id;
    if (!sucursalId) {
      const { data: sucursalRow } = await sb
        .from('sucursales')
        .select('id')
        .limit(1)
        .single();

      if (sucursalRow) {
        sucursalId = sucursalRow.id;
      }
    }

    const fechaFinal = input.fecha || new Date().toISOString().split('T')[0];
    const horaFinal = input.hora || new Date().toTimeString().slice(0, 8);

    const { data, error } = await sb
      .from('fichas')
      .insert([{
        cliente_id: input.cliente_id,
        nota: input.nota.trim(),
        fecha: fechaFinal,
        hora: horaFinal,
        profesional_id: input.profesional_id || null,
        sucursal_id: sucursalId || null,
      }])
      .select(`
        id,
        nota,
        fecha,
        hora,
        cliente_id,
        sucursal_id,
        profesional_id,
        servicio_id,
        profesional:usuarios!profesional_id(nombre_completo),
        servicio:servicios!servicio_id(nombre)
      `)
      .single();

    if (error) throw error;

    const ficha: Ficha = {
      id: data.id,
      nota: data.nota || '',
      fecha: data.fecha,
      hora: data.hora || '',
      cliente_id: data.cliente_id,
      sucursal_id: data.sucursal_id,
      profesional_id: data.profesional_id,
      profesional_nombre: data.profesional?.nombre_completo || '',
      servicio_id: data.servicio_id,
      servicio_nombre: data.servicio?.nombre || '',
    };

    return { success: true, data: ficha };
  } catch (e: any) {
    console.error('[crearFicha]', e.message);
    return {
      success: false,
      error: e.message,
      code: 500,
    };
  }
}
