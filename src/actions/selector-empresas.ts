'use server';

import { getServerSession } from 'next-auth';
import { createClient } from '@/src/lib/supabase/server';

export interface EmpresaOption {
  id: string;
  nombre: string;
  subdominio: string;
  dominio: string;
  producto: 'mensana' | 'tusturnos';
  color_primary?: string;
  color_secondary?: string;
}

export async function obtenerEmpresasDelUsuario(
  brand: 'mensana' | 'tusturnos'
): Promise<EmpresaOption[]> {
  const session = await getServerSession();

  if (!session?.user?.id) {
    return [];
  }

  const supabase = await createClient();
  const userId = session.user.id;
  const userRole = (session.user as any)?.role || 'cliente';

  // Query empresas donde el usuario tiene acceso
  // Para admin/profesional: empresas donde trabajan
  // Para cliente: empresas donde tienen reservas o acceso
  const { data, error } = await supabase
    .from('usuarios_empresas')
    .select(
      `
      empresa_id,
      empresas:empresa_id(
        id,
        nombre,
        subdominio,
        dominio,
        producto,
        color_primary,
        color_secondary
      )
    `
    )
    .eq('usuario_id', userId)
    .eq('empresas.producto', brand);

  if (error) {
    console.error('Error fetching user empresas:', error);
    return [];
  }

  return (
    data
      ?.map((row: any) => row.empresas)
      .filter(Boolean)
      .sort((a: any, b: any) => a.nombre.localeCompare(b.nombre)) || []
  );
}

export async function obtenerEmpresaUnica(brand: 'mensana' | 'tusturnos') {
  const empresas = await obtenerEmpresasDelUsuario(brand);
  
  // Si solo hay una empresa, retornarla
  if (empresas.length === 1) {
    return empresas[0];
  }
  
  return null;
}
