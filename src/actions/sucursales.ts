'use server';

import { createClient } from '@supabase/supabase-js';
import type { ActionResult } from './reservas';

export interface SucursalOrdenada {
  id: string;
  nombre: string;
  direccion: string | null;
  distancia_metros: number;
  location: unknown;
}

/**
 * Obtiene sucursales ordenadas por proximidad al usuario.
 * Usa ST_Distance de PostGIS para calcular distancias.
 *
 * @param empresa_id - ID de la empresa
 * @param usuario_location - Ubicación del usuario como [lat, lon] o geography GeoJSON
 * @param limit - Límite de sucursales a retornar (default: 10)
 */
export async function obtenerSucursalesCercanas(
  empresa_id: string,
  usuario_location: [number, number] | null,
  limit: number = 10,
): Promise<ActionResult<SucursalOrdenada[]>> {
  if (!usuario_location) {
    return {
      success: false,
      error: 'Ubicación del usuario requerida',
    };
  }

  const sb = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false } },
  );

  try {
    const [lat, lon] = usuario_location;
    
    // Construir punto geografía desde [lat, lon]
    // PostGIS espera POINT(longitude latitude)
    const userPoint = `POINT(${lon} ${lat})`;

    const { data, error } = await sb
      .rpc('obtener_sucursales_cercanas', {
        p_empresa_id: empresa_id,
        p_usuario_location: userPoint,
        p_limit: limit,
      });

    if (error) {
      console.error('[sucursales] RPC error:', error.message);
      return {
        success: false,
        error: error.message || 'Error al obtener sucursales',
      };
    }

    const sucursales: SucursalOrdenada[] = (data || []).map((row: any) => ({
      id: row.id,
      nombre: row.nombre,
      direccion: row.direccion,
      distancia_metros: row.distancia_metros || 0,
      location: row.location,
    }));

    return { success: true, data: sucursales };
  } catch (err) {
    console.error('[sucursales] Error:', err);
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Error desconocido',
    };
  }
}

/**
 * Fallback: obtiene todas las sucursales de la empresa sin ordenar por distancia.
 * Usado cuando la ubicación del usuario no está disponible.
 */
export async function obtenerSucursalesEmpresa(
  empresa_id: string,
): Promise<ActionResult<SucursalOrdenada[]>> {
  const sb = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false } },
  );

  try {
    const { data, error } = await sb
      .from('sucursales')
      .select('id, nombre, direccion, location')
      .eq('empresa_id', empresa_id)
      .eq('activa', true)
      .order('nombre', { ascending: true });

    if (error) {
      console.error('[sucursales] Query error:', error.message);
      return {
        success: false,
        error: error.message || 'Error al obtener sucursales',
      };
    }

    const sucursales: SucursalOrdenada[] = (data || []).map((row: any) => ({
      id: row.id,
      nombre: row.nombre,
      direccion: row.direccion,
      distancia_metros: 0,
      location: row.location,
    }));

    return { success: true, data: sucursales };
  } catch (err) {
    console.error('[sucursales] Error:', err);
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Error desconocido',
    };
  }
}
