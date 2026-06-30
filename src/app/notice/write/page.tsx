"use client";

import { useRouter } from "next/navigation";
import PostWriteForm from "@/components/board/PostWriteForm";
import { useNewsCreate } from "@/hooks/news/useNewsMutation";
import type { NewsCategory } from "@/api";

const CATEGORY_MAP: Record<string, NewsCategory> = {
  공지: "NOTICE",
  이벤트: "EVENT",
  IT소식: "IT_NEWS",
};

export default function NoticeWritePage() {
  const router = useRouter();
  const { mutateAsync, isPending } = useNewsCreate();

  return (
    <PostWriteForm
      boardName="씨부엉 소식"
      heading="글 작성"
      categories={["공지", "이벤트", "IT소식"]}
      categoryMaxLength={{ 공지: 20000 }}
      staffOnly
      backPath="/notice"
      isSubmitting={isPending}
      onSubmit={async ({ title, content, category }) => {
        if (!category) {
          window.alert("분류를 선택해주세요.");
          return;
        }
        try {
          await mutateAsync({ title, content, category: CATEGORY_MAP[category] });
          router.push("/notice");
        } catch {
          window.alert("저장에 실패했습니다. 다시 시도해주세요.");
        }
      }}
    />
  );
}
