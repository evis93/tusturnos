/** Identifica el producto/dominio que originó la reserva. */
export type Brand = 'mensana' | 'tusturnos' | 'nrc'

/** Rol del usuario que ejecuta una acción. */
export type CallerRol = 'admin' | 'superadmin' | 'profesional' | 'cliente'

/** @deprecated Usar Brand en su lugar */
export type TipoDominio = 'mensana' | 'tusturnos'

/** Fila de la tabla `reservas` tal como la devuelve Supabase (snake_case). */
export interface ReservaRow {
  id: string
  empresa_id: string
  cliente_id: string
  profesional_id: string
  servicio_id: string | null
  servicio_nombre: string | null
  sucursal_id: string | null
  reserva_origen_id: string | null
  fecha: string
  hora_inicio: string
  estado: string
  estado_anterior: string | null
  motivo_cambio: string | null
  pagado: boolean
  precio_total: number
  monto_seña: number
  seña_pagada: boolean
  monto_restante: number
  sena_monto: number | null
  sena_estado: string | null
  sena_pago_id: string | null
  cliente_auth_user_id: string | null
  metodo_pago: string | null
  nota: string | null
  recordatorio_enviado: boolean
  created_at: string
  updated_at: string
}

/** ReservaRow enriquecida con datos de entidades relacionadas (usuarios, servicios). */
export interface ReservaEnriquecida extends ReservaRow {
  hora: string
  cliente_nombre: string
  cliente_email: string
  cliente_telefono: string
  profesional_nombre: string
  profesional_telefono: string
  servicio_precio: number | null
}

/** Resultado de listarReservas: incluye nombre y dirección de sucursal. */
export interface ReservaListItem extends ReservaEnriquecida {
  sucursal_nombre: string
  sucursal_direccion: string | null
}

/** Resultado de obtenerReserva: agrega la columna location (PostGIS geography) de la sucursal. */
export interface ReservaDetalle extends ReservaListItem {
  sucursal_location: unknown | null
}
