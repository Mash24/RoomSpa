import { AdminHeader } from "@/components/admin/admin-header";

export default function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <AdminHeader />
      <div className="mx-auto max-w-6xl px-5 py-8 md:px-8">{children}</div>
    </>
  );
}
