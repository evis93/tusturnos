/**
 * GET /api/reservas?empresaId=&profesionalId=&estado=&fechaDesde=&fechaHasta=
 * Lista reservas con filtros opcionales.
 *
 * POST /api/reservas
 * Crea una nueva reserva en estado PENDIENTE.
 * Body: { empresaId, clienteId, profesionalId, servicioId, fechaHoraInicio }
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function adminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!
  if (!key) throw new Error('SUPABASE_SERVICE_ROLE_KEY no configurado')
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } })
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const empresaId     = searchParams.get('empresaId')
    const profesionalId = searchParams.get('profesionalId')
    const clienteId     = searchParams.get('clienteId')
    const estado        = searchParams.get('estado')
    const fechaDesde    = searchParams.get('fechaDesde')
    const fechaHasta    = searchParams.get('fechaHasta')

    if (!empresaId && !profesionalId && !clienteId) {
      return NextResponse.json(
        { error: 'Se requiere al menos empresaId, profesionalId o clienteId' },
        { status: 400 }
      )
    }

    const sb = adminClient()
    let query = sb
      .from('reservas')
      .select('*')

    if (empresaId)     query = query.eq('empresa_id', empresaId)
    if (profesionalId) query = query.eq('profesional_id', profesionalId)
    if (clienteId)     query = query.eq('cliente_id', clienteId)
    if (estado)        query = query.eq('estado', estado)
    if (fechaDesde)    query = query.gte('hora_inicio', fechaDesde)
    if (fechaHasta)    query = query.lte('hora_inicio', fechaHasta + 'T23:59:59')

    query = query.order('hora_inicio', { ascending: true })

    const { data: reservasData, error } = await query
    if (error) throw error

    const reservas = reservasData ?? []

    // Batch-fetch related entities to avoid FK hint issues
    const clienteIds    = [...new Set(reservas.map((r: any) => r.cliente_id).filter(Boolean))]
    const profesionalIds = [...new Set(reservas.map((r: any) => r.profesional_id).filter(Boolean))]
    const servicioIds   = [...new Set(reservas.map((r: any) => r.servicio_id).filter(Boolean))]

    const [clientesRes, profesionalesRes, serviciosRes] = await Promise.all([
      clienteIds.length
        ? sb.from('usuarios').select('id, nombre_completo, email, telefono').in('id', clienteIds)
        : { data: [], error: null },
      profesionalIds.length
        ? sb.from('usuarios').select('id, nombre_completo, telefono').in('id', profesionalIds)
        : { data: [], error: null },
      servicioIds.length
        ? sb.from('servicios').select('id, nombre, precio').in('id', servicioIds)
        : { data: [], error: null },
    ])

    const clienteMap    = Object.fromEntries((clientesRes.data ?? []).map((u: any) => [u.id, u]))
    const profesionalMap = Object.fromEntries((profesionalesRes.data ?? []).map((u: any) => [u.id, u]))
    const servicioMap   = Object.fromEntries((serviciosRes.data ?? []).map((s: any) => [s.id, s]))

    // hora_inicio es timestamp without time zone → "YYYY-MM-DDTHH:MM:SS"
    const normalizado = reservas.map((r: any) => {
      const fecha = r.fecha || r.hora_inicio?.split('T')[0] || ''
      const hora  = r.hora_inicio?.substring(11, 16) || ''
      return {
        ...r,
        fecha,
        hora,
        cliente_nombre:     clienteMap[r.cliente_id]?.nombre_completo || '',
        cliente_email:      clienteMap[r.cliente_id]?.email || '',
        cliente_telefono:   clienteMap[r.cliente_id]?.telefono || '',
        profesional_nombre:    profesionalMap[r.profesional_id]?.nombre_completo || '',
        profesional_telefono:  profesionalMap[r.profesional_id]?.telefono || '',
        servicio_nombre:    servicioMap[r.servicio_id]?.nombre || r.servicio_nombre || '',
        servicio_precio:    servicioMap[r.servicio_id]?.precio ?? null,
      }
    })

    return NextResponse.json({ success: true, data: normalizado })
  } catch (e: any) {
    console.error('[api/reservas GET]', e.message)
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const { empresaId, clienteId, profesionalId, servicioId, sucursalId, fechaHoraInicio, reservaOrigenId } = await req.json()
    const servicioIdNormalizado = typeof servicioId === 'string' ? servicioId.trim() : servicioId

    if (!empresaId || !clienteId || !profesionalId || !fechaHoraInicio) {
      return NextResponse.json(
        { error: 'empresaId, clienteId, profesionalId y fechaHoraInicio son requeridos' },
        { status: 400 }
      )
    }

    const sb = adminClient()

    // fechaHoraInicio = "YYYY-MM-DDTHH:MM:SS" (hora local AR, sin TZ)
    const fecha = fechaHoraInicio.split('T')[0]
    let duracionMinutos = 30 // duración por defecto cuando no hay servicio

    let servicioNombre = ''
    if (servicioIdNormalizado) {
      try {
        const { data: servicio } = await sb
          .from('servicios')
          .select('duracion_minutos, nombre')
          .eq('id', servicioIdNormalizado)
          .maybeSingle()
        if (servicio?.duracion_minutos) duracionMinutos = servicio.duracion_minutos
        if (servicio?.nombre) servicioNombre = servicio.nombre
      } catch {
        // Si falla la consulta del servicio, usamos valores por defecto
      }
    }

    // hora_inicio es timestamp without time zone → usar el string completo "YYYY-MM-DDTHH:MM:SS"
    // Calcular fin sin usar new Date() para evitar problemas de timezone en Node.js
    const [hh, mm] = fechaHoraInicio.split('T')[1].split(':').map(Number)
    const finTotalMin = hh * 60 + mm + duracionMinutos
    const finHH = String(Math.floor(finTotalMin / 60)).padStart(2, '0')
    const finMM = String(finTotalMin % 60).padStart(2, '0')
    const finStr = `${fecha}T${finHH}:${finMM}:00`

    // Verificar que el slot no esté ya ocupado
    const { data: conflicto } = await sb
      .from('reservas')
      .select('id')
      .eq('profesional_id', profesionalId)
      .eq('fecha', fecha)
      .in('estado', ['pendiente', 'confirmada', 'PENDIENTE', 'CONFIRMADA', 'cambio_solicitado', 'CAMBIO_SOLICITADO'])
      .lt('hora_inicio', finStr)
      .gte('hora_inicio', fechaHoraInicio)
      .maybeSingle()

    if (conflicto) {
      return NextResponse.json(
        { error: 'El horario seleccionado ya está ocupado' },
        { status: 409 }
      )
    }

    const { data: reserva, error: reservaError } = await sb
      .from('reservas')
      .insert({
        empresa_id:           empresaId,
        cliente_id:           clienteId,
        profesional_id:       profesionalId,
        servicio_id:          servicioIdNormalizado || null,
        servicio_nombre:      servicioNombre || null,
        sucursal_id:          sucursalId || null,
        reserva_origen_id:    reservaOrigenId || null,
        fecha,
        hora_inicio:          fechaHoraInicio,
        estado:               'pendiente',
        pagado:               false,
        recordatorio_enviado: false,
        precio_total:         0,
        monto_seña:           0,
        seña_pagada:          false,
        monto_restante:       0,
        cliente_auth_user_id: null,
        metodo_pago:          null,
        nota:                 null,
      })
      .select()
      .single()

    if (reservaError) throw reservaError

    return NextResponse.json({ success: true, data: reserva }, { status: 201 })
  } catch (e: any) {
    console.error('[api/reservas POST]', e.message)
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
