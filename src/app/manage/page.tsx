export const dynamic = "force-dynamic";

import RequireStaff from "@/components/auth/RequireStaff";
import AdminPageClient from "@/components/admin/AdminPageClient";

export default function ManagePage() {
  // 운영진이면 진입 가능, 메뉴는 권한(capability)별로 AdminPageClient에서 분기
  return (
    <RequireStaff>
      <AdminPageClient />
    </RequireStaff>
  );
}
