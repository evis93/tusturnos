import { notFound } from 'next/navigation';
import { headers } from 'next/headers';
import { TenantProvider } from '@/src/context/TenantContext';
import { resolveBySlug } from '@/src/services/TenantResolver';

export default async function TenantLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ brand: 'mensana' | 'tusturnos'; subdominio: string }>;
}) {
  const { brand, subdominio } = await params;

  try {
    // Resolve tenant from database using slug
    const tenant = await resolveBySlug(subdominio, brand);

    if (!tenant || tenant.producto !== brand) {
      return notFound();
    }

    // Provide resolved tenant to child components
    return (
      <TenantProvider tenantData={tenant}>
        {children}
      </TenantProvider>
    );
  } catch (error) {
    console.error('Tenant resolution error:', error);
    return notFound();
  }
}