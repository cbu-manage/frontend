"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import DetailTemplate from "@/components/detail/DetailTemplate";
import Image from "next/image";
import { CommentInput, CommentItem } from "@/components/detail/CommentSection";
import { useUserStore } from "@/store/userStore";
import { useAuthStore } from "@/store/authStore";
import RequireMember from "@/components/auth/RequireMember";
import { codingTestApi } from "@/api";
import { useCodingTestMeta } from "@/hooks/coding-test/useCodingTestMeta";
import {
  useProblemComments,
  type NormalizedComment,
} from "@/hooks/coding-test/useProblemComments";

function findCommentById(
  list: NormalizedComment[],
  id: number,
): NormalizedComment | null {
  for (const c of list) {
    if (c.id === id) return c;
    const found = findCommentById(c.replies, id);
    if (found) return found;
  }
  return null;
}

function formatDate(iso?: string): string {
  if (!iso) return "";
  try {
    return new Date(iso)
      .toLocaleDateString("ko-KR", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      })
      .replace(/\. /g, ". ");
  } catch {
    return iso;
  }
}

export default function CodingTestDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id =
    typeof params.id === "string" ? Number(params.id) : Number(params.id?.[0]);
  const name = useUserStore((s) => s.name);
  const isMember = !!name;

  const accessToken = useAuthStore((s) => s.accessToken);
  const currentUserId = (() => {
    if (!accessToken) return null;
    try {
      const payload = JSON.parse(atob(accessToken.split(".")[1]));
      return (payload.user_id as number) ?? null;
    } catch {
      return null;
    }
  })();

  useCodingTestMeta();

  const queryClient = useQueryClient();
  const [mainCommentValue, setMainCommentValue] = useState("");

  const {
    comments,
    isLoading: commentsLoading,
    createComment,
    replyComment,
    updateComment,
    deleteComment,
    isCreating,
  } = useProblemComments(id);

  const {
    data: res,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["codingTest", "detail", id],
    queryFn: () => codingTestApi.getById(id),
    enabled: !!id && !Number.isNaN(id),
  });

  const deleteMutation = useMutation({
    mutationFn: () => codingTestApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["codingTest", "list"] });
      router.push("/coding-test");
    },
  });

  const raw = res?.data as
    | { data?: Record<string, unknown> }
    | Record<string, unknown>
    | undefined;
  const detail = (
    raw && typeof raw === "object" && "data" in raw
      ? (raw as { data?: Record<string, unknown> }).data
      : raw
  ) as
    | {
        problemId?: number;
        title?: string;
        content?: string;
        problemStatus?: string;
        authorName?: string;
        authorGeneration?: number;
        viewCount?: number;
        commentCount?: number;
        createdAt?: string;
        updatedAt?: string;
        categories?: string[];
        platformName?: string;
        languageName?: string;
        grade?: string;
        problemUrl?: string;
        isAuthor?: boolean;
        [key: string]: unknown;
      }
    | null
    | undefined;

  const authorDisplay = detail?.authorName
    ? detail.authorGeneration != null
      ? `${detail.authorGeneration}기 ${detail.authorName}`
      : detail.authorName
    : "익명";

  const categoryNames = detail?.categories ?? [];
  const statusKey = detail?.problemStatus === "SOLVED" ? "solved" : "unsolved";

  if (isLoading) {
    return (
      <RequireMember>
        <main className="min-h-screen bg-white flex items-center justify-center">
          <p className="text-gray-500">로딩 중...</p>
        </main>
      </RequireMember>
    );
  }

  if (isError || !detail) {
    return (
      <RequireMember>
        <main className="min-h-screen bg-white flex items-center justify-center">
          <p className="text-red-500">문제를 불러올 수 없습니다.</p>
        </main>
      </RequireMember>
    );
  }

  return (
    <RequireMember>
      <main className="min-h-screen bg-white">
        <DetailTemplate
          backPath="/coding-test"
          hasSidebar={false}
          isMarkdown={true}
          title={detail.title ?? ""}
          status={statusKey}
          author={authorDisplay}
          date={formatDate(detail.createdAt)}
          views={detail.viewCount ?? 0}
          infoContentOverride={
            <div className="flex flex-col gap-3 bg-gray-50 rounded-[20px] px-5 py-5">
              {/* 문제 URL (한 줄 전체) */}
              {detail.problemUrl && (
                <div className="flex items-center gap-6 bg-gray-0 rounded-full px-6 py-2 w-full min-h-[56px]">
                  <span className="text-[16px] font-semibold text-[#54585E] shrink-0 min-w-[5em]">
                    문제 URL
                  </span>
                  <div className="w-[2px] h-5 bg-gray-300" />
                  <a
                    href={detail.problemUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[16px] text-brand underline break-all"
                  >
                    {detail.problemUrl}
                  </a>
                </div>
              )}

              {/* 플랫폼 / 언어 + 문제 정보: 같은 줄, 세로 크기 통일 */}
              <div className="flex flex-col md:flex-row gap-3">
                {/* 플랫폼 / 언어 */}
                <div className="flex items-center gap-6 bg-gray-0 rounded-full px-6 py-2 w-full md:flex-1 min-h-[56px]">
                  <span className="text-[16px] font-semibold text-[#54585E] shrink-0 min-w-[5em]">
                    플랫폼 / 언어
                  </span>
                  <div className="w-[2px] h-5 bg-gray-300" />
                  <span className="text-[16px] text-[#3E434A]">
                    {detail.platformName ?? "-"} · {detail.languageName ?? "-"}
                  </span>
                </div>

                {/* 문제 정보 (카테고리 태그) */}
                <div className="flex items-center gap-6 bg-gray-0 rounded-full px-6 py-2 w-full md:flex-1 min-h-[56px]">
                  <span className="text-[16px] font-semibold text-[#54585E] shrink-0 min-w-[5em]">
                    문제 정보
                  </span>
                  <div className="w-[2px] h-5 bg-gray-300" />
                  <div className="flex flex-wrap gap-2">
                    {(categoryNames.length > 0 ? categoryNames : ["-"]).map(
                      (cat) => (
                        <span
                          key={cat}
                          className="inline-flex items-center px-4 py-2 bg-gray-100 text-[#3E434A] rounded-full text-[14px] font-medium font-['Inter']"
                        >
                          {cat}
                        </span>
                      ),
                    )}
                  </div>
                </div>
              </div>
            </div>
          }
          infoLabel="문제 정보"
          categories={categoryNames.length > 0 ? categoryNames : ["-"]}
          content={detail.content ?? ""}
          showCommentsCount={isMember}
          commentsCount={detail.commentCount ?? comments.length}
          onEdit={
            detail.isAuthor
              ? () => {
                  const payload = {
                    id: String(params.id),
                    problemId: detail.problemId,
                    title: detail.title,
                    categories: categoryNames,
                    platformName: detail.platformName,
                    languageName: detail.languageName,
                    grade: detail.grade,
                    solveStatus:
                      detail.problemStatus === "SOLVED" ? "solved" : "unsolved",
                    content: detail.content,
                    problemUrl: detail.problemUrl,
                  };
                  sessionStorage.setItem(
                    "editPost_codingtest",
                    JSON.stringify(payload),
                  );
                  router.push(`/coding-test/write?id=${params.id}`);
                }
              : undefined
          }
          onDelete={
            detail.isAuthor
              ? () => {
                  if (window.confirm("이 문제 글을 삭제할까요?"))
                    deleteMutation.mutate();
                }
              : undefined
          }
          comments={
            isMember ? (
              <div className="space-y-12">
                {commentsLoading ? (
                  <div className="flex justify-center py-12">
                    <p className="text-gray-500">댓글 로딩 중...</p>
                  </div>
                ) : comments.length > 0 ? (
                  <div className="flex flex-col">
                    {comments.map((c) => (
                      <CommentItem
                        key={c.id}
                        id={c.id}
                        author={c.author}
                        authorName={c.authorName}
                        userId={c.userId}
                        content={c.content}
                        date={c.date}
                        replies={c.replies}
                        onReplySubmit={replyComment}
                        onEditComment={async (commentId) => {
                          const comment = findCommentById(comments, commentId);
                          const current = comment?.content ?? "";
                          const newContent = window.prompt(
                            "수정할 내용을 입력하세요.",
                            current,
                          );
                          if (newContent != null && newContent.trim())
                            await updateComment(commentId, newContent.trim());
                        }}
                        onDeleteComment={async (commentId) => {
                          if (window.confirm("이 댓글을 삭제할까요?"))
                            await deleteComment(commentId);
                        }}
                        deleted={c.deleted}
                        currentUserId={currentUserId}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-20">
                    <Image
                      src="/assets/sadowl.svg"
                      alt="댓글 없음"
                      width={120}
                      height={120}
                      className="mb-6"
                    />
                    <p className="text-[20px] font-semibold text-[#3E434A] leading-[160%] text-center">
                      첫 번째 댓글을 남겨주세요!
                    </p>
                  </div>
                )}
                <CommentInput
                  value={mainCommentValue}
                  onChange={setMainCommentValue}
                  onSubmit={async (content) => {
                    await createComment(content);
                    setMainCommentValue("");
                  }}
                  disabled={isCreating}
                />
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-16">
                <p className="text-[20px] font-semibold text-[#3E434A] leading-[160%] text-center">
                  댓글을 보려면 로그인해주세요!
                </p>
              </div>
            )
          }
        />
      </main>
    </RequireMember>
  );
}
