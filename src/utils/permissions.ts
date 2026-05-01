const ROLE_PERMISSIONS: Record<string, string[]> = {
  superadmin: ['*'],
  admin: [
    'agenda:read', 'agenda:write',
    'reservas:read', 'reservas:write',
    'reportes:read',
    'profesionales:read', 'profesionales:write',
    'horarios:read', 'horarios:write',
    'consultantes:read', 'consultantes:write',
    'servicios:read', 'servicios:write',
    'admin:dashboard',
  ],
  profesional: [
    'agenda:read', 'agenda:write',
    'reservas:read', 'reservas:write',
    'profesionales:read',
    'horarios:read', 'horarios:write',
    'consultantes:read', 'consultantes:write',
    'servicios:read',
  ],
  cliente: [
    'explorar:read',
    'favoritos:read', 'favoritos:write',
    'citas:read',
  ],
};

export interface SucursalDisponible {
  sucursalId: string;
  sucursalNombre: string;
  empresaId: string;
  empresaNombre: string;
  direccion?: string;
  location?: any;
  rolId: string;
  totalSucursalesUsuario: number;
  totalEmpresasUsuario: number;
  sucursalesPorEmpresa: number;
}

export interface EmpresaDisponible {
  empresaId: string;
  empresaNombre: string;
  rol: string;
  colorPrimario?: string;
  colorSecundario?: string;
  colorBackground?: string;
  logoUrl?: string;
}

export interface Profile {
  rol?: string | null;
  empresaId?: string | null;
  sucursalId?: string | null;
  usuarioId?: string | null;
  authUserId?: string | null;
  nombre_completo?: string | null;
  email?: string | null;
  empresaNombre?: string | null;
  sucursalNombre?: string | null;
  profesionalId?: string | null;
  esAdmin?: boolean;
  esProfesional?: boolean;
  esCliente?: boolean;
  esMensana?: boolean;
  colorPrimario?: string | null;
  colorSecundario?: string | null;
  colorBackground?: string | null;
  logoUrl?: string | null;
  empresasDisponibles?: EmpresaDisponible[];
  sucursalesDisponibles?: SucursalDisponible[];
  totalSucursales?: number;
}

export function hasPermission(rol: string | null | undefined, permission: string) {
  if (!rol) return false;
  const perms = ROLE_PERMISSIONS[rol];
  if (!perms) return false;
  if (perms.includes('*')) return true;
  return perms.includes(permission);
}

export function requirePermission(profile: Profile | null, permission: string) {
  if (!hasPermission(profile?.rol, permission)) {
    return { success: false, error: 'Sin permisos', code: 'FORBIDDEN' };
  }
  return null;
}

export function requireEmpresa(profile: Profile | null) {
  if (!profile?.empresaId) {
    return { success: false, error: 'Sin empresa asociada', code: 'NO_EMPRESA' };
  }
  return null;
}
