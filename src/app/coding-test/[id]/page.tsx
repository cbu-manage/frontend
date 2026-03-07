"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import DetailTemplate from "@/components/detail/DetailTemplate";
import Image from "next/image";
import { CommentInput, CommentItem } from "@/components/detail/CommentSection";
import { useUserStore } from "@/store/userStore";
import RequireMember from "@/components/auth/RequireMember";
import { codingTestApi } from "@/api";
import { useCodingTestMetaStore } from "@/store/codingTestMetaStore";
import { useCodingTestMeta } from "@/hooks/coding-test/useCodingTestMeta";
import { useProblemComments, type NormalizedComment } from "@/hooks/coding-test/useProblemComments";

function findCommentById(list: NormalizedComment[], id: number): NormalizedComment | null {
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
    return new Date(iso).toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).replace(/\. /g, ". ");
  } catch {
    return iso;
  }
}

export default function CodingTestDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = typeof params.id === "string" ? Number(params.id) : Number(params.id?.[0]);
  const name = useUserStore((s) => s.name);
  const isMember = !!name;

  useCodingTestMeta();
  const platforms = useCodingTestMetaStore((s) => s.platforms);
  const languages = useCodingTestMetaStore((s) => s.languages);
  const categories = useCodingTestMetaStore((s) => s.categories);

  const queryClient = useQueryClient();
  const [mainCommentValue, setMainCommentValue] = useState("");
  const [activeReplyId, setActiveReplyId] = useState<number | null>(null);

  const {
    comments,
    isLoading: commentsLoading,
    createComment,
    replyComment,
    updateComment,
    deleteComment,
    isCreating,
  } = useProblemComments(id);

  const { data: res, isLoading, isError } = useQuery({
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

  const raw = res?.data as { data?: Record<string, unknown> } | Record<string, unknown> | undefined;
  const detail = (raw && typeof raw === "object" && "data" in raw ? (raw as { data?: Record<string, unknown> }).data : raw) as {
    postId?: number;
    title?: string;
    content?: string;
    problemStatus?: string;
    authorName?: string;
    authorGeneration?: number;
    viewCount?: number;
    createdAt?: string;
    categoryIds?: number[];
    platformId?: number;
    languageId?: number;
    problemUrl?: string;
    isAuthor?: boolean;
    [key: string]: unknown;
  } | null | undefined;

  const authorDisplay = detail?.authorName
    ? detail.authorGeneration != null
      ? `${detail.authorGeneration}기 ${detail.authorName}`
      : detail.authorName
    : "익명";

  const categoryNames = (detail?.categoryIds ?? [])
    .map((cid) => categories.find((c) => c.id === cid)?.name)
    .filter(Boolean) as string[];

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
          infoLabel="문제 정보"
          categories={categoryNames.length > 0 ? categoryNames : ["-"]}
          content={detail.content ?? ""}
          showCommentsCount={isMember}
          commentsCount={comments.length}
          onEdit={
            detail.isAuthor
              ? () => {
                  const payload = {
                    id: String(params.id),
                    postId: detail.postId,
                    title: detail.title,
                    categories: categoryNames,
                    categoryIds: detail.categoryIds,
                    platformId: detail.platformId,
                    languageId: detail.languageId,
                    solveStatus: detail.problemStatus === "SOLVED" ? "solved" : "unsolved",
                    content: detail.content,
                    problemUrl: detail.problemUrl,
                  };
                  sessionStorage.setItem("editPost_codingtest", JSON.stringify(payload));
                  router.push(`/coding-test/write?id=${params.id}`);
                }
              : undefined
          }
          onDelete={
            detail.isAuthor
              ? () => {
                  if (window.confirm("이 문제 글을 삭제할까요?")) deleteMutation.mutate();
                }
              : undefined
          }
          comments={
            isMember ? (
              <div className="space-y-12">
                <CommentInput
                  value={mainCommentValue}
                  onChange={setMainCommentValue}
                  onSubmit={async (content) => {
                    await createComment(content);
                    setMainCommentValue("");
                  }}
                  disabled={isCreating}
                />
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
                        content={c.content}
                        date={c.date}
                        replies={c.replies}
                        activeReplyId={activeReplyId}
                        onReplyClick={setActiveReplyId}
                        onReplySubmit={replyComment}
                        onEditComment={async (commentId) => {
                          const comment = findCommentById(comments, commentId);
                          const current = comment?.content ?? "";
                          const newContent = window.prompt("수정할 내용을 입력하세요.", current);
                          if (newContent != null && newContent.trim()) await updateComment(commentId, newContent.trim());
                        }}
                        onDeleteComment={async (commentId) => {
                          if (window.confirm("이 댓글을 삭제할까요?")) await deleteComment(commentId);
                        }}
                        deleted={c.deleted}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-20">
                    <Image src="/assets/sadowl.svg" alt="댓글 없음" width={120} height={120} className="mb-6" />
                    <p className="text-[20px] font-semibold text-[#3E434A] leading-[160%] text-center">
                      첫 번째 댓글을 남겨주세요!
                    </p>
                  </div>
                )}
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
