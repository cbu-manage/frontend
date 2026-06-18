"use client";

import { useCallback, useState } from "react";
import { useSearchParams } from "next/navigation";
import Sidebar from "@/components/shared/Sidebar";
import MemberManageSection from "@/components/admin/MemberManageSection";
import GroupManageSection from "@/components/admin/GroupManageSection";
import ReportManageSection from "@/components/manage/ReportManageSection";
import NewMemberManageSection from "@/components/admin/NewMemberManageSection";

const ADMIN_MENU_ITEMS = [
  { label: "회원 관리", value: "members" },
  { label: "그룹 관리", value: "groups" },
  { label: "보고서 관리", value: "reports" },
  { label: "신청서 조회", value: "new-members" },
] as const;

type AdminMenuValue = (typeof ADMIN_MENU_ITEMS)[number]["value"];

export default function AdminPageClient() {
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab");
  const [selectedMenu, setSelectedMenu] = useState<AdminMenuValue>(() => {
    if (tabParam === "groups" || tabParam === "reports" || tabParam === "new-members") {
      return tabParam as AdminMenuValue;
    }
    return "members";
  });

  const handleSelect = useCallback((value: string) => {
    setSelectedMenu(value as AdminMenuValue);
  }, []);

  return (
    <main className="min-h-screen bg-gray-0">
      <div className="flex flex-col lg:flex-row pt-4 lg:pt-14 pb-6 lg:pb-12">
        <Sidebar
          items={ADMIN_MENU_ITEMS}
          selected={selectedMenu}
          onSelect={handleSelect}
        />
        <div className="flex-1 min-w-0 px-6 sm:px-8 lg:ml-[calc(9.375vw+240px)] lg:pl-6 lg:pr-[9.375%]">
          {selectedMenu === "members" && <MemberManageSection />}
          {selectedMenu === "groups" && <GroupManageSection />}
          {selectedMenu === "reports" && <ReportManageSection />}
          {selectedMenu === "new-members" && <NewMemberManageSection />}
        </div>
      </div>
    </main>
  );
}
