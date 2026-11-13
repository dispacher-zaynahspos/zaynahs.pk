import { redirect } from 'next/navigation';

interface Props {
  searchParams: Promise<{ id?: string }>;
}

export default async function ProductEditorRedirectPage({ searchParams }: Props) {
  const params = await searchParams;
  if (params?.id) {
    redirect(`/admin/products/${params.id}`);
  }
  redirect('/admin/products');
}
