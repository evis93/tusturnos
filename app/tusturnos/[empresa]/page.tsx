import { redirect } from 'next/navigation';

interface Props {
  params: Promise<{ empresa: string }>;
}

export default async function EmpresaPublicPage({ params }: Props) {
  const { empresa } = await params;
  redirect(`/tusturnos/${empresa}/auth/login`);
}
