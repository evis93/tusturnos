'use server';

import { getServerSession } from 'next-auth';
import { createClient } from '@/src/lib/supabase/server';

export async function obtenerEmpresas(brand: 'mensana' | 'tusturnos') {
  const session = await getServerSession();

  if (!session?.user) {
    throw new Error('No autenticado');
  }

  // Validate superadmin role
  const userRole = (session.user as any)?.role;
  if (userRole !== 'superadmin') {
    throw new Error('No autorizado');
  }

  const supabase = await createClient();

  const { data, error } = await supabase
    .from('empresas')
    .select('id, nombre, subdominio, dominio, producto')
    .eq('producto', brand)
    .order('nombre', { ascending: true });

  if (error) {
    throw new Error(`Error fetching empresas: ${error.message}`);
  }

  return data || [];
}

export async function obtenerEmpresas1O2(brand: 'mensana' | 'tusturnos') {
  const empresas = await obtenerEmpresas(brand);
  
  // If user has only 1 empresa, return it directly
  // If user has 2 or more, return them for selection
  return {
    count: empresas.length,
    empresas,
  };
}
