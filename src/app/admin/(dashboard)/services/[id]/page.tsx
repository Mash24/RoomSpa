import { AdminServiceEditor } from "@/components/admin/admin-service-editor";

type PageProps = { params: Promise<{ id: string }> };

export default async function AdminEditServicePage({ params }: PageProps) {
  const { id } = await params;
  return <AdminServiceEditor serviceId={id} />;
}
