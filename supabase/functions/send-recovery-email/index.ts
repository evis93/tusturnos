// Edge Function: send-recovery-email
// Envía un mail a mensana.soporte@gmail.com cuando un usuario solicita recuperar su contraseña.
// Servicio: Resend (https://resend.com) — plan free: 3.000 mails/mes, 100/día.
//
// Setup (una sola vez):
//   1. Crear cuenta en https://resend.com
//   2. Ir a API Keys → crear una key
//   3. En terminal: supabase secrets set RESEND_API_KEY=re_xxxxxxxx

const SOPORTE_EMAIL = 'mensana.soporte@gmail.com';
const FROM = 'Mensana <noreply@mensana.com.ar>';   // Requiere dominio verificado en Resend

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req: Request) => {
  // Preflight CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { email } = await req.json();

    if (!email || typeof email !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Email requerido' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const resendKey = Deno.env.get('RESEND_API_KEY');
    if (!resendKey) {
      return new Response(
        JSON.stringify({ error: 'Configuración de email incompleta' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${resendKey}`,
      },
      body: JSON.stringify({
        from: FROM,
        to: [SOPORTE_EMAIL],
        subject: 'Solicitud de recuperación de contraseña',
        html: `
          <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
            <h2 style="color: #268FDB;">Tus Turnos — Recuperación de contraseña</h2>
            <p>El siguiente usuario solicitó recuperar su contraseña:</p>
            <p style="font-size: 18px; font-weight: bold; color: #1e293b;">${email.trim()}</p>
            <p style="color: #64748b;">Por favor, asistirlo a la brevedad desde el panel de administración de Supabase.</p>
            <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
            <p style="font-size: 12px; color: #94a3b8;">Este mensaje fue generado automáticamente por Tus Turnos.</p>
          </div>
        `,
      }),
    });

    if (!res.ok) {
      const errorBody = await res.text();
      console.error('Resend error:', errorBody);
      return new Response(
        JSON.stringify({ error: 'Error al enviar el email' }),
        { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ ok: true }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    console.error('Error inesperado:', err);
    return new Response(
      JSON.stringify({ error: 'Error interno' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
