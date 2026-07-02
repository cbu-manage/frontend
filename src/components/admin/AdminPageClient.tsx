"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Sidebar from "@/components/shared/Sidebar";
import MemberManageSection from "@/components/admin/MemberManageSection";
import GroupManageSection from "@/components/admin/GroupManageSection";
import ReportManageSection from "@/components/manage/ReportManageSection";
import NewMemberManageSection from "@/components/admin/NewMemberManageSection";
import StaffAssignSection from "@/components/admin/StaffAssignSection";
import ClubScheduleSettingsSection from "@/components/admin/ClubScheduleSettingsSection";
import { useCan } from "@/hooks/auth/useCan";
import type { Capability } from "@/lib/permissions";

// 메뉴마다 노출 기준 capability. role→capability 매핑은 src/lib/permissions.ts (서버가 최종 차단)
const ADMIN_MENU_ITEMS = [
  { label: "회원 관리", value: "members", capability: "members.read" },
  { label: "그룹 관리", value: "groups", capability: "groups.manage" },
  { label: "보고서 관리", value: "reports", capability: "reportDocs.manage" },
  {
    label: "신청서 조회",
    value: "new-members",
    capability: "applications.review",
  },
  { label: "운영진 지정", value: "staff", capability: "staff.assign" },
  {
    label: "동아리 일정 설정",
    value: "settings",
    capability: "system.settings",
  },
] as const satisfies readonly {
  label: string;
  value: string;
  capability: Capability;
}[];

type AdminMenuValue = (typeof ADMIN_MENU_ITEMS)[number]["value"];

export default function AdminPageClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab");

  // 권한별 메뉴 노출 (ADMIN=전부, 운영진 서브롤=해당 capability만)
  const canMap: Record<AdminMenuValue, boolean> = {
    members: useCan("members.read"),
    groups: useCan("groups.manage"),
    reports: useCan("reportDocs.manage"),
    "new-members": useCan("applications.review"),
    staff: useCan("staff.assign"),
    settings: useCan("system.settings"),
  };
  const visibleItems = ADMIN_MENU_ITEMS.filter((item) => canMap[item.value]);

  const [selectedMenu, setSelectedMenu] = useState<AdminMenuValue>(() => {
    if (
      tabParam === "members" ||
      tabParam === "groups" ||
      tabParam === "reports" ||
      tabParam === "new-members" ||
      tabParam === "staff" ||
      tabParam === "settings"
    ) {
      return tabParam as AdminMenuValue;
    }
    return "new-members"; // 전 운영진 공통 메뉴를 기본값으로
  });

  // 선택된 메뉴에 권한이 없으면(예: deep-link) 보이는 첫 메뉴로 보정
  const effectiveMenu: AdminMenuValue | null = visibleItems.some(
    (i) => i.value === selectedMenu,
  )
    ? selectedMenu
    : (visibleItems[0]?.value ?? null);

  // 권한 없는 tab 딥링크는 URL도 보정 (새로고침/공유/북마크 시 허용 메뉴 유지)
  useEffect(() => {
    if (effectiveMenu && tabParam !== effectiveMenu) {
      router.replace(`/manage?tab=${effectiveMenu}`);
    }
  }, [effectiveMenu, tabParam, router]);

  const handleSelect = (value: string) => {
    setSelectedMenu(value as AdminMenuValue);
  };

  return (
    <main className="min-h-screen bg-gray-0">
      <div className="flex flex-col lg:flex-row pt-4 lg:pt-14 pb-6 lg:pb-12">
        <Sidebar
          items={visibleItems}
          selected={effectiveMenu ?? ""}
          onSelect={handleSelect}
        />
        <div className="flex-1 min-w-0 px-6 sm:px-8 lg:ml-[calc(9.375vw+240px)] lg:pl-6 lg:pr-[9.375%]">
          {effectiveMenu === "members" && <MemberManageSection />}
          {effectiveMenu === "groups" && <GroupManageSection />}
          {effectiveMenu === "reports" && <ReportManageSection />}
          {effectiveMenu === "new-members" && <NewMemberManageSection />}
          {effectiveMenu === "staff" && <StaffAssignSection />}
          {effectiveMenu === "settings" && <ClubScheduleSettingsSection />}
        </div>
      </div>
    </main>
  );
}
