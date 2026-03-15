export const dynamic = "force-dynamic";

import RequireAdmin from "@/components/auth/RequireAdmin";
import AdminPageClient from "@/components/admin/AdminPageClient";

export default function ManagePage() {
  return (
    <RequireAdmin>
      <AdminPageClient />
    </RequireAdmin>
  );
}
