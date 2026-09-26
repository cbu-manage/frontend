"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import PostWriteForm from "@/components/board/PostWriteForm";
import { useFreeboardDetail } from "@/hooks/board";
import {
  freeboardApi,
  LABEL_TO_TOPIC,
  TOPIC_TO_LABEL,
  type FreeboardTopic,
} from "@/api";
import RequireMember from "@/components/auth/RequireMember";

function BoardWriteClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get("edit")
    ? Number(searchParams.get("edit"))
    : null;
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { postQuery } = useFreeboardDetail(editId ?? 0);
  const editPost = editId ? postQuery.data : null;

  const handleSubmit = async ({
    title,
    content,
    category,
    isAnonymous,
  }: {
    title: string;
    content: string;
    category: string | null;
    isAnonymous: boolean;
  }) => {
    setIsSubmitting(true);
    try {
      // 화면은 말머리를 한글 라벨로 다루고 서버는 enum 으로 받는다.
      const topic: FreeboardTopic | undefined = category
        ? LABEL_TO_TOPIC[category]
        : undefined;
      if (editId) {
        await freeboardApi.update(editId, {
          title,
          content,
          isAnonymous,
          ...(topic ? { topic } : {}),
        });
        router.push(`/board/${editId}`);
      } else {
        await freeboardApi.create({
          title,
          content,
          isAnonymous,
          ...(topic ? { topic } : {}),
        });
        router.push("/board");
      }
    } catch (e) {
      console.error(e);
      window.alert("저장 중 오류가 발생했습니다. 다시 시도해주세요.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (editId && postQuery.isLoading) {
    return (
      <main className="min-h-screen bg-white">
        <div className="container-x-lg pt-16 text-center text-sm text-gray-400">
          불러오는 중...
        </div>
      </main>
    );
  }

  if (editId && !postQuery.isLoading && !editPost) {
    return (
      <main className="min-h-screen bg-white">
        <div className="container-x-lg pt-16 text-center text-sm text-gray-500">
          게시글을 찾을 수 없습니다.
        </div>
      </main>
    );
  }

  return (
    <PostWriteForm
      boardName="자유게시판"
      heading={editId ? "자유게시판 글 수정" : "자유게시판 글쓰기"}
      subtitle="※ 익명·실명 모두 가능 · 부적절한 글은 다른 회원이 신고할 수 있어요"
      categories={["일상", "질문", "잡담", "홍보"]}
      showAnonymous
      showAttachments={false}
      backPath={editId ? `/board/${editId}` : "/board"}
      contentPlaceholder="자유롭게 이야기를 나눠보세요."
      initialValues={
        editPost
          ? {
              title: editPost.title ?? "",
              content: editPost.content ?? "",
              category: editPost.topic
                ? TOPIC_TO_LABEL[editPost.topic]
                : undefined,
              isAnonymous: editPost.isAnonymous ?? true,
            }
          : undefined
      }
      onSubmit={handleSubmit}
      isSubmitting={isSubmitting}
    />
  );
}

export default function BoardWritePage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-white">
          <div className="container-x-lg pt-16 text-center text-sm text-gray-400">
            불러오는 중...
          </div>
        </main>
      }
    >
      <RequireMember>
        <BoardWriteClient />
      </RequireMember>
    </Suspense>
  );
}
