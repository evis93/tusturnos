/**
 * EmpresaRepository — acceso a datos de empresas.
 * Lee directamente de la tabla Empresa (con RLS que permite lectura pública).
 */

import { createClient } from '@supabase/supabase-js';

function db() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false } },
  );
}

const CAMPOS = 'id, nombre, slug, color_primary, color_secondary, color_background, logo_url, producto';

export async function findBySlug(slug: string) {
  const { data, error } = await db()
    .from('empresas')
    .select(CAMPOS)
    .eq('slug', slug)
    .eq('activa', true)
    .maybeSingle();

  if (error) console.error('[EmpresaRepository.findBySlug]', error.message);
  return data ?? null;
}

export async function findByNombre(nombre: string) {
  const { data, error } = await db()
    .from('empresas')
    .select(CAMPOS)
    .ilike('nombre', `%${nombre}%`)
    .eq('activa', true)
    .maybeSingle();

  if (error) console.error('[EmpresaRepository.findByNombre]', error.message);
  return data ?? null;
}

export async function findByCustomDomain(domain: string) {
  const { data, error } = await db()
    .from('empresas')
    .select(CAMPOS)
    .eq('url', domain)
    .eq('activa', true)
    .maybeSingle();

  if (error) console.error('[EmpresaRepository.findByCustomDomain]', error.message);
  return data ?? null;
}
