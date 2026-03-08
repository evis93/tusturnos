module.exports = [
"[project]/Desktop/03.MENSANA/mensana-next/src/models/ReservaModel.js [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ReservaModel",
    ()=>ReservaModel
]);
class ReservaModel {
    constructor(data = {}){
        this.id = data.id || null;
        this.empresa_id = data.empresa_id || null;
        this.profesional_id = data.profesional_id || null;
        this.cliente_id = data.cliente_id || data.consultante_id || null;
        this.autor_id = data.autor_id || null;
        this.servicio_id = data.servicio_id || data.tipo_sesion_id || null;
        this.sucursal_id = data.sucursal_id || null;
        // Datos del cliente (enriquecidos)
        this.consultante_id = this.cliente_id;
        this.consultante_nombre = data.consultante_nombre || '';
        this.consultante_email = data.consultante_email || '';
        this.consultante_telefono = data.consultante_telefono || '';
        // Datos del profesional (enriquecidos)
        this.profesional_nombre = data.profesional_nombre || '';
        // Nombre del servicio (enriquecido)
        this.servicio_nombre = data.servicio_nombre || '';
        this.fecha = data.fecha || '';
        this.hora_inicio = data.hora_inicio || '';
        this.estado = data.estado || 'pendiente';
        // Campos de pago
        const precioTotal = data.precio_total;
        this.precio_total = precioTotal === '' || precioTotal === null || precioTotal === undefined ? null : parseFloat(precioTotal);
        const montoSeña = data.monto_seña;
        this.monto_seña = montoSeña === '' || montoSeña === null || montoSeña === undefined ? null : parseFloat(montoSeña);
        this.seña_pagada = data.seña_pagada || false;
        this.pagado = data.pagado || false;
        this.metodo_pago = data.metodo_pago || null;
        // Campos de auditoría
        this.recordatorio_enviado = data.recordatorio_enviado || false;
        this.created_at = data.created_at || null;
    }
    // Validaciones
    isValid() {
        return this.cliente_id !== null && this.fecha !== '' && this.hora_inicio !== '';
    }
    // Formateo de hora para mostrar
    getHoraFormateada() {
        if (!this.hora_inicio) return '';
        return this.hora_inicio.substring(0, 5);
    }
    // Convertir a objeto para Supabase
    toJSON() {
        return {
            empresa_id: this.empresa_id,
            profesional_id: this.profesional_id,
            cliente_id: this.cliente_id,
            autor_id: this.autor_id,
            servicio_id: this.servicio_id,
            sucursal_id: this.sucursal_id,
            fecha: this.fecha,
            hora_inicio: this.hora_inicio,
            estado: this.estado,
            precio_total: this.precio_total,
            monto_seña: this.monto_seña,
            seña_pagada: this.seña_pagada,
            pagado: this.pagado,
            metodo_pago: this.metodo_pago
        };
    }
}
}),
"[project]/Desktop/03.MENSANA/mensana-next/src/utils/permissions.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "hasPermission",
    ()=>hasPermission,
    "requireEmpresa",
    ()=>requireEmpresa,
    "requirePermission",
    ()=>requirePermission
]);
const ROLE_PERMISSIONS = {
    superadmin: [
        '*'
    ],
    admin: [
        'agenda:read',
        'agenda:write',
        'reservas:read',
        'reservas:write',
        'reportes:read',
        'profesionales:read',
        'profesionales:write',
        'horarios:read',
        'horarios:write',
        'consultantes:read',
        'consultantes:write',
        'servicios:read',
        'servicios:write',
        'admin:dashboard'
    ],
    profesional: [
        'agenda:read',
        'agenda:write',
        'reservas:read',
        'reservas:write',
        'profesionales:read',
        'horarios:read',
        'horarios:write',
        'consultantes:read',
        'consultantes:write'
    ],
    cliente: [
        'explorar:read',
        'favoritos:read',
        'favoritos:write',
        'citas:read'
    ]
};
function hasPermission(rol, permission) {
    if (!rol) return false;
    const perms = ROLE_PERMISSIONS[rol];
    if (!perms) return false;
    if (perms.includes('*')) return true;
    return perms.includes(permission);
}
function requirePermission(profile, permission) {
    if (!hasPermission(profile?.rol, permission)) {
        return {
            success: false,
            error: 'Sin permisos',
            code: 'FORBIDDEN'
        };
    }
    return null;
}
function requireEmpresa(profile) {
    if (!profile?.empresaId) {
        return {
            success: false,
            error: 'Sin empresa asociada',
            code: 'NO_EMPRESA'
        };
    }
    return null;
}
}),
"[project]/Desktop/03.MENSANA/mensana-next/src/controllers/ReservaController.js [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ReservaController",
    ()=>ReservaController
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$src$2f$config$2f$supabase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/03.MENSANA/mensana-next/src/config/supabase.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$src$2f$models$2f$ReservaModel$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/03.MENSANA/mensana-next/src/models/ReservaModel.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$src$2f$utils$2f$permissions$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/03.MENSANA/mensana-next/src/utils/permissions.ts [app-ssr] (ecmascript)");
;
;
;
class ReservaController {
    // Función auxiliar para enriquecer reservas con datos de consultante y profesional
    static async enriquecerReservas(reservas) {
        if (!reservas || reservas.length === 0) return [];
        // Obtener IDs únicos
        const clienteIds = [
            ...new Set(reservas.map((r)=>r.cliente_id).filter(Boolean))
        ];
        const profesionalIds = [
            ...new Set(reservas.map((r)=>r.profesional_id).filter(Boolean))
        ];
        // Obtener datos de usuarios (clientes y profesionales)
        const todosIds = [
            ...new Set([
                ...clienteIds,
                ...profesionalIds
            ])
        ];
        const { data: usuarios } = await __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$src$2f$config$2f$supabase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["supabase"].from('usuarios').select('id, nombre_completo, email, telefono').in('id', todosIds);
        // Crear mapa para búsqueda rápida
        const usuariosMap = new Map((usuarios || []).map((u)=>[
                u.id,
                u
            ]));
        // Enriquecer cada reserva
        return reservas.map((reserva)=>{
            const cliente = usuariosMap.get(reserva.cliente_id);
            const profesional = usuariosMap.get(reserva.profesional_id);
            return new __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$src$2f$models$2f$ReservaModel$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ReservaModel"]({
                ...reserva,
                consultante_id: reserva.cliente_id,
                consultante_nombre: cliente?.nombre_completo || '',
                consultante_email: cliente?.email || '',
                consultante_telefono: cliente?.telefono || '',
                profesional_nombre: profesional?.nombre_completo || '',
                servicio_nombre: reserva.servicios?.nombre || ''
            });
        });
    }
    // Helper: obtener profesional IDs de la empresa del profile
    static async obtenerProfesionalIdsEmpresa(profile) {
        if (profile.rol === 'superadmin') return null; // null = sin filtro
        const { data: usuarioEmpresa } = await __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$src$2f$config$2f$supabase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["supabase"].from('usuario_empresa').select('usuario_id, roles!inner(nombre)').eq('empresa_id', profile.empresaId).in('roles.nombre', [
            'profesional',
            'admin'
        ]);
        return (usuarioEmpresa || []).map((r)=>r.usuario_id);
    }
    // Obtener reservas por fecha con datos del consultante
    static async obtenerReservasPorFecha(fecha, profesionalId, profile) {
        const permError = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$src$2f$utils$2f$permissions$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["requirePermission"])(profile, 'reservas:read');
        if (permError) return permError;
        try {
            let query = __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$src$2f$config$2f$supabase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["supabase"].from('reservas').select('*, servicios(nombre)').eq('fecha', fecha).order('hora_inicio', {
                ascending: true
            });
            // Scoping por empresa
            if (profile.rol !== 'superadmin') {
                const empError = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$src$2f$utils$2f$permissions$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["requireEmpresa"])(profile);
                if (empError) return empError;
                const profIds = await this.obtenerProfesionalIdsEmpresa(profile);
                if (profIds && profIds.length === 0) {
                    return {
                        success: true,
                        data: []
                    };
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
                data: reservasEnriquecidas
            };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }
    // Obtener fechas con reservas del mes
    static async obtenerFechasConReservas(mesInicio, mesFin, profesionalId, profile) {
        const permError = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$src$2f$utils$2f$permissions$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["requirePermission"])(profile, 'reservas:read');
        if (permError) return permError;
        try {
            let query = __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$src$2f$config$2f$supabase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["supabase"].from('reservas').select('fecha').gte('fecha', mesInicio).lte('fecha', mesFin);
            if (profesionalId) {
                query = query.eq('profesional_id', profesionalId);
            }
            const { data, error } = await query;
            if (error) throw error;
            return {
                success: true,
                data: data || []
            };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }
    // Crear nueva reserva
    static async crearReserva(reservaData, profesionalId, profile) {
        const permError = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$src$2f$utils$2f$permissions$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["requirePermission"])(profile, 'reservas:write');
        if (permError) return permError;
        try {
            const reserva = new __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$src$2f$models$2f$ReservaModel$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ReservaModel"]({
                ...reservaData,
                profesional_id: profesionalId,
                cliente_id: reservaData.cliente_id || reservaData.consultante_id,
                autor_id: profile.usuarioId,
                empresa_id: profile.empresaId
            });
            if (!reserva.isValid()) {
                return {
                    success: false,
                    error: 'Complete los campos obligatorios (cliente, fecha, hora, tipo de sesión)'
                };
            }
            const insertData = reserva.toJSON();
            const { data, error } = await __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$src$2f$config$2f$supabase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["supabase"].from('reservas').insert([
                insertData
            ]).select('*');
            if (error) throw error;
            const [reservaEnriquecida] = await this.enriquecerReservas(data);
            return {
                success: true,
                data: reservaEnriquecida
            };
        } catch (error) {
            console.error('[ReservaController.crearReserva] Error:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }
    // Eliminar reserva
    static async eliminarReserva(id, profile) {
        const permError = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$src$2f$utils$2f$permissions$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["requirePermission"])(profile, 'reservas:write');
        if (permError) return permError;
        try {
            const { error } = await __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$src$2f$config$2f$supabase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["supabase"].from('reservas').delete().eq('id', id);
            if (error) throw error;
            return {
                success: true
            };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }
    // Actualizar estado de reserva
    static async actualizarEstado(id, nuevoEstado, profile) {
        const permError = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$src$2f$utils$2f$permissions$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["requirePermission"])(profile, 'reservas:write');
        if (permError) return permError;
        try {
            const { error } = await __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$src$2f$config$2f$supabase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["supabase"].from('reservas').update({
                estado: nuevoEstado
            }).eq('id', id);
            if (error) throw error;
            return {
                success: true
            };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }
    // Obtener todas las reservas (scoped por empresa)
    static async obtenerTodas(profile) {
        const permError = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$src$2f$utils$2f$permissions$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["requirePermission"])(profile, 'reservas:read');
        if (permError) return permError;
        try {
            let query = __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$src$2f$config$2f$supabase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["supabase"].from('reservas').select('*').order('fecha', {
                ascending: false
            });
            // Scoping por empresa
            if (profile.rol !== 'superadmin') {
                const empError = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$src$2f$utils$2f$permissions$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["requireEmpresa"])(profile);
                if (empError) return empError;
                const profIds = await this.obtenerProfesionalIdsEmpresa(profile);
                if (profIds && profIds.length === 0) return {
                    success: true,
                    data: []
                };
                if (profIds) {
                    query = query.in('profesional_id', profIds);
                }
            }
            const { data, error } = await query;
            if (error) throw error;
            if (!data || data.length === 0) return {
                success: true,
                data: []
            };
            // Obtener IDs únicos
            const clienteIds = [
                ...new Set(data.map((r)=>r.cliente_id).filter(Boolean))
            ];
            const profesionalIds = [
                ...new Set(data.map((r)=>r.profesional_id).filter(Boolean))
            ];
            const todosIds = [
                ...new Set([
                    ...clienteIds,
                    ...profesionalIds
                ])
            ];
            // Obtener datos de usuarios
            const { data: usuarios } = await __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$src$2f$config$2f$supabase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["supabase"].from('usuarios').select('id, nombre_completo, email, telefono').in('id', todosIds);
            const usuariosMap = new Map((usuarios || []).map((u)=>[
                    u.id,
                    u
                ]));
            const reservasEnriquecidas = data.map((reserva)=>{
                const cliente = usuariosMap.get(reserva.cliente_id);
                const profesional = usuariosMap.get(reserva.profesional_id);
                return {
                    ...reserva,
                    consultante: cliente ? {
                        nombre: cliente.nombre_completo || '',
                        email: cliente.email || '',
                        telefono: cliente.telefono || ''
                    } : null,
                    profesional: profesional ? {
                        nombre: profesional.nombre_completo || ''
                    } : null
                };
            });
            return {
                success: true,
                data: reservasEnriquecidas
            };
        } catch (error) {
            console.error('[ReservaController.obtenerTodas] Error:', error);
            return {
                success: false,
                error: error.message,
                data: []
            };
        }
    }
    // Obtener resumen de caja diario (scoped por empresa)
    static async obtenerResumenCajaDiario(fecha, profile) {
        const permError = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$src$2f$utils$2f$permissions$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["requirePermission"])(profile, 'reportes:read');
        if (permError) return permError;
        try {
            let query = __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$src$2f$config$2f$supabase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["supabase"].from('reservas').select('*').eq('fecha', fecha);
            // Scoping por empresa
            if (profile.rol !== 'superadmin') {
                const empError = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$src$2f$utils$2f$permissions$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["requireEmpresa"])(profile);
                if (empError) return empError;
                const profIds = await this.obtenerProfesionalIdsEmpresa(profile);
                if (profIds && profIds.length === 0) {
                    return {
                        success: true,
                        data: {
                            totalRecaudado: 0,
                            desglosePagos: {},
                            transaccionesPendientes: [],
                            cantidadPagadas: 0,
                            cantidadPendientes: 0
                        }
                    };
                }
                if (profIds) {
                    query = query.in('profesional_id', profIds);
                }
            }
            const { data: reservas, error } = await query;
            if (error) throw error;
            const reservasPagadas = (reservas || []).filter((r)=>r.pagado === true);
            const totalRecaudado = reservasPagadas.reduce((sum, r)=>sum + (r.precio_total || 0), 0);
            const desglosePagos = {};
            reservasPagadas.forEach((r)=>{
                const metodo = r.metodo_pago || 'sin_especificar';
                if (!desglosePagos[metodo]) {
                    desglosePagos[metodo] = 0;
                }
                desglosePagos[metodo] += r.precio_total || 0;
            });
            const reservasPendientes = (reservas || []).filter((r)=>r.pagado !== true);
            const transaccionesPendientes = await this.enriquecerReservas(reservasPendientes);
            return {
                success: true,
                data: {
                    totalRecaudado,
                    desglosePagos,
                    transaccionesPendientes,
                    cantidadPagadas: reservasPagadas.length,
                    cantidadPendientes: transaccionesPendientes.length
                }
            };
        } catch (error) {
            console.error('[ReservaController.obtenerResumenCajaDiario] Error:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }
    // Registrar pago de una reserva
    static async registrarPago(id, pagoData, profile) {
        const permError = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$src$2f$utils$2f$permissions$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["requirePermission"])(profile, 'reservas:write');
        if (permError) return permError;
        try {
            const updateData = {};
            if (pagoData.precio_total !== undefined) updateData.precio_total = pagoData.precio_total;
            if (pagoData.metodo_pago !== undefined) updateData.metodo_pago = pagoData.metodo_pago;
            if (pagoData.pagado !== undefined) updateData.pagado = pagoData.pagado;
            const { error } = await __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$src$2f$config$2f$supabase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["supabase"].from('reservas').update(updateData).eq('id', id);
            if (error) throw error;
            return {
                success: true
            };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }
    // Actualizar reserva completa
    static async actualizarReserva(id, reservaData, profile) {
        const permError = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$src$2f$utils$2f$permissions$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["requirePermission"])(profile, 'reservas:write');
        if (permError) return permError;
        try {
            const reserva = new __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$src$2f$models$2f$ReservaModel$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ReservaModel"]({
                ...reservaData,
                cliente_id: reservaData.cliente_id || reservaData.consultante_id
            });
            if (!reserva.isValid()) {
                return {
                    success: false,
                    error: 'Complete los campos obligatorios'
                };
            }
            const updateData = reserva.toJSON();
            const { data, error } = await __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$src$2f$config$2f$supabase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["supabase"].from('reservas').update(updateData).eq('id', id).select('*');
            if (error) throw error;
            const [reservaEnriquecida] = await this.enriquecerReservas(data);
            return {
                success: true,
                data: reservaEnriquecida
            };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }
}
}),
"[project]/Desktop/03.MENSANA/mensana-next/src/controllers/ProfesionalController.js [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ProfesionalController",
    ()=>ProfesionalController
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$src$2f$config$2f$supabase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/03.MENSANA/mensana-next/src/config/supabase.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$src$2f$utils$2f$permissions$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/03.MENSANA/mensana-next/src/utils/permissions.ts [app-ssr] (ecmascript)");
;
;
class ProfesionalController {
    // Obtener todos los profesionales activos (scoped por empresa)
    // Un profesional es un usuario con rol 'profesional' o 'admin' en usuario_empresa
    static async obtenerProfesionales(profile) {
        const permError = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$src$2f$utils$2f$permissions$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["requirePermission"])(profile, 'profesionales:read');
        if (permError) return permError;
        try {
            // Mensana ve todo; los demás filtran por empresa
            let empresaFilter = null;
            if (profile.rol !== 'superadmin') {
                const empError = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$src$2f$utils$2f$permissions$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["requireEmpresa"])(profile);
                if (empError) return empError;
                empresaFilter = profile.empresaId;
            }
            // Obtener usuarios que son profesionales/admins en la empresa
            let query = __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$src$2f$config$2f$supabase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["supabase"].from('usuario_empresa').select(`
          usuario_id,
          roles!inner(nombre),
          usuarios!inner(
            id,
            nombre_completo,
            email,
            telefono,
            avatar_url
          )
        `).in('roles.nombre', [
                'profesional',
                'admin'
            ]);
            if (empresaFilter) {
                query = query.eq('empresa_id', empresaFilter);
            }
            const { data, error } = await query;
            if (error) throw error;
            const ROL_PRIORIDAD = {
                superadmin: 4,
                admin: 3,
                profesional: 2,
                cliente: 1
            };
            const profMap = new Map();
            (data || []).forEach((item)=>{
                const id = item.usuarios.id;
                const rol = item.roles.nombre;
                const existing = profMap.get(id);
                if (!existing || (ROL_PRIORIDAD[rol] || 0) > (ROL_PRIORIDAD[existing.rol] || 0)) {
                    profMap.set(id, {
                        id,
                        usuario_id: id,
                        nombre_completo: item.usuarios.nombre_completo || '',
                        email: item.usuarios.email || '',
                        telefono: item.usuarios.telefono || '',
                        avatar_url: item.usuarios.avatar_url || '',
                        rol
                    });
                }
            });
            const profesionales = Array.from(profMap.values());
            profesionales.sort((a, b)=>a.nombre_completo.localeCompare(b.nombre_completo));
            return {
                success: true,
                data: profesionales
            };
        } catch (error) {
            console.error('[obtenerProfesionales] Error:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }
    // Obtener profesional por ID (usuario_id)
    static async obtenerProfesionalPorId(id, profile) {
        const permError = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$src$2f$utils$2f$permissions$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["requirePermission"])(profile, 'profesionales:read');
        if (permError) return permError;
        try {
            const { data, error } = await __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$src$2f$config$2f$supabase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["supabase"].from('usuarios').select('id, nombre_completo, email, telefono, avatar_url').eq('id', id).single();
            if (error) throw error;
            return {
                success: true,
                data: {
                    id: data.id,
                    usuario_id: data.id,
                    nombre_completo: data.nombre_completo,
                    email: data.email,
                    telefono: data.telefono,
                    avatar_url: data.avatar_url
                }
            };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }
    // Crear nuevo profesional con cuenta de usuario completa
    static async crearProfesional(profesionalData, profile) {
        const permError = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$src$2f$utils$2f$permissions$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["requirePermission"])(profile, 'profesionales:write');
        if (permError) return permError;
        const empError = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$src$2f$utils$2f$permissions$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["requireEmpresa"])(profile);
        if (empError) return empError;
        try {
            const { nombre, email, telefono, esAdmin } = profesionalData;
            if (!nombre || !email) {
                return {
                    success: false,
                    error: 'Complete los campos obligatorios (nombre y email)'
                };
            }
            const emailNormalizado = email.trim().toLowerCase();
            const passwordTemporal = '123456';
            // 1. Crear auth user con contraseña temporal (sin necesidad de email)
            const { data: authData, error: authError } = await __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$src$2f$config$2f$supabase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["supabaseAdmin"].auth.admin.createUser({
                email: emailNormalizado,
                password: passwordTemporal,
                email_confirm: true,
                user_metadata: {
                    nombre_completo: nombre
                }
            });
            let authUserId;
            if (authError) {
                // Si el email ya tiene cuenta en Auth, reusar el auth_user_id existente sin tocar la contraseña
                if (authError.status === 422 || authError.message?.includes('already been registered')) {
                    const { data: byEmail } = await __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$src$2f$config$2f$supabase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["supabase"].from('usuarios').select('id, auth_user_id').eq('email', emailNormalizado).maybeSingle();
                    if (byEmail?.auth_user_id) {
                        authUserId = byEmail.auth_user_id;
                    // NO se resetea la contraseña: el usuario ya tiene acceso con sus credenciales actuales
                    } else {
                        throw new Error('El email ya está registrado. Si es un profesional existente, editalo desde la lista.');
                    }
                } else {
                    throw new Error(`Error al crear cuenta: ${authError.message}`);
                }
            } else {
                authUserId = authData.user.id;
            }
            // 2. Verificar/crear registro en usuarios
            let usuarioId;
            const { data: usuarioExistente } = await __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$src$2f$config$2f$supabase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["supabase"].from('usuarios').select('id').eq('email', emailNormalizado).maybeSingle();
            if (usuarioExistente) {
                usuarioId = usuarioExistente.id;
                // Vincular auth_user_id si estaba vacío
                await __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$src$2f$config$2f$supabase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["supabase"].from('usuarios').update({
                    auth_user_id: authUserId
                }).eq('id', usuarioId).is('auth_user_id', null);
            } else {
                const { data: usuarioData, error: usuarioError } = await __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$src$2f$config$2f$supabase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["supabase"].from('usuarios').insert([
                    {
                        auth_user_id: authUserId,
                        nombre_completo: nombre,
                        email: emailNormalizado,
                        telefono: telefono || null,
                        activo: true
                    }
                ]).select().single();
                if (usuarioError) {
                    await __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$src$2f$config$2f$supabase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["supabaseAdmin"].auth.admin.deleteUser(authUserId);
                    throw new Error(`Error al crear registro de usuario: ${usuarioError.message}`);
                }
                usuarioId = usuarioData.id;
            }
            // 3. Obtener el rol_id correspondiente
            const rolCodigo = esAdmin ? 'admin' : 'profesional';
            const { data: rolData, error: rolError } = await __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$src$2f$config$2f$supabase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["supabase"].from('roles').select('id').eq('nombre', rolCodigo).single();
            if (rolError || !rolData) {
                throw new Error(`No se encontró el rol: ${rolCodigo}`);
            }
            // 4. Crear/actualizar en usuario_empresa
            const ROL_PRIORIDAD = {
                superadmin: 4,
                admin: 3,
                profesional: 2,
                cliente: 1
            };
            const { data: ueExistente } = await __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$src$2f$config$2f$supabase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["supabase"].from('usuario_empresa').select('id, roles(nombre)').eq('usuario_id', usuarioId).eq('empresa_id', profile.empresaId).maybeSingle();
            if (ueExistente) {
                const rolActual = ueExistente.roles?.nombre;
                const prioridadActual = ROL_PRIORIDAD[rolActual] || 0;
                const prioridadNueva = ROL_PRIORIDAD[rolCodigo] || 0;
                if (prioridadActual >= prioridadNueva) {
                    return {
                        success: false,
                        error: `Este usuario ya tiene el rol "${rolActual}" en esta empresa. Para cambiarlo usá la opción Editar desde la lista.`
                    };
                }
                await __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$src$2f$config$2f$supabase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["supabase"].from('usuario_empresa').update({
                    rol_id: rolData.id
                }).eq('id', ueExistente.id);
            } else {
                const { error: ueError } = await __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$src$2f$config$2f$supabase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["supabase"].from('usuario_empresa').insert([
                    {
                        usuario_id: usuarioId,
                        empresa_id: profile.empresaId,
                        rol_id: rolData.id
                    }
                ]);
                if (ueError) {
                    await __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$src$2f$config$2f$supabase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["supabaseAdmin"].auth.admin.deleteUser(authUserId);
                    throw new Error(`Error al asignar empresa: ${ueError.message}`);
                }
            }
            return {
                success: true,
                data: {
                    id: usuarioId,
                    usuario_id: usuarioId,
                    nombre_completo: nombre,
                    email: emailNormalizado
                },
                passwordTemporal
            };
        } catch (error) {
            console.error('[crearProfesional] Error:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }
    // Actualizar profesional y su rol
    static async actualizarProfesional(id, profesionalData, profile) {
        const permError = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$src$2f$utils$2f$permissions$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["requirePermission"])(profile, 'profesionales:write');
        if (permError) return permError;
        try {
            const { nombre_completo, email, telefono, esAdmin } = profesionalData;
            // 1. Leer registro actual para verificar auth_user_id (supabase regular, ya funcionaba antes)
            const { data: usuarioActual, error: leerError } = await __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$src$2f$config$2f$supabase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["supabase"].from('usuarios').select('id, auth_user_id, email').eq('id', id).maybeSingle();
            if (leerError) {
                throw new Error(`Error al leer profesional: ${leerError.message}`);
            }
            let passwordTemporal = null;
            // 2. Si auth_user_id es null, crear auth user con contraseña temporal (reparación)
            if (usuarioActual && !usuarioActual.auth_user_id) {
                const emailParaAuth = email?.trim().toLowerCase() || usuarioActual.email;
                if (!emailParaAuth) {
                    throw new Error('No se puede crear acceso sin email');
                }
                const tempPassword = '123456';
                const { data: authData, error: authError } = await __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$src$2f$config$2f$supabase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["supabaseAdmin"].auth.admin.createUser({
                    email: emailParaAuth,
                    password: tempPassword,
                    email_confirm: true,
                    user_metadata: {
                        nombre_completo: nombre_completo
                    }
                });
                if (authError) {
                    throw new Error(`Error al crear acceso: ${authError.message}`);
                }
                const { error: patchError } = await __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$src$2f$config$2f$supabase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["supabase"].from('usuarios').update({
                    auth_user_id: authData.user.id
                }).eq('id', id);
                if (patchError) {
                    await __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$src$2f$config$2f$supabase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["supabaseAdmin"].auth.admin.deleteUser(authData.user.id);
                    throw new Error(`Error al vincular cuenta: ${patchError.message}`);
                }
                passwordTemporal = tempPassword;
            }
            // 3. Actualizar datos del usuario
            const emailActual = usuarioActual?.email || '';
            const { error: usuarioError } = await __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$src$2f$config$2f$supabase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["supabase"].from('usuarios').update({
                nombre_completo: nombre_completo,
                email: email?.trim().toLowerCase() || emailActual,
                telefono: telefono
            }).eq('id', id);
            if (usuarioError) throw usuarioError;
            // 4. Actualizar rol en usuario_empresa
            const rolCodigo = esAdmin ? 'admin' : 'profesional';
            const { data: rolData } = await __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$src$2f$config$2f$supabase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["supabase"].from('roles').select('id').eq('nombre', rolCodigo).single();
            if (rolData) {
                await __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$src$2f$config$2f$supabase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["supabase"].from('usuario_empresa').update({
                    rol_id: rolData.id
                }).eq('usuario_id', id).eq('empresa_id', profile.empresaId);
            }
            return {
                success: true,
                message: 'Profesional actualizado correctamente',
                ...passwordTemporal && {
                    passwordTemporal
                }
            };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }
    // Desactivar profesional (soft delete en usuario_empresa)
    static async desactivarProfesional(id, profile) {
        const permError = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$src$2f$utils$2f$permissions$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["requirePermission"])(profile, 'profesionales:write');
        if (permError) return permError;
        try {
            const { error } = await __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$src$2f$config$2f$supabase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["supabase"].from('usuario_empresa').delete().eq('usuario_id', id).eq('empresa_id', profile.empresaId);
            if (error) throw error;
            return {
                success: true
            };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }
    // Obtener profesionales disponibles para una fecha y hora
    static async obtenerProfesionalesDisponibles(fecha, horaInicio, horaFin, profile) {
        const permError = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$src$2f$utils$2f$permissions$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["requirePermission"])(profile, 'reservas:read');
        if (permError) return permError;
        try {
            const diaSemana = new Date(fecha).getDay();
            // Obtener profesionales de la empresa
            const result = await this.obtenerProfesionales(profile);
            if (!result.success) return result;
            const profesionales = result.data;
            const profesionalIds = profesionales.map((p)=>p.id);
            if (profesionalIds.length === 0) {
                return {
                    success: true,
                    data: []
                };
            }
            // Obtener horarios de atención
            const { data: horarios } = await __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$src$2f$config$2f$supabase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["supabase"].from('horarios_atencion').select('*').in('profesional_id', profesionalIds).eq('dia_semana', diaSemana);
            // Filtrar profesionales que trabajan en ese horario
            const disponibles = profesionales.filter((prof)=>{
                const horario = (horarios || []).find((h)=>h.profesional_id === prof.id);
                if (!horario) return false;
                return horaInicio >= horario.hora_inicio && horaFin <= horario.hora_fin;
            });
            return {
                success: true,
                data: disponibles
            };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }
}
}),
"[project]/Desktop/03.MENSANA/mensana-next/src/controllers/ConsultanteController.js [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ConsultanteController",
    ()=>ConsultanteController
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$src$2f$config$2f$supabase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/03.MENSANA/mensana-next/src/config/supabase.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$src$2f$utils$2f$permissions$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/03.MENSANA/mensana-next/src/utils/permissions.ts [app-ssr] (ecmascript)");
;
;
class ConsultanteController {
    // Buscar consultantes (clientes) por nombre o email
    // Un consultante es un usuario con rol 'cliente' en usuario_empresa
    static async buscarConsultantes(query, profile) {
        const permError = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$src$2f$utils$2f$permissions$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["requirePermission"])(profile, 'consultantes:read');
        if (permError) return permError;
        try {
            if (!query || query.trim() === '') {
                return {
                    success: true,
                    data: []
                };
            }
            const searchTerm = `%${query.trim().toLowerCase()}%`;
            // Obtener clientes de la empresa
            let empresaFilter = null;
            if (profile.rol !== 'superadmin') {
                const empError = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$src$2f$utils$2f$permissions$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["requireEmpresa"])(profile);
                if (empError) return empError;
                empresaFilter = profile.empresaId;
            }
            // Buscar usuarios que son clientes
            let dbQuery = __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$src$2f$config$2f$supabase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["supabase"].from('usuario_empresa').select(`
          usuario_id,
          usuarios!inner(
            id,
            nombre_completo,
            email,
            telefono
          ),
          roles!inner(nombre)
        `).eq('roles.nombre', 'cliente').or(`usuarios.nombre_completo.ilike.${searchTerm},usuarios.email.ilike.${searchTerm}`).limit(10);
            if (empresaFilter) {
                dbQuery = dbQuery.eq('empresa_id', empresaFilter);
            }
            const { data, error } = await dbQuery;
            if (error) throw error;
            // Obtener fichas de estos usuarios
            const usuarioIds = (data || []).map((d)=>d.usuarios.id);
            let fichasMap = new Map();
            if (usuarioIds.length > 0 && empresaFilter) {
                const { data: fichas } = await __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$src$2f$config$2f$supabase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["supabase"].from('fichas').select('id, cliente_id').in('cliente_id', usuarioIds).eq('empresa_id', empresaFilter).eq('activo', true);
                (fichas || []).forEach((f)=>fichasMap.set(f.cliente_id, f.id));
            }
            const consultantes = (data || []).map((item)=>({
                    id: item.usuarios.id,
                    usuario_id: item.usuarios.id,
                    ficha_id: fichasMap.get(item.usuarios.id) || null,
                    nombre_completo: item.usuarios.nombre_completo || '',
                    email: item.usuarios.email || '',
                    telefono: item.usuarios.telefono || ''
                })).sort((a, b)=>a.nombre_completo.localeCompare(b.nombre_completo));
            return {
                success: true,
                data: consultantes
            };
        } catch (error) {
            console.error('[buscarConsultantes] Error:', error);
            return {
                success: false,
                error: error.message,
                data: []
            };
        }
    }
    // Obtener todos los consultantes (clientes)
    static async obtenerConsultantes(profile) {
        const permError = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$src$2f$utils$2f$permissions$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["requirePermission"])(profile, 'consultantes:read');
        if (permError) return permError;
        try {
            let empresaFilter = null;
            if (profile.rol !== 'superadmin') {
                const empError = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$src$2f$utils$2f$permissions$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["requireEmpresa"])(profile);
                if (empError) return empError;
                empresaFilter = profile.empresaId;
            }
            let query = __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$src$2f$config$2f$supabase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["supabase"].from('usuario_empresa').select(`
          usuario_id,
          usuarios!inner(
            id,
            nombre_completo,
            email,
            telefono
          ),
          roles!inner(nombre)
        `).eq('roles.nombre', 'cliente');
            if (empresaFilter) {
                query = query.eq('empresa_id', empresaFilter);
            }
            const { data, error } = await query;
            if (error) throw error;
            // Obtener fichas
            const usuarioIds = (data || []).map((d)=>d.usuarios.id);
            let fichasMap = new Map();
            if (usuarioIds.length > 0 && empresaFilter) {
                const { data: fichas } = await __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$src$2f$config$2f$supabase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["supabase"].from('fichas').select('id, cliente_id').in('cliente_id', usuarioIds).eq('empresa_id', empresaFilter).eq('activo', true);
                (fichas || []).forEach((f)=>fichasMap.set(f.cliente_id, f.id));
            }
            const consultantes = (data || []).map((item)=>({
                    id: item.usuarios.id,
                    usuario_id: item.usuarios.id,
                    ficha_id: fichasMap.get(item.usuarios.id) || null,
                    nombre_completo: item.usuarios.nombre_completo || '',
                    email: item.usuarios.email || '',
                    telefono: item.usuarios.telefono || ''
                })).sort((a, b)=>a.nombre_completo.localeCompare(b.nombre_completo));
            return {
                success: true,
                data: consultantes
            };
        } catch (error) {
            console.error('[obtenerConsultantes] Error:', error);
            return {
                success: false,
                error: error.message,
                data: []
            };
        }
    }
    // Crear nuevo consultante (cliente)
    // Solo crea usuario + rol cliente en usuario_empresa (sin login si no tiene email)
    static async crearConsultante(consultanteData, profile) {
        const permError = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$src$2f$utils$2f$permissions$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["requirePermission"])(profile, 'consultantes:write');
        if (permError) return permError;
        const empError = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$src$2f$utils$2f$permissions$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["requireEmpresa"])(profile);
        if (empError) return empError;
        try {
            const { nombre_completo, email, telefono } = consultanteData;
            if (!nombre_completo || nombre_completo.trim() === '') {
                return {
                    success: false,
                    error: 'El nombre es obligatorio'
                };
            }
            // Verificar si ya existe un usuario con el mismo email
            if (email && email.trim() !== '') {
                const { data: usuarioExistente } = await __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$src$2f$config$2f$supabase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["supabase"].from('usuarios').select('id, nombre_completo, email, telefono').eq('email', email.trim()).maybeSingle();
                if (usuarioExistente) {
                    // Verificar si ya tiene rol cliente en esta empresa
                    const { data: ueExistente } = await __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$src$2f$config$2f$supabase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["supabase"].from('usuario_empresa').select('id, roles!inner(nombre)').eq('usuario_id', usuarioExistente.id).eq('empresa_id', profile.empresaId).eq('roles.nombre', 'cliente').maybeSingle();
                    if (ueExistente) {
                        return {
                            success: true,
                            data: {
                                id: usuarioExistente.id,
                                usuario_id: usuarioExistente.id,
                                nombre_completo: usuarioExistente.nombre_completo,
                                email: usuarioExistente.email,
                                telefono: usuarioExistente.telefono
                            },
                            message: 'Usuario ya existe como cliente'
                        };
                    }
                    // Agregar rol cliente
                    const { data: rolData } = await __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$src$2f$config$2f$supabase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["supabase"].from('roles').select('id').eq('nombre', 'cliente').single();
                    if (rolData) {
                        await __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$src$2f$config$2f$supabase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["supabase"].from('usuario_empresa').insert([
                            {
                                usuario_id: usuarioExistente.id,
                                empresa_id: profile.empresaId,
                                rol_id: rolData.id
                            }
                        ]);
                    }
                    return {
                        success: true,
                        data: {
                            id: usuarioExistente.id,
                            usuario_id: usuarioExistente.id,
                            nombre_completo: usuarioExistente.nombre_completo,
                            email: usuarioExistente.email,
                            telefono: usuarioExistente.telefono
                        },
                        message: 'Rol cliente agregado'
                    };
                }
            }
            // Crear nuevo usuario (sin auth_user_id, sin login)
            const { data: usuarioData, error: usuarioError } = await __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$src$2f$config$2f$supabase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["supabase"].from('usuarios').insert([
                {
                    nombre_completo: nombre_completo.trim(),
                    email: email?.trim() || null,
                    telefono: telefono?.trim() || null,
                    activo: true,
                    auth_user_id: null
                }
            ]).select().single();
            if (usuarioError) throw usuarioError;
            // Obtener rol_id de cliente
            const { data: rolData } = await __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$src$2f$config$2f$supabase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["supabase"].from('roles').select('id').eq('nombre', 'cliente').single();
            // Agregar en usuario_empresa
            if (rolData) {
                await __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$src$2f$config$2f$supabase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["supabase"].from('usuario_empresa').insert([
                    {
                        usuario_id: usuarioData.id,
                        empresa_id: profile.empresaId,
                        rol_id: rolData.id
                    }
                ]);
            }
            return {
                success: true,
                data: {
                    id: usuarioData.id,
                    usuario_id: usuarioData.id,
                    nombre_completo: usuarioData.nombre_completo,
                    email: usuarioData.email,
                    telefono: usuarioData.telefono
                },
                message: 'Consultante creado exitosamente'
            };
        } catch (error) {
            console.error('[crearConsultante] Error:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }
    // Obtener consultante por ID (usuario_id)
    static async obtenerConsultantePorId(id, profile) {
        const permError = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$src$2f$utils$2f$permissions$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["requirePermission"])(profile, 'consultantes:read');
        if (permError) return permError;
        try {
            const { data, error } = await __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$src$2f$config$2f$supabase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["supabase"].from('usuarios').select('id, nombre_completo, email, telefono').eq('id', id).single();
            if (error) throw error;
            // Obtener ficha si existe
            let fichaId = null;
            if (profile.empresaId) {
                const { data: ficha } = await __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$src$2f$config$2f$supabase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["supabase"].from('fichas').select('id').eq('cliente_id', id).eq('empresa_id', profile.empresaId).eq('activo', true).maybeSingle();
                fichaId = ficha?.id || null;
            }
            return {
                success: true,
                data: {
                    id: data.id,
                    usuario_id: data.id,
                    ficha_id: fichaId,
                    nombre_completo: data.nombre_completo || '',
                    email: data.email || '',
                    telefono: data.telefono || ''
                }
            };
        } catch (error) {
            console.error('[obtenerConsultantePorId] Error:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }
    // Actualizar consultante
    static async actualizarConsultante(id, consultanteData, profile) {
        const permError = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$src$2f$utils$2f$permissions$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["requirePermission"])(profile, 'consultantes:write');
        if (permError) return permError;
        try {
            const { nombre_completo, email, telefono } = consultanteData;
            const { error } = await __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$src$2f$config$2f$supabase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["supabase"].from('usuarios').update({
                nombre_completo: nombre_completo?.trim() || null,
                email: email?.trim() || null,
                telefono: telefono?.trim() || null
            }).eq('id', id);
            if (error) throw error;
            return {
                success: true,
                message: 'Consultante actualizado correctamente'
            };
        } catch (error) {
            console.error('[actualizarConsultante] Error:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }
    // Desactivar consultante (soft delete en usuario_empresa)
    static async desactivarConsultante(id, profile) {
        const permError = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$src$2f$utils$2f$permissions$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["requirePermission"])(profile, 'consultantes:write');
        if (permError) return permError;
        try {
            const { error } = await __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$src$2f$config$2f$supabase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["supabase"].from('usuario_empresa').delete().eq('cliente_id', id).eq('empresa_id', profile.empresaId);
            if (error) throw error;
            return {
                success: true,
                message: 'Consultante desactivado correctamente'
            };
        } catch (error) {
            console.error('[desactivarConsultante] Error:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }
}
}),
"[project]/Desktop/03.MENSANA/mensana-next/src/services/database.service.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "DatabaseService",
    ()=>DatabaseService
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$src$2f$config$2f$supabase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/03.MENSANA/mensana-next/src/config/supabase.ts [app-ssr] (ecmascript)");
;
function applyFilters(query, filters) {
    filters.forEach(({ field, operator, value })=>{
        switch(operator){
            case 'eq':
                query = query.eq(field, value);
                break;
            case 'neq':
                query = query.neq(field, value);
                break;
            case 'gt':
                query = query.gt(field, value);
                break;
            case 'gte':
                query = query.gte(field, value);
                break;
            case 'lt':
                query = query.lt(field, value);
                break;
            case 'lte':
                query = query.lte(field, value);
                break;
            case 'in':
                query = query.in(field, value);
                break;
            case 'not':
                query = query.not(field, operator, value);
                break;
            default:
                query = query.eq(field, value);
        }
    });
    return query;
}
class DatabaseService {
    static async obtenerTiposSesion(empresaId = null) {
        try {
            let query = __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$src$2f$config$2f$supabase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["supabase"].from('servicios').select('id, nombre, duracion_minutos, precio').eq('activo', true).order('nombre', {
                ascending: true
            });
            if (empresaId) {
                query = query.eq('empresa_id', empresaId);
            }
            const { data, error } = await query;
            if (error) throw error;
            return {
                success: true,
                data
            };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }
    static async query(table, options = {}) {
        try {
            const { select = '*', filters = [], order = null, single = false } = options;
            let query = __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$src$2f$config$2f$supabase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["supabase"].from(table).select(select);
            query = applyFilters(query, filters);
            if (order) {
                query = query.order(order.field, {
                    ascending: order.ascending ?? true
                });
            }
            if (single) {
                query = query.single();
            }
            const { data, error } = await query;
            if (error) throw error;
            return {
                success: true,
                data: data || []
            };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }
    static async insert(table, data, returnData = true) {
        try {
            const dataArray = Array.isArray(data) ? data : [
                data
            ];
            let query = __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$src$2f$config$2f$supabase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["supabase"].from(table).insert(dataArray);
            if (returnData) {
                query = query.select();
            }
            const { data: result, error } = await query;
            if (error) throw error;
            return {
                success: true,
                data: returnData ? result : null
            };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }
    static async update(table, data, filters = [], returnData = true) {
        try {
            let query = __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$src$2f$config$2f$supabase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["supabase"].from(table).update(data);
            query = applyFilters(query, filters);
            if (returnData) {
                query = query.select();
            }
            const { data: result, error } = await query;
            if (error) throw error;
            return {
                success: true,
                data: returnData ? result : null
            };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }
    static async delete(table, filters = []) {
        try {
            let query = __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$src$2f$config$2f$supabase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["supabase"].from(table).delete();
            query = applyFilters(query, filters);
            const { error } = await query;
            if (error) throw error;
            return {
                success: true
            };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }
    static async count(table, filters = []) {
        try {
            let query = __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$src$2f$config$2f$supabase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["supabase"].from(table).select('*', {
                count: 'exact',
                head: true
            });
            query = applyFilters(query, filters);
            const { count, error } = await query;
            if (error) throw error;
            return {
                success: true,
                data: count
            };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }
}
}),
"[project]/Desktop/03.MENSANA/mensana-next/src/components/reservas/ModalReserva.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>ModalReserva
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/03.MENSANA/mensana-next/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/03.MENSANA/mensana-next/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$src$2f$context$2f$ThemeContext$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/03.MENSANA/mensana-next/src/context/ThemeContext.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$src$2f$controllers$2f$ReservaController$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/03.MENSANA/mensana-next/src/controllers/ReservaController.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$src$2f$controllers$2f$ConsultanteController$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/03.MENSANA/mensana-next/src/controllers/ConsultanteController.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$src$2f$services$2f$database$2e$service$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/03.MENSANA/mensana-next/src/services/database.service.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__X$3e$__ = __turbopack_context__.i("[project]/Desktop/03.MENSANA/mensana-next/node_modules/lucide-react/dist/esm/icons/x.js [app-ssr] (ecmascript) <export default as X>");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$search$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Search$3e$__ = __turbopack_context__.i("[project]/Desktop/03.MENSANA/mensana-next/node_modules/lucide-react/dist/esm/icons/search.js [app-ssr] (ecmascript) <export default as Search>");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$loader$2d$circle$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Loader2$3e$__ = __turbopack_context__.i("[project]/Desktop/03.MENSANA/mensana-next/node_modules/lucide-react/dist/esm/icons/loader-circle.js [app-ssr] (ecmascript) <export default as Loader2>");
'use client';
;
;
;
;
;
;
;
const HORARIOS_DISPONIBLES = Array.from({
    length: 27
}, (_, i)=>{
    const h = Math.floor(i / 2) + 8;
    const m = i % 2 === 0 ? '00' : '30';
    return `${h.toString().padStart(2, '0')}:${m}`;
});
function ModalReserva({ open, onClose, onSaved, fecha, horaInicial, reservaEditar, profesionales, profile }) {
    const { colors } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$src$2f$context$2f$ThemeContext$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useTheme"])();
    const [consultanteSearch, setConsultanteSearch] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])('');
    const [consultantesFiltrados, setConsultantesFiltrados] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])([]);
    const [isSearching, setIsSearching] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [tiposSesion, setTiposSesion] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])([]);
    const [guardando, setGuardando] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const searchTimeout = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(null);
    const [form, setForm] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])({
        consultante_id: null,
        consultante_nombre: '',
        consultante_email: '',
        consultante_telefono: '',
        hora_inicio: horaInicial || '',
        profesional_id: profile?.profesionalId || '',
        tipo_sesion_id: null,
        precio_total: ''
    });
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        if (open) {
            if (reservaEditar) {
                setForm({
                    consultante_id: reservaEditar.consultante_id || reservaEditar.cliente_id,
                    consultante_nombre: reservaEditar.consultante_nombre || '',
                    consultante_email: reservaEditar.consultante_email || '',
                    consultante_telefono: reservaEditar.consultante_telefono || '',
                    hora_inicio: reservaEditar.hora_inicio?.substring(0, 5) || '',
                    profesional_id: reservaEditar.profesional_id || profile?.profesionalId || '',
                    tipo_sesion_id: reservaEditar.servicio_id || null,
                    precio_total: reservaEditar.precio_total?.toString() || ''
                });
                setConsultanteSearch(reservaEditar.consultante_nombre || '');
            } else {
                setForm({
                    consultante_id: null,
                    consultante_nombre: '',
                    consultante_email: '',
                    consultante_telefono: '',
                    hora_inicio: horaInicial || '',
                    profesional_id: profile?.profesionalId || '',
                    tipo_sesion_id: null,
                    precio_total: ''
                });
                setConsultanteSearch('');
            }
        }
    }, [
        open,
        reservaEditar,
        horaInicial
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$src$2f$services$2f$database$2e$service$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["DatabaseService"].obtenerTiposSesion(profile?.empresaId).then((result)=>{
            if (result.success) setTiposSesion(result.data);
        });
    }, [
        profile?.empresaId
    ]);
    const buscarConsultante = (query)=>{
        setConsultanteSearch(query);
        clearTimeout(searchTimeout.current);
        if (!query.trim()) {
            setConsultantesFiltrados([]);
            return;
        }
        searchTimeout.current = setTimeout(async ()=>{
            setIsSearching(true);
            const result = await __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$src$2f$controllers$2f$ConsultanteController$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ConsultanteController"].buscarConsultantes(query, profile);
            if (result.success) setConsultantesFiltrados(result.data || []);
            setIsSearching(false);
        }, 300);
    };
    const seleccionarConsultante = (c)=>{
        setForm((prev)=>({
                ...prev,
                consultante_id: c.id,
                consultante_nombre: c.nombre_completo,
                consultante_email: c.email,
                consultante_telefono: c.telefono
            }));
        setConsultanteSearch(c.nombre_completo);
        setConsultantesFiltrados([]);
    };
    const handleGuardar = async ()=>{
        if (!form.hora_inicio) {
            alert('Seleccioná la hora de inicio');
            return;
        }
        setGuardando(true);
        let consultanteId = form.consultante_id;
        if (!consultanteId && form.consultante_nombre) {
            const r = await __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$src$2f$controllers$2f$ConsultanteController$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ConsultanteController"].crearConsultante({
                nombre_completo: form.consultante_nombre,
                email: form.consultante_email,
                telefono: form.consultante_telefono
            }, profile);
            if (r.success) consultanteId = r.data?.id;
        }
        const reservaData = {
            cliente_id: consultanteId,
            consultante_id: consultanteId,
            fecha,
            hora_inicio: form.hora_inicio,
            servicio_id: form.tipo_sesion_id,
            precio_total: form.precio_total ? parseFloat(form.precio_total) : null,
            estado: 'confirmada'
        };
        const result = reservaEditar ? await __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$src$2f$controllers$2f$ReservaController$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ReservaController"].actualizarReserva(reservaEditar.id, reservaData, profile) : await __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$src$2f$controllers$2f$ReservaController$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ReservaController"].crearReserva(reservaData, form.profesional_id, profile);
        setGuardando(false);
        if (result.success) onSaved();
        else alert(result.error || 'Error al guardar');
    };
    if (!open) return null;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4",
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "bg-white rounded-2xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "flex items-center justify-between mb-5",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                            className: "text-lg font-bold",
                            style: {
                                color: colors.text
                            },
                            children: reservaEditar ? 'Editar Reserva' : 'Nueva Reserva'
                        }, void 0, false, {
                            fileName: "[project]/Desktop/03.MENSANA/mensana-next/src/components/reservas/ModalReserva.tsx",
                            lineNumber: 141,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            onClick: onClose,
                            className: "p-1.5 rounded-lg hover:bg-gray-100 transition",
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__X$3e$__["X"], {
                                size: 18,
                                style: {
                                    color: colors.textSecondary
                                }
                            }, void 0, false, {
                                fileName: "[project]/Desktop/03.MENSANA/mensana-next/src/components/reservas/ModalReserva.tsx",
                                lineNumber: 145,
                                columnNumber: 13
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/Desktop/03.MENSANA/mensana-next/src/components/reservas/ModalReserva.tsx",
                            lineNumber: 144,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/Desktop/03.MENSANA/mensana-next/src/components/reservas/ModalReserva.tsx",
                    lineNumber: 140,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "space-y-4",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "bg-gray-50 rounded-xl px-4 py-2.5",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: "text-xs",
                                    style: {
                                        color: colors.textSecondary
                                    },
                                    children: "Fecha"
                                }, void 0, false, {
                                    fileName: "[project]/Desktop/03.MENSANA/mensana-next/src/components/reservas/ModalReserva.tsx",
                                    lineNumber: 152,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: "font-semibold text-sm",
                                    style: {
                                        color: colors.text
                                    },
                                    children: fecha
                                }, void 0, false, {
                                    fileName: "[project]/Desktop/03.MENSANA/mensana-next/src/components/reservas/ModalReserva.tsx",
                                    lineNumber: 153,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/Desktop/03.MENSANA/mensana-next/src/components/reservas/ModalReserva.tsx",
                            lineNumber: 151,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "relative",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                    className: "block text-sm font-medium mb-1",
                                    style: {
                                        color: colors.text
                                    },
                                    children: "Cliente *"
                                }, void 0, false, {
                                    fileName: "[project]/Desktop/03.MENSANA/mensana-next/src/components/reservas/ModalReserva.tsx",
                                    lineNumber: 158,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "relative",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$search$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Search$3e$__["Search"], {
                                            size: 16,
                                            className: "absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                                        }, void 0, false, {
                                            fileName: "[project]/Desktop/03.MENSANA/mensana-next/src/components/reservas/ModalReserva.tsx",
                                            lineNumber: 160,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                            type: "text",
                                            value: consultanteSearch,
                                            onChange: (e)=>buscarConsultante(e.target.value),
                                            placeholder: "Buscar por nombre o email...",
                                            className: "w-full pl-9 pr-3 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500",
                                            style: {
                                                borderColor: colors.border
                                            }
                                        }, void 0, false, {
                                            fileName: "[project]/Desktop/03.MENSANA/mensana-next/src/components/reservas/ModalReserva.tsx",
                                            lineNumber: 161,
                                            columnNumber: 15
                                        }, this),
                                        isSearching && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$loader$2d$circle$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Loader2$3e$__["Loader2"], {
                                            size: 14,
                                            className: "absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-gray-400"
                                        }, void 0, false, {
                                            fileName: "[project]/Desktop/03.MENSANA/mensana-next/src/components/reservas/ModalReserva.tsx",
                                            lineNumber: 169,
                                            columnNumber: 31
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/Desktop/03.MENSANA/mensana-next/src/components/reservas/ModalReserva.tsx",
                                    lineNumber: 159,
                                    columnNumber: 13
                                }, this),
                                consultantesFiltrados.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "absolute z-10 w-full bg-white border rounded-xl shadow-lg mt-1 max-h-40 overflow-y-auto",
                                    style: {
                                        borderColor: colors.border
                                    },
                                    children: consultantesFiltrados.map((c)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                            onClick: ()=>seleccionarConsultante(c),
                                            className: "w-full text-left px-4 py-2.5 hover:bg-gray-50 transition text-sm border-b last:border-0",
                                            style: {
                                                borderColor: colors.borderLight,
                                                color: colors.text
                                            },
                                            children: [
                                                c.nombre_completo,
                                                c.email && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "text-xs ml-2",
                                                    style: {
                                                        color: colors.textSecondary
                                                    },
                                                    children: c.email
                                                }, void 0, false, {
                                                    fileName: "[project]/Desktop/03.MENSANA/mensana-next/src/components/reservas/ModalReserva.tsx",
                                                    lineNumber: 181,
                                                    columnNumber: 33
                                                }, this)
                                            ]
                                        }, c.id, true, {
                                            fileName: "[project]/Desktop/03.MENSANA/mensana-next/src/components/reservas/ModalReserva.tsx",
                                            lineNumber: 174,
                                            columnNumber: 19
                                        }, this))
                                }, void 0, false, {
                                    fileName: "[project]/Desktop/03.MENSANA/mensana-next/src/components/reservas/ModalReserva.tsx",
                                    lineNumber: 172,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/Desktop/03.MENSANA/mensana-next/src/components/reservas/ModalReserva.tsx",
                            lineNumber: 157,
                            columnNumber: 11
                        }, this),
                        !form.consultante_id && consultanteSearch && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "space-y-2 bg-gray-50 rounded-xl p-3",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: "text-xs font-medium",
                                    style: {
                                        color: colors.textSecondary
                                    },
                                    children: "Datos del nuevo cliente"
                                }, void 0, false, {
                                    fileName: "[project]/Desktop/03.MENSANA/mensana-next/src/components/reservas/ModalReserva.tsx",
                                    lineNumber: 191,
                                    columnNumber: 15
                                }, this),
                                [
                                    {
                                        key: 'consultante_email',
                                        label: 'Email',
                                        type: 'email',
                                        placeholder: 'email@ejemplo.com'
                                    },
                                    {
                                        key: 'consultante_telefono',
                                        label: 'Teléfono',
                                        type: 'tel',
                                        placeholder: '+54 11...'
                                    }
                                ].map((f)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                        type: f.type,
                                        value: form[f.key],
                                        onChange: (e)=>setForm((prev)=>({
                                                    ...prev,
                                                    [f.key]: e.target.value
                                                })),
                                        placeholder: f.placeholder,
                                        className: "w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500",
                                        style: {
                                            borderColor: colors.border
                                        }
                                    }, f.key, false, {
                                        fileName: "[project]/Desktop/03.MENSANA/mensana-next/src/components/reservas/ModalReserva.tsx",
                                        lineNumber: 196,
                                        columnNumber: 17
                                    }, this))
                            ]
                        }, void 0, true, {
                            fileName: "[project]/Desktop/03.MENSANA/mensana-next/src/components/reservas/ModalReserva.tsx",
                            lineNumber: 190,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                    className: "block text-sm font-medium mb-1",
                                    style: {
                                        color: colors.text
                                    },
                                    children: "Hora de inicio *"
                                }, void 0, false, {
                                    fileName: "[project]/Desktop/03.MENSANA/mensana-next/src/components/reservas/ModalReserva.tsx",
                                    lineNumber: 211,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                                    value: form.hora_inicio,
                                    onChange: (e)=>setForm((prev)=>({
                                                ...prev,
                                                hora_inicio: e.target.value
                                            })),
                                    className: "w-full px-3 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500",
                                    style: {
                                        borderColor: colors.border,
                                        color: colors.text
                                    },
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                            value: "",
                                            children: "Seleccionar hora"
                                        }, void 0, false, {
                                            fileName: "[project]/Desktop/03.MENSANA/mensana-next/src/components/reservas/ModalReserva.tsx",
                                            lineNumber: 218,
                                            columnNumber: 15
                                        }, this),
                                        HORARIOS_DISPONIBLES.map((h)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                value: h,
                                                children: h
                                            }, h, false, {
                                                fileName: "[project]/Desktop/03.MENSANA/mensana-next/src/components/reservas/ModalReserva.tsx",
                                                lineNumber: 219,
                                                columnNumber: 46
                                            }, this))
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/Desktop/03.MENSANA/mensana-next/src/components/reservas/ModalReserva.tsx",
                                    lineNumber: 212,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/Desktop/03.MENSANA/mensana-next/src/components/reservas/ModalReserva.tsx",
                            lineNumber: 210,
                            columnNumber: 11
                        }, this),
                        profesionales.length > 1 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                    className: "block text-sm font-medium mb-1",
                                    style: {
                                        color: colors.text
                                    },
                                    children: "Profesional"
                                }, void 0, false, {
                                    fileName: "[project]/Desktop/03.MENSANA/mensana-next/src/components/reservas/ModalReserva.tsx",
                                    lineNumber: 226,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                                    value: form.profesional_id,
                                    onChange: (e)=>setForm((prev)=>({
                                                ...prev,
                                                profesional_id: e.target.value
                                            })),
                                    className: "w-full px-3 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500",
                                    style: {
                                        borderColor: colors.border,
                                        color: colors.text
                                    },
                                    children: profesionales.map((p)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                            value: p.id,
                                            children: p.nombre_completo
                                        }, p.id, false, {
                                            fileName: "[project]/Desktop/03.MENSANA/mensana-next/src/components/reservas/ModalReserva.tsx",
                                            lineNumber: 233,
                                            columnNumber: 41
                                        }, this))
                                }, void 0, false, {
                                    fileName: "[project]/Desktop/03.MENSANA/mensana-next/src/components/reservas/ModalReserva.tsx",
                                    lineNumber: 227,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/Desktop/03.MENSANA/mensana-next/src/components/reservas/ModalReserva.tsx",
                            lineNumber: 225,
                            columnNumber: 13
                        }, this),
                        tiposSesion.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                    className: "block text-sm font-medium mb-1",
                                    style: {
                                        color: colors.text
                                    },
                                    children: "Tipo de sesión"
                                }, void 0, false, {
                                    fileName: "[project]/Desktop/03.MENSANA/mensana-next/src/components/reservas/ModalReserva.tsx",
                                    lineNumber: 241,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                                    value: form.tipo_sesion_id || '',
                                    onChange: (e)=>setForm((prev)=>({
                                                ...prev,
                                                tipo_sesion_id: e.target.value || null
                                            })),
                                    className: "w-full px-3 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500",
                                    style: {
                                        borderColor: colors.border,
                                        color: colors.text
                                    },
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                            value: "",
                                            children: "Sin especificar"
                                        }, void 0, false, {
                                            fileName: "[project]/Desktop/03.MENSANA/mensana-next/src/components/reservas/ModalReserva.tsx",
                                            lineNumber: 248,
                                            columnNumber: 17
                                        }, this),
                                        tiposSesion.map((t)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                value: t.id,
                                                children: [
                                                    t.nombre,
                                                    t.precio ? ` · $${t.precio}` : ''
                                                ]
                                            }, t.id, true, {
                                                fileName: "[project]/Desktop/03.MENSANA/mensana-next/src/components/reservas/ModalReserva.tsx",
                                                lineNumber: 249,
                                                columnNumber: 39
                                            }, this))
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/Desktop/03.MENSANA/mensana-next/src/components/reservas/ModalReserva.tsx",
                                    lineNumber: 242,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/Desktop/03.MENSANA/mensana-next/src/components/reservas/ModalReserva.tsx",
                            lineNumber: 240,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                    className: "block text-sm font-medium mb-1",
                                    style: {
                                        color: colors.text
                                    },
                                    children: "Precio ($)"
                                }, void 0, false, {
                                    fileName: "[project]/Desktop/03.MENSANA/mensana-next/src/components/reservas/ModalReserva.tsx",
                                    lineNumber: 256,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                    type: "number",
                                    value: form.precio_total,
                                    onChange: (e)=>setForm((prev)=>({
                                                ...prev,
                                                precio_total: e.target.value
                                            })),
                                    placeholder: "2500",
                                    className: "w-full px-3 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500",
                                    style: {
                                        borderColor: colors.border
                                    }
                                }, void 0, false, {
                                    fileName: "[project]/Desktop/03.MENSANA/mensana-next/src/components/reservas/ModalReserva.tsx",
                                    lineNumber: 257,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/Desktop/03.MENSANA/mensana-next/src/components/reservas/ModalReserva.tsx",
                            lineNumber: 255,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/Desktop/03.MENSANA/mensana-next/src/components/reservas/ModalReserva.tsx",
                    lineNumber: 149,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "flex gap-3 mt-6",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            onClick: onClose,
                            className: "flex-1 py-2.5 rounded-lg border text-sm font-medium",
                            style: {
                                borderColor: colors.border,
                                color: colors.text
                            },
                            children: "Cancelar"
                        }, void 0, false, {
                            fileName: "[project]/Desktop/03.MENSANA/mensana-next/src/components/reservas/ModalReserva.tsx",
                            lineNumber: 269,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            onClick: handleGuardar,
                            disabled: guardando,
                            className: "flex-1 py-2.5 rounded-lg text-sm font-medium text-white disabled:opacity-60 flex items-center justify-center gap-2",
                            style: {
                                background: colors.primary
                            },
                            children: [
                                guardando && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$loader$2d$circle$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Loader2$3e$__["Loader2"], {
                                    size: 14,
                                    className: "animate-spin"
                                }, void 0, false, {
                                    fileName: "[project]/Desktop/03.MENSANA/mensana-next/src/components/reservas/ModalReserva.tsx",
                                    lineNumber: 278,
                                    columnNumber: 27
                                }, this),
                                guardando ? 'Guardando...' : 'Guardar'
                            ]
                        }, void 0, true, {
                            fileName: "[project]/Desktop/03.MENSANA/mensana-next/src/components/reservas/ModalReserva.tsx",
                            lineNumber: 272,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/Desktop/03.MENSANA/mensana-next/src/components/reservas/ModalReserva.tsx",
                    lineNumber: 268,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/Desktop/03.MENSANA/mensana-next/src/components/reservas/ModalReserva.tsx",
            lineNumber: 139,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/Desktop/03.MENSANA/mensana-next/src/components/reservas/ModalReserva.tsx",
        lineNumber: 138,
        columnNumber: 5
    }, this);
}
}),
"[project]/Desktop/03.MENSANA/mensana-next/src/components/reservas/ModalPago.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>ModalPago
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/03.MENSANA/mensana-next/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/03.MENSANA/mensana-next/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$src$2f$context$2f$ThemeContext$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/03.MENSANA/mensana-next/src/context/ThemeContext.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$src$2f$controllers$2f$ReservaController$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/03.MENSANA/mensana-next/src/controllers/ReservaController.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$src$2f$config$2f$supabase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/03.MENSANA/mensana-next/src/config/supabase.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__X$3e$__ = __turbopack_context__.i("[project]/Desktop/03.MENSANA/mensana-next/node_modules/lucide-react/dist/esm/icons/x.js [app-ssr] (ecmascript) <export default as X>");
'use client';
;
;
;
;
;
;
const METODOS_PAGO = [
    {
        id: 'efectivo',
        nombre: 'Efectivo'
    },
    {
        id: 'transferencia',
        nombre: 'Transferencia'
    },
    {
        id: 'tarjeta_debito',
        nombre: 'Tarjeta de Débito'
    },
    {
        id: 'tarjeta_credito',
        nombre: 'Tarjeta de Crédito'
    },
    {
        id: 'mercadopago',
        nombre: 'Mercado Pago'
    },
    {
        id: 'obra_social',
        nombre: 'Obra Social'
    },
    {
        id: 'otro',
        nombre: 'Otro'
    }
];
function ModalPago({ open, onClose, onSaved, reserva, profile }) {
    const { colors } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$src$2f$context$2f$ThemeContext$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useTheme"])();
    const [monto, setMonto] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])('');
    const [metodoPago, setMetodoPago] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const [pagado, setPagado] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [precioServicio, setPrecioServicio] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const [guardando, setGuardando] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        if (!open || !reserva) return;
        setMonto(reserva.precio_total ? reserva.precio_total.toString() : '');
        setMetodoPago(reserva.metodo_pago || null);
        setPagado(reserva.pagado || false);
        setPrecioServicio(null);
        if (reserva.servicio_id) {
            __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$src$2f$config$2f$supabase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["supabase"].from('servicios').select('nombre, precio').eq('id', reserva.servicio_id).single().then(({ data })=>{
                if (data) setPrecioServicio(data);
            });
        }
    }, [
        open,
        reserva
    ]);
    const handleGuardar = async ()=>{
        setGuardando(true);
        const result = await __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$src$2f$controllers$2f$ReservaController$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ReservaController"].registrarPago(reserva.id, {
            precio_total: monto ? parseFloat(monto) : null,
            metodo_pago: metodoPago,
            pagado
        }, profile);
        setGuardando(false);
        if (result.success) onSaved();
    };
    if (!open) return null;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4",
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "bg-white rounded-2xl w-full max-w-sm p-6",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "flex items-center justify-between mb-5",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                            className: "text-lg font-bold",
                            style: {
                                color: colors.text
                            },
                            children: "Registrar Pago"
                        }, void 0, false, {
                            fileName: "[project]/Desktop/03.MENSANA/mensana-next/src/components/reservas/ModalPago.tsx",
                            lineNumber: 65,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            onClick: onClose,
                            className: "p-1.5 rounded-lg hover:bg-gray-100 transition",
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__X$3e$__["X"], {
                                size: 18,
                                style: {
                                    color: colors.textSecondary
                                }
                            }, void 0, false, {
                                fileName: "[project]/Desktop/03.MENSANA/mensana-next/src/components/reservas/ModalPago.tsx",
                                lineNumber: 67,
                                columnNumber: 13
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/Desktop/03.MENSANA/mensana-next/src/components/reservas/ModalPago.tsx",
                            lineNumber: 66,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/Desktop/03.MENSANA/mensana-next/src/components/reservas/ModalPago.tsx",
                    lineNumber: 64,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "space-y-4",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "bg-gray-50 rounded-xl p-3",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: "font-medium text-sm",
                                    style: {
                                        color: colors.text
                                    },
                                    children: reserva.consultante_nombre || 'Sin nombre'
                                }, void 0, false, {
                                    fileName: "[project]/Desktop/03.MENSANA/mensana-next/src/components/reservas/ModalPago.tsx",
                                    lineNumber: 74,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: "text-xs mt-0.5",
                                    style: {
                                        color: colors.textSecondary
                                    },
                                    children: [
                                        reserva.fecha,
                                        " · ",
                                        reserva.hora_inicio?.substring(0, 5)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/Desktop/03.MENSANA/mensana-next/src/components/reservas/ModalPago.tsx",
                                    lineNumber: 77,
                                    columnNumber: 13
                                }, this),
                                precioServicio && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: "text-xs mt-1",
                                    style: {
                                        color: colors.primary
                                    },
                                    children: [
                                        precioServicio.nombre,
                                        " · Precio sugerido: $",
                                        precioServicio.precio
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/Desktop/03.MENSANA/mensana-next/src/components/reservas/ModalPago.tsx",
                                    lineNumber: 81,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/Desktop/03.MENSANA/mensana-next/src/components/reservas/ModalPago.tsx",
                            lineNumber: 73,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                    className: "block text-sm font-medium mb-1",
                                    style: {
                                        color: colors.text
                                    },
                                    children: "Monto a cobrar"
                                }, void 0, false, {
                                    fileName: "[project]/Desktop/03.MENSANA/mensana-next/src/components/reservas/ModalPago.tsx",
                                    lineNumber: 89,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                    type: "number",
                                    value: monto,
                                    onChange: (e)=>setMonto(e.target.value),
                                    placeholder: "2500",
                                    className: "w-full px-3 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500",
                                    style: {
                                        borderColor: colors.border
                                    }
                                }, void 0, false, {
                                    fileName: "[project]/Desktop/03.MENSANA/mensana-next/src/components/reservas/ModalPago.tsx",
                                    lineNumber: 90,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/Desktop/03.MENSANA/mensana-next/src/components/reservas/ModalPago.tsx",
                            lineNumber: 88,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                    className: "block text-sm font-medium mb-2",
                                    style: {
                                        color: colors.text
                                    },
                                    children: "Método de pago"
                                }, void 0, false, {
                                    fileName: "[project]/Desktop/03.MENSANA/mensana-next/src/components/reservas/ModalPago.tsx",
                                    lineNumber: 102,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "grid grid-cols-2 gap-2",
                                    children: METODOS_PAGO.map((m)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                            onClick: ()=>setMetodoPago(m.id),
                                            className: "py-2 px-3 rounded-lg text-xs font-medium transition text-left",
                                            style: {
                                                background: metodoPago === m.id ? colors.primary : colors.primaryFaded,
                                                color: metodoPago === m.id ? '#fff' : colors.primary
                                            },
                                            children: m.nombre
                                        }, m.id, false, {
                                            fileName: "[project]/Desktop/03.MENSANA/mensana-next/src/components/reservas/ModalPago.tsx",
                                            lineNumber: 105,
                                            columnNumber: 17
                                        }, this))
                                }, void 0, false, {
                                    fileName: "[project]/Desktop/03.MENSANA/mensana-next/src/components/reservas/ModalPago.tsx",
                                    lineNumber: 103,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/Desktop/03.MENSANA/mensana-next/src/components/reservas/ModalPago.tsx",
                            lineNumber: 101,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                            className: "flex items-center gap-3 cursor-pointer",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                    type: "checkbox",
                                    checked: pagado,
                                    onChange: (e)=>setPagado(e.target.checked),
                                    className: "w-4 h-4 rounded"
                                }, void 0, false, {
                                    fileName: "[project]/Desktop/03.MENSANA/mensana-next/src/components/reservas/ModalPago.tsx",
                                    lineNumber: 122,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "text-sm font-medium",
                                    style: {
                                        color: colors.text
                                    },
                                    children: "Marcar como pagado"
                                }, void 0, false, {
                                    fileName: "[project]/Desktop/03.MENSANA/mensana-next/src/components/reservas/ModalPago.tsx",
                                    lineNumber: 128,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/Desktop/03.MENSANA/mensana-next/src/components/reservas/ModalPago.tsx",
                            lineNumber: 121,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/Desktop/03.MENSANA/mensana-next/src/components/reservas/ModalPago.tsx",
                    lineNumber: 71,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "flex gap-3 mt-6",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            onClick: onClose,
                            className: "flex-1 py-2.5 rounded-lg border text-sm font-medium",
                            style: {
                                borderColor: colors.border,
                                color: colors.text
                            },
                            children: "Cancelar"
                        }, void 0, false, {
                            fileName: "[project]/Desktop/03.MENSANA/mensana-next/src/components/reservas/ModalPago.tsx",
                            lineNumber: 133,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            onClick: handleGuardar,
                            disabled: guardando,
                            className: "flex-1 py-2.5 rounded-lg text-sm font-medium text-white disabled:opacity-60",
                            style: {
                                background: colors.primary
                            },
                            children: guardando ? 'Guardando...' : 'Guardar'
                        }, void 0, false, {
                            fileName: "[project]/Desktop/03.MENSANA/mensana-next/src/components/reservas/ModalPago.tsx",
                            lineNumber: 136,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/Desktop/03.MENSANA/mensana-next/src/components/reservas/ModalPago.tsx",
                    lineNumber: 132,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/Desktop/03.MENSANA/mensana-next/src/components/reservas/ModalPago.tsx",
            lineNumber: 63,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/Desktop/03.MENSANA/mensana-next/src/components/reservas/ModalPago.tsx",
        lineNumber: 62,
        columnNumber: 5
    }, this);
}
}),
"[project]/Desktop/03.MENSANA/mensana-next/src/components/reservas/ModalFicha.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>ModalFicha
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/03.MENSANA/mensana-next/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/03.MENSANA/mensana-next/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$src$2f$context$2f$ThemeContext$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/03.MENSANA/mensana-next/src/context/ThemeContext.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$src$2f$config$2f$supabase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/03.MENSANA/mensana-next/src/config/supabase.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$src$2f$services$2f$database$2e$service$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/03.MENSANA/mensana-next/src/services/database.service.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__X$3e$__ = __turbopack_context__.i("[project]/Desktop/03.MENSANA/mensana-next/node_modules/lucide-react/dist/esm/icons/x.js [app-ssr] (ecmascript) <export default as X>");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$lock$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Lock$3e$__ = __turbopack_context__.i("[project]/Desktop/03.MENSANA/mensana-next/node_modules/lucide-react/dist/esm/icons/lock.js [app-ssr] (ecmascript) <export default as Lock>");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$check$2d$big$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__CheckCircle$3e$__ = __turbopack_context__.i("[project]/Desktop/03.MENSANA/mensana-next/node_modules/lucide-react/dist/esm/icons/circle-check-big.js [app-ssr] (ecmascript) <export default as CheckCircle>");
'use client';
;
;
;
;
;
;
const METODOS_PAGO = [
    {
        id: 'efectivo',
        nombre: 'Efectivo'
    },
    {
        id: 'transferencia',
        nombre: 'Transferencia'
    },
    {
        id: 'tarjeta_debito',
        nombre: 'Tarj. Débito'
    },
    {
        id: 'tarjeta_credito',
        nombre: 'Tarj. Crédito'
    },
    {
        id: 'mercadopago',
        nombre: 'Mercado Pago'
    },
    {
        id: 'obra_social',
        nombre: 'Obra Social'
    },
    {
        id: 'otro',
        nombre: 'Otro'
    }
];
function ModalFicha({ open, onClose, onSaved, reserva, profile }) {
    const { colors } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$src$2f$context$2f$ThemeContext$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useTheme"])();
    const [notas, setNotas] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])('');
    const [fichaId, setFichaId] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const [monto, setMonto] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])('');
    const [metodoPago, setMetodoPago] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const [pagado, setPagado] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [servicioId, setServicioId] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const [servicios, setServicios] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])([]);
    const [historial, setHistorial] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])([]);
    const [guardando, setGuardando] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [error, setError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        if (!open || !reserva) return;
        // Datos de pago desde reserva
        setMonto(reserva.precio_total ? reserva.precio_total.toString() : '');
        setMetodoPago(reserva.metodo_pago || null);
        setPagado(reserva.pagado || false);
        setServicioId(reserva.servicio_id || null);
        setNotas('');
        setFichaId(null);
        setHistorial([]);
        setError(null);
        // Cargar ficha existente para esta reserva
        __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$src$2f$config$2f$supabase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["supabase"].from('fichas').select('id, nota').eq('reserva_id', reserva.id).maybeSingle().then(({ data })=>{
            if (data) {
                setFichaId(data.id);
                setNotas(data.nota || '');
            }
        });
        // Cargar servicios de la empresa
        __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$src$2f$services$2f$database$2e$service$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["DatabaseService"].obtenerTiposSesion(profile?.empresaId || null).then((r)=>{
            if (r.success) setServicios(r.data || []);
        });
        // Historial: últimas 3 reservas pagadas del mismo cliente (con ficha si tiene)
        const clienteId = reserva.cliente_id || reserva.consultante_id;
        if (clienteId) {
            __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$src$2f$config$2f$supabase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["supabase"].from('reservas').select('id, fecha, hora_inicio, precio_total, servicio_id, servicios(nombre), fichas(nota)').eq('cliente_id', clienteId).eq('pagado', true).neq('id', reserva.id).order('fecha', {
                ascending: false
            }).order('hora_inicio', {
                ascending: false
            }).limit(3).then(({ data })=>{
                if (data) setHistorial(data);
            });
        }
    }, [
        open,
        reserva
    ]);
    const handleGuardar = async ()=>{
        setGuardando(true);
        setError(null);
        // 1. Actualizar reserva (pago + servicio)
        const { error: errReserva } = await __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$src$2f$config$2f$supabase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["supabase"].from('reservas').update({
            servicio_id: servicioId,
            precio_total: monto ? parseFloat(monto) : null,
            metodo_pago: metodoPago,
            pagado,
            profesional_id: reserva.profesional_id || profile?.profesionalId || null,
            empresa_id: reserva.empresa_id || profile?.empresaId || null,
            autor_id: reserva.autor_id || profile?.usuarioId || null
        }).eq('id', reserva.id);
        if (errReserva) {
            setError(errReserva.message);
            setGuardando(false);
            return;
        }
        // 2. Guardar notas en fichas (upsert por reserva_id)
        if (notas.trim() || fichaId) {
            if (fichaId) {
                await __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$src$2f$config$2f$supabase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["supabase"].from('fichas').update({
                    nota: notas
                }).eq('id', fichaId);
            } else {
                await __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$src$2f$config$2f$supabase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["supabase"].from('fichas').insert({
                    reserva_id: reserva.id,
                    nota: notas,
                    fecha: new Date().toISOString()
                });
            }
        }
        setGuardando(false);
        onSaved();
    };
    if (!open) return null;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4",
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "bg-white rounded-2xl w-full max-w-md flex flex-col overflow-hidden",
            style: {
                maxHeight: '90vh'
            },
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "flex items-center justify-between px-6 py-4 border-b",
                    style: {
                        borderColor: colors.borderLight
                    },
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            onClick: onClose,
                            className: "p-1.5 rounded-full hover:bg-gray-100 transition",
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__X$3e$__["X"], {
                                size: 18,
                                style: {
                                    color: colors.textSecondary
                                }
                            }, void 0, false, {
                                fileName: "[project]/Desktop/03.MENSANA/mensana-next/src/components/reservas/ModalFicha.tsx",
                                lineNumber: 133,
                                columnNumber: 13
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/Desktop/03.MENSANA/mensana-next/src/components/reservas/ModalFicha.tsx",
                            lineNumber: 132,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                            className: "flex-1 text-center text-base font-bold lowercase",
                            style: {
                                color: colors.text
                            },
                            children: "ficha · cobro"
                        }, void 0, false, {
                            fileName: "[project]/Desktop/03.MENSANA/mensana-next/src/components/reservas/ModalFicha.tsx",
                            lineNumber: 135,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "w-8"
                        }, void 0, false, {
                            fileName: "[project]/Desktop/03.MENSANA/mensana-next/src/components/reservas/ModalFicha.tsx",
                            lineNumber: 138,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/Desktop/03.MENSANA/mensana-next/src/components/reservas/ModalFicha.tsx",
                    lineNumber: 131,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "flex-1 overflow-auto p-6 space-y-6",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                            className: "space-y-2",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                    className: "text-xs font-semibold lowercase tracking-wide",
                                    style: {
                                        color: colors.primary
                                    },
                                    children: "resumen de la cita"
                                }, void 0, false, {
                                    fileName: "[project]/Desktop/03.MENSANA/mensana-next/src/components/reservas/ModalFicha.tsx",
                                    lineNumber: 146,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "rounded-xl p-4",
                                    style: {
                                        background: colors.primaryFaded
                                    },
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            className: "font-medium text-sm lowercase",
                                            style: {
                                                color: colors.text
                                            },
                                            children: [
                                                "cliente: ",
                                                reserva?.consultante_nombre || 'sin nombre'
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/Desktop/03.MENSANA/mensana-next/src/components/reservas/ModalFicha.tsx",
                                            lineNumber: 150,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            className: "text-xs mt-0.5 lowercase",
                                            style: {
                                                color: colors.textSecondary
                                            },
                                            children: [
                                                reserva?.fecha,
                                                " · ",
                                                reserva?.hora_inicio?.substring(0, 5),
                                                reserva?.estado ? ` · ${reserva.estado}` : ''
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/Desktop/03.MENSANA/mensana-next/src/components/reservas/ModalFicha.tsx",
                                            lineNumber: 153,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/Desktop/03.MENSANA/mensana-next/src/components/reservas/ModalFicha.tsx",
                                    lineNumber: 149,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/Desktop/03.MENSANA/mensana-next/src/components/reservas/ModalFicha.tsx",
                            lineNumber: 145,
                            columnNumber: 11
                        }, this),
                        historial.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                            className: "space-y-2",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                    className: "text-xs font-semibold lowercase tracking-wide",
                                    style: {
                                        color: colors.primary
                                    },
                                    children: "últimas visitas"
                                }, void 0, false, {
                                    fileName: "[project]/Desktop/03.MENSANA/mensana-next/src/components/reservas/ModalFicha.tsx",
                                    lineNumber: 163,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "space-y-1.5",
                                    children: historial.map((h)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "rounded-lg px-3 py-2",
                                            style: {
                                                background: colors.primaryFaded
                                            },
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "flex items-center justify-between",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                    className: "text-xs font-medium lowercase",
                                                                    style: {
                                                                        color: colors.text
                                                                    },
                                                                    children: [
                                                                        h.fecha,
                                                                        " · ",
                                                                        h.hora_inicio?.substring(0, 5)
                                                                    ]
                                                                }, void 0, true, {
                                                                    fileName: "[project]/Desktop/03.MENSANA/mensana-next/src/components/reservas/ModalFicha.tsx",
                                                                    lineNumber: 171,
                                                                    columnNumber: 25
                                                                }, this),
                                                                h.servicios?.nombre && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                    className: "text-xs lowercase",
                                                                    style: {
                                                                        color: colors.textSecondary
                                                                    },
                                                                    children: h.servicios.nombre
                                                                }, void 0, false, {
                                                                    fileName: "[project]/Desktop/03.MENSANA/mensana-next/src/components/reservas/ModalFicha.tsx",
                                                                    lineNumber: 175,
                                                                    columnNumber: 27
                                                                }, this)
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/Desktop/03.MENSANA/mensana-next/src/components/reservas/ModalFicha.tsx",
                                                            lineNumber: 170,
                                                            columnNumber: 23
                                                        }, this),
                                                        h.precio_total != null && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            className: "text-xs font-semibold",
                                                            style: {
                                                                color: colors.primary
                                                            },
                                                            children: [
                                                                "$",
                                                                h.precio_total
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/Desktop/03.MENSANA/mensana-next/src/components/reservas/ModalFicha.tsx",
                                                            lineNumber: 179,
                                                            columnNumber: 25
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/Desktop/03.MENSANA/mensana-next/src/components/reservas/ModalFicha.tsx",
                                                    lineNumber: 169,
                                                    columnNumber: 21
                                                }, this),
                                                h.fichas?.[0]?.nota && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                    className: "text-xs mt-1 italic",
                                                    style: {
                                                        color: colors.textMuted
                                                    },
                                                    children: h.fichas[0].nota
                                                }, void 0, false, {
                                                    fileName: "[project]/Desktop/03.MENSANA/mensana-next/src/components/reservas/ModalFicha.tsx",
                                                    lineNumber: 183,
                                                    columnNumber: 23
                                                }, this)
                                            ]
                                        }, h.id, true, {
                                            fileName: "[project]/Desktop/03.MENSANA/mensana-next/src/components/reservas/ModalFicha.tsx",
                                            lineNumber: 168,
                                            columnNumber: 19
                                        }, this))
                                }, void 0, false, {
                                    fileName: "[project]/Desktop/03.MENSANA/mensana-next/src/components/reservas/ModalFicha.tsx",
                                    lineNumber: 166,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/Desktop/03.MENSANA/mensana-next/src/components/reservas/ModalFicha.tsx",
                            lineNumber: 162,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                            className: "space-y-2",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                    className: "text-xs font-semibold lowercase tracking-wide",
                                    style: {
                                        color: colors.primary
                                    },
                                    children: "notas internas"
                                }, void 0, false, {
                                    fileName: "[project]/Desktop/03.MENSANA/mensana-next/src/components/reservas/ModalFicha.tsx",
                                    lineNumber: 195,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "relative",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("textarea", {
                                            value: notas,
                                            onChange: (e)=>setNotas(e.target.value),
                                            placeholder: "observaciones clínicas o notas privadas — no visibles para el cliente...",
                                            className: "w-full min-h-[140px] rounded-xl p-4 text-sm resize-none focus:outline-none",
                                            style: {
                                                background: colors.primaryFaded,
                                                border: `1px solid ${colors.borderLight}`,
                                                color: colors.text
                                            }
                                        }, void 0, false, {
                                            fileName: "[project]/Desktop/03.MENSANA/mensana-next/src/components/reservas/ModalFicha.tsx",
                                            lineNumber: 199,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "absolute bottom-3 right-3 pointer-events-none",
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$lock$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Lock$3e$__["Lock"], {
                                                size: 14,
                                                style: {
                                                    color: colors.borderLight
                                                }
                                            }, void 0, false, {
                                                fileName: "[project]/Desktop/03.MENSANA/mensana-next/src/components/reservas/ModalFicha.tsx",
                                                lineNumber: 211,
                                                columnNumber: 17
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/Desktop/03.MENSANA/mensana-next/src/components/reservas/ModalFicha.tsx",
                                            lineNumber: 210,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/Desktop/03.MENSANA/mensana-next/src/components/reservas/ModalFicha.tsx",
                                    lineNumber: 198,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/Desktop/03.MENSANA/mensana-next/src/components/reservas/ModalFicha.tsx",
                            lineNumber: 194,
                            columnNumber: 11
                        }, this),
                        servicios.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                            className: "space-y-2",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                    className: "text-xs font-semibold lowercase tracking-wide",
                                    style: {
                                        color: colors.primary
                                    },
                                    children: "servicio"
                                }, void 0, false, {
                                    fileName: "[project]/Desktop/03.MENSANA/mensana-next/src/components/reservas/ModalFicha.tsx",
                                    lineNumber: 219,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "grid grid-cols-2 gap-2",
                                    children: servicios.map((s)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                            onClick: ()=>{
                                                setServicioId(s.id);
                                                if (!monto && s.precio) setMonto(s.precio.toString());
                                            },
                                            className: "py-2 px-3 rounded-lg text-xs font-medium text-left transition",
                                            style: {
                                                background: servicioId === s.id ? colors.primary : colors.primaryFaded,
                                                color: servicioId === s.id ? '#fff' : colors.primary
                                            },
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "block truncate",
                                                    children: s.nombre
                                                }, void 0, false, {
                                                    fileName: "[project]/Desktop/03.MENSANA/mensana-next/src/components/reservas/ModalFicha.tsx",
                                                    lineNumber: 236,
                                                    columnNumber: 21
                                                }, this),
                                                s.precio ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "opacity-70",
                                                    children: [
                                                        "$",
                                                        s.precio
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/Desktop/03.MENSANA/mensana-next/src/components/reservas/ModalFicha.tsx",
                                                    lineNumber: 237,
                                                    columnNumber: 33
                                                }, this) : null
                                            ]
                                        }, s.id, true, {
                                            fileName: "[project]/Desktop/03.MENSANA/mensana-next/src/components/reservas/ModalFicha.tsx",
                                            lineNumber: 224,
                                            columnNumber: 19
                                        }, this))
                                }, void 0, false, {
                                    fileName: "[project]/Desktop/03.MENSANA/mensana-next/src/components/reservas/ModalFicha.tsx",
                                    lineNumber: 222,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/Desktop/03.MENSANA/mensana-next/src/components/reservas/ModalFicha.tsx",
                            lineNumber: 218,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                            className: "space-y-3",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                    className: "text-xs font-semibold lowercase tracking-wide",
                                    style: {
                                        color: colors.primary
                                    },
                                    children: "detalles del pago"
                                }, void 0, false, {
                                    fileName: "[project]/Desktop/03.MENSANA/mensana-next/src/components/reservas/ModalFicha.tsx",
                                    lineNumber: 246,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                            className: "block text-xs mb-1 lowercase",
                                            style: {
                                                color: colors.textSecondary
                                            },
                                            children: "cobro realizado"
                                        }, void 0, false, {
                                            fileName: "[project]/Desktop/03.MENSANA/mensana-next/src/components/reservas/ModalFicha.tsx",
                                            lineNumber: 251,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "relative",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "absolute left-3 top-1/2 -translate-y-1/2 text-sm",
                                                    style: {
                                                        color: colors.textSecondary
                                                    },
                                                    children: "$"
                                                }, void 0, false, {
                                                    fileName: "[project]/Desktop/03.MENSANA/mensana-next/src/components/reservas/ModalFicha.tsx",
                                                    lineNumber: 253,
                                                    columnNumber: 17
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                    type: "number",
                                                    value: monto,
                                                    onChange: (e)=>setMonto(e.target.value),
                                                    placeholder: "0.00",
                                                    step: "0.01",
                                                    className: "w-full pl-7 pr-3 py-2.5 rounded-xl text-sm focus:outline-none",
                                                    style: {
                                                        background: colors.primaryFaded,
                                                        border: `1px solid ${colors.borderLight}`,
                                                        color: colors.text
                                                    }
                                                }, void 0, false, {
                                                    fileName: "[project]/Desktop/03.MENSANA/mensana-next/src/components/reservas/ModalFicha.tsx",
                                                    lineNumber: 254,
                                                    columnNumber: 17
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/Desktop/03.MENSANA/mensana-next/src/components/reservas/ModalFicha.tsx",
                                            lineNumber: 252,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/Desktop/03.MENSANA/mensana-next/src/components/reservas/ModalFicha.tsx",
                                    lineNumber: 250,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                            className: "block text-xs mb-2 lowercase",
                                            style: {
                                                color: colors.textSecondary
                                            },
                                            children: "método de pago"
                                        }, void 0, false, {
                                            fileName: "[project]/Desktop/03.MENSANA/mensana-next/src/components/reservas/ModalFicha.tsx",
                                            lineNumber: 267,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "grid grid-cols-3 gap-2",
                                            children: METODOS_PAGO.map((m)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                    onClick: ()=>setMetodoPago(m.id),
                                                    className: "py-2 px-2 rounded-lg text-xs font-medium transition",
                                                    style: {
                                                        background: metodoPago === m.id ? colors.primary : colors.primaryFaded,
                                                        color: metodoPago === m.id ? '#fff' : colors.primary
                                                    },
                                                    children: m.nombre
                                                }, m.id, false, {
                                                    fileName: "[project]/Desktop/03.MENSANA/mensana-next/src/components/reservas/ModalFicha.tsx",
                                                    lineNumber: 270,
                                                    columnNumber: 19
                                                }, this))
                                        }, void 0, false, {
                                            fileName: "[project]/Desktop/03.MENSANA/mensana-next/src/components/reservas/ModalFicha.tsx",
                                            lineNumber: 268,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/Desktop/03.MENSANA/mensana-next/src/components/reservas/ModalFicha.tsx",
                                    lineNumber: 266,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                    className: "flex items-center gap-3 cursor-pointer",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                            type: "checkbox",
                                            checked: pagado,
                                            onChange: (e)=>setPagado(e.target.checked),
                                            className: "w-4 h-4 rounded"
                                        }, void 0, false, {
                                            fileName: "[project]/Desktop/03.MENSANA/mensana-next/src/components/reservas/ModalFicha.tsx",
                                            lineNumber: 286,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "text-sm lowercase",
                                            style: {
                                                color: colors.text
                                            },
                                            children: "marcar como pagado"
                                        }, void 0, false, {
                                            fileName: "[project]/Desktop/03.MENSANA/mensana-next/src/components/reservas/ModalFicha.tsx",
                                            lineNumber: 292,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/Desktop/03.MENSANA/mensana-next/src/components/reservas/ModalFicha.tsx",
                                    lineNumber: 285,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/Desktop/03.MENSANA/mensana-next/src/components/reservas/ModalFicha.tsx",
                            lineNumber: 245,
                            columnNumber: 11
                        }, this),
                        error && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                            className: "text-xs text-red-500 text-center",
                            children: error
                        }, void 0, false, {
                            fileName: "[project]/Desktop/03.MENSANA/mensana-next/src/components/reservas/ModalFicha.tsx",
                            lineNumber: 297,
                            columnNumber: 13
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/Desktop/03.MENSANA/mensana-next/src/components/reservas/ModalFicha.tsx",
                    lineNumber: 142,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "px-6 py-4 border-t",
                    style: {
                        borderColor: colors.borderLight,
                        background: colors.primaryFaded
                    },
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            onClick: handleGuardar,
                            disabled: guardando,
                            className: "w-full py-3.5 rounded-xl text-sm font-bold text-white flex items-center justify-center gap-2 transition disabled:opacity-60",
                            style: {
                                background: colors.primary
                            },
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$check$2d$big$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__CheckCircle$3e$__["CheckCircle"], {
                                    size: 18
                                }, void 0, false, {
                                    fileName: "[project]/Desktop/03.MENSANA/mensana-next/src/components/reservas/ModalFicha.tsx",
                                    lineNumber: 309,
                                    columnNumber: 13
                                }, this),
                                guardando ? 'guardando...' : 'finalizar y guardar'
                            ]
                        }, void 0, true, {
                            fileName: "[project]/Desktop/03.MENSANA/mensana-next/src/components/reservas/ModalFicha.tsx",
                            lineNumber: 303,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                            className: "text-center text-[10px] mt-3 italic",
                            style: {
                                color: colors.textMuted
                            },
                            children: "esta información es confidencial y solo para uso profesional"
                        }, void 0, false, {
                            fileName: "[project]/Desktop/03.MENSANA/mensana-next/src/components/reservas/ModalFicha.tsx",
                            lineNumber: 312,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/Desktop/03.MENSANA/mensana-next/src/components/reservas/ModalFicha.tsx",
                    lineNumber: 302,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/Desktop/03.MENSANA/mensana-next/src/components/reservas/ModalFicha.tsx",
            lineNumber: 128,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/Desktop/03.MENSANA/mensana-next/src/components/reservas/ModalFicha.tsx",
        lineNumber: 127,
        columnNumber: 5
    }, this);
}
}),
"[project]/Desktop/03.MENSANA/mensana-next/app/admin/agenda/page.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>AgendaPage
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/03.MENSANA/mensana-next/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/03.MENSANA/mensana-next/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$src$2f$context$2f$AuthContext$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/03.MENSANA/mensana-next/src/context/AuthContext.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$src$2f$context$2f$ThemeContext$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/03.MENSANA/mensana-next/src/context/ThemeContext.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$src$2f$controllers$2f$ReservaController$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/03.MENSANA/mensana-next/src/controllers/ReservaController.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$src$2f$controllers$2f$ProfesionalController$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/03.MENSANA/mensana-next/src/controllers/ProfesionalController.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$src$2f$components$2f$reservas$2f$ModalReserva$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/03.MENSANA/mensana-next/src/components/reservas/ModalReserva.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$src$2f$components$2f$reservas$2f$ModalPago$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/03.MENSANA/mensana-next/src/components/reservas/ModalPago.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$src$2f$components$2f$reservas$2f$ModalFicha$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/03.MENSANA/mensana-next/src/components/reservas/ModalFicha.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$left$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronLeft$3e$__ = __turbopack_context__.i("[project]/Desktop/03.MENSANA/mensana-next/node_modules/lucide-react/dist/esm/icons/chevron-left.js [app-ssr] (ecmascript) <export default as ChevronLeft>");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$right$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronRight$3e$__ = __turbopack_context__.i("[project]/Desktop/03.MENSANA/mensana-next/node_modules/lucide-react/dist/esm/icons/chevron-right.js [app-ssr] (ecmascript) <export default as ChevronRight>");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$clipboard$2d$list$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__ClipboardList$3e$__ = __turbopack_context__.i("[project]/Desktop/03.MENSANA/mensana-next/node_modules/lucide-react/dist/esm/icons/clipboard-list.js [app-ssr] (ecmascript) <export default as ClipboardList>");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$node_modules$2f$clsx$2f$dist$2f$clsx$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/03.MENSANA/mensana-next/node_modules/clsx/dist/clsx.mjs [app-ssr] (ecmascript)");
'use client';
;
;
;
;
;
;
;
;
;
;
;
const DIAS_SEMANA = [
    'Dom',
    'Lun',
    'Mar',
    'Mié',
    'Jue',
    'Vie',
    'Sáb'
];
const MESES = [
    'enero',
    'febrero',
    'marzo',
    'abril',
    'mayo',
    'junio',
    'julio',
    'agosto',
    'septiembre',
    'octubre',
    'noviembre',
    'diciembre'
];
const HORARIOS = Array.from({
    length: 13
}, (_, i)=>i + 8); // 8-20h
function AgendaPage() {
    const { profile } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$src$2f$context$2f$AuthContext$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useAuth"])();
    const { colors } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$src$2f$context$2f$ThemeContext$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useTheme"])();
    const hoy = new Date().toISOString().split('T')[0];
    const [selectedDate, setSelectedDate] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(hoy);
    const [reservas, setReservas] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])([]);
    const [profesionales, setProfesionales] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])([]);
    const [loading, setLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(true);
    const [modalOpen, setModalOpen] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [pagoModal, setPagoModal] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])({
        open: false,
        reserva: null
    });
    const [fichaModal, setFichaModal] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])({
        open: false,
        reserva: null
    });
    const [editingReserva, setEditingReserva] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const [horaSeleccionada, setHoraSeleccionada] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const cargarReservas = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])(async ()=>{
        setLoading(true);
        const result = await __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$src$2f$controllers$2f$ReservaController$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ReservaController"].obtenerReservasPorFecha(selectedDate, profile?.profesionalId, profile);
        if (result.success) setReservas(result.data || []);
        setLoading(false);
    }, [
        selectedDate,
        profile
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        cargarReservas();
    }, [
        cargarReservas
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$src$2f$controllers$2f$ProfesionalController$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ProfesionalController"].obtenerProfesionales(profile).then((r)=>{
            if (r.success) setProfesionales(r.data || []);
        });
    }, [
        profile
    ]);
    const diasSemana = Array.from({
        length: 7
    }, (_, i)=>{
        const base = new Date(selectedDate + 'T12:00:00');
        base.setDate(base.getDate() + (i - 3));
        const str = base.toISOString().split('T')[0];
        return {
            fecha: str,
            diaSemana: DIAS_SEMANA[base.getDay()],
            diaNumero: base.getDate(),
            esHoy: str === hoy
        };
    });
    const fechaFormateada = (()=>{
        const f = new Date(selectedDate + 'T12:00:00');
        return `${DIAS_SEMANA[f.getDay()]}, ${f.getDate()} de ${MESES[f.getMonth()]}`;
    })();
    const getReservaParaHora = (hora)=>reservas.find((r)=>r.hora_inicio && parseInt(r.hora_inicio.split(':')[0]) === hora);
    const handleNuevaReserva = (hora)=>{
        setEditingReserva(null);
        setHoraSeleccionada(hora ? `${hora.toString().padStart(2, '0')}:00` : null);
        setModalOpen(true);
    };
    const handleEditarReserva = (reserva)=>{
        setEditingReserva(reserva);
        setHoraSeleccionada(null);
        setModalOpen(true);
    };
    const handleEliminarReserva = async (id)=>{
        if (!confirm('¿Eliminar esta reserva?')) return;
        await __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$src$2f$controllers$2f$ReservaController$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ReservaController"].eliminarReserva(id, profile);
        cargarReservas();
    };
    const navFecha = (dir)=>{
        const d = new Date(selectedDate + 'T12:00:00');
        d.setDate(d.getDate() + dir);
        setSelectedDate(d.toISOString().split('T')[0]);
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "flex flex-col h-full",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "px-6 pt-6 pb-4",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex items-center justify-between mb-4",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                            className: "text-2xl font-bold",
                            style: {
                                color: colors.text
                            },
                            children: "Agenda"
                        }, void 0, false, {
                            fileName: "[project]/Desktop/03.MENSANA/mensana-next/app/admin/agenda/page.tsx",
                            lineNumber: 93,
                            columnNumber: 11
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/Desktop/03.MENSANA/mensana-next/app/admin/agenda/page.tsx",
                        lineNumber: 92,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex items-center gap-2",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                onClick: ()=>navFecha(-1),
                                className: "p-1.5 rounded-lg hover:bg-gray-100 transition",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$left$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronLeft$3e$__["ChevronLeft"], {
                                    size: 20,
                                    style: {
                                        color: colors.text
                                    }
                                }, void 0, false, {
                                    fileName: "[project]/Desktop/03.MENSANA/mensana-next/app/admin/agenda/page.tsx",
                                    lineNumber: 99,
                                    columnNumber: 13
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/Desktop/03.MENSANA/mensana-next/app/admin/agenda/page.tsx",
                                lineNumber: 98,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex gap-1 flex-1 justify-center",
                                children: diasSemana.map((d)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        onClick: ()=>setSelectedDate(d.fecha),
                                        className: "flex flex-col items-center px-3 py-2 rounded-xl transition-all text-center flex-1 max-w-[64px]",
                                        style: {
                                            background: d.fecha === selectedDate ? colors.primary : 'transparent',
                                            color: d.fecha === selectedDate ? '#fff' : colors.text
                                        },
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "text-xs opacity-70",
                                                children: d.diaSemana
                                            }, void 0, false, {
                                                fileName: "[project]/Desktop/03.MENSANA/mensana-next/app/admin/agenda/page.tsx",
                                                lineNumber: 112,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$node_modules$2f$clsx$2f$dist$2f$clsx$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["clsx"])('text-sm font-bold mt-0.5', d.esHoy && d.fecha !== selectedDate && 'underline'),
                                                children: d.diaNumero
                                            }, void 0, false, {
                                                fileName: "[project]/Desktop/03.MENSANA/mensana-next/app/admin/agenda/page.tsx",
                                                lineNumber: 113,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, d.fecha, true, {
                                        fileName: "[project]/Desktop/03.MENSANA/mensana-next/app/admin/agenda/page.tsx",
                                        lineNumber: 103,
                                        columnNumber: 15
                                    }, this))
                            }, void 0, false, {
                                fileName: "[project]/Desktop/03.MENSANA/mensana-next/app/admin/agenda/page.tsx",
                                lineNumber: 101,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                onClick: ()=>navFecha(1),
                                className: "p-1.5 rounded-lg hover:bg-gray-100 transition",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$right$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronRight$3e$__["ChevronRight"], {
                                    size: 20,
                                    style: {
                                        color: colors.text
                                    }
                                }, void 0, false, {
                                    fileName: "[project]/Desktop/03.MENSANA/mensana-next/app/admin/agenda/page.tsx",
                                    lineNumber: 120,
                                    columnNumber: 13
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/Desktop/03.MENSANA/mensana-next/app/admin/agenda/page.tsx",
                                lineNumber: 119,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/Desktop/03.MENSANA/mensana-next/app/admin/agenda/page.tsx",
                        lineNumber: 97,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "text-sm mt-2 capitalize",
                        style: {
                            color: colors.textSecondary
                        },
                        children: fechaFormateada
                    }, void 0, false, {
                        fileName: "[project]/Desktop/03.MENSANA/mensana-next/app/admin/agenda/page.tsx",
                        lineNumber: 124,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/Desktop/03.MENSANA/mensana-next/app/admin/agenda/page.tsx",
                lineNumber: 91,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex-1 overflow-auto px-6 pb-6",
                children: loading ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "flex justify-center py-12",
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "animate-spin rounded-full h-8 w-8 border-b-2",
                        style: {
                            borderColor: colors.primary
                        }
                    }, void 0, false, {
                        fileName: "[project]/Desktop/03.MENSANA/mensana-next/app/admin/agenda/page.tsx",
                        lineNumber: 131,
                        columnNumber: 13
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/Desktop/03.MENSANA/mensana-next/app/admin/agenda/page.tsx",
                    lineNumber: 130,
                    columnNumber: 11
                }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "space-y-1",
                    children: HORARIOS.map((hora)=>{
                        const reserva = getReservaParaHora(hora);
                        const horaLabel = `${hora.toString().padStart(2, '0')}:00`;
                        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex items-stretch min-h-[56px]",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "w-16 text-xs pt-2 shrink-0",
                                    style: {
                                        color: colors.textMuted
                                    },
                                    children: horaLabel
                                }, void 0, false, {
                                    fileName: "[project]/Desktop/03.MENSANA/mensana-next/app/admin/agenda/page.tsx",
                                    lineNumber: 140,
                                    columnNumber: 19
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex-1 border-l pl-3",
                                    style: {
                                        borderColor: colors.borderLight
                                    },
                                    children: reserva ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "rounded-xl px-4 py-3 cursor-pointer hover:opacity-90 transition",
                                        style: {
                                            background: reserva.pagado ? colors.primaryFaded : '#FFF3CD',
                                            borderLeft: `4px solid ${reserva.pagado ? colors.primary : colors.warning}`
                                        },
                                        onClick: ()=>handleEditarReserva(reserva),
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "flex items-center justify-between",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                            className: "font-semibold text-sm",
                                                            style: {
                                                                color: colors.text
                                                            },
                                                            children: reserva.consultante_nombre || 'Sin nombre'
                                                        }, void 0, false, {
                                                            fileName: "[project]/Desktop/03.MENSANA/mensana-next/app/admin/agenda/page.tsx",
                                                            lineNumber: 150,
                                                            columnNumber: 29
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                            className: "text-xs mt-0.5",
                                                            style: {
                                                                color: colors.textSecondary
                                                            },
                                                            children: [
                                                                reserva.hora_inicio?.substring(0, 5),
                                                                " · ",
                                                                reserva.estado,
                                                                reserva.servicio_nombre ? ` · ${reserva.servicio_nombre}` : '',
                                                                reserva.precio_total ? ` · $${reserva.precio_total}` : ''
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/Desktop/03.MENSANA/mensana-next/app/admin/agenda/page.tsx",
                                                            lineNumber: 153,
                                                            columnNumber: 29
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/Desktop/03.MENSANA/mensana-next/app/admin/agenda/page.tsx",
                                                    lineNumber: 149,
                                                    columnNumber: 27
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "flex gap-2",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                            className: "flex items-center gap-1 text-xs px-3 py-1 rounded-lg",
                                                            style: {
                                                                background: colors.primaryFaded,
                                                                color: colors.primary
                                                            },
                                                            onClick: (e)=>{
                                                                e.stopPropagation();
                                                                setFichaModal({
                                                                    open: true,
                                                                    reserva
                                                                });
                                                            },
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$clipboard$2d$list$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__ClipboardList$3e$__["ClipboardList"], {
                                                                    size: 13
                                                                }, void 0, false, {
                                                                    fileName: "[project]/Desktop/03.MENSANA/mensana-next/app/admin/agenda/page.tsx",
                                                                    lineNumber: 165,
                                                                    columnNumber: 31
                                                                }, this),
                                                                "Ficha"
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/Desktop/03.MENSANA/mensana-next/app/admin/agenda/page.tsx",
                                                            lineNumber: 160,
                                                            columnNumber: 29
                                                        }, this),
                                                        !reserva.pagado && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                            className: "text-xs px-3 py-1 rounded-lg",
                                                            style: {
                                                                background: colors.primary,
                                                                color: '#fff'
                                                            },
                                                            onClick: (e)=>{
                                                                e.stopPropagation();
                                                                setPagoModal({
                                                                    open: true,
                                                                    reserva
                                                                });
                                                            },
                                                            children: "Cobrar"
                                                        }, void 0, false, {
                                                            fileName: "[project]/Desktop/03.MENSANA/mensana-next/app/admin/agenda/page.tsx",
                                                            lineNumber: 169,
                                                            columnNumber: 31
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                            className: "text-xs px-3 py-1 rounded-lg bg-red-50 text-red-600",
                                                            onClick: (e)=>{
                                                                e.stopPropagation();
                                                                handleEliminarReserva(reserva.id);
                                                            },
                                                            children: "Eliminar"
                                                        }, void 0, false, {
                                                            fileName: "[project]/Desktop/03.MENSANA/mensana-next/app/admin/agenda/page.tsx",
                                                            lineNumber: 177,
                                                            columnNumber: 29
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/Desktop/03.MENSANA/mensana-next/app/admin/agenda/page.tsx",
                                                    lineNumber: 159,
                                                    columnNumber: 27
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/Desktop/03.MENSANA/mensana-next/app/admin/agenda/page.tsx",
                                            lineNumber: 148,
                                            columnNumber: 25
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/Desktop/03.MENSANA/mensana-next/app/admin/agenda/page.tsx",
                                        lineNumber: 143,
                                        columnNumber: 23
                                    }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        onClick: ()=>handleNuevaReserva(hora),
                                        className: "w-full h-12 text-left text-xs rounded-xl px-3 hover:bg-gray-50 transition text-gray-300 hover:text-gray-400",
                                        children: "+ Agregar reserva"
                                    }, void 0, false, {
                                        fileName: "[project]/Desktop/03.MENSANA/mensana-next/app/admin/agenda/page.tsx",
                                        lineNumber: 187,
                                        columnNumber: 23
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/Desktop/03.MENSANA/mensana-next/app/admin/agenda/page.tsx",
                                    lineNumber: 141,
                                    columnNumber: 19
                                }, this)
                            ]
                        }, hora, true, {
                            fileName: "[project]/Desktop/03.MENSANA/mensana-next/app/admin/agenda/page.tsx",
                            lineNumber: 139,
                            columnNumber: 17
                        }, this);
                    })
                }, void 0, false, {
                    fileName: "[project]/Desktop/03.MENSANA/mensana-next/app/admin/agenda/page.tsx",
                    lineNumber: 134,
                    columnNumber: 11
                }, this)
            }, void 0, false, {
                fileName: "[project]/Desktop/03.MENSANA/mensana-next/app/admin/agenda/page.tsx",
                lineNumber: 128,
                columnNumber: 7
            }, this),
            modalOpen && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$src$2f$components$2f$reservas$2f$ModalReserva$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                open: modalOpen,
                onClose: ()=>setModalOpen(false),
                onSaved: ()=>{
                    setModalOpen(false);
                    cargarReservas();
                },
                fecha: selectedDate,
                horaInicial: horaSeleccionada,
                reservaEditar: editingReserva,
                profesionales: profesionales,
                profile: profile
            }, void 0, false, {
                fileName: "[project]/Desktop/03.MENSANA/mensana-next/app/admin/agenda/page.tsx",
                lineNumber: 203,
                columnNumber: 9
            }, this),
            pagoModal.open && pagoModal.reserva && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$src$2f$components$2f$reservas$2f$ModalPago$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                open: pagoModal.open,
                onClose: ()=>setPagoModal({
                        open: false,
                        reserva: null
                    }),
                onSaved: ()=>{
                    setPagoModal({
                        open: false,
                        reserva: null
                    });
                    cargarReservas();
                },
                reserva: pagoModal.reserva,
                profile: profile
            }, void 0, false, {
                fileName: "[project]/Desktop/03.MENSANA/mensana-next/app/admin/agenda/page.tsx",
                lineNumber: 216,
                columnNumber: 9
            }, this),
            fichaModal.open && fichaModal.reserva && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$src$2f$components$2f$reservas$2f$ModalFicha$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                open: fichaModal.open,
                onClose: ()=>setFichaModal({
                        open: false,
                        reserva: null
                    }),
                onSaved: ()=>{
                    setFichaModal({
                        open: false,
                        reserva: null
                    });
                    cargarReservas();
                },
                reserva: fichaModal.reserva,
                profile: profile
            }, void 0, false, {
                fileName: "[project]/Desktop/03.MENSANA/mensana-next/app/admin/agenda/page.tsx",
                lineNumber: 226,
                columnNumber: 9
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/Desktop/03.MENSANA/mensana-next/app/admin/agenda/page.tsx",
        lineNumber: 89,
        columnNumber: 5
    }, this);
}
}),
];

//# sourceMappingURL=Desktop_03_MENSANA_mensana-next_b697c942._.js.map