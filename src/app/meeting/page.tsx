"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Pencil } from "lucide-react";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import RequireMember from "@/components/auth/RequireMember";
import Pagination from "@/components/shared/Pagination";
import Tabs from "@/components/common/Tabs";
import MeetingCard from "@/components/meeting/MeetingCard";
import { useGatherings, useCanManageGathering } from "@/hooks/meeting";
import { GATHERING_TYPE_LABEL } from "@/api";

type StatusTab = "전체" | "진행 예정" | "지난 모임";

const PAGE_SIZE = 12; // 3열 × 4행

function formatDate(iso: string) {
  try {
    return format(new Date(iso), "yyyy.MM.dd (EEE) HH:mm", { locale: ko });
  } catch {
    return iso;
  }
}

export default function MeetingPage() {
  const canManage = useCanManageGathering();
  const [activeTab, setActiveTab] = useState<StatusTab>("전체");
  const [currentPage, setCurrentPage] = useState(1);

  const { data: gatherings = [], isLoading, isError } = useGatherings();

  const upcomingCount = gatherings.filter((m) => !m.voteClosed).length;
  const pastCount = gatherings.filter((m) => m.voteClosed).length;

  const filtered = useMemo(() => {
    const list = gatherings.filter((m) => {
      if (activeTab === "진행 예정") return !m.voteClosed;
      if (activeTab === "지난 모임") return m.voteClosed;
      return true;
    });
    return list;
  }, [gatherings, activeTab]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);
  const paged = filtered.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );

  return (
    <RequireMember>
      <main className="min-h-screen pb-16 bg-white">
        <div className="container-x-lg">
          <div className="pt-6 lg:pt-16 pb-6">
            <h1 className="text-h1 text-gray-900 mb-2">모임</h1>
            <p className="text-base text-gray-700">
              회식 · MT · 박람회 등 동아리 모임 일정에 참석 여부를 응답하세요
            </p>
          </div>

          {/* 탭 + 글 작성 */}
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <Tabs
              items={[
                { label: "전체", value: "전체" },
                { label: `진행 예정 (${upcomingCount})`, value: "진행 예정" },
                { label: `지난 모임 (${pastCount})`, value: "지난 모임" },
              ]}
              value={activeTab}
              onValueChange={(v) => {
                setActiveTab(v as StatusTab);
                setCurrentPage(1);
              }}
            />
            {canManage && (
              <Link
                href="/meeting/write"
                className="flex shrink-0 items-center gap-2 rounded-full bg-gray-800 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-gray-700"
              >
                <Pencil size={16} /> 새 모임 등록
              </Link>
            )}
          </div>

          {isLoading && (
            <div className="py-20 text-center text-gray-400">
              모임을 불러오는 중...
            </div>
          )}
          {isError && (
            <div className="py-20 text-center text-red-500">
              모임 목록을 불러오지 못했습니다.
            </div>
          )}

          {!isLoading && !isError && filtered.length === 0 && (
            <div className="py-20 text-center text-gray-400">
              등록된 모임이 없어요.
            </div>
          )}

          {!isLoading && !isError && filtered.length > 0 && (
            <>
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
                {paged.map((m) => (
                  <MeetingCard
                    key={m.id}
                    href={`/meeting/${m.id}`}
                    category={GATHERING_TYPE_LABEL[m.type]}
                    done={m.voteClosed}
                    title={m.title}
                    date={formatDate(m.gatheringDate)}
                    location={m.location}
                    responded={m.summary.attending}
                    capacity={m.summary.total}
                  />
                ))}
              </div>

              <div className="mt-10">
                <Pagination
                  currentPage={currentPage}
                  totalPages={pageNumbers}
                  onPageChange={setCurrentPage}
                />
              </div>
            </>
          )}
        </div>
      </main>
    </RequireMember>
  );
}
