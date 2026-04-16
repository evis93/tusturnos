/**
 * GET /api/admin/cierre-dia?empresaId=
 * Chequea si hay reservas PENDIENTES sin resolver antes de permitir el cierre.
 * Devuelve: { puedesCerrar: boolean, pendientes: ReservaResumen[] }
 *
 * POST /api/admin/cierre-dia
 * Ejecuta el cierre del día: elimina reservas resueltas (CONFIRMADA, CANCELADA*, RECHAZADA).
 * Bloquea si hay PENDIENTES sin resolver.
 * Body: { empresaId }
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function adminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } })
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const empresaId = searchParams.get('empresaId')

    if (!empresaId) {
      return NextResponse.json({ error: 'empresaId es requerido' }, { status: 400 })
    }

    const sb  = adminClient()
    const hoy = new Date().toISOString().split('T')[0]

    // Reservas PENDIENTES de hoy para esta empresa
    const { data: reservasRaw, error } = await sb
      .from('reservas')
      .select('id, cliente_id, profesional_id, servicio_id, hora_inicio')
      .eq('empresa_id', empresaId)
      .eq('estado', 'PENDIENTE')
      .gte('hora_inicio', hoy + 'T00:00:00Z')
      .lte('hora_inicio', hoy + 'T23:59:59Z')
      .order('hora_inicio')

    if (error) throw error

    const reservasBase = reservasRaw ?? []
    const clienteIds    = [...new Set(reservasBase.map((r: any) => r.cliente_id).filter(Boolean))]
    const profesionalIds = [...new Set(reservasBase.map((r: any) => r.profesional_id).filter(Boolean))]
    const servicioIds   = [...new Set(reservasBase.map((r: any) => r.servicio_id).filter(Boolean))]

    const [clientesRes, profesionalesRes, serviciosRes] = await Promise.all([
      clienteIds.length ? sb.from('usuarios').select('id, nombre_completo').in('id', clienteIds) : { data: [] },
      profesionalIds.length ? sb.from('usuarios').select('id, nombre_completo').in('id', profesionalIds) : { data: [] },
      servicioIds.length ? sb.from('servicios').select('id, nombre').in('id', servicioIds) : { data: [] },
    ])

    const clienteMap    = Object.fromEntries((clientesRes.data ?? []).map((u: any) => [u.id, u]))
    const profesionalMap = Object.fromEntries((profesionalesRes.data ?? []).map((u: any) => [u.id, u]))
    const servicioMap   = Object.fromEntries((serviciosRes.data ?? []).map((s: any) => [s.id, s]))

    const pendientes = reservasBase.map((r: any) => ({
      id:                 r.id,
      hora_inicio:  r.hora_inicio,
      cliente_nombre:     clienteMap[r.cliente_id]?.nombre_completo || '',
      profesional_nombre: profesionalMap[r.profesional_id]?.nombre_completo || '',
      servicio_nombre:    servicioMap[r.servicio_id]?.nombre || '',
    }))

    return NextResponse.json({
      success:       true,
      puedesCerrar:  pendientes.length === 0,
      pendientes,
    })
  } catch (e: any) {
    console.error('[api/admin/cierre-dia GET]', e.message)
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const { empresaId } = await req.json()

    if (!empresaId) {
      return NextResponse.json({ error: 'empresaId es requerido' }, { status: 400 })
    }

    const sb  = adminClient()
    const hoy = new Date().toISOString().split('T')[0]

    // Bloquear si hay PENDIENTES
    const { data: pendientes } = await sb
      .from('reservas')
      .select('id')
      .eq('empresa_id', empresaId)
      .eq('estado', 'PENDIENTE')
      .gte('hora_inicio', hoy + 'T00:00:00Z')
      .lte('hora_inicio', hoy + 'T23:59:59Z')

    if ((pendientes ?? []).length > 0) {
      return NextResponse.json(
        { error: 'Hay reservas pendientes sin resolver. Confirmalas o rechazalas antes de cerrar.' },
        { status: 422 }
      )
    }

    // Eliminar reservas resueltas de hoy: CONFIRMADA, RECHAZADA, CANCELADA_*
    const { data: eliminadas, error: deleteError } = await sb
      .from('reservas')
      .delete()
      .eq('empresa_id', empresaId)
      .in('estado', ['CONFIRMADA', 'RECHAZADA', 'CANCELADA_CLIENTE', 'CANCELADA_PROFESIONAL'])
      .gte('hora_inicio', hoy + 'T00:00:00Z')
      .lte('hora_inicio', hoy + 'T23:59:59Z')
      .select('id, estado')

    if (deleteError) throw deleteError

    // Registrar timestamp del último cierre
    await sb
      .from('empresas')
      .update({ cierre_ultimo_at: new Date().toISOString() })
      .eq('id', empresaId)

    const resumen = (eliminadas ?? []).reduce(
      (acc: Record<string, number>, r: any) => {
        acc[r.estado] = (acc[r.estado] ?? 0) + 1
        return acc
      },
      {}
    )

    return NextResponse.json({ success: true, resumen })
  } catch (e: any) {
    console.error('[api/admin/cierre-dia POST]', e.message)
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
