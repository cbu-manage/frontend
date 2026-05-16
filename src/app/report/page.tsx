"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { Users, Sparkles } from "lucide-react";

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
  const activeGroups = allGroups.filter((g: MyGroupItem) => g.groupStatus === "ACTIVE");
  const pendingGroups = allGroups.filter((g: MyGroupItem) => g.groupStatus !== "ACTIVE");

  return (
    <RequireMember>
      <main className="min-h-screen pb-16 bg-white">
        <div className="container-x-lg">
          <div className="pt-6 lg:pt-16 pb-6">
            <h1 className="text-h1 text-gray-900 mb-2">
              내 스터디/프로젝트
            </h1>
            <p className="text-base text-gray-600">
              함께하는 팀을 선택해서 보고서를 작성해보세요 ✨
            </p>
          </div>

          <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 w-full">
            {isLoading && (
              <div className="col-span-full text-center py-16 text-gray-500">
                그룹 목록을 불러오는 중...
              </div>
            )}
            {isError && (
              <div className="col-span-full text-center py-16 text-red-500">
                그룹 목록을 불러오지 못했습니다.
              </div>
            )}
            {!isLoading && !isError && allGroups.length > 0 && (
              <>
                {activeGroups.map((g) => (
                  <Link
                    key={g.groupId}
                    href={`/report/${g.groupId}`}
                    className="group block rounded-2xl border-2 border-gray-200 bg-white p-6 text-center hover:border-[#95C674] hover:shadow-lg hover:-translate-y-1 transition-all duration-200"
                  >
                    <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#E8F5E3] text-[#5a9b4a] group-hover:bg-[#95C674]/30 transition-colors">
                      <Users className="h-7 w-7" strokeWidth={2} />
                    </div>
                    <p className="text-gray-900 font-semibold text-base break-words line-clamp-2 group-hover:text-[#2d5a1e] transition-colors">
                      {g.groupName}
                    </p>
                    <span className="mt-3 inline-block rounded-full bg-[#E8F5E3] px-4 py-1.5 text-sm font-medium text-[#5a9b4a]">
                      보고서 작성
                    </span>
                  </Link>
                ))}
                {pendingGroups.map((g) => (
                  <div
                    key={g.groupId}
                    className="block rounded-2xl border-2 border-gray-200 bg-gray-50 p-6 text-center cursor-not-allowed opacity-60"
                  >
                    <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-200 text-gray-400">
                      <Users className="h-7 w-7" strokeWidth={2} />
                    </div>
                    <p className="text-gray-500 font-semibold text-base break-words line-clamp-2">
                      {g.groupName}
                    </p>
                    <span className="mt-3 inline-block rounded-full bg-amber-100 px-4 py-1.5 text-sm font-medium text-amber-700">
                      승인 대기 중
                    </span>
                  </div>
                ))}
              </>
            )}
            {!isLoading && !isError && allGroups.length === 0 && (
              <div className="col-span-full rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50 py-20 px-8 text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#E8F5E3]">
                  <Sparkles className="h-8 w-8 text-[#5a9b4a]" strokeWidth={2} />
                </div>
                <p className="text-lg font-semibold text-gray-700 mb-2">
                  아직 가입한 스터디/프로젝트가 없어요
                </p>
                <p className="text-gray-500 max-w-sm mx-auto">
                  스터디·프로젝트에 참여하고 보고서를 올려보세요!
                  <br />
                  <Link
                    href="/study"
                    className="mt-3 inline-block text-[#5a9b4a] font-medium hover:underline"
                  >
                    스터디 둘러보기 →
                  </Link>
                  {" · "}
                  <Link
                    href="/project"
                    className="text-[#5a9b4a] font-medium hover:underline"
                  >
                    프로젝트 둘러보기 →
                  </Link>
                </p>
              </div>
            )}
          </section>
        </div>
      </main>
    </RequireMember>
  );
}
