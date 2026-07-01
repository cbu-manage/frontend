"use client";

import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import PostWriteForm from "@/components/board/PostWriteForm";
import { useNewsCreate, useNewsUpdate } from "@/hooks/news/useNewsMutation";
import { newsApi, type NewsCategory } from "@/api";

const CATEGORY_MAP: Record<string, NewsCategory> = {
  공지: "NOTICE",
  이벤트: "EVENT",
  IT소식: "IT_NEWS",
};

const CATEGORY_LABEL: Record<string, string> = {
  NOTICE: "공지",
  EVENT: "이벤트",
  IT_NEWS: "IT소식",
};

function NoticeWriteClient() {
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

  if (editId && postQuery.isError) {
    return (
      <main className="min-h-screen bg-white">
        <div className="container-x-lg pt-16 text-center text-sm text-gray-500">게시글을 불러오지 못했습니다.</div>
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
      boardName="씨부엉 소식"
      heading={editId ? "글 수정" : "글 작성"}
      categories={["공지", "이벤트", "IT소식"]}
      categoryMaxLength={{ 공지: 20000 }}
      staffOnly
      backPath={editId ? `/notice/${editId}` : "/notice"}
      initialValues={
        editPost
          ? { title: editPost.title, content: editPost.content, category: CATEGORY_LABEL[editPost.category] }
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
            await updateNews({ id: editId, data: { title, content, category: CATEGORY_MAP[category] } });
            router.push(`/notice/${editId}`);
          } else {
            await createNews({ title, content, category: CATEGORY_MAP[category] });
            router.push("/notice");
          }
        } catch {
          window.alert("저장에 실패했습니다. 다시 시도해주세요.");
        }
      }}
    />
  );
}

export default function NoticeWritePage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-white">
          <div className="container-x-lg pt-16 text-center text-sm text-gray-400">불러오는 중...</div>
        </main>
      }
    >
      <NoticeWriteClient />
    </Suspense>
  );
}
