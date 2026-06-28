"use client";

import { useRouter, useParams } from "next/navigation";
import { useState } from "react";
import { ChevronLeft, Clock, Eye, MessageCircle } from "lucide-react";
import RequireMember from "@/components/auth/RequireMember";
import KebabMenu from "@/components/common/KebabMenu";
import { CommentItem } from "@/components/detail/CommentSection";
import CommentEmpty from "@/components/detail/CommentEmpty";
import { useIsAuthor } from "@/hooks/auth";
import { useFreeboardDetail } from "@/hooks/board";
import { useUserStore } from "@/store/userStore";
import { formatDate } from "@/lib/date";

export default function BoardDetailPage() {
  const router = useRouter();
  const params = useParams();
  const postId = Number(params.id);
  const [comment, setComment] = useState("");
  const [anonymous, setAnonymous] = useState(true);

  const userId = useUserStore((s) => s.userId);
  const currentUserId = userId ? Number(userId) : null;

  const { postQuery, commentsQuery, createComment, replyComment, deleteComment, deletePost, flagPost, flagComment } =
    useFreeboardDetail(postId);

  const post = postQuery.data;
  const comments = commentsQuery.data ?? [];
  const commentCount = comments.reduce((n, c) => n + 1 + c.replies.length, 0);

  const { canModify } = useIsAuthor(post?.authorId, post?.isAuthor);

  const handleCommentSubmit = async () => {
    const trimmed = comment.trim();
    if (!trimmed || createComment.isPending) return;
    await createComment.mutateAsync(trimmed);
    setComment("");
  };

  const handleDelete = async () => {
    if (!window.confirm("이 글을 삭제할까요?")) return;
    await deletePost.mutateAsync();
    router.push("/board");
  };

  const handleFlag = async () => {
    const reason = window.prompt("신고 사유를 입력해주세요.");
    if (!reason?.trim()) return;
    await flagPost.mutateAsync(reason.trim());
    window.alert("신고가 접수되었습니다.");
  };

  const handleCommentFlag = async (commentId: number) => {
    const reason = window.prompt("댓글 신고 사유를 입력해주세요.");
    if (!reason?.trim()) return;
    await flagComment.mutateAsync({ commentId, content: reason.trim() });
    window.alert("신고가 접수되었습니다.");
  };

  if (postQuery.isLoading) {
    return (
      <RequireMember>
        <main className="min-h-screen bg-white">
          <div className="container-x-lg pt-16 text-center text-sm text-gray-400">불러오는 중...</div>
        </main>
      </RequireMember>
    );
  }

  if (!post) {
    return (
      <RequireMember>
        <main className="min-h-screen bg-white">
          <div className="container-x-lg pt-16 text-center text-sm text-gray-500">게시글을 찾을 수 없습니다.</div>
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
                onClick={() => router.push("/board")}
                className="inline-flex items-center gap-1 rounded-full border border-gray-200 px-5 py-2.5 text-sm text-gray-600 transition-colors hover:bg-gray-50"
              >
                <ChevronLeft size={16} /> 목록으로
              </button>
              <KebabMenu
                onEdit={canModify ? () => router.push(`/board/write?edit=${postId}`) : undefined}
                onDelete={canModify ? handleDelete : undefined}
                onReport={!canModify ? handleFlag : undefined}
              />
            </div>

            {/* 제목 / 작성자 / 메타 */}
            <h1 className="mt-4 text-h1 text-gray-900">{post.title}</h1>
            <p className="mt-3 text-base text-gray-600">
              {post.isAnonymous ? "익명" : (post.authorName ?? "")}
            </p>
            <div className="mt-3 flex items-center gap-4 border-b border-gray-200 pb-6 text-sm text-gray-600">
              <span className="flex items-center gap-1">
                <Clock size={14} /> {post.createdAt ? formatDate(post.createdAt as string) : ""}
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
            {comments.length === 0 ? (
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

            {/* 댓글 입력 */}
            <div className="mt-6 rounded-2xl border border-gray-200 p-5">
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                maxLength={1000}
                rows={4}
                placeholder="씨부엉 회원들과 함께 이야기를 나눠보세요!"
                aria-label="댓글 입력"
                className="w-full resize-none text-sm text-gray-700 placeholder-gray-400 focus:outline-none"
              />
              <div className="mt-2 flex items-center justify-between">
                <span className="text-xs text-gray-400">{comment.length} / 1,000</span>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setAnonymous((v) => !v)}
                    aria-pressed={anonymous}
                    className={`flex items-center gap-1.5 text-sm transition-colors ${
                      anonymous ? "text-gray-800" : "text-gray-400 hover:text-gray-600"
                    }`}
                  >
                    <span
                      className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors ${
                        anonymous ? "border-gray-800 bg-gray-800" : "border-gray-300"
                      }`}
                    >
                      {anonymous && (
                        <svg width="10" height="8" viewBox="0 0 10 8" fill="none" aria-hidden="true">
                          <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                    </span>
                    익명으로 작성
                  </button>
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
      </main>
    </RequireMember>
  );
}
