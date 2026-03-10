import { redirect } from 'next/navigation';

export default async function EditProfilePage({ params }: { params: Promise<{ handle: string }> }) {
  const { handle } = await params;
  redirect(`/p/${handle}`);
}
