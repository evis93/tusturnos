/**
 * GET /api/cron/recordatorios
 * Ejecutado por Vercel Cron cada 30 minutos.
 * Genera notificaciones_pendientes para reservas próximas (24h y 1h antes).
 *
 * Configuar en vercel.json:
 * { "crons": [{ "path": "/api/cron/recordatorios", "schedule": "every-30-min" }] }
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { generarLinkWA } from '@/src/utils/whatsapp'

function adminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } })
}

function formatearFechaHora(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleString('es-AR', {
    weekday: 'long', day: 'numeric', month: 'long',
    hour: '2-digit', minute: '2-digit',
  })
}

export async function GET(req: NextRequest) {
  // Verificar que viene de Vercel Cron o tiene el secret
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 })
  }

  try {
    const sb      = adminClient()
    const ahora   = new Date()
    const ventana = 30 * 60 * 1000  // 30 minutos (frecuencia del cron)

    // Ventanas de tiempo para recordatorios
    const en24h_desde = new Date(ahora.getTime() + 24 * 60 * 60 * 1000 - ventana)
    const en24h_hasta = new Date(ahora.getTime() + 24 * 60 * 60 * 1000 + ventana)
    const en1h_desde  = new Date(ahora.getTime() + 60 * 60 * 1000 - ventana)
    const en1h_hasta  = new Date(ahora.getTime() + 60 * 60 * 1000 + ventana)

    let procesadas = 0

    // Helper: enrich reservas with user/service names
    async function enrichReservas(reservasRaw: any[]) {
      if (!reservasRaw.length) return []
      const clienteIds    = [...new Set(reservasRaw.map(r => r.cliente_id).filter(Boolean))]
      const profesionalIds = [...new Set(reservasRaw.map(r => r.profesional_id).filter(Boolean))]
      const servicioIds   = [...new Set(reservasRaw.map(r => r.servicio_id).filter(Boolean))]

      const [clientesRes, profesionalesRes, serviciosRes] = await Promise.all([
        clienteIds.length ? sb.from('usuarios').select('id, nombre_completo, telefono').in('id', clienteIds) : { data: [] },
        profesionalIds.length ? sb.from('usuarios').select('id, nombre_completo').in('id', profesionalIds) : { data: [] },
        servicioIds.length ? sb.from('servicios').select('id, nombre').in('id', servicioIds) : { data: [] },
      ])

      const clienteMap    = Object.fromEntries((clientesRes.data ?? []).map((u: any) => [u.id, u]))
      const profesionalMap = Object.fromEntries((profesionalesRes.data ?? []).map((u: any) => [u.id, u]))
      const servicioMap   = Object.fromEntries((serviciosRes.data ?? []).map((s: any) => [s.id, s]))

      return reservasRaw.map(r => ({
        ...r,
        cliente_nombre:     clienteMap[r.cliente_id]?.nombre_completo || '',
        cliente_telefono:   clienteMap[r.cliente_id]?.telefono || '',
        profesional_nombre: profesionalMap[r.profesional_id]?.nombre_completo || '',
        servicio_nombre:    servicioMap[r.servicio_id]?.nombre || '',
      }))
    }

    // ── Recordatorios 24h ────────────────────────────────────────────────────
    const { data: reservas24hRaw } = await sb
      .from('reservas')
      .select('*')
      .eq('estado', 'CONFIRMADA')
      .gte('hora_inicio', en24h_desde.toISOString())
      .lte('hora_inicio', en24h_hasta.toISOString())

    const reservas24h = await enrichReservas(reservas24hRaw ?? [])

    for (const r of reservas24h) {
      // Verificar que no fue enviado ya
      const { data: yaEnviado } = await sb
        .from('notificaciones_pendientes')
        .select('id')
        .eq('reserva_id', r.id)
        .eq('tipo', 'RECORDATORIO_24H')
        .maybeSingle()

      if (yaEnviado) continue
      if (!r.cliente_telefono) continue

      const mensaje = `Recordatorio: mañana tenés turno de *${r.servicio_nombre}* con ${r.profesional_nombre} a las ${formatearFechaHora(r.hora_inicio)}.`

      await sb.from('notificaciones_pendientes').insert({
        reserva_id:  r.id,
        tipo:        'RECORDATORIO_24H',
        destinatario:'CLIENTE',
        telefono:    r.cliente_telefono,
        mensaje,
        enviada_at:  new Date().toISOString(),
      })

      procesadas++
    }

    // ── Recordatorios 1h ─────────────────────────────────────────────────────
    const { data: reservas1hRaw } = await sb
      .from('reservas')
      .select('*')
      .eq('estado', 'CONFIRMADA')
      .gte('hora_inicio', en1h_desde.toISOString())
      .lte('hora_inicio', en1h_hasta.toISOString())

    const reservas1h = await enrichReservas(reservas1hRaw ?? [])

    for (const r of reservas1h) {
      const { data: yaEnviado } = await sb
        .from('notificaciones_pendientes')
        .select('id')
        .eq('reserva_id', r.id)
        .eq('tipo', 'RECORDATORIO_1H')
        .maybeSingle()

      if (yaEnviado) continue
      if (!r.cliente_telefono) continue

      const mensaje = `Tu turno de *${r.servicio_nombre}* con ${r.profesional_nombre} es en 1 hora (${formatearFechaHora(r.hora_inicio)}). ¡Te esperamos!`

      await sb.from('notificaciones_pendientes').insert({
        reserva_id:  r.id,
        tipo:        'RECORDATORIO_1H',
        destinatario:'CLIENTE',
        telefono:    r.cliente_telefono,
        mensaje,
        enviada_at:  new Date().toISOString(),
      })

      procesadas++
    }

    return NextResponse.json({ success: true, procesadas })
  } catch (e: any) {
    console.error('[api/cron/recordatorios]', e.message)
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
