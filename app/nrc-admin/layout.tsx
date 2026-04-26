import { ReactNode } from 'react';

const SUPERADMIN_COLORS = {
  primary: '#002442',
  secondary: '#006876',
  background: '#f9f9ff',
  primaryContainer: '#1a3a5a',
};

export default async function NrcAdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  // TODO: Implement validateSuperadminAccess() check
  // const { authorized } = await validateSuperadminAccess();
  // if (!authorized) redirect('/nrc-admin/auth/login');

  return (
    <html lang="es">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>NCR Console</title>
        <link
          href="https://fonts.googleapis.com/css2?family=Manrope:wght@200;400;500;600;700;800&family=Inter:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
        <style>
          {`
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            html, body {
              height: 100%;
              font-family: 'Manrope', sans-serif;
            }
            .material-symbols-outlined {
              font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
            }
          `}
        </style>
      </head>
      <body style={{ backgroundColor: SUPERADMIN_COLORS.background }}>
        {children}
      </body>
    </html>
  );
}
