"use client";

import { useQuery } from "@tanstack/react-query";
import RequireMember from "@/components/auth/RequireMember";
import { groupApi } from "@/api";

export default function ReportPage() {
  const {
    data: res,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["myGroups"],
    queryFn: () => groupApi.getMyGroups(),
  });

  const body = res?.data as
    | {
        code?: string;
        message?: string;
        data?: { groupId: number; groupName: string }[];
      }
    | undefined;
  const list =
    body && typeof body === "object" && "data" in body ? body.data : body;
  const groups = Array.isArray(list) ? list : [];

  return (
    <RequireMember>
      <main className="min-h-screen pb-12 bg-white">
        <div className="px-72">
          {/* 헤더 섹션 */}
          <div className="pt-12 flex items-start justify-between">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                내 스터디/프로젝트
              </h1>
              <p className="text-base text-gray-600">
                보고서 업로드 기능이 곧 제공될 예정입니다. 잠시만 기다려 주세요.
              </p>
            </div>
          </div>

          {/* 내 스터디/프로젝트 - 카드 그리드 (자료방과 동일 레이아웃) */}
          <section className="py-8 md:py-12">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              {isLoading && (
                <div className="col-span-full text-center py-12 text-gray-500">
                  그룹 목록을 불러오는 중...
                </div>
              )}
              {isError && (
                <div className="col-span-full text-center py-12 text-red-500">
                  그룹 목록을 불러오지 못했습니다.
                </div>
              )}
              {!isLoading &&
                !isError &&
                groups.map((g) => (
                  <div
                    key={g.groupId}
                    className="rounded-2xl border border-gray-200 bg-white p-4 md:p-5 shadow-sm hover:shadow-md transition-shadow"
                  >
                    <p className="text-gray-900 font-medium line-clamp-2">
                      {g.groupName}
                    </p>
                  </div>
                ))}
              {!isLoading && !isError && groups.length === 0 && (
                <div className="col-span-full text-center py-12 text-gray-500">
                  가입한 스터디/프로젝트가 없습니다.
                </div>
              )}
            </div>
          </section>
        </div>
      </main>
    </RequireMember>
  );
}
