"use client";

import { useRouter } from "next/navigation";
import PostWriteForm from "@/components/board/PostWriteForm";
import { useNewsCreate } from "@/hooks/news/useNewsMutation";

export default function NewsWritePage() {
  const router = useRouter();
  const { mutateAsync, isPending } = useNewsCreate();

  return (
    <PostWriteForm
      boardName="뉴스레터"
      heading="글 작성"
      categories={["주간", "특집", "공지"]}
      staffOnly
      backPath="/news"
      isSubmitting={isPending}
      onSubmit={async ({ title, content }) => {
        await mutateAsync({ title, content, category: "NEWSLETTER" });
        router.push("/news");
      }}
    />
  );
}
