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
        const mapped = category ? CATEGORY_MAP[category] : "NOTICE";
        await mutateAsync({ title, content, category: mapped });
        router.push("/notice");
      }}
    />
  );
}
