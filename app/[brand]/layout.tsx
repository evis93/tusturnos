import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'TusTurnos y Mensana - Gestión Profesional',
  description: 'Plataforma integral de reservas y agendamiento',
};

export default async function BrandLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ brand: 'mensana' | 'tusturnos' }>;
}) {
  const { brand } = await params;
  const brandTitle = brand === 'mensana' ? 'Mensana' : 'TusTurnos';

  return (
    <>
      {/* Brand-level metadata via HTML title tag would be set here if needed */}
      {children}
    </>
  );
}