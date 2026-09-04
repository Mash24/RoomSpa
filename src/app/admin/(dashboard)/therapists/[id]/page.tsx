import { AdminTherapistWorkspace } from "@/components/admin/admin-therapist-workspace";

type PageProps = { params: Promise<{ id: string }> };

export default async function EditTherapistPage({ params }: PageProps) {
  const { id } = await params;
  return <AdminTherapistWorkspace therapistId={id} />;
}
