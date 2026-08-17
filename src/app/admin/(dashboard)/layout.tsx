import { AdminHeader } from "@/components/admin/admin-header";

export default function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <AdminHeader />
      <div className="mx-auto max-w-6xl px-4 py-6 xs:px-5 md:px-8 md:py-8">{children}</div>
    </>
  );
}
