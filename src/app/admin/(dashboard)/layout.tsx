import { AdminHeader } from "@/components/admin/admin-header";

export default function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="admin-shell">
      <AdminHeader />
      <div className="mx-auto w-full min-w-0 max-w-6xl px-4 py-6 xs:px-5 md:px-8 md:py-10">
        {children}
      </div>
    </div>
  );
}
