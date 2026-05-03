"use client";

import { useRouter } from "next/navigation";
import { Download } from "lucide-react";

// TODO: API 연동 후 실제 데이터로 교체 (GET /api/v1/report/{id})
const MOCK_DETAIL = {
  title: "2026년 4월 정기활동 보고서",
  tag: "프론트엔드팀",
  author: "15기 김민주",
  updatedAt: "2026.04.18",
  files: ["HWP", "PDF"],
  meta: [
    { label: "활동 기간", value: "04.01 — 04.18" },
    { label: "참여 인원", value: "12명" },
    { label: "활동 주제", value: "Next.js 마이그레이션" },
    { label: "주요 결과", value: "라우팅 전면 개편 완료" },
  ],
  sections: [
    {
      title: "활동 내용",
      content: "활동 내용을 입력하세요.",
      hasImagePlaceholder: true,
    },
    {
      title: "참여자 명단",
      content: "참여자 명단을 입력하세요.",
      hasImagePlaceholder: false,
    },
    {
      title: "소감",
      content: "소감을 입력하세요.",
      hasImagePlaceholder: false,
    },
  ],
};

export default function ReportDetailPage() {
  const router = useRouter();

  return (
    <main className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-6 py-10">

        {/* 목록으로 */}
        <button
          onClick={() => router.push("/manage?tab=reports")}
          className="mb-6 text-sm text-gray-900 font-medium hover:text-gray-600 transition-colors"
        >
          ← 목록으로
        </button>

        {/* 제목 + 파일 다운로드 */}
        <div className="flex items-start justify-between gap-4 mb-3">
          <h1 className="text-2xl font-bold text-gray-900">
            {MOCK_DETAIL.title}
          </h1>
          <div className="flex gap-2 shrink-0">
            {MOCK_DETAIL.files.map((f) => (
              <button
                key={f}
                className="flex items-center gap-1.5 rounded-lg border border-gray-300 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
              >
                <Download size={14} />
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* 팀 뱃지 + 작성자 + 날짜 */}
        <div className="flex items-center gap-2 mb-6 text-sm text-gray-500">
          <span className="rounded border border-gray-300 px-2 py-0.5 text-xs font-medium text-gray-700">
            {MOCK_DETAIL.tag}
          </span>
          <span>{MOCK_DETAIL.author}</span>
          <span>·</span>
          <span>최종일 {MOCK_DETAIL.updatedAt}</span>
        </div>

        {/* 메타 정보 카드 4개 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-10">
          {MOCK_DETAIL.meta.map((item) => (
            <div
              key={item.label}
              className="rounded-xl border border-gray-200 bg-white p-4"
            >
              <p className="text-xs text-gray-400 mb-1">{item.label}</p>
              <p className="text-sm font-semibold text-gray-900">{item.value}</p>
            </div>
          ))}
        </div>

        {/* 상세 내용 */}
        <h2 className="text-base font-bold text-gray-900 mb-6">상세 내용</h2>

        <div className="divide-y divide-gray-200">
          {MOCK_DETAIL.sections.map((section, i) => (
            <div key={section.title} className="py-8 first:pt-0">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">
                {i + 1}. {section.title}
              </h3>

              {/* TODO: 실제 내용 렌더링 */}
              <div className="space-y-2 mb-4">
                <div className="h-3 rounded bg-gray-200 w-full" />
                <div className="h-3 rounded bg-gray-200 w-full" />
                <div className="h-3 rounded bg-gray-200 w-full" />
              </div>

              {/* 활동 내용에만 이미지 플레이스홀더 */}
              {section.hasImagePlaceholder && (
                <div className="rounded-xl border border-gray-200 bg-gray-50 flex items-center justify-center h-48 text-sm text-gray-400">
                  활동 사진 / 별내일
                </div>
              )}
            </div>
          ))}
        </div>

      </div>
    </main>
  );
}
