'use server';

import { adminClient } from '@/src/lib/supabase/admin';

export type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string; code?: number };

export interface Ficha {
  id: string;
  cliente_id: string;
  profesional_id: string;
  sucursal_id: string;
  servicio_id?: string;
  fecha: string;
  hora: string;
  nota?: string;
  created_at?: string;
}

export async function obtenerFichasPorCliente(
  clienteId: string
): Promise<ActionResult<Ficha[]>> {
  try {
    const sb = adminClient();

    const { data, error } = await sb
      .from('fichas')
      .select('*')
      .eq('cliente_id', clienteId)
      .order('fecha', { ascending: false });

    if (error) throw error;

    return { success: true, data: data || [] };
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
  ficha: Omit<Ficha, 'id' | 'created_at'>
): Promise<ActionResult<Ficha>> {
  try {
    const sb = adminClient();

    const { data, error } = await sb
      .from('fichas')
      .insert([ficha])
      .select()
      .single();

    if (error) throw error;

    return { success: true, data };
  } catch (e: any) {
    console.error('[crearFicha]', e.message);
    return {
      success: false,
      error: e.message,
      code: 500,
    };
  }
}
