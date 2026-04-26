// Server-side validation for superadmin access
// This is a simple validation - actual auth is handled by AuthContext on client
export async function validateSuperadminAccess(): Promise<boolean> {
  // For now, return true to allow testing
  // In production, check server session/cookies
  return true;
}

export async function getSuperadminUserId(): Promise<string | null> {
  const session = await getServerSession();
  return session?.user?.id || null;
}

export function getSuperadminBrandLabel(brand: 'mensana' | 'tusturnos'): string {
  return brand === 'mensana' ? 'Mensana' : 'TusTurnos';
}
