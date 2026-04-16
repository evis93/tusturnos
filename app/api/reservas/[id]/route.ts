/**
 * GET /api/reservas/[id]
 * Devuelve el detalle completo de una reserva por id.
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function adminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } })
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const sb = adminClient()
    const { data: reserva, error } = await sb
      .from('reservas')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error
    if (!reserva) return NextResponse.json({ error: 'Reserva no encontrada' }, { status: 404 })

    // Enrich with related data
    const [clienteRes, profesionalRes, servicioRes] = await Promise.all([
      reserva.cliente_id
        ? sb.from('usuarios').select('id, nombre_completo, email, telefono').eq('id', reserva.cliente_id).single()
        : { data: null },
      reserva.profesional_id
        ? sb.from('usuarios').select('id, nombre_completo, telefono').eq('id', reserva.profesional_id).single()
        : { data: null },
      reserva.servicio_id
        ? sb.from('servicios').select('id, nombre, precio').eq('id', reserva.servicio_id).single()
        : { data: null },
    ])

    const data = {
      ...reserva,
      cliente_usuario_id:    reserva.cliente_id,
      profesional_usuario_id: reserva.profesional_id,
      cliente_nombre:         clienteRes.data?.nombre_completo || '',
      cliente_email:          clienteRes.data?.email || '',
      cliente_telefono:       clienteRes.data?.telefono || '',
      profesional_nombre:     profesionalRes.data?.nombre_completo || '',
      profesional_telefono:   profesionalRes.data?.telefono || '',
      servicio_nombre:        servicioRes.data?.nombre || '',
      servicio_precio:        servicioRes.data?.precio ?? null,
    }

    return NextResponse.json({ success: true, data })
  } catch (e: any) {
    console.error('[api/reservas/[id] GET]', e.message)
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
