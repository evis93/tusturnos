'use server'

import { createClient, SupabaseClient } from '@supabase/supabase-js'
import { generarLinkWA } from '@/src/utils/whatsapp'
import type { ReservaEstado } from '@/src/types/reservas'
import type { Brand, CallerRol, ReservaListItem, ReservaDetalle } from '@/src/models/reserva'

// ─── Re-exports para que los consumidores no importen dos módulos ─────────────
export type { Brand, CallerRol, ReservaListItem, ReservaDetalle }

// ─── Tipos de entrada y resultado ────────────────────────────────────────────

export type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string; code?: number }

/**
 * Parámetros para crear una reserva.
 * fecha: "YYYY-MM-DD" | hora_inicio: "HH:MM"
 */
export interface BookingInput {
  empresa_id: string
  cliente_id: string
  sucursal_id: string
  profesional_id: string
  servicio_id?: string
  fecha: string
  hora_inicio: string
  brand: Brand
  caller_usuario_id: string
}

export interface ListarFiltros {
  empresa_id?: string
  sucursal_id?: string
  profesional_id?: string
  /** Filtra por cliente_id o profesional_id (solo admin puede usarlo con IDs ajenos). */
  usuario_id?: string
  estado?: ReservaEstado
  caller_usuario_id: string
  caller_rol: CallerRol
}

export interface CambioEstadoInput {
  nuevo_estado: ReservaEstado
  motivo_cambio?: string
  /** Solo requerido cuando nuevo_estado es CAMBIO_SOLICITADO. Formato ISO. */
  nueva_fecha_hora_inicio?: string
  caller_usuario_id: string
}

export interface CambiarEstadoResult {
  reserva_id: string
  estado: ReservaEstado
  ficha_id: string | null
  nueva_reserva_id: string | null
  wa_links: Record<string, string>
}

// ─── Helpers internos ─────────────────────────────────────────────────────────

function adminClient(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!
  if (!key) throw new Error('SUPABASE_SERVICE_ROLE_KEY no configurado')
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } })
}

function buildReservaUrl(reservaId: string, brand: Brand): string {
  const base = process.env.NEXT_PUBLIC_APP_URL ?? ''
  const prefix = brand === 'mensana' ? '/mensana' : brand === 'nrc' ? '/nrc' : ''
  return `${base}${prefix}/cliente/reservas/${reservaId}`
}

function formatearFechaHora(iso: string): string {
  return new Date(iso).toLocaleString('es-AR', {
    weekday: 'long', day: 'numeric', month: 'long',
    hour: '2-digit', minute: '2-digit',
  })
}

/** Verifica si un usuario es admin o superadmin de una empresa. */
async function esAdminDeEmpresa(
  sb: SupabaseClient,
  usuario_id: string,
  empresa_id: string
): Promise<boolean> {
  const { data: ue } = await sb
    .from('usuario_empresa')
    .select('rol_id')
    .eq('usuario_id', usuario_id)
    .eq('empresa_id', empresa_id)
    .maybeSingle()

  if (!ue?.rol_id) return false

  const { data: rol } = await sb
    .from('roles')
    .select('nombre')
    .eq('id', ue.rol_id)
    .single()

  return ['admin', 'superadmin'].includes(rol?.nombre ?? '')
}

// ─── Máquina de estados ───────────────────────────────────────────────────────

const TRANSICIONES_VALIDAS: Record<ReservaEstado, ReservaEstado[]> = {
  PENDIENTE:             ['CONFIRMADA', 'RECHAZADA', 'CAMBIO_SOLICITADO'],
  CONFIRMADA:            ['CANCELADA_PROFESIONAL', 'CAMBIO_SOLICITADO'],
  CAMBIO_SOLICITADO:     ['CONFIRMADA', 'RECHAZADA', 'CANCELADA_CLIENTE', 'CANCELADA_PROFESIONAL'],
  RECHAZADA:             [],
  CANCELADA_CLIENTE:     [],
  CANCELADA_PROFESIONAL: [],
  COMPLETADA:            [],
}

// ─── Enriquecedor en batch (reutilizado por listarReservas) ───────────────────

async function enriquecerReservas(
  sb: SupabaseClient,
  reservas: any[]
): Promise<ReservaListItem[]> {
  if (reservas.length === 0) return []

  const clienteIds     = [...new Set(reservas.map(r => r.cliente_id).filter(Boolean))]
  const profesionalIds = [...new Set(reservas.map(r => r.profesional_id).filter(Boolean))]
  const servicioIds    = [...new Set(reservas.map(r => r.servicio_id).filter(Boolean))]
  const sucursalIds    = [...new Set(reservas.map(r => r.sucursal_id).filter(Boolean))]

  const [clientesRes, profesionalesRes, serviciosRes, sucursalesRes] = await Promise.all([
    clienteIds.length
      ? sb.from('usuarios').select('id, nombre_completo, email, telefono').in('id', clienteIds)
      : { data: [] },
    profesionalIds.length
      ? sb.from('usuarios').select('id, nombre_completo, telefono').in('id', profesionalIds)
      : { data: [] },
    servicioIds.length
      ? sb.from('servicios').select('id, nombre, precio').in('id', servicioIds)
      : { data: [] },
    sucursalIds.length
      ? sb.from('sucursales').select('id, nombre, direccion').in('id', sucursalIds)
      : { data: [] },
  ])

  const cm = Object.fromEntries((clientesRes.data ?? []).map((u: any) => [u.id, u]))
  const pm = Object.fromEntries((profesionalesRes.data ?? []).map((u: any) => [u.id, u]))
  const sm = Object.fromEntries((serviciosRes.data ?? []).map((s: any) => [s.id, s]))
  const sucm = Object.fromEntries((sucursalesRes.data ?? []).map((s: any) => [s.id, s]))

  return reservas.map(r => ({
    ...r,
    fecha:                r.fecha || r.hora_inicio?.split('T')[0] || '',
    hora:                 r.hora_inicio?.substring(11, 16) || '',
    cliente_nombre:       cm[r.cliente_id]?.nombre_completo || '',
    cliente_email:        cm[r.cliente_id]?.email || '',
    cliente_telefono:     cm[r.cliente_id]?.telefono || '',
    profesional_nombre:   pm[r.profesional_id]?.nombre_completo || '',
    profesional_telefono: pm[r.profesional_id]?.telefono || '',
    servicio_nombre:      sm[r.servicio_id]?.nombre || r.servicio_nombre || '',
    servicio_precio:      sm[r.servicio_id]?.precio ?? null,
    sucursal_nombre:      sucm[r.sucursal_id]?.nombre || '',
    sucursal_direccion:   sucm[r.sucursal_id]?.direccion || null,
  }))
}

// ─── Actions ──────────────────────────────────────────────────────────────────

/**
 * Crea una reserva en estado PENDIENTE.
 *
 * Validaciones:
 * 1. Multisede — el profesional debe tener una fila en usuario_empresa con la sucursal_id dada.
 * 2. Conflicto de horario — no puede haber otra reserva activa solapada para ese profesional.
 * 3. Ubicación — si el cliente tiene location en su perfil la incluye en la respuesta;
 *    si no, la reserva se crea igual (no bloqueante).
 */
export async function crearReserva(
  input: BookingInput
): Promise<ActionResult<ReservaListItem & { cliente_location: unknown }>> {
  const {
    empresa_id, cliente_id, sucursal_id, profesional_id,
    servicio_id, fecha, hora_inicio, brand, caller_usuario_id,
  } = input

  if (!empresa_id || !cliente_id || !sucursal_id || !profesional_id || !fecha || !hora_inicio) {
    return {
      success: false,
      error: 'empresa_id, cliente_id, sucursal_id, profesional_id, fecha y hora_inicio son requeridos',
      code: 400,
    }
  }

  try {
    const sb = adminClient()

    // 1. Validación Multisede
    const { data: asignacion } = await sb
      .from('usuario_empresa')
      .select('id')
      .eq('usuario_id', profesional_id)
      .eq('empresa_id', empresa_id)
      .eq('sucursal_id', sucursal_id)
      .maybeSingle()

    if (!asignacion) {
      return {
        success: false,
        error: 'El profesional no está asignado a esta sucursal',
        code: 422,
      }
    }

    // 2. Servicio y duración
    const servicioIdNorm = typeof servicio_id === 'string' ? servicio_id.trim() : servicio_id
    let duracionMinutos = 30
    let servicioNombre = ''

    if (servicioIdNorm) {
      const { data: svc } = await sb
        .from('servicios')
        .select('duracion_minutos, nombre')
        .eq('id', servicioIdNorm)
        .maybeSingle()
      if (svc?.duracion_minutos) duracionMinutos = svc.duracion_minutos
      if (svc?.nombre) servicioNombre = svc.nombre
    }

    // 3. Construir timestamps (sin new Date() para evitar problemas de TZ local)
    const horaStr = hora_inicio.length === 5 ? `${hora_inicio}:00` : hora_inicio
    const fechaHoraInicio = `${fecha}T${horaStr}`
    const [hh, mm] = horaStr.split(':').map(Number)
    const finTotal = hh * 60 + mm + duracionMinutos
    const finStr = `${fecha}T${String(Math.floor(finTotal / 60)).padStart(2, '0')}:${String(finTotal % 60).padStart(2, '0')}:00`

    // 4. Verificar conflicto de horario
    const { data: conflicto } = await sb
      .from('reservas')
      .select('id')
      .eq('profesional_id', profesional_id)
      .eq('fecha', fecha)
      .in('estado', ['pendiente', 'confirmada', 'PENDIENTE', 'CONFIRMADA', 'cambio_solicitado', 'CAMBIO_SOLICITADO'])
      .lt('hora_inicio', finStr)
      .gte('hora_inicio', fechaHoraInicio)
      .maybeSingle()

    if (conflicto) {
      return { success: false, error: 'El horario seleccionado ya está ocupado', code: 409 }
    }

    // 5. Ubicación del cliente (no bloqueante)
    let clienteLocation: unknown = null
    const { data: usuarioDatos } = await sb
      .from('usuarios')
      .select('location')
      .eq('id', cliente_id)
      .maybeSingle()
    if (usuarioDatos?.location) clienteLocation = usuarioDatos.location

    // 6. Insertar reserva
    const { data: reserva, error: reservaError } = await sb
      .from('reservas')
      .insert({
        empresa_id,
        cliente_id,
        profesional_id,
        servicio_id:          servicioIdNorm || null,
        servicio_nombre:      servicioNombre || null,
        sucursal_id,
        fecha,
        hora_inicio:          fechaHoraInicio,
        estado:               'PENDIENTE',
        brand,
        pagado:               false,
        recordatorio_enviado: false,
        precio_total:         0,
        monto_seña:           0,
        seña_pagada:          false,
        monto_restante:       0,
        created_by:           caller_usuario_id,
        cliente_auth_user_id: null,
        metodo_pago:          null,
        nota:                 null,
      })
      .select()
      .single()

    if (reservaError) throw reservaError

    const [enriquecida] = await enriquecerReservas(sb, [reserva])
    return { success: true, data: { ...enriquecida, cliente_location: clienteLocation } }
  } catch (e: any) {
    console.error('[actions/reservas crearReserva]', e.message)
    return { success: false, error: e.message, code: 500 }
  }
}

/**
 * Lista reservas con filtros y lógica de roles.
 *
 * - admin/superadmin: ve todas las reservas de las empresas donde está asignado.
 * - profesional: ve sus propios turnos en todas las sucursales donde trabaja.
 * - cliente: ve sus propios turnos globales.
 *
 * Los filtros opcionales (empresa_id, sucursal_id, profesional_id, usuario_id, estado)
 * reducen el resultado dentro del alcance que el rol permite.
 */
export async function listarReservas(
  filtros: ListarFiltros
): Promise<ActionResult<ReservaListItem[]>> {
  const {
    empresa_id, sucursal_id, profesional_id,
    usuario_id, estado, caller_usuario_id, caller_rol,
  } = filtros

  try {
    const sb = adminClient()
    let query = sb.from('reservas').select('*')

    // ── Capa de seguridad por rol ─────────────────────────────────────────────
    if (caller_rol === 'admin' || caller_rol === 'superadmin') {
      // Admin ve todas las reservas de sus empresas
      const { data: membresias } = await sb
        .from('usuario_empresa')
        .select('empresa_id')
        .eq('usuario_id', caller_usuario_id)

      const empresaIds = (membresias ?? []).map((r: any) => r.empresa_id)
      if (empresaIds.length === 0) return { success: true, data: [] }

      if (empresa_id) {
        if (!empresaIds.includes(empresa_id)) {
          return { success: false, error: 'Sin acceso a esta empresa', code: 403 }
        }
        query = query.eq('empresa_id', empresa_id)
      } else {
        query = query.in('empresa_id', empresaIds)
      }

      if (sucursal_id)    query = query.eq('sucursal_id', sucursal_id)
      if (profesional_id) query = query.eq('profesional_id', profesional_id)
      // usuario_id permite buscar a cualquier persona (cliente o profesional)
      if (usuario_id)     query = query.or(`cliente_id.eq.${usuario_id},profesional_id.eq.${usuario_id}`)

    } else if (caller_rol === 'profesional') {
      // Profesional ve sus turnos en todas sus sucursales
      query = query.eq('profesional_id', caller_usuario_id)
      if (empresa_id)  query = query.eq('empresa_id', empresa_id)
      if (sucursal_id) query = query.eq('sucursal_id', sucursal_id)

    } else {
      // Cliente ve sus propios turnos
      query = query.eq('cliente_id', caller_usuario_id)
      if (empresa_id)  query = query.eq('empresa_id', empresa_id)
      if (sucursal_id) query = query.eq('sucursal_id', sucursal_id)
    }

    if (estado) query = query.eq('estado', estado)
    query = query.order('hora_inicio', { ascending: true })

    const { data: reservasData, error } = await query
    if (error) throw error

    const data = await enriquecerReservas(sb, reservasData ?? [])
    return { success: true, data }
  } catch (e: any) {
    console.error('[actions/reservas listarReservas]', e.message)
    return { success: false, error: e.message, code: 500 }
  }
}

/**
 * Devuelve el detalle completo de una reserva:
 * datos del cliente, profesional, servicio y sucursal (incluyendo location PostGIS).
 */
export async function obtenerReserva(
  reserva_id: string
): Promise<ActionResult<ReservaDetalle>> {
  try {
    const sb = adminClient()

    const { data: reserva, error } = await sb
      .from('reservas')
      .select('*')
      .eq('id', reserva_id)
      .single()

    if (error) throw error
    if (!reserva) return { success: false, error: 'Reserva no encontrada', code: 404 }

    const [clienteRes, profesionalRes, servicioRes, sucursalRes] = await Promise.all([
      reserva.cliente_id
        ? sb.from('usuarios').select('id, nombre_completo, email, telefono').eq('id', reserva.cliente_id).single()
        : { data: null },
      reserva.profesional_id
        ? sb.from('usuarios').select('id, nombre_completo, telefono').eq('id', reserva.profesional_id).single()
        : { data: null },
      reserva.servicio_id
        ? sb.from('servicios').select('id, nombre, precio, duracion_minutos, modalidad').eq('id', reserva.servicio_id).single()
        : { data: null },
      reserva.sucursal_id
        ? sb.from('sucursales').select('id, nombre, direccion, location, hora_apertura, hora_cierre').eq('id', reserva.sucursal_id).single()
        : { data: null },
    ])

    const data: ReservaDetalle = {
      ...reserva,
      hora:                 reserva.hora_inicio?.substring(11, 16) || '',
      cliente_nombre:       clienteRes.data?.nombre_completo || '',
      cliente_email:        clienteRes.data?.email || '',
      cliente_telefono:     clienteRes.data?.telefono || '',
      profesional_nombre:   profesionalRes.data?.nombre_completo || '',
      profesional_telefono: profesionalRes.data?.telefono || '',
      servicio_nombre:      servicioRes.data?.nombre || reserva.servicio_nombre || '',
      servicio_precio:      servicioRes.data?.precio ?? null,
      sucursal_nombre:      sucursalRes.data?.nombre || '',
      sucursal_direccion:   sucursalRes.data?.direccion || null,
      sucursal_location:    sucursalRes.data?.location ?? null,
    }

    return { success: true, data }
  } catch (e: any) {
    console.error('[actions/reservas obtenerReserva]', e.message)
    return { success: false, error: e.message, code: 500 }
  }
}

/**
 * Obtiene reservas por una fecha específica, enriquecidas con datos de cliente/profesional/servicio.
 * Usado por agenda diaria.
 */
export async function obtenerReservasPorFecha(
  fecha: string,
  profesionalId?: string | null,
  incluirAdmin: boolean = false
): Promise<ActionResult<ReservaListItem[]>> {
  try {
    const sb = adminClient()

    let query = sb
      .from('reservas')
      .select('*')
      .eq('fecha', fecha)
      .order('hora_inicio', { ascending: true })

    if (profesionalId) {
      query = query.eq('profesional_id', profesionalId)
    }

    const { data, error } = await query
    if (error) throw error

    const enriquecidas = await enriquecerReservas(sb, data || [])
    return { success: true, data: enriquecidas }
  } catch (e: any) {
    console.error('[actions/reservas obtenerReservasPorFecha]', e.message)
    return { success: false, error: e.message, code: 500 }
  }
}

/**
 * Obtiene fechas que tienen reservas dentro de un rango (para vista mensual).
 * Retorna array de { fecha: "YYYY-MM-DD" }.
 */
export async function obtenerFechasConReservas(
  fechaInicio: string,
  fechaFin: string,
  profesionalId?: string | null
): Promise<ActionResult<Array<{ fecha: string }>>> {
  try {
    const sb = adminClient()

    let query = sb
      .from('reservas')
      .select('fecha')
      .gte('fecha', fechaInicio)
      .lte('fecha', fechaFin)

    if (profesionalId) {
      query = query.eq('profesional_id', profesionalId)
    }

    const { data, error } = await query
    if (error) throw error

    // Deduplicar y retornar fechas únicas
    const fechas = [...new Set((data || []).map((r: any) => r.fecha))]
      .map(fecha => ({ fecha: fecha as string }))

    return { success: true, data: fechas }
  } catch (e: any) {
    console.error('[actions/reservas obtenerFechasConReservas]', e.message)
    return { success: false, error: e.message, code: 500 }
  }
}

/**
 * Obtiene todas las reservas de un cliente específico.
 */
export async function obtenerReservasPorCliente(
  clienteId: string
): Promise<ActionResult<ReservaListItem[]>> {
  try {
    const sb = adminClient()

    const { data, error } = await sb
      .from('reservas')
      .select('*')
      .eq('cliente_id', clienteId)
      .order('fecha', { ascending: false })

    if (error) throw error

    const enriquecidas = await enriquecerReservas(sb, data || [])
    return { success: true, data: enriquecidas }
  } catch (e: any) {
    console.error('[actions/reservas obtenerReservasPorCliente]', e.message)
    return { success: false, error: e.message, code: 500 }
  }
}

/**
 * Elimina una reserva.
 */
export async function eliminarReserva(
  reservaId: string
): Promise<ActionResult<void>> {
  try {
    const sb = adminClient()

    const { error } = await sb
      .from('reservas')
      .delete()
      .eq('id', reservaId)

    if (error) throw error

    return { success: true, data: undefined }
  } catch (e: any) {
    console.error('[actions/reservas eliminarReserva]', e.message)
    return { success: false, error: e.message, code: 500 }
  }
}

/**
 * Cambia el estado de una reserva y ejecuta las acciones asociadas.
 *
 * Seguridad:
 * - El cliente puede cancelar su propia reserva (CANCELADA_CLIENTE).
 * - El profesional puede confirmar, rechazar o cancelar sus turnos.
 * - Un admin/superadmin de la empresa puede hacer cualquier transición.
 *
 * Side-effects por estado:
 * - CONFIRMADA     → crea ficha clínica (si hay sucursal_id) + link WA al cliente.
 * - RECHAZADA      → link WA al cliente.
 * - CANCELADA_PROF → link WA al cliente.
 * - CANCELADA_CLI  → link WA al profesional.
 * - CAMBIO_SOL     → crea nueva reserva PENDIENTE con el nuevo horario.
 */
export async function cambiarEstadoReserva(
  reserva_id: string,
  input: CambioEstadoInput
): Promise<ActionResult<CambiarEstadoResult>> {
  const { nuevo_estado, motivo_cambio, nueva_fecha_hora_inicio, caller_usuario_id } = input

  if (!nuevo_estado) {
    return { success: false, error: 'nuevo_estado es requerido', code: 400 }
  }

  try {
    const sb = adminClient()

    const { data: reservaBase, error: reservaError } = await sb
      .from('reservas')
      .select('*')
      .eq('id', reserva_id)
      .single()

    if (reservaError || !reservaBase) {
      return { success: false, error: 'Reserva no encontrada', code: 404 }
    }

    // ── Verificar permisos ────────────────────────────────────────────────────
    const esCliente      = reservaBase.cliente_id === caller_usuario_id
    const esProfesional  = reservaBase.profesional_id === caller_usuario_id
    const esAdmin        = await esAdminDeEmpresa(sb, caller_usuario_id, reservaBase.empresa_id)

    if (!esCliente && !esProfesional && !esAdmin) {
      return { success: false, error: 'Sin permiso para modificar esta reserva', code: 403 }
    }

    // ── Validar transición ────────────────────────────────────────────────────
    const transicionesPermitidas = TRANSICIONES_VALIDAS[reservaBase.estado as ReservaEstado] ?? []
    if (!transicionesPermitidas.includes(nuevo_estado)) {
      return {
        success: false,
        error: `No se puede pasar de ${reservaBase.estado} a ${nuevo_estado}`,
        code: 422,
      }
    }

    // ── Enriquecer para WA ────────────────────────────────────────────────────
    const [clienteRes, profesionalRes, servicioRes] = await Promise.all([
      reservaBase.cliente_id
        ? sb.from('usuarios').select('nombre_completo, telefono').eq('id', reservaBase.cliente_id).single()
        : { data: null },
      reservaBase.profesional_id
        ? sb.from('usuarios').select('nombre_completo, telefono').eq('id', reservaBase.profesional_id).single()
        : { data: null },
      reservaBase.servicio_id
        ? sb.from('servicios').select('nombre').eq('id', reservaBase.servicio_id).single()
        : { data: null },
    ])

    const reserva = {
      ...reservaBase,
      cliente_nombre:       clienteRes.data?.nombre_completo || '',
      cliente_telefono:     clienteRes.data?.telefono || '',
      profesional_nombre:   profesionalRes.data?.nombre_completo || '',
      profesional_telefono: profesionalRes.data?.telefono || '',
      servicio_nombre:      servicioRes.data?.nombre || '',
    }

    // ── Actualizar estado ─────────────────────────────────────────────────────
    const { error: updateError } = await sb
      .from('reservas')
      .update({
        estado:          nuevo_estado,
        estado_anterior: reserva.estado,
        motivo_cambio:   motivo_cambio ?? null,
      })
      .eq('id', reserva_id)

    if (updateError) throw updateError

    // ── Side-effects ──────────────────────────────────────────────────────────
    const brand: Brand = reserva.brand ?? 'tusturnos'
    const datosWA = {
      profesionalNombre: reserva.profesional_nombre,
      clienteNombre:     reserva.cliente_nombre,
      servicio:          reserva.servicio_nombre,
      fechaHora:         formatearFechaHora(reserva.hora_inicio),
      linkReserva:       buildReservaUrl(reserva_id, brand),
    }

    const waLinks: Record<string, string> = {}
    let fichaId: string | null = null
    let nuevaReservaId: string | null = null

    // CONFIRMADA → ficha clínica + WA cliente
    if (nuevo_estado === 'CONFIRMADA') {
      if (reserva.sucursal_id) {
        const AR_OFFSET_MS = -3 * 60 * 60 * 1000
        const arTime       = new Date(new Date(reserva.hora_inicio).getTime() + AR_OFFSET_MS)
        const fechaStr     = arTime.toISOString().split('T')[0]
        const horaStr      = arTime.toISOString().split('T')[1].substring(0, 5)

        const { data: ficha, error: fichaError } = await sb
          .from('fichas')
          .insert({
            cliente_id:     reserva.cliente_id,
            sucursal_id:    reserva.sucursal_id,
            profesional_id: reserva.profesional_id,
            servicio_id:    reserva.servicio_id,
            fecha:          fechaStr,
            hora:           horaStr,
            nota:           `${fechaStr} - ${reserva.servicio_nombre}`,
          })
          .select('id')
          .single()

        if (!fichaError && ficha) fichaId = ficha.id
      }
      if (reserva.cliente_telefono) {
        waLinks.cliente = generarLinkWA(reserva.cliente_telefono, 'CONFIRMACION_CLIENTE', datosWA)
      }
    }

    // RECHAZADA → WA cliente
    if (nuevo_estado === 'RECHAZADA' && reserva.cliente_telefono) {
      waLinks.cliente = generarLinkWA(reserva.cliente_telefono, 'RECHAZO_CLIENTE', datosWA)
    }

    // CANCELADA_PROFESIONAL → WA cliente
    if (nuevo_estado === 'CANCELADA_PROFESIONAL' && reserva.cliente_telefono) {
      waLinks.cliente = generarLinkWA(reserva.cliente_telefono, 'CANCELACION_PROFESIONAL_CLIENTE', datosWA)
    }

    // CANCELADA_CLIENTE → WA profesional
    if (nuevo_estado === 'CANCELADA_CLIENTE' && reserva.profesional_telefono) {
      waLinks.profesional = generarLinkWA(reserva.profesional_telefono, 'CANCELACION_CLIENTE_PROFESIONAL', datosWA)
    }

    // CAMBIO_SOLICITADO → nueva reserva con el horario propuesto
    if (nuevo_estado === 'CAMBIO_SOLICITADO' && nueva_fecha_hora_inicio) {
      const { data: svc } = await sb
        .from('servicios')
        .select('duracion_minutos')
        .eq('id', reserva.servicio_id)
        .single()

      if (svc) {
        const nuevaInicio = new Date(nueva_fecha_hora_inicio)

        const { data: nuevaReserva } = await sb
          .from('reservas')
          .insert({
            empresa_id:        reserva.empresa_id,
            cliente_id:        reserva.cliente_id,
            profesional_id:    reserva.profesional_id,
            servicio_id:       reserva.servicio_id,
            sucursal_id:       reserva.sucursal_id,
            brand:             reserva.brand,
            fecha:             nuevaInicio.toISOString().split('T')[0],
            hora_inicio:       nuevaInicio.toISOString(),
            estado:            'PENDIENTE',
            sena_monto:        reserva.sena_monto,
            sena_estado:       reserva.sena_estado,
            sena_pago_id:      reserva.sena_pago_id,
            reserva_origen_id: reserva_id,
          })
          .select('id')
          .single()

        if (nuevaReserva) nuevaReservaId = nuevaReserva.id
      }
    }

    return {
      success: true,
      data: { reserva_id, estado: nuevo_estado, ficha_id: fichaId, nueva_reserva_id: nuevaReservaId, wa_links: waLinks },
    }
  } catch (e: any) {
    console.error('[actions/reservas cambiarEstadoReserva]', e.message)
    return { success: false, error: e.message, code: 500 }
  }
}
