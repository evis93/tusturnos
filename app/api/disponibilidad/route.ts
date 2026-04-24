/**
 * GET /api/disponibilidad?profesionalId=&empresaId=&servicioId=&fecha=
 * Devuelve los slots disponibles de un profesional para una fecha dada.
 * Tiene en cuenta: horario base de la empresa + excepciones del profesional + reservas existentes.
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { calcularSlots } from '@/src/utils/disponibilidad'
import type { HorarioDia, ExcepcionDisponibilidad } from '@/src/types/disponibilidad'

function adminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!
  if (!key) throw new Error('SUPABASE_SERVICE_ROLE_KEY no configurado')
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } })
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const profesionalId = searchParams.get('profesionalId')?.trim()
    const empresaId     = searchParams.get('empresaId')?.trim()
    const servicioId    = searchParams.get('servicioId')?.trim()
    const fechaParam    = searchParams.get('fecha')  // "2026-03-28"
    const duracionParam = searchParams.get('duracionMinutos')
    const duracionFallback = duracionParam ? Number(duracionParam) : NaN

    if (!profesionalId || !empresaId || !servicioId || !fechaParam) {
      return NextResponse.json(
        { error: 'profesionalId, empresaId, servicioId y fecha son requeridos' },
        { status: 400 }
      )
    }

    const fecha = new Date(fechaParam + 'T00:00:00')
    const sb    = adminClient()

    // 1. Duración del servicio
    let duracionServicio: number | null = null
    const { data: servicio, error: servicioError } = await sb
      .from('servicios')
      .select('duracion_minutos')
      .eq('id', servicioId)
      .eq('empresa_id', empresaId)
      .eq('activo', true)
      .maybeSingle()

    if (servicioError) {
      const puedeUsarFallback = servicioError.message?.toLowerCase().includes('permission denied')
        && Number.isFinite(duracionFallback)
        && duracionFallback > 0

      if (puedeUsarFallback) {
        duracionServicio = duracionFallback
      } else {
      console.error('[api/disponibilidad GET][servicio query]', servicioError.message)
      return NextResponse.json({ error: 'Error al consultar servicio' }, { status: 500 })
      }
    }

    if (!duracionServicio && !servicio) {
      return NextResponse.json({ error: 'Servicio no encontrado' }, { status: 404 })
    }

    if (!duracionServicio) {
      duracionServicio = servicio?.duracion_minutos ?? null
    }

    if (!duracionServicio || duracionServicio <= 0) {
      return NextResponse.json({ error: 'Duración de servicio inválida' }, { status: 400 })
    }

    // 2. Horario base de la empresa
    const { data: horariosDB } = await sb
      .from('horarios_empresa')
      .select('*')
      .eq('empresa_id', empresaId)
      .eq('activo', true)

    const horarioBase: HorarioDia[] = (horariosDB ?? []).map((h: any) => ({
      id:         h.id,
      empresaId:  h.empresa_id,
      diaSemana:  h.dia_semana,
      horaInicio: h.hora_inicio,
      horaFin:    h.hora_fin,
      activo:     h.activo,
    }))

    // 3. Excepciones del profesional para esa fecha
    const { data: excepcionesDB } = await sb
      .from('disponibilidad_profesional')
      .select('*')
      .eq('usuario_id', profesionalId)
      .eq('empresa_id', empresaId)
      .eq('fecha', fechaParam)

    const excepciones: ExcepcionDisponibilidad[] = (excepcionesDB ?? []).map((e: any) => ({
      id:         e.id,
      usuarioId:  e.usuario_id,
      empresaId:  e.empresa_id,
      fecha:      e.fecha,
      tipo:       e.tipo,
      horaInicio: e.hora_inicio,
      horaFin:    e.hora_fin,
      motivo:     e.motivo,
    }))

    // 4. Reservas existentes del profesional ese día (PENDIENTE y CONFIRMADA)
    const diaInicio = fechaParam + 'T00:00:00.000Z'
    const diaFin    = fechaParam + 'T23:59:59.999Z'

    const { data: reservasDB } = await sb
      .from('reservas')
      .select('hora_inicio')
      .eq('profesional_id', profesionalId)
      .in('estado', ['PENDIENTE', 'CONFIRMADA', 'CAMBIO_SOLICITADO'])
      .gte('hora_inicio', diaInicio)
      .lte('hora_inicio', diaFin)

    const reservasOcupadas = (reservasDB ?? []).map((r: any) => ({
      fechaHoraInicio: r.hora_inicio,
    }))

    // 5. Calcular slots
    const slots = calcularSlots(
      horarioBase,
      excepciones,
      reservasOcupadas,
      duracionServicio,
      fecha
    )

    return NextResponse.json({ success: true, data: { fecha: fechaParam, slots } })
  } catch (e: any) {
    console.error('[api/disponibilidad GET]', e.message)
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
