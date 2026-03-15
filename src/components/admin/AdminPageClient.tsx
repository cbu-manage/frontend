"use client";

import { useCallback, useState } from "react";
import { useSearchParams } from "next/navigation";
import Sidebar from "@/components/shared/Sidebar";
import MemberManageSection from "@/components/admin/MemberManageSection";
import GroupManageSection from "@/components/admin/GroupManageSection";
import ReportManageSection from "@/components/admin/ReportManageSection";

const ADMIN_MENU_ITEMS = [
  { label: "회원 관리", value: "members" },
  { label: "그룹 관리", value: "groups" },
  { label: "보고서 관리", value: "reports" },
] as const;

type AdminMenuValue = (typeof ADMIN_MENU_ITEMS)[number]["value"];

export default function AdminPageClient() {
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab");
  const [selectedMenu, setSelectedMenu] = useState<AdminMenuValue>(() => {
    if (tabParam === "groups" || tabParam === "reports") {
      return tabParam as AdminMenuValue;
    }
    return "members";
  });

  const handleSelect = useCallback((value: string) => {
    setSelectedMenu(value as AdminMenuValue);
  }, []);

  return (
    <main className="min-h-screen bg-gray-0">
      <div className="flex pt-14 pb-12">
        <Sidebar
          items={ADMIN_MENU_ITEMS}
          selected={selectedMenu}
          onSelect={handleSelect}
        />
        <div className="flex-1 ml-[calc(9.375vw+240px)] pl-6 pr-[9.375%] min-w-0">
          {selectedMenu === "members" && <MemberManageSection />}
          {selectedMenu === "groups" && <GroupManageSection />}
          {selectedMenu === "reports" && <ReportManageSection />}
        </div>
      </div>
    </main>
  );
}
