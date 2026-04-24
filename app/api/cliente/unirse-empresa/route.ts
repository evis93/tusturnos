/**
 * POST /api/cliente/unirse-empresa
 * Vincula un usuario existente a una empresa con rol 'cliente'.
 * Usa service role para bypassear RLS.
 * Body: { usuarioId: string, empresaId: string }
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function adminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  if (!key) throw new Error('SUPABASE_SERVICE_ROLE_KEY no configurado');
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
}

export async function POST(req: NextRequest) {
  try {
    const { usuarioId, empresaId } = await req.json();

    if (!usuarioId || !empresaId) {
      return NextResponse.json({ error: 'usuarioId y empresaId son requeridos' }, { status: 400 });
    }

    const sb = adminClient();

    const { data: rol } = await sb
      .from('roles')
      .select('id')
      .eq('rol', 'cliente')
      .maybeSingle();

    if (!rol) {
      return NextResponse.json({ error: 'Rol cliente no encontrado' }, { status: 500 });
    }

    const { error } = await sb
      .from('usuario_empresa')
      .upsert(
        { usuario_id: usuarioId, empresa_id: empresaId, rol_id: rol.id },
        { onConflict: 'usuario_id,empresa_id' }
      );

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (e: any) {
    console.error('[api/cliente/unirse-empresa]', e.message);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
