module.exports = [
"[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[project]/Desktop/03.MENSANA/mensana-next/src/config/supabase.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "supabase",
    ()=>supabase,
    "supabaseAdmin",
    ()=>supabaseAdmin
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$node_modules$2f40$supabase$2f$supabase$2d$js$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/Desktop/03.MENSANA/mensana-next/node_modules/@supabase/supabase-js/dist/index.mjs [app-ssr] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$node_modules$2f40$supabase$2f$ssr$2f$dist$2f$module$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/Desktop/03.MENSANA/mensana-next/node_modules/@supabase/ssr/dist/module/index.js [app-ssr] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$node_modules$2f40$supabase$2f$ssr$2f$dist$2f$module$2f$createBrowserClient$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/03.MENSANA/mensana-next/node_modules/@supabase/ssr/dist/module/createBrowserClient.js [app-ssr] (ecmascript)");
;
;
const supabaseUrl = ("TURBOPACK compile-time value", "https://hqdubrtdrnncysrlncbs.supabase.co");
const supabaseAnonKey = ("TURBOPACK compile-time value", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhxZHVicnRkcm5uY3lzcmxuY2JzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk1MDA4NjQsImV4cCI6MjA3NTA3Njg2NH0.9xJKmCHhE-_uJYKsdi45t_xw3hJ59N0XDjLdqz0tWwc");
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$node_modules$2f40$supabase$2f$ssr$2f$dist$2f$module$2f$createBrowserClient$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["createBrowserClient"])(supabaseUrl, supabaseAnonKey);
const supabaseAdmin = supabaseServiceRoleKey ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$node_modules$2f40$supabase$2f$supabase$2d$js$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["createClient"])(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
}) : null;
}),
"[project]/Desktop/03.MENSANA/mensana-next/src/context/AuthContext.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "AuthProvider",
    ()=>AuthProvider,
    "useAuth",
    ()=>useAuth
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/03.MENSANA/mensana-next/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/03.MENSANA/mensana-next/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$src$2f$config$2f$supabase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/03.MENSANA/mensana-next/src/config/supabase.ts [app-ssr] (ecmascript)");
'use client';
;
;
;
const AuthContext = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["createContext"])({
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
const useAuth = ()=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useContext"])(AuthContext);
const AuthProvider = ({ children })=>{
    const [session, setSession] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const [user, setUser] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const [loading, setLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(true);
    const [profile, setProfile] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const fetchingProfile = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(false);
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
            const { data: filas, error } = await queryTimeout(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$src$2f$config$2f$supabase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["supabase"].from('v_sesion_contexto').select('*'));
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
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        const checkSession = async ()=>{
            try {
                const timeoutPromise = new Promise((_, reject)=>setTimeout(()=>reject(new Error('Session check timeout')), 10000));
                const sessionPromise = __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$src$2f$config$2f$supabase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["supabase"].auth.getSession();
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
        };
        checkSession();
        const { data: { subscription } } = __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$src$2f$config$2f$supabase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["supabase"].auth.onAuthStateChange(async (_event, session)=>{
            setSession(session);
            setUser(session?.user ?? null);
            if (session?.user) {
                setProfile((prev)=>{
                    if (prev && prev.authUserId === session.user.id) {
                        setLoading(false);
                        return prev;
                    }
                    fetchProfile(session.user.id);
                    return prev;
                });
            } else {
                setProfile(null);
                setLoading(false);
            }
        });
        return ()=>{
            subscription?.unsubscribe();
        };
    }, []);
    const login = async (email, password)=>{
        setLoading(true);
        try {
            const { data, error } = await __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$src$2f$config$2f$supabase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["supabase"].auth.signInWithPassword({
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
            const { data, error } = await __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$src$2f$config$2f$supabase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["supabase"].auth.signUp({
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
            await __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$src$2f$config$2f$supabase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["supabase"].auth.signOut({
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
            const { error: signInError } = await __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$src$2f$config$2f$supabase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["supabase"].auth.signInWithPassword({
                email,
                password: currentPassword
            });
            if (signInError) return {
                success: false,
                error: signInError
            };
            const { data, error } = await __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$src$2f$config$2f$supabase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["supabase"].auth.updateUser({
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
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(AuthContext.Provider, {
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
}),
"[project]/Desktop/03.MENSANA/mensana-next/src/utils/colorUtils.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
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
}),
"[project]/Desktop/03.MENSANA/mensana-next/src/context/ThemeContext.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ThemeProvider",
    ()=>ThemeProvider,
    "default",
    ()=>__TURBOPACK__default__export__,
    "useTheme",
    ()=>useTheme
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/03.MENSANA/mensana-next/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/03.MENSANA/mensana-next/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$src$2f$context$2f$AuthContext$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/03.MENSANA/mensana-next/src/context/AuthContext.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$src$2f$utils$2f$colorUtils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/03.MENSANA/mensana-next/src/utils/colorUtils.ts [app-ssr] (ecmascript)");
'use client';
;
;
;
;
const DEFAULT_COLORS = {
    primary: '#2980b9',
    primaryDark: '#1e6a9e',
    primaryLight: '#5ca0d3',
    primaryFaded: '#e0f0ff',
    secondary: '#00d2ff',
    accent: '#00d2ff',
    background: '#fafafa',
    surface: '#ffffff',
    text: '#3D3D3D',
    textSecondary: '#666666',
    textMuted: '#999999',
    success: '#7DB88F',
    error: '#D4726A',
    warning: '#D4A574',
    border: '#E8E4E0',
    borderLight: '#F2EFEB',
    headerText: '#1a1a1a'
};
const ThemeContext = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["createContext"])({
    themeId: 'default',
    colors: DEFAULT_COLORS,
    logoUrl: null,
    empresaNombre: null,
    loading: false
});
const ThemeProvider = ({ children })=>{
    const { profile, loading: authLoading } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$src$2f$context$2f$AuthContext$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useAuth"])();
    const value = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>{
        if (authLoading) {
            return {
                themeId: 'loading',
                colors: DEFAULT_COLORS,
                logoUrl: null,
                empresaNombre: null,
                loading: true
            };
        }
        if (!profile || !profile.empresaId) {
            return {
                themeId: 'default',
                colors: DEFAULT_COLORS,
                logoUrl: null,
                empresaNombre: null,
                loading: false
            };
        }
        const primary = (profile.colorPrimario || DEFAULT_COLORS.primary).trim();
        const secondary = (profile.colorSecundario || DEFAULT_COLORS.secondary).trim();
        const background = (profile.colorBackground || DEFAULT_COLORS.background).trim();
        const colors = {
            ...DEFAULT_COLORS,
            primary,
            primaryDark: (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$src$2f$utils$2f$colorUtils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["darken"])(primary, 0.15),
            primaryLight: (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$src$2f$utils$2f$colorUtils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["lighten"])(primary, 0.25),
            primaryFaded: (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$src$2f$utils$2f$colorUtils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["lighten"])(primary, 0.85),
            secondary,
            accent: secondary,
            background,
            headerText: (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$src$2f$utils$2f$colorUtils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["contrastText"])(secondary)
        };
        return {
            themeId: `empresa-${profile.empresaId}`,
            colors,
            logoUrl: profile.logoUrl || null,
            empresaNombre: profile.empresaNombre || null,
            loading: false
        };
    }, [
        profile,
        authLoading
    ]);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(ThemeContext.Provider, {
        value: value,
        children: children
    }, void 0, false, {
        fileName: "[project]/Desktop/03.MENSANA/mensana-next/src/context/ThemeContext.tsx",
        lineNumber: 100,
        columnNumber: 10
    }, ("TURBOPACK compile-time value", void 0));
};
const useTheme = ()=>{
    const context = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$03$2e$MENSANA$2f$mensana$2d$next$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useContext"])(ThemeContext);
    if (!context) throw new Error('useTheme debe usarse dentro de ThemeProvider');
    return context;
};
const __TURBOPACK__default__export__ = ThemeContext;
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__71dc38df._.js.map