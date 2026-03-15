"use client";

import { useQuery } from "@tanstack/react-query";

import RequireMember from "@/components/auth/RequireMember";
import { groupApi, type MyGroupItem } from "@/api";

function extractMyGroups(raw: unknown): MyGroupItem[] {
  if (!raw || typeof raw !== "object") return [];
  const obj = raw as Record<string, unknown>;
  const data = obj.data ?? obj;
  if (Array.isArray(data)) return data as MyGroupItem[];
  if (data && typeof data === "object" && "content" in data) {
    const arr = (data as { content?: unknown }).content;
    return Array.isArray(arr) ? (arr as MyGroupItem[]) : [];
  }
  return [];
}

export default function ReportPage() {
  const { data: res, isLoading, isError } = useQuery({
    queryKey: ["myGroups"],
    queryFn: () => groupApi.getMyGroups(),
  });

  const allGroups = extractMyGroups(res?.data ?? null);
  const activeGroups = allGroups.filter((g) => g.groupStatus === "ACTIVE");
  const pendingGroups = allGroups.filter((g) => g.groupStatus !== "ACTIVE");

  return (
    <RequireMember>
      <main className="min-h-screen pb-12 bg-white">
        <div className="px-[15%]">
          <div className="pt-16 flex items-start justify-between">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                내 스터디/프로젝트
              </h1>
              <p className="text-base text-gray-600">
                보고서 업로드 기능이 곧 제공될 예정입니다. 잠시만 기다려 주세요.
              </p>
            </div>
          </div>

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
                activeGroups.map((g) => (
                  <div
                    key={g.groupId}
                    className="rounded-2xl border border-gray-200 bg-white p-4 md:p-5 shadow-sm hover:shadow-md transition-shadow block cursor-pointer"
                  >
                    <p className="text-gray-900 font-medium line-clamp-2 mb-2">
                      {g.groupName}
                    </p>
                  
                  </div>
                ))}
              {!isLoading &&
                !isError &&
                pendingGroups.map((g) => (
                  <div
                    key={g.groupId}
                    className="rounded-2xl border border-gray-200 bg-gray-50 p-4 md:p-5 block opacity-70"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <p className="text-gray-700 font-medium line-clamp-2 flex-1">
                        {g.groupName}
                      </p>
                      <span className="shrink-0 px-2 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-700">
                        승인 대기 중
                      </span>
                    </div>
                  </div>
                ))}
              {!isLoading && !isError && allGroups.length === 0 && (
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
