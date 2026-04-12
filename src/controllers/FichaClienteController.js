import { supabase } from '../config/supabase';
import { requirePermission, requireEmpresa } from '../utils/permissions';

export class FichaClienteController {
  // Obtener fichas de un cliente por su cliente_id (usuarios.id)
  static async obtenerFichasPorCliente(clienteId, profile) {
    const permError = requirePermission(profile, 'consultantes:read');
    if (permError) return permError;

    try {
      if (!clienteId) {
        return { success: true, data: [] };
      }

      const { data, error } = await supabase
        .from('fichas')
        .select(`
          id,
          nota,
          fecha,
          hora,
          cliente_id,
          sucursal_id,
          profesional_id,
          servicio_id,
          profesional:usuarios!profesional_id(nombre_completo),
          servicio:servicios!servicio_id(nombre)
        `)
        .eq('cliente_id', clienteId)
        .order('fecha', { ascending: false });

      if (error) throw error;

      const fichas = (data || []).map(f => ({
        id: f.id,
        nota: f.nota || '',
        fecha: f.fecha,
        hora: f.hora || '',
        cliente_id: f.cliente_id,
        sucursal_id: f.sucursal_id,
        profesional_id: f.profesional_id,
        profesional_nombre: f.profesional?.nombre_completo || '',
        servicio_id: f.servicio_id,
        servicio_nombre: f.servicio?.nombre || '',
      }));

      return { success: true, data: fichas };
    } catch (error) {
      console.error('[FichaClienteController.obtenerFichasPorCliente] Error:', error);
      return { success: false, error: error.message, data: [] };
    }
  }

  // Crear nueva ficha para un cliente (manual, sin reserva)
  static async crearFicha({ cliente_id, nota, fecha, hora, profesional_id }, profile) {
    const permError = requirePermission(profile, 'consultantes:write');
    if (permError) return permError;

    const empError = requireEmpresa(profile);
    if (empError) return empError;

    try {
      if (!cliente_id) {
        return { success: false, error: 'cliente_id es obligatorio' };
      }
      if (!nota || nota.trim() === '') {
        return { success: false, error: 'La nota es obligatoria' };
      }

      // Resolver sucursal_id a partir de la empresa del profesional
      const { data: sucursalRow, error: sucursalError } = await supabase
        .from('sucursales')
        .select('id')
        .eq('empresa_id', profile.empresaId)
        .limit(1)
        .single();

      if (sucursalError || !sucursalRow) {
        return { success: false, error: 'No se encontró sucursal para la empresa' };
      }

      const fechaFinal = fecha || new Date().toISOString().split('T')[0];
      const horaFinal  = hora  || new Date().toTimeString().slice(0, 8);

      const { data, error } = await supabase
        .from('fichas')
        .insert([{
          cliente_id,
          sucursal_id:    sucursalRow.id,
          profesional_id: profesional_id || null,
          fecha:          fechaFinal,
          hora:           horaFinal,
          nota:           nota.trim(),
        }])
        .select()
        .single();

      if (error) throw error;

      return {
        success: true,
        data: {
          id:               data.id,
          nota:             data.nota,
          fecha:            data.fecha,
          hora:             data.hora,
          cliente_id:       data.cliente_id,
          sucursal_id:      data.sucursal_id,
          profesional_id:   data.profesional_id,
          profesional_nombre: '',
          servicio_nombre:  '',
        },
        message: 'Ficha creada correctamente',
      };
    } catch (error) {
      console.error('[FichaClienteController.crearFicha] Error:', error);
      return { success: false, error: error.message };
    }
  }
}
