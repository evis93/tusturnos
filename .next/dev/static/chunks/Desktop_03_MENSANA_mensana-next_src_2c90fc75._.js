(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/Desktop/03.MENSANA/mensana-next/src/config/supabase.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "supabase",
    ()=>supabase,
    "supabaseAdmin",
    ()=>supabaseAdmin
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = /*#__PURE__*/ __turbopack_context__.i("[project]/Desktop/03.MENSANA/mensana-next/node_modules/next/dist/build/polyfills/process.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$node_modules$2f40$supabase$2f$supabase$2d$js$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/Desktop/03.MENSANA/mensana-next/node_modules/@supabase/supabase-js/dist/index.mjs [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$node_modules$2f40$supabase$2f$ssr$2f$dist$2f$module$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/Desktop/03.MENSANA/mensana-next/node_modules/@supabase/ssr/dist/module/index.js [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$node_modules$2f40$supabase$2f$ssr$2f$dist$2f$module$2f$createBrowserClient$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/03.MENSANA/mensana-next/node_modules/@supabase/ssr/dist/module/createBrowserClient.js [app-client] (ecmascript)");
;
;
const supabaseUrl = ("TURBOPACK compile-time value", "https://hqdubrtdrnncysrlncbs.supabase.co");
const supabaseAnonKey = ("TURBOPACK compile-time value", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhxZHVicnRkcm5uY3lzcmxuY2JzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk1MDA4NjQsImV4cCI6MjA3NTA3Njg2NH0.9xJKmCHhE-_uJYKsdi45t_xw3hJ59N0XDjLdqz0tWwc");
const supabaseServiceRoleKey = __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$node_modules$2f40$supabase$2f$ssr$2f$dist$2f$module$2f$createBrowserClient$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createBrowserClient"])(supabaseUrl, supabaseAnonKey);
const supabaseAdmin = supabaseServiceRoleKey ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$node_modules$2f40$supabase$2f$supabase$2d$js$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["createClient"])(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
}) : null;
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/Desktop/03.MENSANA/mensana-next/src/context/AuthContext.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "AuthProvider",
    ()=>AuthProvider,
    "useAuth",
    ()=>useAuth
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/03.MENSANA/mensana-next/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/03.MENSANA/mensana-next/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$src$2f$config$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/03.MENSANA/mensana-next/src/config/supabase.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature(), _s1 = __turbopack_context__.k.signature();
'use client';
;
;
const AuthContext = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createContext"])({
    session: null,
    user: null,
    profile: null,
    loading: true,
    login: async ()=>({
            success: false
        }),
    register: async ()=>({
            success: false
        }),
    logout: async ()=>{},
    changePassword: async ()=>({
            success: false
        }),
    rol: null,
    empresaId: null,
    isAdmin: false,
    isProfesional: false,
    isCliente: false,
    isMensana: false
});
const useAuth = ()=>{
    _s();
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useContext"])(AuthContext);
};
_s(useAuth, "gDsCjeeItUuvgOWf1v4qoK9RF6k=");
const AuthProvider = ({ children })=>{
    _s1();
    const [session, setSession] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [user, setUser] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [loading, setLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(true);
    const [profile, setProfile] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const fetchingProfile = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(false);
    const ROL_PRIORIDAD = {
        superadmin: 4,
        admin: 3,
        profesional: 2,
        cliente: 1
    };
    const fetchProfile = async (authUserId, options = {})=>{
        if (fetchingProfile.current) return;
        fetchingProfile.current = true;
        const { retry = true } = options;
        try {
            const queryTimeout = (promise)=>Promise.race([
                    promise,
                    new Promise((_, reject)=>setTimeout(()=>reject(new Error('Query timeout')), 15000))
                ]);
            const { data: filas, error } = await queryTimeout(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$src$2f$config$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["supabase"].from('v_sesion_contexto').select('*'));
            if (error || !filas || filas.length === 0) {
                console.error('[AuthContext] Error fetching v_sesion_contexto:', error);
                setLoading(false);
                return;
            }
            const data = filas.reduce((mejor, fila)=>{
                const prioridadActual = ROL_PRIORIDAD[fila.rol_codigo] || 0;
                const prioridadMejor = ROL_PRIORIDAD[mejor.rol_codigo] || 0;
                return prioridadActual > prioridadMejor ? fila : mejor;
            }, filas[0]);
            const rol = data.rol_codigo || null;
            setProfile({
                usuarioId: data.usuario_id,
                authUserId: data.auth_user_id,
                nombre_completo: data.nombre_completo,
                email: data.email,
                rol,
                empresaId: data.empresa_id,
                empresaNombre: data.empresa_nombre,
                profesionalId: [
                    'admin',
                    'profesional',
                    'superadmin'
                ].includes(rol) ? data.usuario_id : null,
                esAdmin: rol === 'admin' || rol === 'superadmin',
                esProfesional: rol === 'profesional' || rol === 'admin' || rol === 'superadmin',
                esCliente: rol === 'cliente',
                esMensana: rol === 'superadmin',
                colorPrimario: data.color_primary,
                colorSecundario: data.color_secondary,
                colorBackground: data.color_background,
                logoUrl: data.logo_url
            });
        } catch (error) {
            console.error('[AuthContext] Error fetching profile:', error);
            if (retry && error.message === 'Query timeout') {
                fetchingProfile.current = false;
                return fetchProfile(authUserId, {
                    retry: false
                });
            }
        } finally{
            fetchingProfile.current = false;
            setLoading(false);
        }
    };
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "AuthProvider.useEffect": ()=>{
            const checkSession = {
                "AuthProvider.useEffect.checkSession": async ()=>{
                    try {
                        const timeoutPromise = new Promise({
                            "AuthProvider.useEffect.checkSession": (_, reject)=>setTimeout({
                                    "AuthProvider.useEffect.checkSession": ()=>reject(new Error('Session check timeout'))
                                }["AuthProvider.useEffect.checkSession"], 10000)
                        }["AuthProvider.useEffect.checkSession"]);
                        const sessionPromise = __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$src$2f$config$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["supabase"].auth.getSession();
                        const { data: { session } } = await Promise.race([
                            sessionPromise,
                            timeoutPromise
                        ]);
                        setSession(session);
                        setUser(session?.user ?? null);
                        if (session?.user) {
                            await fetchProfile(session.user.id);
                        }
                    } catch (error) {
                        console.error('Error checking session:', error);
                        setSession(null);
                        setUser(null);
                        setProfile(null);
                    } finally{
                        setLoading(false);
                    }
                }
            }["AuthProvider.useEffect.checkSession"];
            checkSession();
            const { data: { subscription } } = __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$src$2f$config$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["supabase"].auth.onAuthStateChange({
                "AuthProvider.useEffect": async (_event, session)=>{
                    setSession(session);
                    setUser(session?.user ?? null);
                    if (session?.user) {
                        setProfile({
                            "AuthProvider.useEffect": (prev)=>{
                                if (prev && prev.authUserId === session.user.id) {
                                    setLoading(false);
                                    return prev;
                                }
                                fetchProfile(session.user.id);
                                return prev;
                            }
                        }["AuthProvider.useEffect"]);
                    } else {
                        setProfile(null);
                        setLoading(false);
                    }
                }
            }["AuthProvider.useEffect"]);
            return ({
                "AuthProvider.useEffect": ()=>{
                    subscription?.unsubscribe();
                }
            })["AuthProvider.useEffect"];
        }
    }["AuthProvider.useEffect"], []);
    const login = async (email, password)=>{
        setLoading(true);
        try {
            const { data, error } = await __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$src$2f$config$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["supabase"].auth.signInWithPassword({
                email,
                password
            });
            if (error) return {
                success: false,
                error
            };
            return {
                success: true,
                data
            };
        } catch (e) {
            return {
                success: false,
                error: e
            };
        } finally{
            setLoading(false);
        }
    };
    const register = async (email, password, fullName)=>{
        setLoading(true);
        try {
            const { data, error } = await __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$src$2f$config$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["supabase"].auth.signUp({
                email,
                password,
                options: {
                    data: {
                        full_name: fullName
                    }
                }
            });
            if (error) return {
                success: false,
                error
            };
            return {
                success: true,
                data
            };
        } catch (e) {
            return {
                success: false,
                error: e
            };
        } finally{
            setLoading(false);
        }
    };
    const logout = async ()=>{
        try {
            await __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$src$2f$config$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["supabase"].auth.signOut({
                scope: 'local'
            });
        } catch (e) {
            console.error('[AuthContext] Error logout:', e);
        } finally{
            setSession(null);
            setUser(null);
            setProfile(null);
            setLoading(false);
        }
    };
    const changePassword = async (email, currentPassword, newPassword)=>{
        setLoading(true);
        try {
            const { error: signInError } = await __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$src$2f$config$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["supabase"].auth.signInWithPassword({
                email,
                password: currentPassword
            });
            if (signInError) return {
                success: false,
                error: signInError
            };
            const { data, error } = await __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$src$2f$config$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["supabase"].auth.updateUser({
                password: newPassword
            });
            if (error) return {
                success: false,
                error
            };
            return {
                success: true,
                data
            };
        } catch (e) {
            return {
                success: false,
                error: e
            };
        } finally{
            setLoading(false);
        }
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(AuthContext.Provider, {
        value: {
            session,
            user,
            profile,
            loading,
            login,
            register,
            logout,
            changePassword,
            rol: profile?.rol ?? null,
            empresaId: profile?.empresaId ?? null,
            isAdmin: profile?.esAdmin ?? false,
            isProfesional: profile?.esProfesional ?? false,
            isCliente: profile?.esCliente ?? false,
            isMensana: profile?.esMensana ?? false
        },
        children: children
    }, void 0, false, {
        fileName: "[project]/Desktop/03.MENSANA/mensana-next/src/context/AuthContext.tsx",
        lineNumber: 219,
        columnNumber: 5
    }, ("TURBOPACK compile-time value", void 0));
};
_s1(AuthProvider, "/3LLqY6Fs2YNRnBjoAmAt6iuyGc=");
_c = AuthProvider;
var _c;
__turbopack_context__.k.register(_c, "AuthProvider");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/Desktop/03.MENSANA/mensana-next/src/context/BusinessContext.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "BusinessProvider",
    ()=>BusinessProvider,
    "default",
    ()=>__TURBOPACK__default__export__,
    "useBusiness",
    ()=>useBusiness
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = /*#__PURE__*/ __turbopack_context__.i("[project]/Desktop/03.MENSANA/mensana-next/node_modules/next/dist/build/polyfills/process.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/03.MENSANA/mensana-next/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
/**
 * BusinessContext — White-label dinámico (Next.js)
 *
 * Prioridad de resolución del businessId:
 *   DEV:  devOverride > NEXT_PUBLIC_DEV_BUSINESS_ID (env) > localStorage (QR/URL param)
 *   PROD: localStorage únicamente (URL param)
 *
 * API pública:
 *   const { businessId, businessBranding, businessLoading, setBusiness, clearBusiness } = useBusiness();
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/03.MENSANA/mensana-next/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$src$2f$config$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/03.MENSANA/mensana-next/src/config/supabase.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature(), _s1 = __turbopack_context__.k.signature();
'use client';
;
;
const STORAGE_KEY = 'mensana_business_id';
const IS_DEV = ("TURBOPACK compile-time value", "development") === 'development';
const DEV_ENV_BUSINESS_ID = ("TURBOPACK compile-time truthy", 1) ? __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].env.NEXT_PUBLIC_DEV_BUSINESS_ID || null : "TURBOPACK unreachable";
const BusinessContext = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createContext"])(null);
const BusinessProvider = ({ children })=>{
    _s();
    const [storedId, setStoredId] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [devOverride, setDevOverride] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [businessBranding, setBusinessBranding] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [businessLoading, setBusinessLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(true);
    // Al montar: restaurar desde localStorage
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "BusinessProvider.useEffect": ()=>{
            try {
                const stored = localStorage.getItem(STORAGE_KEY);
                if (stored) {
                    setStoredId(stored);
                } else if (IS_DEV && DEV_ENV_BUSINESS_ID) {
                    setStoredId(DEV_ENV_BUSINESS_ID);
                } else {
                    setBusinessLoading(false);
                }
            } catch  {
                setBusinessLoading(false);
            }
        }
    }["BusinessProvider.useEffect"], []);
    const effectiveId = IS_DEV && devOverride ? devOverride : storedId;
    // Cuando cambia el id efectivo: cargar branding desde v_empresa_branding
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "BusinessProvider.useEffect": ()=>{
            if (!effectiveId) {
                setBusinessBranding(null);
                setBusinessLoading(false);
                return;
            }
            let cancelled = false;
            setBusinessLoading(true);
            // Intentar buscar por id (UUID) primero, luego por slug
            __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$src$2f$config$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["supabase"].from('v_empresa_branding').select('id, nombre, color_primary, color_secondary, color_background, logo_url').or(`id.eq.${effectiveId},slug.eq.${effectiveId}`).maybeSingle().then({
                "BusinessProvider.useEffect": ({ data, error })=>{
                    if (cancelled) return;
                    if (error) {
                        console.warn('[BusinessContext] Error cargando branding:', error.message);
                        // Intentar por nombre normalizado si falla la búsqueda por slug
                        setBusinessBranding(null);
                    } else {
                        setBusinessBranding(data || null);
                    }
                    setBusinessLoading(false);
                }
            }["BusinessProvider.useEffect"]);
            return ({
                "BusinessProvider.useEffect": ()=>{
                    cancelled = true;
                }
            })["BusinessProvider.useEffect"];
        }
    }["BusinessProvider.useEffect"], [
        effectiveId
    ]);
    const setBusiness = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "BusinessProvider.useCallback[setBusiness]": (id)=>{
            try {
                localStorage.setItem(STORAGE_KEY, String(id));
            } catch  {}
            setStoredId(String(id));
        }
    }["BusinessProvider.useCallback[setBusiness]"], []);
    const clearBusiness = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "BusinessProvider.useCallback[clearBusiness]": ()=>{
            try {
                localStorage.removeItem(STORAGE_KEY);
            } catch  {}
            setStoredId(null);
        }
    }["BusinessProvider.useCallback[clearBusiness]"], []);
    const value = {
        businessId: effectiveId,
        businessBranding,
        businessLoading,
        setBusiness,
        clearBusiness,
        ...IS_DEV && {
            devOverride,
            setDevOverride
        }
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(BusinessContext.Provider, {
        value: value,
        children: children
    }, void 0, false, {
        fileName: "[project]/Desktop/03.MENSANA/mensana-next/src/context/BusinessContext.tsx",
        lineNumber: 119,
        columnNumber: 5
    }, ("TURBOPACK compile-time value", void 0));
};
_s(BusinessProvider, "JDTy5wf0Gwr78kIfsXqKt8ljuzk=");
_c = BusinessProvider;
const useBusiness = ()=>{
    _s1();
    const context = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useContext"])(BusinessContext);
    if (!context) throw new Error('useBusiness debe usarse dentro de BusinessProvider');
    return context;
};
_s1(useBusiness, "b9L3QQ+jgeyIrH0NfHrJ8nn7VMU=");
const __TURBOPACK__default__export__ = BusinessContext;
var _c;
__turbopack_context__.k.register(_c, "BusinessProvider");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/Desktop/03.MENSANA/mensana-next/src/utils/colorUtils.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "contrastText",
    ()=>contrastText,
    "darken",
    ()=>darken,
    "hexToRgba",
    ()=>hexToRgba,
    "lighten",
    ()=>lighten
]);
function hexToRgb(hex) {
    const h = hex.replace('#', '');
    return {
        r: parseInt(h.substring(0, 2), 16),
        g: parseInt(h.substring(2, 4), 16),
        b: parseInt(h.substring(4, 6), 16)
    };
}
function rgbToHex(r, g, b) {
    const clamp = (v)=>Math.max(0, Math.min(255, Math.round(v)));
    return '#' + [
        clamp(r),
        clamp(g),
        clamp(b)
    ].map((v)=>v.toString(16).padStart(2, '0')).join('');
}
function darken(hex, amount = 0.1) {
    if (!hex) return hex;
    const { r, g, b } = hexToRgb(hex);
    const factor = 1 - amount;
    return rgbToHex(r * factor, g * factor, b * factor);
}
function lighten(hex, amount = 0.1) {
    if (!hex) return hex;
    const { r, g, b } = hexToRgb(hex);
    return rgbToHex(r + (255 - r) * amount, g + (255 - g) * amount, b + (255 - b) * amount);
}
function hexToRgba(hex, alpha = 1) {
    if (!hex) return `rgba(0,0,0,${alpha})`;
    const { r, g, b } = hexToRgb(hex);
    return `rgba(${r},${g},${b},${alpha})`;
}
function contrastText(hex) {
    if (!hex) return '#ffffff';
    const { r, g, b } = hexToRgb(hex);
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance > 0.5 ? '#1a1a1a' : '#ffffff';
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/Desktop/03.MENSANA/mensana-next/src/context/ThemeContext.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ThemeProvider",
    ()=>ThemeProvider,
    "default",
    ()=>__TURBOPACK__default__export__,
    "useTheme",
    ()=>useTheme
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/03.MENSANA/mensana-next/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/03.MENSANA/mensana-next/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$src$2f$context$2f$AuthContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/03.MENSANA/mensana-next/src/context/AuthContext.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$src$2f$context$2f$BusinessContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/03.MENSANA/mensana-next/src/context/BusinessContext.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$src$2f$utils$2f$colorUtils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/03.MENSANA/mensana-next/src/utils/colorUtils.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature(), _s1 = __turbopack_context__.k.signature();
'use client';
;
;
;
;
const DEFAULT_LOGO = '/images/logoMensana.png';
// Logos locales por empresa — evita depender del archivo en Supabase Storage
const LOCAL_LOGOS = {
    monalisa: '/images/Logo-corporeo-monalisa.png',
    'arte urbano': '/images/logo_palabra_arte_urbano.png',
    arturbano: '/images/logo_palabra_arte_urbano.png'
};
function resolveLogoUrl(empresaNombre, dbLogoUrl) {
    if (empresaNombre) {
        const lower = empresaNombre.toLowerCase();
        for (const [key, path] of Object.entries(LOCAL_LOGOS)){
            if (lower.includes(key)) return path;
        }
    }
    return dbLogoUrl || null;
}
const DEFAULT_COLORS = {
    primary: '#3498db',
    primaryDark: '#2980b9',
    primaryLight: '#5ca0d3',
    primaryFaded: '#f0f9ff',
    secondary: '#00d2ff',
    accent: '#00d2ff',
    background: '#f8fbff',
    surface: '#ffffff',
    text: '#1a2b3c',
    textSecondary: '#666666',
    textMuted: '#999999',
    success: '#7DB88F',
    error: '#D4726A',
    warning: '#D4A574',
    border: '#E8E4E0',
    borderLight: '#F2EFEB',
    headerText: '#1a1a1a'
};
const buildColors = (primary, secondary, background)=>({
        ...DEFAULT_COLORS,
        primary,
        primaryDark: (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$src$2f$utils$2f$colorUtils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["darken"])(primary, 0.15),
        primaryLight: (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$src$2f$utils$2f$colorUtils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["lighten"])(primary, 0.25),
        primaryFaded: (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$src$2f$utils$2f$colorUtils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["lighten"])(primary, 0.85),
        secondary,
        accent: secondary,
        background,
        headerText: (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$src$2f$utils$2f$colorUtils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["contrastText"])(secondary)
    });
const ThemeContext = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createContext"])({
    themeId: 'default',
    colors: DEFAULT_COLORS,
    logoUrl: null,
    empresaNombre: null,
    loading: false
});
const ThemeProvider = ({ children })=>{
    _s();
    const { profile, loading: authLoading } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$src$2f$context$2f$AuthContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAuth"])();
    const { businessBranding, businessLoading } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$src$2f$context$2f$BusinessContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useBusiness"])();
    // Prioridad:
    //   1. profile autenticado (post-login) — mayor prioridad
    //   2. businessBranding (pre-login, cargado por QR/URL slug)
    //   3. Defaults de Mensana
    const value = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "ThemeProvider.useMemo[value]": ()=>{
            if (authLoading || businessLoading) {
                return {
                    themeId: 'loading',
                    colors: DEFAULT_COLORS,
                    logoUrl: null,
                    empresaNombre: null,
                    loading: true
                };
            }
            if (profile?.empresaId) {
                const primary = (profile.colorPrimario || DEFAULT_COLORS.primary).trim();
                const secondary = (profile.colorSecundario || DEFAULT_COLORS.secondary).trim();
                const background = (profile.colorBackground || DEFAULT_COLORS.background).trim();
                return {
                    themeId: `empresa-${profile.empresaId}`,
                    colors: buildColors(primary, secondary, background),
                    logoUrl: resolveLogoUrl(profile.empresaNombre, profile.logoUrl),
                    empresaNombre: profile.empresaNombre || null,
                    loading: false
                };
            }
            if (businessBranding) {
                const primary = (businessBranding.color_primary || DEFAULT_COLORS.primary).trim();
                const secondary = (businessBranding.color_secondary || DEFAULT_COLORS.secondary).trim();
                const background = (businessBranding.color_background || DEFAULT_COLORS.background).trim();
                return {
                    themeId: `business-${businessBranding.id}`,
                    colors: buildColors(primary, secondary, background),
                    logoUrl: resolveLogoUrl(businessBranding.nombre, businessBranding.logo_url),
                    empresaNombre: businessBranding.nombre || null,
                    loading: false
                };
            }
            return {
                themeId: 'default',
                colors: DEFAULT_COLORS,
                logoUrl: DEFAULT_LOGO,
                empresaNombre: null,
                loading: false
            };
        }
    }["ThemeProvider.useMemo[value]"], [
        profile,
        authLoading,
        businessBranding,
        businessLoading
    ]);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(ThemeContext.Provider, {
        value: value,
        children: children
    }, void 0, false, {
        fileName: "[project]/Desktop/03.MENSANA/mensana-next/src/context/ThemeContext.tsx",
        lineNumber: 137,
        columnNumber: 10
    }, ("TURBOPACK compile-time value", void 0));
};
_s(ThemeProvider, "gAHJ4bC1JBsjD99/g6ynDnCp1n8=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$src$2f$context$2f$AuthContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAuth"],
        __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$src$2f$context$2f$BusinessContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useBusiness"]
    ];
});
_c = ThemeProvider;
const useTheme = ()=>{
    _s1();
    const context = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useContext"])(ThemeContext);
    if (!context) throw new Error('useTheme debe usarse dentro de ThemeProvider');
    return context;
};
_s1(useTheme, "b9L3QQ+jgeyIrH0NfHrJ8nn7VMU=");
const __TURBOPACK__default__export__ = ThemeContext;
var _c;
__turbopack_context__.k.register(_c, "ThemeProvider");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=Desktop_03_MENSANA_mensana-next_src_2c90fc75._.js.map