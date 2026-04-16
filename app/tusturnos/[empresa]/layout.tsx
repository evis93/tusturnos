/**
 * Layout server-side de /tusturnos/[empresa]/*
 *
 * 1. Resuelve el tenant via TenantResolver (Service Layer)
 * 2. Provee TenantContext a todos los children
 * 3. ThemeProvider dentro de TenantProvider → lee los colores correctos
 */

import { resolveBySlug } from '@/src/services/TenantResolver';
import { TenantProvider } from '@/src/context/TenantContext';
import { ThemeProvider } from '@/src/context/ThemeContext';
import { headers } from 'next/headers'

interface Props {
  children: React.ReactNode;
  params: Promise<{ empresa: string }>;
}

export default async function EmpresaLayout({ children, params }: Props) {
  const { empresa } = await params;
  const h = await headers();
  const product = h.get('x-tenant-product') ?? 'tusturnos';
  const tenant = await resolveBySlug(empresa, product);

  return (
    <TenantProvider tenant={tenant}>
      <ThemeProvider>
        {children}
      </ThemeProvider>
    </TenantProvider>
  );
}
