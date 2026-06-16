"use client";

import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Download, Pencil } from "lucide-react";
import { format } from "date-fns";
import { useUserStore } from "@/store/userStore";
import { reportApi, type ReportDetail } from "@/api";

const TYPE_LABEL: Record<string, string> = {
  STUDY: "스터디",
  PROJECT: "프로젝트",
  MENTORING: "멘토링",
};

function formatDate(iso?: string): string {
  if (!iso) return "-";
  try {
    return format(new Date(iso), "yyyy.MM.dd");
  } catch {
    return iso;
  }
}

export default function ReportDetailPage() {
  const router = useRouter();
  const params = useParams();
  const postId = Number(params.id);
  const isAdmin = useUserStore((s) => s.isAdmin);

  const { data: res, isLoading, isError } = useQuery({
    queryKey: ["report", postId],
    queryFn: () => reportApi.getById(postId),
    enabled: Number.isFinite(postId),
  });

  const detail = res?.data?.data;

  const handleExport = async () => {
    try {
      const fileRes = await reportApi.exportHwp(postId);
      const url = URL.createObjectURL(fileRes.data as Blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${detail?.postInfoDTO.title ?? "report"}.hwp`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch {
      alert("HWP 추출에 실패했습니다.");
    }
  };

  return (
    <main className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-6 py-10">

        {/* 목록으로 */}
        <button
          onClick={() => router.push("/report")}
          className="mb-6 text-sm text-gray-900 font-medium hover:text-gray-600 transition-colors"
        >
          ← 목록으로
        </button>

        {isLoading && (
          <div className="text-center py-16 text-gray-500">불러오는 중...</div>
        )}
        {isError && (
          <div className="text-center py-16 text-red-500">보고서를 불러오지 못했습니다.</div>
        )}

        {!isLoading && !isError && detail && (
          <ReportDetailView
            detail={detail}
            isAdmin={isAdmin}
            onExport={handleExport}
            onEdit={() => router.push(`/report/write?edit=${postId}`)}
          />
        )}
      </div>
    </main>
  );
}

function ReportDetailView({
  detail,
  isAdmin,
  onExport,
  onEdit,
}: {
  detail: ReportDetail;
  isAdmin: boolean;
  onExport: () => void;
  onEdit: () => void;
}) {
  const { postInfoDTO: post, reportInfoDTO: report } = detail;

  const meta = [
    { label: "활동 일자", value: formatDate(report.date) },
    { label: "활동 장소", value: report.location || "-" },
    { label: "유형", value: TYPE_LABEL[report.type] ?? report.type },
    { label: "참여 인원", value: `${report.reportMembers.length}명` },
  ];

  return (
    <>
      {/* 제목 + HWP 추출 */}
      <div className="flex items-start justify-between gap-4 mb-3">
        <h1 className="text-2xl font-bold text-gray-900">{post.title}</h1>
        {isAdmin && (
          <div className="flex gap-2 shrink-0">
            <button
              type="button"
              onClick={onExport}
              className="flex items-center gap-1.5 rounded-lg border border-gray-300 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
            >
              <Download size={14} />
              HWP 추출
            </button>
          </div>
        )}
      </div>

      {/* 팀 뱃지 + 작성자 + 날짜 */}
      <div className="flex items-center gap-2 mb-6 text-sm text-gray-500">
        <span className="rounded border border-gray-300 px-2 py-0.5 text-xs font-medium text-gray-700">
          {report.groupInfoDTO.groupName}
        </span>
        <span>
          {post.generation}기 {post.authorName}
        </span>
        <span>·</span>
        <span>최종일 {formatDate(post.updatedAt)}</span>
      </div>

      {/* 메타 정보 카드 4개 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-10">
        {meta.map((item) => (
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
        {/* 1. 활동 내용 */}
        <section className="py-8 first:pt-0">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">1. 활동 내용</h3>
          <p className="text-sm leading-6 text-gray-700 whitespace-pre-wrap mb-4">
            {post.content || "내용이 없습니다."}
          </p>
          {report.reportImage && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={report.reportImage}
              alt="활동 사진"
              className="rounded-xl border border-gray-200 w-full object-cover"
            />
          )}
        </section>

        {/* 2. 참여자 명단 */}
        <section className="py-8">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">2. 참여자 명단</h3>
          {report.reportMembers.length === 0 ? (
            <p className="text-sm text-gray-400">참여자 정보가 없습니다.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {report.reportMembers.map((m) => (
                <span
                  key={m.userId}
                  className="rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-700"
                >
                  {m.name}
                </span>
              ))}
            </div>
          )}
        </section>

        {/* 3. 소감 */}
        <section className="py-8">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">3. 스터디 후 느낀 점</h3>
          <p className="text-sm leading-6 text-gray-700 whitespace-pre-wrap">
            {report.reflection || "내용이 없습니다."}
          </p>
        </section>

        {/* 4. 다음 주 계획 */}
        <section className="py-8">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">4. 다음 주 계획</h3>
          <p className="text-sm leading-6 text-gray-700 whitespace-pre-wrap">
            {report.nextPlan || "내용이 없습니다."}
          </p>
        </section>
      </div>

      {/* 수정 버튼 (작성자 전용 — TODO: API 연동 시 작성자 여부로 노출 제어) */}
      <div className="flex justify-end mt-10">
        <button
          type="button"
          onClick={onEdit}
          className="flex items-center gap-1.5 rounded-lg bg-gray-800 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700 transition-colors"
        >
          <Pencil size={14} />
          수정
        </button>
      </div>
    </>
  );
}
