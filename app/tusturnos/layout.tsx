/**
 * Layout de /tusturnos — passthrough sin lógica.
 *
 * La protección de superadmin vive en app/tusturnos/page.tsx directamente.
 * Las páginas públicas de empresa (/tusturnos/[slug]/*) se renderizan
 * limpias sin ningún wrapper de dashboard.
 */
export default function TusTurnosLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
