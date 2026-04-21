import { supabase } from '../config/supabase';
import { ReservaModel } from '../models/ReservaModel';
import { requireEmpresa, requirePermission } from '../utils/permissions';

export class ReservaController {
  // Función auxiliar para enriquecer reservas con datos de consultante y profesional
  static async enriquecerReservas(reservas) {
    if (!reservas || reservas.length === 0) return [];

    // Obtener IDs únicos
    const clienteIds = [...new Set(reservas.map(r => r.cliente_id).filter(Boolean))];
    const profesionalIds = [...new Set(reservas.map(r => r.profesional_id).filter(Boolean))];
    const servicioIds = [...new Set(reservas.map(r => r.servicio_id).filter(Boolean))];

    const todosIds = [...new Set([...clienteIds, ...profesionalIds])];

    // Fetch en paralelo: usuarios + servicios
    const [{ data: usuarios }, { data: servicios }] = await Promise.all([
      supabase.from('usuarios').select('id, nombre_completo, email, telefono').in('id', todosIds),
      servicioIds.length > 0
        ? supabase.from('servicios').select('id, nombre').in('id', servicioIds)
        : Promise.resolve({ data: [] }),
    ]);

    const usuariosMap = new Map((usuarios || []).map(u => [u.id, u]));
    const serviciosMap = new Map((servicios || []).map(s => [s.id, s]));

    return reservas.map(reserva => {
      const cliente = usuariosMap.get(reserva.cliente_id);
      const profesional = usuariosMap.get(reserva.profesional_id);
      const servicio = serviciosMap.get(reserva.servicio_id);

      return new ReservaModel({
        ...reserva,
        consultante_id: reserva.cliente_id,
        consultante_nombre: cliente?.nombre_completo || '',
        consultante_email: cliente?.email || '',
        consultante_telefono: cliente?.telefono || '',
        profesional_nombre: profesional?.nombre_completo || '',
        servicio: servicio?.nombre || null,
        tipo_sesion: servicio?.nombre || null,
      });
    });
  }

  // Helper: obtener profesional IDs de la empresa del profile
  // Retorna null para superadmin (sin filtro), array de IDs para el resto.
  // Array vacío significa que la empresa no tiene staff con rol admin/profesional en usuario_empresa.
  static async obtenerProfesionalIdsEmpresa(profile) {
    if (profile.rol === 'superadmin') return null; // null = sin filtro

    const { data: usuarioEmpresa } = await supabase
      .from('usuario_empresa')
      .select('usuario_id, roles!inner(rol)')
      .eq('empresa_id', profile.empresaId)
      .in('roles.rol', ['profesional', 'admin']);

    const ids = (usuarioEmpresa || []).map(r => r.usuario_id);

    if (ids.length === 0) {
      console.warn(
        `[ReservaController] La empresa ${profile.empresaId} no tiene profesionales ni admins en usuario_empresa`
      );
    }

    return ids;
  }

  // Obtener reservas por fecha con datos del consultante
  static async obtenerReservasPorFecha(fecha, profesionalId, profile) {
    const permError = requirePermission(profile, 'reservas:read');
    if (permError) return permError;

    try {
      let query = supabase
        .from('reservas')
        .select('*')
        .eq('fecha', fecha)
        .order('hora_inicio', { ascending: true });

      // Scoping por empresa
      if (profile.rol !== 'superadmin') {
        const empError = requireEmpresa(profile);
        if (empError) return empError;

        const profIds = await this.obtenerProfesionalIdsEmpresa(profile);
        if (profIds && profIds.length === 0) {
          return { success: true, data: [], warning: 'La empresa no tiene profesionales ni admins asignados' };
        }
        if (profIds) {
          query = query.in('profesional_id', profIds);
        }
      }

      const { data, error } = await query;

      if (error) throw error;

      const reservasEnriquecidas = await this.enriquecerReservas(data);

      return {
        success: true,
        data: reservasEnriquecidas,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // Obtener fechas con reservas del mes
  static async obtenerFechasConReservas(mesInicio, mesFin, profesionalId, profile) {
    const permError = requirePermission(profile, 'reservas:read');
    if (permError) return permError;

    try {
      let query = supabase
        .from('reservas')
        .select('fecha_hora_inicio')
        .gte('fecha_hora_inicio', mesInicio + 'T00:00:00')
        .lte('fecha_hora_inicio', mesFin + 'T23:59:59');

      if (profesionalId) {
        query = query.eq('profesional_id', profesionalId);
      }

      const { data, error } = await query;

      if (error) throw error;

      // Extraer fecha local AR (UTC-3) de cada timestamp
      const AR_OFFSET_MS = -3 * 60 * 60 * 1000;
      const mapped = (data || []).map(r => ({
        fecha: new Date(new Date(r.fecha_hora_inicio).getTime() + AR_OFFSET_MS)
          .toISOString().split('T')[0],
      }));

      return {
        success: true,
        data: mapped,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // Crear nueva reserva
  static async crearReserva(reservaData, profesionalId, profile) {
    const permError = requirePermission(profile, 'reservas:write');
    if (permError) return permError;

    const empError = requireEmpresa(profile);
    if (empError) return empError;

    try {
      const reserva = new ReservaModel({
        ...reservaData,
        profesional_id: profesionalId,
        cliente_id: reservaData.cliente_id || reservaData.consultante_id,
        autor_id: profile.usuarioId,
        empresa_id: profile.empresaId,
        estado: 'pendiente',
      });

      if (!reserva.isValidForCreate()) {
        return {
          success: false,
          error: 'Complete los campos obligatorios (cliente, fecha, hora, tipo de sesión)',
        };
      }

      const insertData = reserva.toJSON();

      const { data, error } = await supabase
        .from('reservas')
        .insert([insertData])
        .select('*');

      if (error) throw error;

      const [reservaEnriquecida] = await this.enriquecerReservas(data);

      return {
        success: true,
        data: reservaEnriquecida,
      };
    } catch (error) {
      console.error('[ReservaController.crearReserva] Error:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // Eliminar reserva
  static async eliminarReserva(id, profile) {
    const permError = requirePermission(profile, 'reservas:write');
    if (permError) return permError;

    try {
      const { error } = await supabase
        .from('reservas')
        .delete()
        .eq('id', id);

      if (error) throw error;

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // Actualizar estado de reserva
  static async actualizarEstado(id, nuevoEstado, profile) {
    const permError = requirePermission(profile, 'reservas:write');
    if (permError) return permError;

    try {
      const { error } = await supabase
        .from('reservas')
        .update({ estado: nuevoEstado })
        .eq('id', id);

      if (error) throw error;

      // Al confirmar: si la reserva tiene origen (es un cambio de horario), cancelar la original
      if (nuevoEstado === 'confirmada') {
        const { data: reserva } = await supabase
          .from('reservas')
          .select('reserva_origen_id')
          .eq('id', id)
          .single();

        if (reserva?.reserva_origen_id) {
          await supabase
            .from('reservas')
            .update({ estado: 'cancelada' })
            .eq('id', reserva.reserva_origen_id);
        }
      }

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // Obtener todas las reservas (scoped por empresa)
  static async obtenerTodas(profile) {
    const permError = requirePermission(profile, 'reservas:read');
    if (permError) return permError;

    try {
      let query = supabase
        .from('reservas')
        .select('*')
        .order('fecha', { ascending: false });

      // Scoping por empresa
      if (profile.rol !== 'superadmin') {
        const empError = requireEmpresa(profile);
        if (empError) return empError;

        const profIds = await this.obtenerProfesionalIdsEmpresa(profile);
        if (profIds && profIds.length === 0) return { success: true, data: [], warning: 'La empresa no tiene profesionales ni admins asignados' };
        if (profIds) {
          query = query.in('profesional_id', profIds);
        }
      }

      const { data, error } = await query;

      if (error) throw error;

      if (!data || data.length === 0) return { success: true, data: [] };

      // Obtener IDs únicos
      const clienteIds = [...new Set(data.map(r => r.cliente_id).filter(Boolean))];
      const profesionalIds = [...new Set(data.map(r => r.profesional_id).filter(Boolean))];
      const servicioIds = [...new Set(data.map(r => r.servicio_id).filter(Boolean))];
      const todosIds = [...new Set([...clienteIds, ...profesionalIds])];

      // Fetch usuarios + servicios en paralelo
      const [{ data: usuarios }, { data: servicios }] = await Promise.all([
        supabase.from('usuarios').select('id, nombre_completo, email, telefono').in('id', todosIds),
        servicioIds.length > 0
          ? supabase.from('servicios').select('id, nombre').in('id', servicioIds)
          : Promise.resolve({ data: [] }),
      ]);

      const usuariosMap = new Map((usuarios || []).map(u => [u.id, u]));
      const serviciosMap = new Map((servicios || []).map(s => [s.id, s]));

      const reservasEnriquecidas = data.map(reserva => {
        const cliente = usuariosMap.get(reserva.cliente_id);
        const profesional = usuariosMap.get(reserva.profesional_id);
        const servicio = serviciosMap.get(reserva.servicio_id);

        return {
          ...reserva,
          servicio: servicio?.nombre || null,
          consultante: cliente ? {
            nombre: cliente.nombre_completo || '',
            email: cliente.email || '',
            telefono: cliente.telefono || '',
          } : null,
          profesional: profesional ? {
            nombre: profesional.nombre_completo || '',
          } : null,
        };
      });

      return {
        success: true,
        data: reservasEnriquecidas,
      };
    } catch (error) {
      console.error('[ReservaController.obtenerTodas] Error:', error);
      return {
        success: false,
        error: error.message,
        data: [],
      };
    }
  }

  // Obtener resumen de caja diario (scoped por empresa)
  static async obtenerResumenCajaDiario(fecha, profile) {
    const permError = requirePermission(profile, 'reportes:read');
    if (permError) return permError;

    try {
      // Scoping por empresa: obtener sucursal_ids de la empresa
      let sucursalIds = null;
      if (profile.rol !== 'superadmin') {
        const empError = requireEmpresa(profile);
        if (empError) return empError;

        const { data: sucursales } = await supabase
          .from('sucursales')
          .select('id')
          .eq('empresa_id', profile.empresaId);

        sucursalIds = (sucursales || []).map(s => s.id);
        if (sucursalIds.length === 0) {
          return {
            success: true,
            data: { totalRecaudado: 0, desglosePagos: {}, transaccionesPendientes: [], cantidadPagadas: 0, cantidadPendientes: 0 },
          };
        }
      }

      // 1. Pagos del día desde pagos_reservas (filtrado por created_at::date = fecha)
      let pagosQuery = supabase
        .from('pagos_reservas')
        .select('reserva_id, monto, metodo_pago')
        .gte('created_at', `${fecha}T00:00:00`)
        .lte('created_at', `${fecha}T23:59:59`);

      if (sucursalIds) {
        pagosQuery = pagosQuery.in('sucursal_id', sucursalIds);
      }

      const { data: pagos, error: pagosError } = await pagosQuery;
      if (pagosError) throw pagosError;

      const totalRecaudado = (pagos || []).reduce((sum, p) => sum + parseFloat(p.monto || 0), 0);

      const desglosePagos = {};
      (pagos || []).forEach(p => {
        const metodo = p.metodo_pago || 'sin_especificar';
        desglosePagos[metodo] = (desglosePagos[metodo] || 0) + parseFloat(p.monto || 0);
      });

      // 2. Reservas pendientes del día (no pagadas, no canceladas)
      let reservasQuery = supabase
        .from('reservas')
        .select('*')
        .eq('fecha', fecha)
        .neq('estado', 'cancelada')
        .eq('pagado', false);

      if (sucursalIds) {
        reservasQuery = reservasQuery.in('sucursal_id', sucursalIds);
      }

      const { data: reservasPendientesRaw, error: reservasError } = await reservasQuery;
      if (reservasError) throw reservasError;

      const transaccionesPendientes = await this.enriquecerReservas(reservasPendientesRaw || []);

      return {
        success: true,
        data: {
          totalRecaudado,
          desglosePagos,
          transaccionesPendientes,
          cantidadPagadas: new Set((pagos || []).map(p => p.reserva_id)).size,
          cantidadPendientes: transaccionesPendientes.length,
        },
      };
    } catch (error) {
      console.error('[ReservaController.obtenerResumenCajaDiario] Error:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // Actualizar campos de seña de una reserva
  static async actualizarSeña(id, { monto_seña, monto_restante, seña_pagada, cbu_alias }, profile) {
    const permError = requirePermission(profile, 'reservas:write');
    if (permError) return permError;

    try {
      const updateData = {};
      if (monto_seña !== undefined) updateData.monto_seña = monto_seña === '' || monto_seña === null ? null : parseFloat(monto_seña);
      if (monto_restante !== undefined) updateData.monto_restante = monto_restante === '' || monto_restante === null ? null : parseFloat(monto_restante);
      if (seña_pagada !== undefined) updateData.seña_pagada = seña_pagada;
      if (cbu_alias !== undefined) updateData.cbu_alias = cbu_alias || null;

      const { error } = await supabase
        .from('reservas')
        .update(updateData)
        .eq('id', id);

      if (error) throw error;
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Registrar cobro de seña: inserta en pagos_reservas y marca seña_pagada = true
  static async registrarSeña(id, { monto, metodo_pago }, profile) {
    const permError = requirePermission(profile, 'reservas:write');
    if (permError) return permError;

    try {
      const { data: reserva, error: fetchError } = await supabase
        .from('reservas')
        .select('sucursal_id, precio_total, monto_seña')
        .eq('id', id)
        .single();

      if (fetchError) throw fetchError;

      if (!reserva.sucursal_id) {
        return { success: false, error: 'La reserva no tiene sucursal asignada' };
      }

      const montoNumerico = parseFloat(monto);

      // 1. Registrar el pago de la seña en pagos_reservas
      const { error: pagoError } = await supabase
        .from('pagos_reservas')
        .insert({
          reserva_id:     id,
          sucursal_id:    reserva.sucursal_id,
          monto:          montoNumerico,
          metodo_pago:    metodo_pago,
          registrado_por: profile.usuarioId,
        });

      if (pagoError) throw pagoError;

      // 2. Marcar seña como pagada y calcular monto restante
      const montoRestante = reserva.precio_total != null
        ? Math.max(0, reserva.precio_total - montoNumerico)
        : null;

      const { error: updateError } = await supabase
        .from('reservas')
        .update({
          seña_pagada:    true,
          monto_seña:     montoNumerico,
          monto_restante: montoRestante,
          metodo_pago:    metodo_pago,
        })
        .eq('id', id);

      if (updateError) throw updateError;

      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Guardar nota en la reserva (sin tocar estado ni pago)
  static async guardarNota(id, nota, profile) {
    const permError = requirePermission(profile, 'reservas:write');
    if (permError) return permError;

    try {
      const { error } = await supabase
        .from('reservas')
        .update({ nota: nota ?? null })
        .eq('id', id);

      if (error) throw error;
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Registrar pago de una reserva
  static async registrarPago(id, pagoData, profile) {
    const permError = requirePermission(profile, 'reservas:write');
    if (permError) return permError;

    try {
      // Determinar si el pago está completo:
      // pagado=true Y (no hay seña o la seña también está pagada)
      const tieneSeña = pagoData.monto_seña != null && parseFloat(pagoData.monto_seña || 0) > 0;
      const completamentePagado = pagoData.pagado && (!tieneSeña || pagoData.seña_pagada);

      // Si no está completamente pagado, solo actualizar campos
      if (!completamentePagado) {
        const updateData = {};
        if (pagoData.precio_total !== undefined) updateData.precio_total = pagoData.precio_total;
        if (pagoData.metodo_pago !== undefined) updateData.metodo_pago = pagoData.metodo_pago;
        if (pagoData.pagado !== undefined) updateData.pagado = pagoData.pagado;
        if (pagoData.monto_seña !== undefined) updateData.monto_seña = pagoData.monto_seña === '' || pagoData.monto_seña === null ? null : parseFloat(pagoData.monto_seña);
        if (pagoData.seña_pagada !== undefined) updateData.seña_pagada = pagoData.seña_pagada;
        if (pagoData.nota !== undefined) updateData.nota = pagoData.nota;

        const { error } = await supabase
          .from('reservas')
          .update(updateData)
          .eq('id', id);

        if (error) throw error;
        return { success: true };
      }

      // === COBRO COMPLETO: archivar en fichas + eliminar reserva ===

      // 1. Obtener datos completos de la reserva
      const { data: reserva, error: fetchError } = await supabase
        .from('reservas')
        .select('*')
        .eq('id', id)
        .single();

      if (fetchError) throw fetchError;

      const sucursalId = reserva.sucursal_id || pagoData.sucursal_id || null;
      if (!sucursalId) {
        return { success: false, error: 'No hay sucursal seleccionada. Elegí una sucursal desde el menú lateral.' };
      }

      const notaFinal = pagoData.nota ?? reserva.nota ?? null;

      // 2. Crear ficha — es el paso crítico; si falla, no se borra la reserva
      const { error: fichaError } = await supabase.from('fichas').insert({
        cliente_id:     reserva.cliente_id,
        sucursal_id:    sucursalId,
        profesional_id: reserva.profesional_id,
        servicio_id:    reserva.servicio_id ?? null,
        fecha:          reserva.fecha,
        hora:           reserva.hora_inicio,
        nota:           notaFinal,
      });

      if (fichaError) throw new Error(`Error al crear ficha: ${fichaError.message}`);

      // 3. Registrar pago (no bloqueante — si falla se avisa pero la ficha ya existe)
      const { error: pagoError } = await supabase.from('pagos_reservas').insert({
        reserva_id:     id,
        sucursal_id:    sucursalId,
        monto:          pagoData.precio_total,
        metodo_pago:    pagoData.metodo_pago,
        registrado_por: profile.usuarioId,
      });

      if (pagoError) console.warn('[registrarPago] pagoError:', pagoError.message);

      // 4. Ficha creada OK → eliminar la reserva (pagos_reservas se borra en cascade)
      const { error: deleteError } = await supabase
        .from('reservas')
        .delete()
        .eq('id', id);

      if (deleteError) throw deleteError;

      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Actualizar reserva completa
  static async actualizarReserva(id, reservaData, profile) {
    const permError = requirePermission(profile, 'reservas:write');
    if (permError) return permError;

    try {
      const reserva = new ReservaModel({
        ...reservaData,
        cliente_id: reservaData.cliente_id || reservaData.consultante_id,
      });

      if (!reserva.isValid()) {
        return {
          success: false,
          error: 'Complete los campos obligatorios',
        };
      }

      const updateData = reserva.toJSON();

      const { data, error } = await supabase
        .from('reservas')
        .update(updateData)
        .eq('id', id)
        .select('*');

      if (error) throw error;

      const [reservaEnriquecida] = await this.enriquecerReservas(data);

      return {
        success: true,
        data: reservaEnriquecida,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // Cerrar sesión: marca la reserva como completada, crea ficha y registra pago
  static async cerrarSesion(id, { precio_total, metodo_pago, nota }, profile) {
    const permError = requirePermission(profile, 'reservas:write');
    if (permError) return permError;

    try {
      // 1. Obtener datos completos de la reserva
      const { data: reserva, error: fetchError } = await supabase
        .from('reservas')
        .select('*')
        .eq('id', id)
        .single();

      if (fetchError) throw fetchError;

      if (!reserva.sucursal_id) {
        return { success: false, error: 'La reserva no tiene sucursal asignada' };
      }

      const montoNumerico = parseFloat(precio_total);
      const tienePago = precio_total !== undefined && precio_total !== '' && !isNaN(montoNumerico);

      // 2. Marcar reserva como completada si hay monto
      if (tienePago) {
        const updateData = { estado: 'completada', pagado: true, precio_total: montoNumerico };
        if (metodo_pago) updateData.metodo_pago = metodo_pago;

        const { error: reservaError } = await supabase
          .from('reservas')
          .update(updateData)
          .eq('id', id);

        if (reservaError) throw reservaError;
      }

      // 3. Insertar ficha con el nuevo schema
      const { error: fichaError } = await supabase
        .from('fichas')
        .insert({
          cliente_id:     reserva.cliente_id,
          sucursal_id:    reserva.sucursal_id,
          profesional_id: reserva.profesional_id,
          servicio_id:    reserva.servicio_id ?? null,
          fecha:          reserva.fecha,
          hora:           reserva.hora_inicio,
          nota:           nota ?? null,
        });

      if (fichaError) throw fichaError;

      // 4. Registrar pago si hay monto
      if (tienePago) {
        const { error: pagoError } = await supabase
          .from('pagos_reservas')
          .insert({
            reserva_id:     id,
            sucursal_id:    reserva.sucursal_id,
            monto:          montoNumerico,
            metodo_pago:    metodo_pago,
            registrado_por: profile.usuarioId,
          });

        if (pagoError) throw pagoError;
      }

      return { success: true };
    } catch (error) {
      console.error('[cerrarSesion] Error:', error);
      return { success: false, error: error.message };
    }
  }

  // Obtener reserva por ID con su ficha asociada si existe
  static async obtenerReservaPorId(id, profile) {
    const permError = requirePermission(profile, 'reservas:read');
    if (permError) return permError;

    try {
      const { data, error } = await supabase
        .from('reservas')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;

      const [reservaEnriquecida] = await this.enriquecerReservas([data]);

      const { data: ficha } = await supabase
        .from('fichas')
        .select('id, nota, fecha')
        .eq('reserva_id', id)
        .maybeSingle();

      return {
        success: true,
        data: { ...reservaEnriquecida, ficha: ficha || null },
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Obtener todas las reservas de un cliente específico (scoped por empresa)
  static async obtenerReservasPorCliente(clienteId, profile) {
    const permError = requirePermission(profile, 'reservas:read');
    if (permError) return permError;

    try {
      const empError = requireEmpresa(profile);
      if (empError) return empError;

      const profIds = await this.obtenerProfesionalIdsEmpresa(profile);

      let query = supabase
        .from('reservas')
        .select('*')
        .eq('cliente_id', clienteId)
        .order('fecha', { ascending: false });

      if (profIds && profIds.length > 0) {
        query = query.in('profesional_id', profIds);
      }

      const { data, error } = await query;
      if (error) throw error;

      const reservasEnriquecidas = await this.enriquecerReservas(data || []);

      // Traer notas de fichas para este historial
      const reservaIds = reservasEnriquecidas.map(r => r.id).filter(Boolean);
      let fichasMap = new Map();
      if (reservaIds.length > 0) {
        const { data: fichas } = await supabase
          .from('fichas')
          .select('reserva_id, nota')
          .in('reserva_id', reservaIds);
        fichasMap = new Map((fichas || []).map(f => [f.reserva_id, f]));
      }

      const conFichas = reservasEnriquecidas.map(r => ({
        ...r,
        ficha: fichasMap.get(r.id) || null,
      }));

      return { success: true, data: conFichas };
    } catch (error) {
      console.error('[obtenerReservasPorCliente] Error:', error);
      return { success: false, error: error.message, data: [] };
    }
  }
}
