import { notFound } from 'next/navigation';
import { validateSuperadminAccess } from '@/src/lib/superadmin-utils';
import { SUPERADMIN_COLORS } from '@/src/lib/brand-colors';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Panel de Control - Superadmin',
  description: 'Panel de administración global del sistema',
};

export default async function SuperadminLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ brand: 'mensana' | 'tusturnos' }>;
}) {
  await params;
  const isAuthorized = await validateSuperadminAccess();

  if (!isAuthorized) {
    return notFound();
  }

  const colors = SUPERADMIN_COLORS;

  return (
    <div
      style={
        {
          '--color-primary': colors.primary,
          '--color-secondary': colors.secondary,
          '--color-background': colors.background,
        } as React.CSSProperties
      }
    >
      {children}
    </div>
  );
}