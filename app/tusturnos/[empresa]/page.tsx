import { redirect } from 'next/navigation';

interface Props {
  params: Promise<{ empresa: string }>;
}

export default async function EmpresaPublicPage({ params }: Props) {
  const { empresa } = await params;
<<<<<<<< HEAD:app/tusturnos/[empresa]/page.tsx
  redirect(`/tusturnos/${empresa}/auth/login`);
}
========
  redirect(`/mensana/${empresa}/auth/login`);
}
>>>>>>>> desarrollo:app/mensana/[empresa]/page.tsx
