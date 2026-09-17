"use client";

import { useState } from "react";
import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import Tabs from "@/components/common/Tabs";
import Modal from "@/components/common/Modal";
import Mascot from "@/components/common/Mascot";
import Pagination from "@/components/shared/Pagination";
import {
  useFlagPostList,
  useFlagPostDetail,
  useResolvePostFlags,
  useFlagCommentList,
  useFlagCommentDetail,
  useResolveCommentFlags,
} from "@/hooks/flag";
import { formatDate } from "@/lib/date";

type FlagTab = "post" | "comment";

const TAB_ITEMS: { label: string; value: FlagTab }[] = [
  { label: "게시글 신고", value: "post" },
  { label: "댓글 신고", value: "comment" },
];

/** "{기수}기 {이름}" — 기수 없으면 이름만 */
function personLabel(name?: string, generation?: number | null) {
  if (!name) return "-";
  return generation != null ? `${generation}기 ${name}` : name;
}

/**
 * PostCategory value → 상세 라우트. 상세 경로가 postId 를 쓰는 게시판만.
 * 자료방(6)은 상세 페이지가 없고, 소식(11)은 라우트 id 가 news id 라 post id 로 못 간다.
 */
const CATEGORY_PATH: Record<number, string> = {
  1: "/study",
  2: "/project",
  5: "/coding-test",
  7: "/report",
  8: "/board",
};

function postHref(category: number | undefined, postId: number) {
  if (category == null) return null;
  const base = CATEGORY_PATH[category];
  return base ? `${base}/${postId}` : null;
}

function toPageList(totalPages: number) {
  return Array.from({ length: Math.max(totalPages, 1) }, (_, i) => i + 1);
}

/**
 * 신고 관리 — 게시글/댓글 신고 목록·상세·처리 완료.
 * 노출: capability `flag.manage`(ADMIN·회장·부회장). 서버 @PreAuthorize 가 최종 판정.
 * 상세에서는 익명 글이어도 작성자 실명이 온다(서버가 Post.authorId 로 직접 조회).
 */
export default function FlagManageSection() {
  const [tab, setTab] = useState<FlagTab>("post");
  const [postPage, setPostPage] = useState(1);
  const [commentPage, setCommentPage] = useState(1);

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-h1 text-gray-900 mb-2">신고 관리</h1>
      <p className="text-body-sm text-gray-700 mb-6">
        부원이 신고한 게시글·댓글을 확인하고 처리해요. 처리 완료하면 같은 대상에
        걸린 신고가 모두 목록에서 사라져요.
      </p>

      <Tabs
        items={TAB_ITEMS}
        value={tab}
        onValueChange={(v) => setTab(v as FlagTab)}
        className="mb-6"
      />

      {tab === "post" ? (
        <PostFlagTable page={postPage} onPageChange={setPostPage} />
      ) : (
        <CommentFlagTable page={commentPage} onPageChange={setCommentPage} />
      )}
    </div>
  );
}

/* ───────────────────── 공통 상태 표시 ───────────────────── */

function ListStatus({
  isLoading,
  isError,
  isEmpty,
  emptyText,
}: {
  isLoading: boolean;
  isError: boolean;
  isEmpty: boolean;
  emptyText: string;
}) {
  if (isLoading)
    return (
      <div className="py-12 text-center text-gray-500">
        신고 목록을 불러오는 중...
      </div>
    );
  if (isError)
    return (
      <div className="py-12 text-center text-red-500">
        신고 목록을 불러오지 못했습니다.
      </div>
    );
  if (isEmpty)
    return (
      <div className="flex flex-col items-center py-20 text-center">
        <div className="flex size-28 items-center justify-center rounded-full bg-gray-100">
          <Mascot emotion="working" size="md" decorative />
        </div>
        <p className="mt-5 text-lg font-bold text-gray-800">{emptyText}</p>
      </div>
    );
  return null;
}

function Th({ children }: { children: React.ReactNode }) {
  return (
    <th className="p-3 text-center font-medium text-gray-700">{children}</th>
  );
}

function DetailRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1 sm:flex-row sm:gap-4">
      <span className="w-24 shrink-0 text-body-sm font-semibold text-gray-500">
        {label}
      </span>
      <div className="min-w-0 flex-1 text-gray-900 break-words">{children}</div>
    </div>
  );
}

/* ───────────────────── 게시글 신고 ───────────────────── */

function PostFlagTable({
  page,
  onPageChange,
}: {
  page: number;
  onPageChange: (p: number) => void;
}) {
  const { data, isLoading, isError } = useFlagPostList(page);
  const [openId, setOpenId] = useState<number | null>(null);
  const detail = useFlagPostDetail(openId);
  const resolve = useResolvePostFlags();

  const items = data?.items ?? [];

  const handleResolve = async () => {
    const target = detail.data;
    if (!target) return;
    if (
      !window.confirm(
        `「${target.targetPostTitle}」에 걸린 신고를 모두 처리 완료로 바꿉니다.\n게시글 자체는 삭제되지 않습니다. 계속할까요?`,
      )
    )
      return;
    // 먼저 닫아야 처리 뒤 목록 갱신 때 지워진 신고 상세를 다시 조회하지 않는다
    setOpenId(null);
    try {
      await resolve.mutateAsync(target.targetPostId);
    } catch {
      window.alert("처리 중 오류가 발생했습니다. 다시 시도해주세요.");
    }
  };

  return (
    <>
      <ListStatus
        isLoading={isLoading}
        isError={isError}
        isEmpty={!isLoading && !isError && items.length === 0}
        emptyText="처리할 게시글 신고가 없습니다."
      />

      {!isLoading && !isError && items.length > 0 && (
        <>
          <div className="overflow-x-auto rounded-lg border">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <Th>신고일</Th>
                  <Th>신고된 게시글</Th>
                  <Th>신고 사유</Th>
                  <Th>신고자</Th>
                  <Th>관리</Th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {items.map((f) => (
                  <tr
                    key={f.flagPostId}
                    className="hover:bg-gray-50/50 transition-colors"
                  >
                    <td className="p-3 text-center text-gray-500 whitespace-nowrap">
                      {formatDate(f.createdAt)}
                    </td>
                    <td className="p-3 text-left font-medium max-w-[240px] truncate">
                      {f.targetPostTitle}
                    </td>
                    <td className="p-3 text-left text-gray-600 max-w-[280px] truncate">
                      {f.content}
                    </td>
                    <td className="p-3 text-center text-gray-600 whitespace-nowrap">
                      {personLabel(f.authorName, f.authorGeneration)}
                    </td>
                    <td className="p-3 text-center">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setOpenId(f.flagPostId)}
                      >
                        상세 보기
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <Pagination
            currentPage={page}
            totalPages={toPageList(data?.totalPages ?? 1)}
            onPageChange={onPageChange}
            className="mt-6"
          />
        </>
      )}

      <Modal
        open={openId !== null}
        onClose={() => setOpenId(null)}
        title="게시글 신고 상세"
        className="w-full max-w-2xl"
        footer={
          <Button
            type="button"
            variant="brand"
            className="w-full"
            disabled={!detail.data || resolve.isPending}
            onClick={handleResolve}
          >
            {resolve.isPending ? "처리 중..." : "처리 완료"}
          </Button>
        }
      >
        {detail.isLoading && (
          <p className="py-8 text-center text-gray-500">불러오는 중...</p>
        )}
        {detail.isError && (
          <p className="py-8 text-center text-red-500">
            신고 상세를 불러오지 못했습니다.
          </p>
        )}
        {detail.data && (
          <div className="flex flex-col gap-4">
            <DetailRow label="신고일">
              {formatDate(detail.data.createdAt, "yyyy.MM.dd HH:mm")}
            </DetailRow>
            <DetailRow label="신고자">
              {personLabel(
                detail.data.authorName,
                detail.data.authorGeneration,
              )}
            </DetailRow>
            <DetailRow label="신고 사유">
              <p className="whitespace-pre-wrap">{detail.data.content}</p>
            </DetailRow>
            <hr className="border-gray-100" />
            <DetailRow label="게시글 작성자">
              {personLabel(
                detail.data.targetUserName,
                detail.data.targetUserGeneration,
              )}
            </DetailRow>
            <DetailRow label="게시글 제목">
              <div className="flex flex-wrap items-center gap-3">
                <p className="font-semibold">{detail.data.targetPostTitle}</p>
                {(() => {
                  // 구 서버(카테고리 미제공)면 링크 영역을 아예 비운다
                  if (detail.data.targetPostCategory == null) return null;
                  const href = postHref(
                    detail.data.targetPostCategory,
                    detail.data.targetPostId,
                  );
                  if (href)
                    return (
                      <Link
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-body-sm font-medium text-brand hover:underline"
                      >
                        원문 보기 <ExternalLink size={14} />
                      </Link>
                    );
                  return (
                    <span className="text-xs text-gray-400">
                      원문 링크 미지원 게시판
                    </span>
                  );
                })()}
              </div>
            </DetailRow>
            <DetailRow label="게시글 본문">
              <div className="max-h-64 overflow-y-auto rounded-lg bg-gray-50 p-3 whitespace-pre-wrap text-body-sm">
                {detail.data.targetPostContent}
              </div>
            </DetailRow>
          </div>
        )}
      </Modal>
    </>
  );
}

/* ───────────────────── 댓글 신고 ───────────────────── */

function CommentFlagTable({
  page,
  onPageChange,
}: {
  page: number;
  onPageChange: (p: number) => void;
}) {
  const { data, isLoading, isError } = useFlagCommentList(page);
  const [openId, setOpenId] = useState<number | null>(null);
  const detail = useFlagCommentDetail(openId);
  const resolve = useResolveCommentFlags();

  const items = data?.items ?? [];

  const handleResolve = async () => {
    const target = detail.data;
    if (!target) return;
    if (
      !window.confirm(
        "이 댓글에 걸린 신고를 모두 처리 완료로 바꿉니다.\n댓글 자체는 삭제되지 않습니다. 계속할까요?",
      )
    )
      return;
    setOpenId(null);
    try {
      await resolve.mutateAsync(target.targetCommentId);
    } catch {
      window.alert("처리 중 오류가 발생했습니다. 다시 시도해주세요.");
    }
  };

  return (
    <>
      <ListStatus
        isLoading={isLoading}
        isError={isError}
        isEmpty={!isLoading && !isError && items.length === 0}
        emptyText="처리할 댓글 신고가 없습니다."
      />

      {!isLoading && !isError && items.length > 0 && (
        <>
          <div className="overflow-x-auto rounded-lg border">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <Th>신고일</Th>
                  <Th>신고된 댓글</Th>
                  <Th>신고 사유</Th>
                  <Th>신고자</Th>
                  <Th>관리</Th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {items.map((f) => (
                  <tr
                    key={f.flagCommentId}
                    className="hover:bg-gray-50/50 transition-colors"
                  >
                    <td className="p-3 text-center text-gray-500 whitespace-nowrap">
                      {formatDate(f.createdAt)}
                    </td>
                    <td className="p-3 text-left font-medium max-w-[240px] truncate">
                      {f.targetCommentContent}
                    </td>
                    <td className="p-3 text-left text-gray-600 max-w-[280px] truncate">
                      {f.content}
                    </td>
                    <td className="p-3 text-center text-gray-600 whitespace-nowrap">
                      {personLabel(f.authorName, f.authorGeneration)}
                    </td>
                    <td className="p-3 text-center">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setOpenId(f.flagCommentId)}
                      >
                        상세 보기
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <Pagination
            currentPage={page}
            totalPages={toPageList(data?.totalPages ?? 1)}
            onPageChange={onPageChange}
            className="mt-6"
          />
        </>
      )}

      <Modal
        open={openId !== null}
        onClose={() => setOpenId(null)}
        title="댓글 신고 상세"
        className="w-full max-w-2xl"
        footer={
          <Button
            type="button"
            variant="brand"
            className="w-full"
            disabled={!detail.data || resolve.isPending}
            onClick={handleResolve}
          >
            {resolve.isPending ? "처리 중..." : "처리 완료"}
          </Button>
        }
      >
        {detail.isLoading && (
          <p className="py-8 text-center text-gray-500">불러오는 중...</p>
        )}
        {detail.isError && (
          <p className="py-8 text-center text-red-500">
            신고 상세를 불러오지 못했습니다.
          </p>
        )}
        {detail.data && (
          <div className="flex flex-col gap-4">
            <DetailRow label="신고일">
              {formatDate(detail.data.createdAt, "yyyy.MM.dd HH:mm")}
            </DetailRow>
            <DetailRow label="신고자">
              {personLabel(
                detail.data.authorName,
                detail.data.authorGeneration,
              )}
            </DetailRow>
            <DetailRow label="신고 사유">
              <p className="whitespace-pre-wrap">{detail.data.content}</p>
            </DetailRow>
            <hr className="border-gray-100" />
            <DetailRow label="댓글 작성자">
              {personLabel(
                detail.data.targetUserName,
                detail.data.targetUserGeneration,
              )}
            </DetailRow>
            <DetailRow label="댓글 내용">
              <div className="max-h-64 overflow-y-auto rounded-lg bg-gray-50 p-3 whitespace-pre-wrap text-body-sm">
                {detail.data.targetCommentContent}
              </div>
            </DetailRow>
          </div>
        )}
      </Modal>
    </>
  );
}
