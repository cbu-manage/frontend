"use client";

import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import PostWriteForm from "@/components/board/PostWriteForm";
import { useNewsCreate, useNewsUpdate } from "@/hooks/news/useNewsMutation";
import { newsApi, type NewsCategory } from "@/api";

/** BE 소식 첨부 허용 목록(NewsController.addAttachment)과 동일. 파일당 20MB */
const ATTACHMENT_ACCEPT =
  ".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.hwp,.hwpx,.txt,.csv,.zip,image/*";
const ATTACHMENT_HINT =
  "이미지·PDF·문서(doc/ppt/xls/hwp/txt/csv)·zip, 파일당 20MB";

/**
 * 게시글 저장 뒤 첨부를 하나씩 올린다. 일부만 실패하면 어떤 파일이 안 올라갔는지 알려주고 계속 진행한다.
 * 글은 이미 저장된 상태라 실패한 파일은 상세에서 다시 올릴 수 있다.
 */
async function uploadAttachments(newsId: number, files: File[]) {
  const failed: string[] = [];
  for (const file of files) {
    try {
      await newsApi.addAttachment(newsId, file);
    } catch {
      failed.push(file.name);
    }
  }
  if (failed.length > 0) {
    window.alert(
      `글은 저장됐지만 첨부 ${failed.length}개를 올리지 못했어요.\n${failed.join("\n")}`,
    );
  }
}

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
  const editId = searchParams.get("edit")
    ? Number(searchParams.get("edit"))
    : null;

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
        <div className="container-x-lg pt-16 text-center text-sm text-gray-400">
          불러오는 중...
        </div>
      </main>
    );
  }

  if (editId && postQuery.isError) {
    return (
      <main className="min-h-screen bg-white">
        <div className="container-x-lg pt-16 text-center text-sm text-gray-500">
          게시글을 불러오지 못했습니다.
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
      boardName="씨부엉 소식"
      heading={editId ? "글 수정" : "글 작성"}
      categories={["공지", "이벤트", "IT소식"]}
      categoryMaxLength={{ 공지: 20000 }}
      staffOnly
      backPath={editId ? `/notice/${editId}` : "/notice"}
      initialValues={
        editPost
          ? {
              title: editPost.title,
              content: editPost.content,
              category: CATEGORY_LABEL[editPost.category],
            }
          : undefined
      }
      isSubmitting={isCreating || isUpdating}
      attachmentAccept={ATTACHMENT_ACCEPT}
      attachmentHint={ATTACHMENT_HINT}
      onSubmit={async ({ title, content, category, files }) => {
        if (!category) {
          window.alert("분류를 선택해주세요.");
          return;
        }
        try {
          if (editId) {
            await updateNews({
              id: editId,
              data: { title, content, category: CATEGORY_MAP[category] },
            });
            await uploadAttachments(editId, files);
            router.push(`/notice/${editId}`);
          } else {
            const created = await createNews({
              title,
              content,
              category: CATEGORY_MAP[category],
            });
            const newsId = created.data.data?.newsId;
            if (newsId) await uploadAttachments(newsId, files);
            router.push(newsId ? `/notice/${newsId}` : "/notice");
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
          <div className="container-x-lg pt-16 text-center text-sm text-gray-400">
            불러오는 중...
          </div>
        </main>
      }
    >
      <NoticeWriteClient />
    </Suspense>
  );
}
