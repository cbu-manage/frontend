"use client";

import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import PostWriteForm from "@/components/board/PostWriteForm";
import { useNewsCreate, useNewsUpdate } from "@/hooks/news/useNewsMutation";
import { newsApi, type NewsletterType } from "@/api";

const TYPE_MAP: Record<string, NewsletterType> = {
  주간: "WEEKLY",
  특집: "SPECIAL",
  공지: "NOTICE",
};

const TYPE_LABEL: Record<string, string> = {
  WEEKLY: "주간",
  SPECIAL: "특집",
  NOTICE: "공지",
};

function NewsWriteClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get("edit") ? Number(searchParams.get("edit")) : null;

  const { mutateAsync: createNews, isPending: isCreating } = useNewsCreate();
  const { mutateAsync: updateNews, isPending: isUpdating } = useNewsUpdate();

  const postQuery = useQuery({
    queryKey: ["news", editId],
    queryFn: async () => {
      const res = await newsApi.getById(editId!);
      return res.data.data;
    },
    enabled: !!editId,
  });

  const editPost = editId ? postQuery.data : null;

  if (editId && postQuery.isLoading) {
    return (
      <main className="min-h-screen bg-white">
        <div className="container-x-lg pt-16 text-center text-sm text-gray-400">불러오는 중...</div>
      </main>
    );
  }

  if (editId && !postQuery.isLoading && !editPost) {
    return (
      <main className="min-h-screen bg-white">
        <div className="container-x-lg pt-16 text-center text-sm text-gray-500">게시글을 찾을 수 없습니다.</div>
      </main>
    );
  }

  return (
    <PostWriteForm
      boardName="뉴스레터"
      heading={editId ? "글 수정" : "글 작성"}
      categories={["주간", "특집", "공지"]}
      staffOnly
      backPath={editId ? `/news/${editId}` : "/news"}
      initialValues={
        editPost
          ? {
              title: editPost.title,
              content: editPost.content,
              category: editPost.newsletterType ? TYPE_LABEL[editPost.newsletterType] : undefined,
            }
          : undefined
      }
      isSubmitting={isCreating || isUpdating}
      onSubmit={async ({ title, content, category }) => {
        if (!category) {
          window.alert("분류를 선택해주세요.");
          return;
        }
        try {
          if (editId) {
            await updateNews({
              id: editId,
              data: { title, content, category: "NEWSLETTER", newsletterType: TYPE_MAP[category] },
            });
            router.push(`/news/${editId}`);
          } else {
            await createNews({
              title,
              content,
              category: "NEWSLETTER",
              newsletterType: TYPE_MAP[category],
            });
            router.push("/news");
          }
        } catch {
          window.alert("저장에 실패했습니다. 다시 시도해주세요.");
        }
      }}
    />
  );
}

export default function NewsWritePage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-white">
          <div className="container-x-lg pt-16 text-center text-sm text-gray-400">불러오는 중...</div>
        </main>
      }
    >
      <NewsWriteClient />
    </Suspense>
  );
}
