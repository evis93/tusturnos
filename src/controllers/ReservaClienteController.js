import { supabase } from '../config/supabase';

// Helper: genera slots cada 30 min entre horaInicio y horaFin (strings 'HH:MM')
function generarSlotsDelRango(horaInicio, horaFin) {
  const slots = [];
  let [h, m] = horaInicio.split(':').map(Number);
  const [hFin, mFin] = horaFin.split(':').map(Number);
  const finTotal = hFin * 60 + mFin;

  while (h * 60 + m < finTotal) {
    slots.push(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`);
    m += 30;
    if (m >= 60) { h += 1; m -= 60; }
  }
  return slots;
}

export class ReservaClienteController {

  // Profesionales activos de la empresa (sin guardia de permisos — RLS de Supabase controla acceso)
  static async obtenerProfesionalesEmpresa(empresaId) {
    try {
      const { data, error } = await supabase
        .from('usuario_empresa')
        .select(`
          usuario_id,
          roles!inner(rol),
          usuarios!inner(id, nombre_completo, avatar_url)
        `)
        .eq('empresa_id', empresaId)
        .in('roles.rol', ['profesional', 'admin']);

      if (error) throw error;

      // Deduplicar por usuario_id, priorizar 'admin' sobre 'profesional'
      const ROL_PRIORIDAD = { admin: 2, profesional: 1 };
      const profMap = new Map();
      (data || []).forEach(item => {
        const id = item.usuarios.id;
        const rol = item.roles.rol;
        const existing = profMap.get(id);
        if (!existing || (ROL_PRIORIDAD[rol] || 0) > (ROL_PRIORIDAD[existing.rol] || 0)) {
          profMap.set(id, {
            id,
            nombre_completo: item.usuarios.nombre_completo || '',
            avatar_url: item.usuarios.avatar_url || '',
            rol,
          });
        }
      });

      const profesionales = Array.from(profMap.values());
      profesionales.sort((a, b) => a.nombre_completo.localeCompare(b.nombre_completo));

      return { success: true, data: profesionales };
    } catch (error) {
      console.error('[ReservaClienteController.obtenerProfesionalesEmpresa]', error);
      return { success: false, error: error.message };
    }
  }

  // Servicios activos de la empresa
  static async obtenerServiciosEmpresa(empresaId) {
    try {
      const { data, error } = await supabase
        .from('servicios')
        .select('id, nombre, duracion_minutos, precio')
        .eq('empresa_id', empresaId)
        .eq('activo', true)
        .order('nombre');

      if (error) throw error;
      return { success: true, data: data || [] };
    } catch (error) {
      console.error('[ReservaClienteController.obtenerServiciosEmpresa]', error);
      return { success: false, error: error.message };
    }
  }

  static calcularSeña(precioTotal, porcentaje = 0.3) {
    const monto = Number(precioTotal);
    if (!Number.isFinite(monto) || monto <= 0) return null;
    return Math.round(monto * porcentaje * 100) / 100;
  }

  // Horarios del profesional para un día de semana (0=Dom, 1=Lun … 6=Sab)
  static async obtenerHorariosDelDia(profesionalId, diaSemana) {
    try {
      const { data, error } = await supabase
        .from('horarios_atencion')
        .select('hora_inicio, hora_fin')
        .eq('profesional_id', profesionalId)
        .eq('dia_semana', diaSemana)
        .eq('activo', true);

      if (error) throw error;
      return { success: true, data: data || [] };
    } catch (error) {
      console.error('[ReservaClienteController.obtenerHorariosDelDia]', error);
      return { success: false, error: error.message };
    }
  }

  // Slots ya ocupados para un profesional en una fecha (hora_inicio como 'HH:MM')
  static async obtenerSlotsOcupados(profesionalId, fecha) {
    try {
      const { data, error } = await supabase
        .from('reservas')
        .select('hora_inicio')
        .eq('profesional_id', profesionalId)
        .eq('fecha', fecha)
        .not('estado', 'in', '("cancelada","rechazada")');

      if (error) throw error;

      // Normalizar a 'HH:MM' para comparar con los slots generados
      const ocupados = (data || []).map(r => r.hora_inicio?.substring(0, 5));
      return { success: true, data: ocupados };
    } catch (error) {
      console.error('[ReservaClienteController.obtenerSlotsOcupados]', error);
      return { success: false, error: error.message };
    }
  }

  // Calcula los slots disponibles (libres) dados los horarios del profesional y las reservas existentes
  static calcularSlotsDisponibles(horarios, ocupados) {
    const todosLosSlots = [];
    horarios.forEach(h => {
      todosLosSlots.push(...generarSlotsDelRango(h.hora_inicio, h.hora_fin));
    });

    const disponibles = todosLosSlots.filter(s => !ocupados.includes(s));

    const manana = disponibles.filter(s => {
      const [h] = s.split(':').map(Number);
      return h < 13;
    });
    const tarde = disponibles.filter(s => {
      const [h] = s.split(':').map(Number);
      return h >= 13;
    });

    return { manana, tarde, todos: disponibles };
  }

  // Cancela una reserva (DELETE). Solo puede hacerlo el cliente dueño de la reserva.
  static async cancelarReserva(reservaId, clienteId) {
    try {
      const { error } = await supabase
        .from('reservas')
        .delete()
        .eq('id', reservaId)
        .eq('cliente_id', clienteId);
      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error('[ReservaClienteController.cancelarReserva]', error);
      return { success: false, error: error.message };
    }
  }

  // Crea la solicitud de turno con estado 'pendiente'
  static async solicitarReserva({ empresaId, profesionalId, clienteId, servicioId, fecha, horaInicio, precioTotal, montoSeña }) {
    try {
      const { data, error } = await supabase
        .from('reservas')
        .insert([{
          empresa_id: empresaId,
          profesional_id: profesionalId,
          cliente_id: clienteId,
          autor_id: clienteId,
          servicio_id: servicioId || null,
          fecha,
          hora_inicio: `${horaInicio}:00`,
          estado: 'pendiente',
          precio_total: precioTotal ?? null,
          monto_seña: montoSeña ?? null,
          seña_pagada: false,
          pagado: false,
        }])
        .select()
        .single();

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('[ReservaClienteController.solicitarReserva]', error);
      return { success: false, error: error.message };
    }
  }
}
