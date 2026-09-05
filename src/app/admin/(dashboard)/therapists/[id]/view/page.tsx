import { AdminTherapistPreview } from "@/components/admin/admin-therapist-preview";

type PageProps = { params: Promise<{ id: string }> };

export default async function ViewTherapistPage({ params }: PageProps) {
  const { id } = await params;
  return <AdminTherapistPreview therapistId={id} />;
}
