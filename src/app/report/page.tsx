"use client";

import { useQuery } from "@tanstack/react-query";
import RequireMember from "@/components/auth/RequireMember";
import { groupApi } from "@/api";

export default function ReportPage() {
  const { data: res, isLoading, isError } = useQuery({
    queryKey: ["myGroups"],
    queryFn: () => groupApi.getMyGroups(),
  });

  const body = res?.data as
    | { code?: string; message?: string; data?: { groupId: number; groupName: string }[] }
    | undefined;
  const list = body && typeof body === "object" && "data" in body ? body.data : body;
  const groups = Array.isArray(list) ? list : [];

  return (
    <RequireMember>
      <main className="flex min-h-[50vh] flex-col bg-gray-0 px-[9.375%] py-16">
        <h1 className="text-3xl font-semibold text-gray-900 mb-8">
          보고서 업로드
        </h1>

        {/* 내 스터디/프로젝트 - 리스트에는 groupName만 표시 */}
        <section className="mb-10">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            내 스터디/프로젝트
          </h2>
          {isLoading && (
            <p className="text-gray-500">그룹 목록을 불러오는 중...</p>
          )}
          {isError && (
            <p className="text-red-500">그룹 목록을 불러오지 못했습니다.</p>
          )}
          {!isLoading && !isError && groups.length === 0 && (
            <p className="text-gray-500">가입한 스터디/프로젝트가 없습니다.</p>
          )}
          {!isLoading && !isError && groups.length > 0 && (
            <ul className="flex flex-col gap-2">
              {groups.map((g) => (
                <li
                  key={g.groupId}
                  className="py-2 px-4 rounded-lg bg-white border border-gray-200 text-gray-900 font-medium"
                >
                  {g.groupName}
                </li>
              ))}
            </ul>
          )}
        </section>

        <p className="max-w-2xl text-base text-gray-600">
          보고서 업로드 기능이 곧 제공될 예정입니다. 잠시만 기다려 주세요.
        </p>
      </main>
    </RequireMember>
  );
}
