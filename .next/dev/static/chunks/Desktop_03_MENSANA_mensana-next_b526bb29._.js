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
"[project]/Desktop/03.MENSANA/mensana-next/src/components/reservas/ModalPago.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>ModalPago
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/03.MENSANA/mensana-next/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/03.MENSANA/mensana-next/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$src$2f$context$2f$ThemeContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/03.MENSANA/mensana-next/src/context/ThemeContext.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$src$2f$controllers$2f$ReservaController$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/03.MENSANA/mensana-next/src/controllers/ReservaController.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$src$2f$config$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/03.MENSANA/mensana-next/src/config/supabase.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__X$3e$__ = __turbopack_context__.i("[project]/Desktop/03.MENSANA/mensana-next/node_modules/lucide-react/dist/esm/icons/x.js [app-client] (ecmascript) <export default as X>");
;
var _s = __turbopack_context__.k.signature();
'use client';
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
    _s();
    const { colors } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$src$2f$context$2f$ThemeContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTheme"])();
    const [monto, setMonto] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('');
    const [metodoPago, setMetodoPago] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [pagado, setPagado] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [precioServicio, setPrecioServicio] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [guardando, setGuardando] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "ModalPago.useEffect": ()=>{
            if (!open || !reserva) return;
            setMonto(reserva.precio_total ? reserva.precio_total.toString() : '');
            setMetodoPago(reserva.metodo_pago || null);
            setPagado(reserva.pagado || false);
            setPrecioServicio(null);
            if (reserva.servicio_id) {
                __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$src$2f$config$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["supabase"].from('servicios').select('nombre, precio').eq('id', reserva.servicio_id).single().then({
                    "ModalPago.useEffect": ({ data })=>{
                        if (data) setPrecioServicio(data);
                    }
                }["ModalPago.useEffect"]);
            }
        }
    }["ModalPago.useEffect"], [
        open,
        reserva
    ]);
    const handleGuardar = async ()=>{
        setGuardando(true);
        const result = await __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$src$2f$controllers$2f$ReservaController$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ReservaController"].registrarPago(reserva.id, {
            precio_total: monto ? parseFloat(monto) : null,
            metodo_pago: metodoPago,
            pagado
        }, profile);
        setGuardando(false);
        if (result.success) onSaved();
    };
    if (!open) return null;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4",
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "bg-white rounded-2xl w-full max-w-sm p-6",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "flex items-center justify-between mb-5",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
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
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            onClick: onClose,
                            className: "p-1.5 rounded-lg hover:bg-gray-100 transition",
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__X$3e$__["X"], {
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
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "space-y-4",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "bg-gray-50 rounded-xl p-3",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
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
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
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
                                precioServicio && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
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
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
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
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
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
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
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
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "grid grid-cols-2 gap-2",
                                    children: METODOS_PAGO.map((m)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
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
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                            className: "flex items-center gap-3 cursor-pointer",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                    type: "checkbox",
                                    checked: pagado,
                                    onChange: (e)=>setPagado(e.target.checked),
                                    className: "w-4 h-4 rounded"
                                }, void 0, false, {
                                    fileName: "[project]/Desktop/03.MENSANA/mensana-next/src/components/reservas/ModalPago.tsx",
                                    lineNumber: 122,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
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
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "flex gap-3 mt-6",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
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
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
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
_s(ModalPago, "K/4tVjwUi4EQkBWW5iY46ZrdAmA=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$src$2f$context$2f$ThemeContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTheme"]
    ];
});
_c = ModalPago;
var _c;
__turbopack_context__.k.register(_c, "ModalPago");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/Desktop/03.MENSANA/mensana-next/app/admin/gestion-reservas/page.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>GestionReservasPage
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/03.MENSANA/mensana-next/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/03.MENSANA/mensana-next/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$src$2f$context$2f$AuthContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/03.MENSANA/mensana-next/src/context/AuthContext.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$src$2f$context$2f$ThemeContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/03.MENSANA/mensana-next/src/context/ThemeContext.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$src$2f$controllers$2f$ReservaController$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/03.MENSANA/mensana-next/src/controllers/ReservaController.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$src$2f$components$2f$reservas$2f$ModalPago$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/03.MENSANA/mensana-next/src/components/reservas/ModalPago.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$refresh$2d$cw$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__RefreshCw$3e$__ = __turbopack_context__.i("[project]/Desktop/03.MENSANA/mensana-next/node_modules/lucide-react/dist/esm/icons/refresh-cw.js [app-client] (ecmascript) <export default as RefreshCw>");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$message$2d$circle$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__MessageCircle$3e$__ = __turbopack_context__.i("[project]/Desktop/03.MENSANA/mensana-next/node_modules/lucide-react/dist/esm/icons/message-circle.js [app-client] (ecmascript) <export default as MessageCircle>");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$check$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Check$3e$__ = __turbopack_context__.i("[project]/Desktop/03.MENSANA/mensana-next/node_modules/lucide-react/dist/esm/icons/check.js [app-client] (ecmascript) <export default as Check>");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__X$3e$__ = __turbopack_context__.i("[project]/Desktop/03.MENSANA/mensana-next/node_modules/lucide-react/dist/esm/icons/x.js [app-client] (ecmascript) <export default as X>");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$node_modules$2f$clsx$2f$dist$2f$clsx$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/03.MENSANA/mensana-next/node_modules/clsx/dist/clsx.mjs [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
'use client';
;
;
;
;
;
;
;
const TABS = [
    'Pendientes',
    'Confirmadas',
    'Historial'
];
function GestionReservasPage() {
    _s();
    const { profile } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$src$2f$context$2f$AuthContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAuth"])();
    const { colors } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$src$2f$context$2f$ThemeContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTheme"])();
    const [activeTab, setActiveTab] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(0);
    const [reservas, setReservas] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [loading, setLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(true);
    const [pagoModal, setPagoModal] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])({
        open: false,
        reserva: null
    });
    const cargarReservas = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "GestionReservasPage.useCallback[cargarReservas]": async ()=>{
            setLoading(true);
            const result = await __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$src$2f$controllers$2f$ReservaController$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ReservaController"].obtenerTodas(profile);
            if (result.success) setReservas(result.data || []);
            setLoading(false);
        }
    }["GestionReservasPage.useCallback[cargarReservas]"], [
        profile
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "GestionReservasPage.useEffect": ()=>{
            cargarReservas();
        }
    }["GestionReservasPage.useEffect"], [
        cargarReservas
    ]);
    const reservasFiltradas = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "GestionReservasPage.useMemo[reservasFiltradas]": ()=>{
            if (activeTab === 0) return reservas.filter({
                "GestionReservasPage.useMemo[reservasFiltradas]": (r)=>r.estado === 'pendiente'
            }["GestionReservasPage.useMemo[reservasFiltradas]"]);
            if (activeTab === 1) return reservas.filter({
                "GestionReservasPage.useMemo[reservasFiltradas]": (r)=>r.estado === 'confirmada'
            }["GestionReservasPage.useMemo[reservasFiltradas]"]);
            return reservas.filter({
                "GestionReservasPage.useMemo[reservasFiltradas]": (r)=>r.estado === 'cancelada' || r.estado === 'completada'
            }["GestionReservasPage.useMemo[reservasFiltradas]"]);
        }
    }["GestionReservasPage.useMemo[reservasFiltradas]"], [
        reservas,
        activeTab
    ]);
    const handleConfirmar = async (id)=>{
        await __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$src$2f$controllers$2f$ReservaController$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ReservaController"].actualizarEstado(id, 'confirmada', profile);
        cargarReservas();
    };
    const handleRechazar = async (id)=>{
        if (!confirm('¿Cancelar esta reserva?')) return;
        await __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$src$2f$controllers$2f$ReservaController$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ReservaController"].actualizarEstado(id, 'cancelada', profile);
        cargarReservas();
    };
    const handleWhatsApp = (reserva)=>{
        const tel = reserva.consultante?.telefono || '';
        const msg = `Hola ${reserva.consultante?.nombre || ''}, tu reserva para el ${reserva.fecha} a las ${reserva.hora_inicio} ha sido confirmada.`;
        window.open(`https://wa.me/${tel}?text=${encodeURIComponent(msg)}`, '_blank');
    };
    const estadoColor = {
        pendiente: '#FFF3CD',
        confirmada: '#d1fae5',
        cancelada: '#fee2e2',
        completada: '#e0e7ff'
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "p-6",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex items-center justify-between mb-6",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                        className: "text-2xl font-bold",
                        style: {
                            color: colors.text
                        },
                        children: "Gestión de Reservas"
                    }, void 0, false, {
                        fileName: "[project]/Desktop/03.MENSANA/mensana-next/app/admin/gestion-reservas/page.tsx",
                        lineNumber: 64,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        onClick: cargarReservas,
                        className: "p-2 rounded-lg hover:bg-gray-100 transition",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$refresh$2d$cw$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__RefreshCw$3e$__["RefreshCw"], {
                            size: 18,
                            style: {
                                color: colors.textSecondary
                            }
                        }, void 0, false, {
                            fileName: "[project]/Desktop/03.MENSANA/mensana-next/app/admin/gestion-reservas/page.tsx",
                            lineNumber: 66,
                            columnNumber: 11
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/Desktop/03.MENSANA/mensana-next/app/admin/gestion-reservas/page.tsx",
                        lineNumber: 65,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/Desktop/03.MENSANA/mensana-next/app/admin/gestion-reservas/page.tsx",
                lineNumber: 63,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex gap-1 bg-gray-100 rounded-xl p-1 mb-6 w-fit",
                children: TABS.map((tab, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        onClick: ()=>setActiveTab(i),
                        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$node_modules$2f$clsx$2f$dist$2f$clsx$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["clsx"])('px-4 py-2 rounded-lg text-sm font-medium transition', activeTab === i ? 'bg-white shadow-sm' : 'text-gray-500 hover:text-gray-700'),
                        style: activeTab === i ? {
                            color: colors.primary
                        } : {},
                        children: tab
                    }, tab, false, {
                        fileName: "[project]/Desktop/03.MENSANA/mensana-next/app/admin/gestion-reservas/page.tsx",
                        lineNumber: 73,
                        columnNumber: 11
                    }, this))
            }, void 0, false, {
                fileName: "[project]/Desktop/03.MENSANA/mensana-next/app/admin/gestion-reservas/page.tsx",
                lineNumber: 71,
                columnNumber: 7
            }, this),
            loading ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex justify-center py-12",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "animate-spin rounded-full h-8 w-8 border-b-2",
                    style: {
                        borderColor: colors.primary
                    }
                }, void 0, false, {
                    fileName: "[project]/Desktop/03.MENSANA/mensana-next/app/admin/gestion-reservas/page.tsx",
                    lineNumber: 86,
                    columnNumber: 11
                }, this)
            }, void 0, false, {
                fileName: "[project]/Desktop/03.MENSANA/mensana-next/app/admin/gestion-reservas/page.tsx",
                lineNumber: 85,
                columnNumber: 9
            }, this) : reservasFiltradas.length === 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "text-center py-16",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "text-4xl mb-3",
                        children: "📋"
                    }, void 0, false, {
                        fileName: "[project]/Desktop/03.MENSANA/mensana-next/app/admin/gestion-reservas/page.tsx",
                        lineNumber: 90,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        style: {
                            color: colors.textSecondary
                        },
                        children: [
                            "No hay reservas ",
                            TABS[activeTab].toLowerCase()
                        ]
                    }, void 0, true, {
                        fileName: "[project]/Desktop/03.MENSANA/mensana-next/app/admin/gestion-reservas/page.tsx",
                        lineNumber: 91,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/Desktop/03.MENSANA/mensana-next/app/admin/gestion-reservas/page.tsx",
                lineNumber: 89,
                columnNumber: 9
            }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "space-y-3",
                children: reservasFiltradas.map((reserva)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "bg-white rounded-xl border p-4",
                        style: {
                            borderColor: colors.border,
                            borderLeft: `4px solid ${colors.primary}`
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex items-start justify-between",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                className: "font-semibold",
                                                style: {
                                                    color: colors.text
                                                },
                                                children: reserva.consultante?.nombre || reserva.consultante_nombre || 'Sin nombre'
                                            }, void 0, false, {
                                                fileName: "[project]/Desktop/03.MENSANA/mensana-next/app/admin/gestion-reservas/page.tsx",
                                                lineNumber: 103,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                className: "text-sm mt-0.5",
                                                style: {
                                                    color: colors.textSecondary
                                                },
                                                children: [
                                                    reserva.fecha,
                                                    " · ",
                                                    reserva.hora_inicio?.substring(0, 5),
                                                    reserva.profesional?.nombre ? ` · ${reserva.profesional.nombre}` : ''
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/Desktop/03.MENSANA/mensana-next/app/admin/gestion-reservas/page.tsx",
                                                lineNumber: 106,
                                                columnNumber: 19
                                            }, this),
                                            reserva.precio_total != null && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                className: "text-sm font-medium mt-1",
                                                style: {
                                                    color: colors.primary
                                                },
                                                children: [
                                                    "$",
                                                    reserva.precio_total,
                                                    " ",
                                                    reserva.pagado ? '✅ Pagado' : '⏳ Pendiente de pago'
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/Desktop/03.MENSANA/mensana-next/app/admin/gestion-reservas/page.tsx",
                                                lineNumber: 111,
                                                columnNumber: 21
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/Desktop/03.MENSANA/mensana-next/app/admin/gestion-reservas/page.tsx",
                                        lineNumber: 102,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "text-xs px-2 py-1 rounded-full font-medium",
                                        style: {
                                            background: estadoColor[reserva.estado] || '#f3f4f6'
                                        },
                                        children: reserva.estado
                                    }, void 0, false, {
                                        fileName: "[project]/Desktop/03.MENSANA/mensana-next/app/admin/gestion-reservas/page.tsx",
                                        lineNumber: 116,
                                        columnNumber: 17
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/Desktop/03.MENSANA/mensana-next/app/admin/gestion-reservas/page.tsx",
                                lineNumber: 101,
                                columnNumber: 15
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex gap-2 mt-3 flex-wrap",
                                children: [
                                    reserva.estado === 'pendiente' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                onClick: ()=>handleConfirmar(reserva.id),
                                                className: "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-white",
                                                style: {
                                                    background: colors.success
                                                },
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$check$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Check$3e$__["Check"], {
                                                        size: 12
                                                    }, void 0, false, {
                                                        fileName: "[project]/Desktop/03.MENSANA/mensana-next/app/admin/gestion-reservas/page.tsx",
                                                        lineNumber: 132,
                                                        columnNumber: 23
                                                    }, this),
                                                    " Confirmar"
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/Desktop/03.MENSANA/mensana-next/app/admin/gestion-reservas/page.tsx",
                                                lineNumber: 127,
                                                columnNumber: 21
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                onClick: ()=>handleRechazar(reserva.id),
                                                className: "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-red-50 text-red-600",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__X$3e$__["X"], {
                                                        size: 12
                                                    }, void 0, false, {
                                                        fileName: "[project]/Desktop/03.MENSANA/mensana-next/app/admin/gestion-reservas/page.tsx",
                                                        lineNumber: 138,
                                                        columnNumber: 23
                                                    }, this),
                                                    " Rechazar"
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/Desktop/03.MENSANA/mensana-next/app/admin/gestion-reservas/page.tsx",
                                                lineNumber: 134,
                                                columnNumber: 21
                                            }, this)
                                        ]
                                    }, void 0, true),
                                    !reserva.pagado && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        onClick: ()=>setPagoModal({
                                                open: true,
                                                reserva
                                            }),
                                        className: "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-white",
                                        style: {
                                            background: colors.primary
                                        },
                                        children: "💰 Registrar pago"
                                    }, void 0, false, {
                                        fileName: "[project]/Desktop/03.MENSANA/mensana-next/app/admin/gestion-reservas/page.tsx",
                                        lineNumber: 143,
                                        columnNumber: 19
                                    }, this),
                                    (reserva.consultante?.telefono || reserva.consultante_telefono) && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        onClick: ()=>handleWhatsApp(reserva),
                                        className: "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-green-50 text-green-700",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$message$2d$circle$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__MessageCircle$3e$__["MessageCircle"], {
                                                size: 12
                                            }, void 0, false, {
                                                fileName: "[project]/Desktop/03.MENSANA/mensana-next/app/admin/gestion-reservas/page.tsx",
                                                lineNumber: 156,
                                                columnNumber: 21
                                            }, this),
                                            " WhatsApp"
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/Desktop/03.MENSANA/mensana-next/app/admin/gestion-reservas/page.tsx",
                                        lineNumber: 152,
                                        columnNumber: 19
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/Desktop/03.MENSANA/mensana-next/app/admin/gestion-reservas/page.tsx",
                                lineNumber: 124,
                                columnNumber: 15
                            }, this)
                        ]
                    }, reserva.id, true, {
                        fileName: "[project]/Desktop/03.MENSANA/mensana-next/app/admin/gestion-reservas/page.tsx",
                        lineNumber: 96,
                        columnNumber: 13
                    }, this))
            }, void 0, false, {
                fileName: "[project]/Desktop/03.MENSANA/mensana-next/app/admin/gestion-reservas/page.tsx",
                lineNumber: 94,
                columnNumber: 9
            }, this),
            pagoModal.open && pagoModal.reserva && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$src$2f$components$2f$reservas$2f$ModalPago$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
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
                fileName: "[project]/Desktop/03.MENSANA/mensana-next/app/admin/gestion-reservas/page.tsx",
                lineNumber: 166,
                columnNumber: 9
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/Desktop/03.MENSANA/mensana-next/app/admin/gestion-reservas/page.tsx",
        lineNumber: 62,
        columnNumber: 5
    }, this);
}
_s(GestionReservasPage, "AOdkNabz1WzaHMQwFylf+GQdkZg=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$src$2f$context$2f$AuthContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAuth"],
        __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$src$2f$context$2f$ThemeContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTheme"]
    ];
});
_c = GestionReservasPage;
var _c;
__turbopack_context__.k.register(_c, "GestionReservasPage");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/Desktop/03.MENSANA/mensana-next/node_modules/lucide-react/dist/esm/icons/x.js [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "__iconNode",
    ()=>__iconNode,
    "default",
    ()=>X
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
            d: "M18 6 6 18",
            key: "1bl5f8"
        }
    ],
    [
        "path",
        {
            d: "m6 6 12 12",
            key: "d8bk6v"
        }
    ]
];
const X = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$createLucideIcon$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"])("x", __iconNode);
;
 //# sourceMappingURL=x.js.map
}),
"[project]/Desktop/03.MENSANA/mensana-next/node_modules/lucide-react/dist/esm/icons/x.js [app-client] (ecmascript) <export default as X>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "X",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"]
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/03.MENSANA/mensana-next/node_modules/lucide-react/dist/esm/icons/x.js [app-client] (ecmascript)");
}),
"[project]/Desktop/03.MENSANA/mensana-next/node_modules/lucide-react/dist/esm/icons/refresh-cw.js [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "__iconNode",
    ()=>__iconNode,
    "default",
    ()=>RefreshCw
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
            d: "M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8",
            key: "v9h5vc"
        }
    ],
    [
        "path",
        {
            d: "M21 3v5h-5",
            key: "1q7to0"
        }
    ],
    [
        "path",
        {
            d: "M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16",
            key: "3uifl3"
        }
    ],
    [
        "path",
        {
            d: "M8 16H3v5",
            key: "1cv678"
        }
    ]
];
const RefreshCw = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$createLucideIcon$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"])("refresh-cw", __iconNode);
;
 //# sourceMappingURL=refresh-cw.js.map
}),
"[project]/Desktop/03.MENSANA/mensana-next/node_modules/lucide-react/dist/esm/icons/refresh-cw.js [app-client] (ecmascript) <export default as RefreshCw>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "RefreshCw",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$refresh$2d$cw$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"]
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$refresh$2d$cw$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/03.MENSANA/mensana-next/node_modules/lucide-react/dist/esm/icons/refresh-cw.js [app-client] (ecmascript)");
}),
"[project]/Desktop/03.MENSANA/mensana-next/node_modules/lucide-react/dist/esm/icons/message-circle.js [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "__iconNode",
    ()=>__iconNode,
    "default",
    ()=>MessageCircle
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
            d: "M2.992 16.342a2 2 0 0 1 .094 1.167l-1.065 3.29a1 1 0 0 0 1.236 1.168l3.413-.998a2 2 0 0 1 1.099.092 10 10 0 1 0-4.777-4.719",
            key: "1sd12s"
        }
    ]
];
const MessageCircle = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$createLucideIcon$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"])("message-circle", __iconNode);
;
 //# sourceMappingURL=message-circle.js.map
}),
"[project]/Desktop/03.MENSANA/mensana-next/node_modules/lucide-react/dist/esm/icons/message-circle.js [app-client] (ecmascript) <export default as MessageCircle>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "MessageCircle",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$message$2d$circle$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"]
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$message$2d$circle$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/03.MENSANA/mensana-next/node_modules/lucide-react/dist/esm/icons/message-circle.js [app-client] (ecmascript)");
}),
"[project]/Desktop/03.MENSANA/mensana-next/node_modules/lucide-react/dist/esm/icons/check.js [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "__iconNode",
    ()=>__iconNode,
    "default",
    ()=>Check
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
            d: "M20 6 9 17l-5-5",
            key: "1gmf2c"
        }
    ]
];
const Check = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$createLucideIcon$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"])("check", __iconNode);
;
 //# sourceMappingURL=check.js.map
}),
"[project]/Desktop/03.MENSANA/mensana-next/node_modules/lucide-react/dist/esm/icons/check.js [app-client] (ecmascript) <export default as Check>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Check",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$check$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"]
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$check$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/03.MENSANA/mensana-next/node_modules/lucide-react/dist/esm/icons/check.js [app-client] (ecmascript)");
}),
]);

//# sourceMappingURL=Desktop_03_MENSANA_mensana-next_b526bb29._.js.map