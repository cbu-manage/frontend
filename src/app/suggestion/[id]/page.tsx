"use client";

import { useRouter, useParams } from "next/navigation";
import { useState } from "react";
import {
  ChevronLeft,
  Clock,
  Eye,
  MessageCircle,
  CheckCircle2,
  RotateCcw,
  Pin,
  PinOff,
} from "lucide-react";
import RequireMember from "@/components/auth/RequireMember";
import KebabMenu from "@/components/common/KebabMenu";
import { CommentItem } from "@/components/detail/CommentSection";
import CommentEmpty from "@/components/detail/CommentEmpty";
import ReportModal from "@/components/detail/ReportModal";
import {
  SuggestionStatusBadge,
  SuggestionTypeBadge,
} from "@/components/suggestion/SuggestionBadges";
import { useCan, useIsAuthor } from "@/hooks/auth";
import { useSuggestionDetail } from "@/hooks/suggestion";
import type { MappedSuggestionComment } from "@/hooks/suggestion";
import { useUserStore } from "@/store/userStore";
import { formatDate } from "@/lib/date";

function countComments(items: MappedSuggestionComment[]): number {
  return items.reduce((n, c) => n + 1 + countComments(c.replies), 0);
}

export default function SuggestionDetailPage() {
  const router = useRouter();
  const params = useParams();
  const postId = Number(params.id);
  const [comment, setComment] = useState("");

  const userId = useUserStore((s) => s.userId);
  const currentUserId = userId ? Number(userId) : null;
  const canManage = useCan("suggestions.manage");
  const canPin = useCan("suggestions.pin");

  const {
    postQuery,
    commentsQuery,
    createComment,
    replyComment,
    deleteComment,
    deletePost,
    updateStatus,
    updatePinned,
    flagPost,
    flagComment,
  } = useSuggestionDetail(postId);

  const post = postQuery.data;
  const comments = commentsQuery.data ?? [];
  const commentCount = countComments(comments);

  // 익명 글이라 authorId 가 없다. 서버가 계산한 isAuthor 만 쓴다(+ 관리자)
  const { canModify } = useIsAuthor(undefined, post?.isAuthor);

  const handleCommentSubmit = async () => {
    const trimmed = comment.trim();
    if (!trimmed || createComment.isPending) return;
    try {
      await createComment.mutateAsync(trimmed);
      setComment("");
    } catch {
      window.alert("댓글 등록에 실패했습니다. 다시 시도해주세요.");
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("이 건의를 삭제할까요?")) return;
    try {
      await deletePost.mutateAsync();
      router.push("/suggestion");
    } catch {
      window.alert("삭제에 실패했습니다. 다시 시도해주세요.");
    }
  };

  const handleToggleStatus = async () => {
    if (!post) return;
    const next = post.status === "RESOLVED" ? "OPEN" : "RESOLVED";
    const msg =
      next === "RESOLVED"
        ? "이 건의를 해결로 표시할까요?"
        : "이 건의를 다시 미해결로 되돌릴까요?";
    if (!window.confirm(msg)) return;
    try {
      await updateStatus.mutateAsync(next);
    } catch {
      window.alert("상태 변경에 실패했습니다. 다시 시도해주세요.");
    }
  };

  const handleTogglePin = async () => {
    if (!post) return;
    try {
      await updatePinned.mutateAsync(!post.isPinned);
    } catch {
      window.alert("고정 변경에 실패했습니다. 다시 시도해주세요.");
    }
  };

  const [reportTarget, setReportTarget] = useState<
    { type: "post" } | { type: "comment"; commentId: number } | null
  >(null);
  const handleFlag = () => setReportTarget({ type: "post" });
  const handleCommentFlag = (commentId: number) =>
    setReportTarget({ type: "comment", commentId });
  const handleReportSubmit = async (content: string) => {
    if (!reportTarget) return;
    try {
      if (reportTarget.type === "post") {
        await flagPost.mutateAsync(content);
      } else {
        await flagComment.mutateAsync({
          commentId: reportTarget.commentId,
          content,
        });
      }
      setReportTarget(null);
      window.alert("신고가 접수되었습니다.");
    } catch {
      window.alert("신고 접수에 실패했습니다. 다시 시도해주세요.");
    }
  };

  if (postQuery.isLoading) {
    return (
      <RequireMember>
        <main className="min-h-screen bg-white">
          <div className="container-x-lg pt-16 text-center text-sm text-gray-400">
            불러오는 중...
          </div>
        </main>
      </RequireMember>
    );
  }

  if (!post) {
    return (
      <RequireMember>
        <main className="min-h-screen bg-white">
          <div className="container-x-lg pt-16 text-center text-sm text-gray-500">
            게시글을 찾을 수 없습니다.
          </div>
        </main>
      </RequireMember>
    );
  }

  return (
    <RequireMember>
      <main className="min-h-screen pb-16 bg-white">
        <div className="container-x-lg">
          <div className="pt-6 lg:pt-12">
            {/* 상단 바 */}
            <div className="flex items-center justify-between mb-6">
              <button
                onClick={() => router.push("/suggestion")}
                className="inline-flex items-center gap-1 rounded-full border border-gray-200 px-5 py-2.5 text-sm text-gray-600 transition-colors hover:bg-gray-50"
              >
                <ChevronLeft size={16} /> 목록으로
              </button>
              <div className="flex items-center gap-2">
                {canPin && (
                  <button
                    type="button"
                    onClick={handleTogglePin}
                    disabled={updatePinned.isPending}
                    aria-pressed={!!post.isPinned}
                    className={`inline-flex items-center gap-1.5 rounded-full border px-4 py-2 text-sm font-semibold transition-colors disabled:opacity-50 ${
                      post.isPinned
                        ? "border-gray-900 bg-gray-900 text-white hover:bg-gray-800"
                        : "border-gray-200 text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    {post.isPinned ? (
                      <>
                        <PinOff size={16} /> 고정 해제
                      </>
                    ) : (
                      <>
                        <Pin size={16} /> 상단 고정
                      </>
                    )}
                  </button>
                )}
                {canManage && (
                  <button
                    type="button"
                    onClick={handleToggleStatus}
                    disabled={updateStatus.isPending}
                    className={`inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold transition-colors disabled:opacity-50 ${
                      post.status === "RESOLVED"
                        ? "border border-gray-200 text-gray-700 hover:bg-gray-50"
                        : "bg-brand text-white hover:opacity-90"
                    }`}
                  >
                    {post.status === "RESOLVED" ? (
                      <>
                        <RotateCcw size={16} /> 미해결로 되돌리기
                      </>
                    ) : (
                      <>
                        <CheckCircle2 size={16} /> 해결로 표시
                      </>
                    )}
                  </button>
                )}
                <KebabMenu
                  onEdit={
                    post.isAuthor
                      ? () => router.push(`/suggestion/write?edit=${postId}`)
                      : undefined
                  }
                  onDelete={canModify ? handleDelete : undefined}
                  onReport={!post.isAuthor ? handleFlag : undefined}
                />
              </div>
            </div>

            {/* 배지 / 제목 / 메타 */}
            <div className="flex items-center gap-2">
              <SuggestionTypeBadge type={post.type} />
              <SuggestionStatusBadge status={post.status} />
              {post.isPinned && (
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-gray-900">
                  <Pin size={12} className="fill-gray-900" /> 상단 고정
                </span>
              )}
              {post.status === "RESOLVED" && post.resolvedAt && (
                <span className="text-xs text-gray-400">
                  {formatDate(post.resolvedAt)} 해결
                </span>
              )}
            </div>
            <h1 className="mt-3 text-h1 text-gray-900">{post.title}</h1>
            <p className="mt-3 text-base text-gray-600">익명</p>
            <div className="mt-3 flex items-center gap-4 border-b border-gray-200 pb-6 text-sm text-gray-600">
              <span className="flex items-center gap-1">
                <Clock size={14} />{" "}
                {post.createdAt ? formatDate(post.createdAt) : ""}
              </span>
              <span className="flex items-center gap-1">
                <Eye size={14} /> {post.viewCount ?? 0}
              </span>
              <span className="flex items-center gap-1">
                <MessageCircle size={14} /> {commentCount}
              </span>
            </div>

            {/* 본문 */}
            <div className="whitespace-pre-wrap py-10 text-base leading-relaxed text-gray-900 border-b border-gray-200">
              {post.content}
            </div>

            {/* 댓글 목록 */}
            {commentsQuery.isLoading ? (
              <div className="py-10 text-center text-sm text-gray-400">
                댓글을 불러오는 중...
              </div>
            ) : comments.length === 0 ? (
              <CommentEmpty />
            ) : (
              <div>
                {comments.map((c) => (
                  <CommentItem
                    key={c.id}
                    {...c}
                    currentUserId={currentUserId}
                    onReplySubmit={(parentId, content) =>
                      replyComment.mutate({ commentId: parentId, content })
                    }
                    onDeleteComment={(id) => deleteComment.mutate(id)}
                    onReportComment={handleCommentFlag}
                  />
                ))}
              </div>
            )}

            {/* 댓글 입력 — 항상 익명 */}
            <div className="mt-6 rounded-2xl border border-gray-200 p-5">
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                maxLength={1000}
                rows={4}
                placeholder="익명으로 의견을 남겨 주세요."
                aria-label="댓글 입력"
                className="w-full resize-none text-sm text-gray-700 placeholder-gray-400 focus:outline-none"
              />
              <div className="mt-2 flex items-center justify-between">
                <span className="text-xs text-gray-400">
                  {comment.length} / 1,000
                </span>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-400">
                    익명으로 작성됩니다
                  </span>
                  <button
                    type="button"
                    onClick={handleCommentSubmit}
                    disabled={!comment.trim() || createComment.isPending}
                    className="rounded-full bg-gray-800 px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-gray-700 disabled:opacity-50"
                  >
                    {createComment.isPending ? "등록 중..." : "등록"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <ReportModal
          open={reportTarget !== null}
          onClose={() => setReportTarget(null)}
          target={reportTarget?.type ?? "post"}
          onSubmit={handleReportSubmit}
          isPending={flagPost.isPending || flagComment.isPending}
        />
      </main>
    </RequireMember>
  );
}
