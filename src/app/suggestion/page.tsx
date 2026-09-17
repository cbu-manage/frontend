"use client";

import { useState } from "react";
import Link from "next/link";
import { Pencil } from "lucide-react";
import RequireMember from "@/components/auth/RequireMember";
import Pagination from "@/components/shared/Pagination";
import Tabs from "@/components/common/Tabs";
import {
  SuggestionStatusBadge,
  SuggestionTypeBadge,
} from "@/components/suggestion/SuggestionBadges";
import { useSuggestionList, useSuggestionSummary } from "@/hooks/suggestion";
import type { SuggestionStatus, SuggestionType } from "@/api";
import { formatDate } from "@/lib/date";

type TypeTab = "ALL" | SuggestionType;
type StatusFilter = "ALL" | SuggestionStatus;

const TYPE_TABS: { label: string; value: TypeTab }[] = [
  { label: "전체", value: "ALL" },
  { label: "버그", value: "BUG" },
  { label: "건의", value: "SUGGESTION" },
];

const STATUS_FILTERS: { label: string; value: StatusFilter }[] = [
  { label: "전체", value: "ALL" },
  { label: "미해결", value: "OPEN" },
  { label: "해결", value: "RESOLVED" },
];

export default function SuggestionPage() {
  const [typeTab, setTypeTab] = useState<TypeTab>("ALL");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");
  const [currentPage, setCurrentPage] = useState(1);

  const { data, isLoading, isError } = useSuggestionList({
    page: currentPage,
    type: typeTab === "ALL" ? undefined : typeTab,
    status: statusFilter === "ALL" ? undefined : statusFilter,
  });
  const summary = useSuggestionSummary();

  const posts = data?.items ?? [];
  const totalPages = Array.from(
    { length: data?.totalPages ?? 1 },
    (_, i) => i + 1,
  );

  return (
    <RequireMember>
      <main className="min-h-screen pb-16 bg-white">
        <div className="container-x-lg">
          <div className="pt-6 lg:pt-16 pb-6">
            <h1 className="text-h1 text-gray-900 mb-2">건의방</h1>
            <p className="text-gray-700">
              버그 제보와 기능 건의를 남기는 대나무숲이에요. 글과 댓글은 모두
              익명으로 올라가요.
            </p>
            {summary.data && (
              <p className="mt-3 text-body-sm text-gray-500">
                미해결{" "}
                <span className="font-semibold text-gray-900">
                  {summary.data.openCount}
                </span>
                건 · 해결{" "}
                <span className="font-semibold text-brand">
                  {summary.data.resolvedCount}
                </span>
                건
              </p>
            )}
          </div>

          {/* 종류 탭 + 상태 필터 + 글 작성 */}
          <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
            <Tabs
              items={TYPE_TABS}
              value={typeTab}
              onValueChange={(v) => {
                setTypeTab(v as TypeTab);
                setCurrentPage(1);
              }}
            />
            <div className="flex items-center gap-4">
              {STATUS_FILTERS.map((s) => (
                <button
                  key={s.value}
                  type="button"
                  onClick={() => {
                    setStatusFilter(s.value);
                    setCurrentPage(1);
                  }}
                  className={`text-sm transition-colors ${
                    statusFilter === s.value
                      ? "text-gray-900 font-semibold"
                      : "text-gray-400 hover:text-gray-600"
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>
          <div className="flex w-full items-center justify-end mb-4">
            <Link
              href="/suggestion/write"
              className="flex shrink-0 items-center gap-2 rounded-full bg-gray-800 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-gray-700"
            >
              <Pencil size={16} /> 글 작성하기
            </Link>
          </div>

          {/* 테이블 */}
          <div className="overflow-hidden rounded-lg border border-gray-200">
            <div className="flex items-center gap-8 px-2 py-3 bg-brand text-sm font-bold text-white">
              <span className="w-20 text-center shrink-0">종류</span>
              <span className="flex-1 text-center">제목</span>
              <span className="w-20 text-center shrink-0">상태</span>
              <span className="w-28 text-center shrink-0">작성일</span>
              <span className="w-20 text-center shrink-0">조회</span>
            </div>

            {isLoading ? (
              <div className="py-16 text-center text-sm text-gray-400">
                불러오는 중...
              </div>
            ) : isError ? (
              <div className="py-16 text-center text-sm text-red-500">
                목록을 불러오지 못했습니다.
              </div>
            ) : posts.length === 0 ? (
              <div className="py-16 text-center text-sm text-gray-900">
                아직 올라온 건의가 없습니다.
              </div>
            ) : (
              posts.map((post) => (
                <Link
                  key={post.postId}
                  href={`/suggestion/${post.postId}`}
                  className="flex items-center gap-8 px-2 py-6 border-b border-gray-100 transition-colors hover:bg-gray-50"
                >
                  <span className="w-20 flex justify-center shrink-0">
                    <SuggestionTypeBadge type={post.type} />
                  </span>
                  <span className="flex-1 flex items-center gap-1.5 min-w-0 text-sm text-gray-900">
                    <span className="truncate">{post.title}</span>
                    {(post.commentCount ?? 0) > 0 && (
                      <span className="shrink-0 text-brand text-xs">
                        [{post.commentCount}]
                      </span>
                    )}
                  </span>
                  <span className="w-20 flex justify-center shrink-0">
                    <SuggestionStatusBadge status={post.status} />
                  </span>
                  <span className="w-28 text-center shrink-0 text-sm text-gray-900">
                    {post.createdAt ? formatDate(post.createdAt) : ""}
                  </span>
                  <span className="w-20 text-center shrink-0 text-sm text-gray-900">
                    {post.viewCount ?? 0}
                  </span>
                </Link>
              ))
            )}
          </div>

          <div className="mt-8">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </div>
        </div>
      </main>
    </RequireMember>
  );
}
