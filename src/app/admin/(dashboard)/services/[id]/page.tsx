import { AdminServiceEditor } from "@/components/admin/admin-service-editor";

type PageProps = { params: Promise<{ id: string }> };

export default async function AdminEditServicePage({ params }: PageProps) {
  const { id } = await params;
  return (
    <section className="mx-auto max-w-6xl px-5 py-10 md:px-8 md:py-12">
      <AdminServiceEditor serviceId={id} />
    </section>
  );
}
