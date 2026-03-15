"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
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

  const groups = extractMyGroups(res?.data ?? null);

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
                groups.map((g) => {
                  const postId = g.postId ?? g.groupId;
                  const href =
                    g.postType === "PROJECT"
                      ? `/project/${postId}`
                      : `/study/${postId}`;
                  return (
                    <Link
                      key={g.groupId}
                      href={href}
                      className="rounded-2xl border border-gray-200 bg-white p-4 md:p-5 shadow-sm hover:shadow-md transition-shadow block"
                    >
                      <p className="text-gray-900 font-medium line-clamp-2 mb-2">
                        {g.groupName}
                      </p>
                      <p className="text-sm text-gray-500">
                        {g.activeMemberCount}/{g.maxActiveMembers}명
                      </p>
                    </Link>
                  );
                })}
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
