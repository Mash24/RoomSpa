import { AdminTherapistEditor } from "@/components/admin/admin-therapist-editor";

type PageProps = { params: Promise<{ id: string }> };

export default async function EditTherapistPage({ params }: PageProps) {
  const { id } = await params;
  return <AdminTherapistEditor therapistId={id} />;
}
