"use client";

import { useState, useRef, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Download, Pencil, Trash2, MoreVertical } from "lucide-react";
import { format } from "date-fns";
import { reportApi, groupApi, type ReportDetail } from "@/api";
import { useIsAuthor, useCanManageReports, useMe } from "@/hooks/auth";

function formatDate(iso?: string): string {
  if (!iso) return "-";
  try {
    return format(new Date(iso), "yyyy.MM.dd");
  } catch {
    return iso;
  }
}

/** 파일명에 못 쓰는 문자(\ / : * ? " < > |)와 공백을 _로 치환 */
function sanitizeFilePart(v: string): string {
  return v.replace(/[\\/:*?"<>|\s]+/g, "_").replace(/^_+|_+$/g, "");
}

/** 개별 HWP 다운로드 파일명 규칙: [팀명]_작성자_날짜(yyMMdd).hwp */
function buildHwpFilename(detail?: ReportDetail): string {
  if (!detail) return "report.hwp";
  const team = detail.reportInfoDTO.groupInfoDTO.groupName;
  const author = detail.postInfoDTO.authorName;
  const date = detail.reportInfoDTO.date;
  const dateStr = date ? format(new Date(date), "yyMMdd") : "";
  const parts = [team, author, dateStr].filter(Boolean).map(sanitizeFilePart);
  const base = parts.join("_") || "report";
  return `${base}.hwp`;
}

export default function ReportDetailPage() {
  const router = useRouter();
  const params = useParams();
  const postId = Number(params.id);
  const invalidId = !Number.isFinite(postId); // /report/abc 같은 잘못된 경로
  useMe(); // userId·role 하이드레이트 (수정 버튼 작성자 검증·HWP 권한용)

  const {
    data: res,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["report", postId],
    queryFn: () => reportApi.getById(postId),
    enabled: !invalidId,
  });

  const detail = res?.data?.data;

  // 수정/삭제 권한 (작성자 본인 또는 최고관리자) — 상단 ⋮ 메뉴 노출용
  // store의 isAdmin은 /login/me가 안 내려줘서 항상 false → role 기반 useCanManageReports로 판정
  // TODO: 백엔드가 로그인 응답에 role 내려주기로 함 → store에 저장해 권한(isAdmin) 일괄 처리로 정리 (현재는 role 기반 우회)
  const { isAuthor } = useIsAuthor(detail?.postInfoDTO.authorId);
  const canManageReports = useCanManageReports();
  const canModify = isAuthor || canManageReports;
  const [menuOpen, setMenuOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node))
        setMenuOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleExport = async () => {
    try {
      const fileRes = await reportApi.exportHwp(postId);
      const url = URL.createObjectURL(fileRes.data as Blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = buildHwpFilename(detail);
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch {
      alert("HWP 추출에 실패했습니다.");
    }
  };

  const handleDelete = async () => {
    setMenuOpen(false);
    if (!window.confirm("이 보고서를 삭제할까요? 삭제 후 되돌릴 수 없습니다."))
      return;
    try {
      setDeleting(true);
      await reportApi.remove(postId);
      router.push("/report");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "";
      alert("삭제에 실패했습니다." + (msg ? `\n(${msg})` : ""));
      setDeleting(false);
    }
  };

  return (
    <main className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-6 py-10">
        {/* 목록으로 + ⋮(수정/삭제) */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => router.push("/report")}
            className="text-sm text-gray-900 font-medium hover:text-gray-600 transition-colors"
          >
            ← 목록으로
          </button>
          {detail && canModify && (
            <div className="relative" ref={menuRef}>
              <button
                type="button"
                onClick={() => setMenuOpen((v) => !v)}
                disabled={deleting}
                aria-haspopup="menu"
                aria-expanded={menuOpen}
                aria-label="더보기"
                className="rounded-lg p-1.5 text-gray-500 hover:bg-gray-100 transition-colors disabled:opacity-50"
              >
                <MoreVertical size={18} />
              </button>
              {menuOpen && (
                <div
                  role="menu"
                  className="absolute right-0 z-10 mt-1 w-28 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-md"
                >
                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => {
                      setMenuOpen(false);
                      router.push(`/report/write?edit=${postId}`);
                    }}
                    className="flex w-full items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <Pencil size={14} /> 수정
                  </button>
                  <button
                    type="button"
                    role="menuitem"
                    onClick={handleDelete}
                    className="flex w-full items-center gap-2 px-3 py-2 text-sm text-danger hover:bg-gray-50 transition-colors"
                  >
                    <Trash2 size={14} /> 삭제
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {invalidId && (
          <div className="text-center py-16 text-gray-500">
            잘못된 보고서 주소입니다.
          </div>
        )}
        {!invalidId && isLoading && (
          <div className="text-center py-16 text-gray-500">불러오는 중...</div>
        )}
        {!invalidId && isError && (
          <div className="text-center py-16 text-red-500">
            보고서를 불러오지 못했습니다.
          </div>
        )}

        {!invalidId && !isLoading && !isError && detail && (
          <ReportDetailView detail={detail} onExport={handleExport} />
        )}
      </div>
    </main>
  );
}

function ReportDetailView({
  detail,
  onExport,
}: {
  detail: ReportDetail;
  onExport: () => void;
}) {
  const { postInfoDTO: post, reportInfoDTO: report } = detail;
  const canManage = useCanManageReports();

  // 참여자 명단 기수: reportMembers엔 generation이 없어 그룹 상세에서 userId→기수 매핑해 보강
  const { data: groupRes } = useQuery({
    queryKey: ["groupDetail", report.groupInfoDTO.groupId],
    queryFn: () => groupApi.getById(report.groupInfoDTO.groupId),
  });
  const genByUserId = new Map<number, number>(
    (groupRes?.data?.data?.members ?? []).map((m) => [
      m.userId,
      m.userGeneration,
    ]),
  );

  const meta = [
    { label: "활동 일자", value: formatDate(report.date) },
    { label: "참여 인원", value: `${report.reportMembers.length}명` },
  ];

  return (
    <>
      {/* 제목 + HWP 추출 */}
      <div className="flex items-start justify-between gap-4 mb-3">
        <h1 className="text-2xl font-bold text-gray-900">{post.title}</h1>
        {canManage && (
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
        <span className="rounded-full bg-report-badge px-3 py-1 text-xs font-medium text-white">
          {report.groupInfoDTO.groupName}
        </span>
        <span>
          {post.generation}기 {post.authorName}
        </span>
        <span>·</span>
        <span>최종일 {formatDate(post.updatedAt)}</span>
      </div>

      {/* 메타 정보 카드 (활동 일자 · 참여 인원) */}
      <div className="grid grid-cols-2 gap-3 mb-10">
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
          <h3 className="text-sm font-semibold text-gray-700 mb-3">
            1. 활동 내용
          </h3>
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
          <h3 className="text-sm font-semibold text-gray-700 mb-3">
            2. 참여자 명단
          </h3>
          {report.reportMembers.length === 0 ? (
            <p className="text-sm text-gray-400">참여자 정보가 없습니다.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {report.reportMembers.map((m) => {
                const gen = genByUserId.get(m.userId);
                return (
                  <span
                    key={m.userId}
                    className="rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-700"
                  >
                    {gen != null ? `${gen}기 ${m.name}` : m.name}
                  </span>
                );
              })}
            </div>
          )}
        </section>

        {/* 3. 소감 */}
        <section className="py-8">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">
            3. 스터디 후 느낀 점
          </h3>
          <p className="text-sm leading-6 text-gray-700 whitespace-pre-wrap">
            {report.reflection || "내용이 없습니다."}
          </p>
        </section>

        {/* 4. 다음 주 계획 */}
        <section className="py-8">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">
            4. 다음 주 계획
          </h3>
          <p className="text-sm leading-6 text-gray-700 whitespace-pre-wrap">
            {report.nextPlan || "내용이 없습니다."}
          </p>
        </section>
      </div>
    </>
  );
}
