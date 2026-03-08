(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/Desktop/03.MENSANA/mensana-next/src/models/ReservaModel.js [app-client] (ecmascript)", ((__turbopack_context__) => {
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
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/Desktop/03.MENSANA/mensana-next/src/utils/permissions.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
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
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/Desktop/03.MENSANA/mensana-next/src/controllers/ReservaController.js [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ReservaController",
    ()=>ReservaController
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$src$2f$config$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/03.MENSANA/mensana-next/src/config/supabase.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$src$2f$models$2f$ReservaModel$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/03.MENSANA/mensana-next/src/models/ReservaModel.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$src$2f$utils$2f$permissions$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/03.MENSANA/mensana-next/src/utils/permissions.ts [app-client] (ecmascript)");
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
        const { data: usuarios } = await __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$src$2f$config$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["supabase"].from('usuarios').select('id, nombre_completo, email, telefono').in('id', todosIds);
        // Crear mapa para búsqueda rápida
        const usuariosMap = new Map((usuarios || []).map((u)=>[
                u.id,
                u
            ]));
        // Enriquecer cada reserva
        return reservas.map((reserva)=>{
            const cliente = usuariosMap.get(reserva.cliente_id);
            const profesional = usuariosMap.get(reserva.profesional_id);
            return new __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$src$2f$models$2f$ReservaModel$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ReservaModel"]({
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
        const { data: usuarioEmpresa } = await __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$src$2f$config$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["supabase"].from('usuario_empresa').select('usuario_id, roles!inner(nombre)').eq('empresa_id', profile.empresaId).in('roles.nombre', [
            'profesional',
            'admin'
        ]);
        return (usuarioEmpresa || []).map((r)=>r.usuario_id);
    }
    // Obtener reservas por fecha con datos del consultante
    static async obtenerReservasPorFecha(fecha, profesionalId, profile) {
        const permError = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$src$2f$utils$2f$permissions$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["requirePermission"])(profile, 'reservas:read');
        if (permError) return permError;
        try {
            let query = __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$src$2f$config$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["supabase"].from('reservas').select('*, servicios(nombre)').eq('fecha', fecha).order('hora_inicio', {
                ascending: true
            });
            // Scoping por empresa
            if (profile.rol !== 'superadmin') {
                const empError = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$src$2f$utils$2f$permissions$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["requireEmpresa"])(profile);
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
        const permError = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$src$2f$utils$2f$permissions$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["requirePermission"])(profile, 'reservas:read');
        if (permError) return permError;
        try {
            let query = __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$src$2f$config$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["supabase"].from('reservas').select('fecha').gte('fecha', mesInicio).lte('fecha', mesFin);
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
        const permError = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$src$2f$utils$2f$permissions$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["requirePermission"])(profile, 'reservas:write');
        if (permError) return permError;
        try {
            const reserva = new __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$src$2f$models$2f$ReservaModel$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ReservaModel"]({
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
            const { data, error } = await __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$src$2f$config$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["supabase"].from('reservas').insert([
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
        const permError = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$src$2f$utils$2f$permissions$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["requirePermission"])(profile, 'reservas:write');
        if (permError) return permError;
        try {
            const { error } = await __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$src$2f$config$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["supabase"].from('reservas').delete().eq('id', id);
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
        const permError = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$src$2f$utils$2f$permissions$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["requirePermission"])(profile, 'reservas:write');
        if (permError) return permError;
        try {
            const { error } = await __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$src$2f$config$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["supabase"].from('reservas').update({
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
        const permError = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$src$2f$utils$2f$permissions$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["requirePermission"])(profile, 'reservas:read');
        if (permError) return permError;
        try {
            let query = __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$src$2f$config$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["supabase"].from('reservas').select('*').order('fecha', {
                ascending: false
            });
            // Scoping por empresa
            if (profile.rol !== 'superadmin') {
                const empError = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$src$2f$utils$2f$permissions$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["requireEmpresa"])(profile);
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
            const { data: usuarios } = await __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$src$2f$config$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["supabase"].from('usuarios').select('id, nombre_completo, email, telefono').in('id', todosIds);
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
        const permError = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$src$2f$utils$2f$permissions$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["requirePermission"])(profile, 'reportes:read');
        if (permError) return permError;
        try {
            let query = __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$src$2f$config$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["supabase"].from('reservas').select('*').eq('fecha', fecha);
            // Scoping por empresa
            if (profile.rol !== 'superadmin') {
                const empError = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$src$2f$utils$2f$permissions$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["requireEmpresa"])(profile);
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
        const permError = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$src$2f$utils$2f$permissions$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["requirePermission"])(profile, 'reservas:write');
        if (permError) return permError;
        try {
            const updateData = {};
            if (pagoData.precio_total !== undefined) updateData.precio_total = pagoData.precio_total;
            if (pagoData.metodo_pago !== undefined) updateData.metodo_pago = pagoData.metodo_pago;
            if (pagoData.pagado !== undefined) updateData.pagado = pagoData.pagado;
            const { error } = await __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$src$2f$config$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["supabase"].from('reservas').update(updateData).eq('id', id);
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
        const permError = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$src$2f$utils$2f$permissions$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["requirePermission"])(profile, 'reservas:write');
        if (permError) return permError;
        try {
            const reserva = new __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$src$2f$models$2f$ReservaModel$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ReservaModel"]({
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
            const { data, error } = await __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$src$2f$config$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["supabase"].from('reservas').update(updateData).eq('id', id).select('*');
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
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/Desktop/03.MENSANA/mensana-next/app/admin/agenda-mensual/page.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>AgendaMensualPage
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/03.MENSANA/mensana-next/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/03.MENSANA/mensana-next/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$src$2f$context$2f$AuthContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/03.MENSANA/mensana-next/src/context/AuthContext.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$src$2f$context$2f$ThemeContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/03.MENSANA/mensana-next/src/context/ThemeContext.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$src$2f$controllers$2f$ReservaController$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/03.MENSANA/mensana-next/src/controllers/ReservaController.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$left$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronLeft$3e$__ = __turbopack_context__.i("[project]/Desktop/03.MENSANA/mensana-next/node_modules/lucide-react/dist/esm/icons/chevron-left.js [app-client] (ecmascript) <export default as ChevronLeft>");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$right$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronRight$3e$__ = __turbopack_context__.i("[project]/Desktop/03.MENSANA/mensana-next/node_modules/lucide-react/dist/esm/icons/chevron-right.js [app-client] (ecmascript) <export default as ChevronRight>");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/03.MENSANA/mensana-next/node_modules/next/navigation.js [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
'use client';
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
    'Enero',
    'Febrero',
    'Marzo',
    'Abril',
    'Mayo',
    'Junio',
    'Julio',
    'Agosto',
    'Septiembre',
    'Octubre',
    'Noviembre',
    'Diciembre'
];
function AgendaMensualPage() {
    _s();
    const { profile } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$src$2f$context$2f$AuthContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAuth"])();
    const { colors } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$src$2f$context$2f$ThemeContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTheme"])();
    const router = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRouter"])();
    const now = new Date();
    const [mes, setMes] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(now.getMonth() + 1);
    const [año, setAño] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(now.getFullYear());
    const [fechasConReservas, setFechasConReservas] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(new Set());
    const [loading, setLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const cargar = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "AgendaMensualPage.useCallback[cargar]": async ()=>{
            setLoading(true);
            const mesStr = mes.toString().padStart(2, '0');
            const ultimoDia = new Date(año, mes, 0).getDate();
            const inicio = `${año}-${mesStr}-01`;
            const fin = `${año}-${mesStr}-${ultimoDia.toString().padStart(2, '0')}`;
            const result = await __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$src$2f$controllers$2f$ReservaController$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ReservaController"].obtenerFechasConReservas(inicio, fin, profile?.profesionalId, profile);
            if (result.success && 'data' in result) {
                setFechasConReservas(new Set(result.data.map({
                    "AgendaMensualPage.useCallback[cargar]": (r)=>r.fecha
                }["AgendaMensualPage.useCallback[cargar]"])));
            }
            setLoading(false);
        }
    }["AgendaMensualPage.useCallback[cargar]"], [
        mes,
        año,
        profile
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "AgendaMensualPage.useEffect": ()=>{
            cargar();
        }
    }["AgendaMensualPage.useEffect"], [
        cargar
    ]);
    const cambiarMes = (dir)=>{
        let nuevoMes = mes + dir;
        let nuevoAño = año;
        if (nuevoMes > 12) {
            nuevoMes = 1;
            nuevoAño++;
        } else if (nuevoMes < 1) {
            nuevoMes = 12;
            nuevoAño--;
        }
        setMes(nuevoMes);
        setAño(nuevoAño);
    };
    const primerDia = new Date(año, mes - 1, 1).getDay();
    const ultimoDia = new Date(año, mes, 0).getDate();
    const hoy = new Date().toISOString().split('T')[0];
    const celdas = Array.from({
        length: primerDia + ultimoDia
    }, (_, i)=>{
        if (i < primerDia) return null;
        const d = i - primerDia + 1;
        const fecha = `${año}-${mes.toString().padStart(2, '0')}-${d.toString().padStart(2, '0')}`;
        return {
            dia: d,
            fecha
        };
    });
    const irAAgenda = (fecha)=>{
        router.push(`/admin/agenda?fecha=${fecha}`);
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "p-6 max-w-2xl mx-auto",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                className: "text-2xl font-bold mb-6",
                style: {
                    color: colors.text
                },
                children: "Agenda Mensual"
            }, void 0, false, {
                fileName: "[project]/Desktop/03.MENSANA/mensana-next/app/admin/agenda-mensual/page.tsx",
                lineNumber: 66,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "bg-white rounded-xl border p-5 shadow-sm",
                style: {
                    borderColor: colors.border
                },
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex items-center justify-between mb-6",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                onClick: ()=>cambiarMes(-1),
                                className: "p-2 rounded-lg hover:bg-gray-100 transition",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$left$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronLeft$3e$__["ChevronLeft"], {
                                    size: 20,
                                    style: {
                                        color: colors.text
                                    }
                                }, void 0, false, {
                                    fileName: "[project]/Desktop/03.MENSANA/mensana-next/app/admin/agenda-mensual/page.tsx",
                                    lineNumber: 72,
                                    columnNumber: 13
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/Desktop/03.MENSANA/mensana-next/app/admin/agenda-mensual/page.tsx",
                                lineNumber: 71,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "font-semibold text-lg",
                                style: {
                                    color: colors.text
                                },
                                children: [
                                    MESES[mes - 1],
                                    " ",
                                    año
                                ]
                            }, void 0, true, {
                                fileName: "[project]/Desktop/03.MENSANA/mensana-next/app/admin/agenda-mensual/page.tsx",
                                lineNumber: 74,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                onClick: ()=>cambiarMes(1),
                                className: "p-2 rounded-lg hover:bg-gray-100 transition",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$right$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronRight$3e$__["ChevronRight"], {
                                    size: 20,
                                    style: {
                                        color: colors.text
                                    }
                                }, void 0, false, {
                                    fileName: "[project]/Desktop/03.MENSANA/mensana-next/app/admin/agenda-mensual/page.tsx",
                                    lineNumber: 76,
                                    columnNumber: 13
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/Desktop/03.MENSANA/mensana-next/app/admin/agenda-mensual/page.tsx",
                                lineNumber: 75,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/Desktop/03.MENSANA/mensana-next/app/admin/agenda-mensual/page.tsx",
                        lineNumber: 70,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "grid grid-cols-7 mb-2",
                        children: DIAS_SEMANA.map((d)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "text-center text-xs font-medium py-1",
                                style: {
                                    color: colors.textSecondary
                                },
                                children: d
                            }, d, false, {
                                fileName: "[project]/Desktop/03.MENSANA/mensana-next/app/admin/agenda-mensual/page.tsx",
                                lineNumber: 83,
                                columnNumber: 13
                            }, this))
                    }, void 0, false, {
                        fileName: "[project]/Desktop/03.MENSANA/mensana-next/app/admin/agenda-mensual/page.tsx",
                        lineNumber: 81,
                        columnNumber: 9
                    }, this),
                    loading ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex justify-center py-8",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "animate-spin rounded-full h-7 w-7 border-b-2",
                            style: {
                                borderColor: colors.primary
                            }
                        }, void 0, false, {
                            fileName: "[project]/Desktop/03.MENSANA/mensana-next/app/admin/agenda-mensual/page.tsx",
                            lineNumber: 90,
                            columnNumber: 13
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/Desktop/03.MENSANA/mensana-next/app/admin/agenda-mensual/page.tsx",
                        lineNumber: 89,
                        columnNumber: 11
                    }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "grid grid-cols-7 gap-1",
                        children: celdas.map((celda, i)=>{
                            if (!celda) return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {}, `empty-${i}`, false, {
                                fileName: "[project]/Desktop/03.MENSANA/mensana-next/app/admin/agenda-mensual/page.tsx",
                                lineNumber: 95,
                                columnNumber: 34
                            }, this);
                            const tieneReservas = fechasConReservas.has(celda.fecha);
                            const esHoy = celda.fecha === hoy;
                            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                onClick: ()=>irAAgenda(celda.fecha),
                                className: "aspect-square rounded-xl flex flex-col items-center justify-center text-sm font-medium transition-all hover:opacity-90 relative",
                                style: {
                                    background: esHoy ? colors.primary : tieneReservas ? colors.primaryFaded : 'transparent',
                                    color: esHoy ? '#fff' : tieneReservas ? colors.primary : colors.text,
                                    border: tieneReservas && !esHoy ? `1px solid ${colors.primaryLight}` : '1px solid transparent'
                                },
                                children: [
                                    celda.dia,
                                    tieneReservas && !esHoy && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "absolute bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full",
                                        style: {
                                            background: colors.primary
                                        }
                                    }, void 0, false, {
                                        fileName: "[project]/Desktop/03.MENSANA/mensana-next/app/admin/agenda-mensual/page.tsx",
                                        lineNumber: 111,
                                        columnNumber: 21
                                    }, this)
                                ]
                            }, celda.fecha, true, {
                                fileName: "[project]/Desktop/03.MENSANA/mensana-next/app/admin/agenda-mensual/page.tsx",
                                lineNumber: 99,
                                columnNumber: 17
                            }, this);
                        })
                    }, void 0, false, {
                        fileName: "[project]/Desktop/03.MENSANA/mensana-next/app/admin/agenda-mensual/page.tsx",
                        lineNumber: 93,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex gap-4 mt-4 pt-4 border-t",
                        style: {
                            borderColor: colors.borderLight
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex items-center gap-2 text-xs",
                                style: {
                                    color: colors.textSecondary
                                },
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "w-3 h-3 rounded-full inline-block",
                                        style: {
                                            background: colors.primary
                                        }
                                    }, void 0, false, {
                                        fileName: "[project]/Desktop/03.MENSANA/mensana-next/app/admin/agenda-mensual/page.tsx",
                                        lineNumber: 121,
                                        columnNumber: 13
                                    }, this),
                                    "Hoy"
                                ]
                            }, void 0, true, {
                                fileName: "[project]/Desktop/03.MENSANA/mensana-next/app/admin/agenda-mensual/page.tsx",
                                lineNumber: 120,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex items-center gap-2 text-xs",
                                style: {
                                    color: colors.textSecondary
                                },
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "w-3 h-3 rounded-full inline-block border",
                                        style: {
                                            background: colors.primaryFaded,
                                            borderColor: colors.primaryLight
                                        }
                                    }, void 0, false, {
                                        fileName: "[project]/Desktop/03.MENSANA/mensana-next/app/admin/agenda-mensual/page.tsx",
                                        lineNumber: 125,
                                        columnNumber: 13
                                    }, this),
                                    "Con reservas"
                                ]
                            }, void 0, true, {
                                fileName: "[project]/Desktop/03.MENSANA/mensana-next/app/admin/agenda-mensual/page.tsx",
                                lineNumber: 124,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/Desktop/03.MENSANA/mensana-next/app/admin/agenda-mensual/page.tsx",
                        lineNumber: 119,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/Desktop/03.MENSANA/mensana-next/app/admin/agenda-mensual/page.tsx",
                lineNumber: 68,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/Desktop/03.MENSANA/mensana-next/app/admin/agenda-mensual/page.tsx",
        lineNumber: 65,
        columnNumber: 5
    }, this);
}
_s(AgendaMensualPage, "rvyIKeOyCcHLtOTLlREjL/iG1Sc=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$src$2f$context$2f$AuthContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAuth"],
        __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$src$2f$context$2f$ThemeContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTheme"],
        __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRouter"]
    ];
});
_c = AgendaMensualPage;
var _c;
__turbopack_context__.k.register(_c, "AgendaMensualPage");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/Desktop/03.MENSANA/mensana-next/node_modules/lucide-react/dist/esm/icons/chevron-left.js [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "__iconNode",
    ()=>__iconNode,
    "default",
    ()=>ChevronLeft
]);
/**
 * @license lucide-react v0.575.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$createLucideIcon$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/03.MENSANA/mensana-next/node_modules/lucide-react/dist/esm/createLucideIcon.js [app-client] (ecmascript)");
;
const __iconNode = [
    [
        "path",
        {
            d: "m15 18-6-6 6-6",
            key: "1wnfg3"
        }
    ]
];
const ChevronLeft = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$createLucideIcon$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"])("chevron-left", __iconNode);
;
 //# sourceMappingURL=chevron-left.js.map
}),
"[project]/Desktop/03.MENSANA/mensana-next/node_modules/lucide-react/dist/esm/icons/chevron-left.js [app-client] (ecmascript) <export default as ChevronLeft>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ChevronLeft",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$left$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"]
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$left$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/03.MENSANA/mensana-next/node_modules/lucide-react/dist/esm/icons/chevron-left.js [app-client] (ecmascript)");
}),
"[project]/Desktop/03.MENSANA/mensana-next/node_modules/lucide-react/dist/esm/icons/chevron-right.js [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "__iconNode",
    ()=>__iconNode,
    "default",
    ()=>ChevronRight
]);
/**
 * @license lucide-react v0.575.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$createLucideIcon$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/03.MENSANA/mensana-next/node_modules/lucide-react/dist/esm/createLucideIcon.js [app-client] (ecmascript)");
;
const __iconNode = [
    [
        "path",
        {
            d: "m9 18 6-6-6-6",
            key: "mthhwq"
        }
    ]
];
const ChevronRight = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$createLucideIcon$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"])("chevron-right", __iconNode);
;
 //# sourceMappingURL=chevron-right.js.map
}),
"[project]/Desktop/03.MENSANA/mensana-next/node_modules/lucide-react/dist/esm/icons/chevron-right.js [app-client] (ecmascript) <export default as ChevronRight>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ChevronRight",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$right$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"]
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$right$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/03.MENSANA/mensana-next/node_modules/lucide-react/dist/esm/icons/chevron-right.js [app-client] (ecmascript)");
}),
]);

//# sourceMappingURL=Desktop_03_MENSANA_mensana-next_1a369569._.js.map