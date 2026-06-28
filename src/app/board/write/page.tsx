"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import PostWriteForm from "@/components/board/PostWriteForm";
import { freeboardApi } from "@/api";

export default function BoardWritePage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async ({
    title,
    content,
    isAnonymous,
  }: {
    title: string;
    content: string;
    category: string | null;
    isAnonymous: boolean;
  }) => {
    setIsSubmitting(true);
    try {
      await freeboardApi.create({ title, content, isAnonymous });
      router.push("/board");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <PostWriteForm
      boardName="자유게시판"
      heading="자유게시판 글쓰기"
      subtitle="※ 익명·실명 모두 가능 · 부적절한 글은 다른 회원이 신고할 수 있어요"
      categories={["일상", "질문", "잡담", "홍보"]}
      showAnonymous
      backPath="/board"
      contentPlaceholder="자유롭게 이야기를 나눠보세요."
      onSubmit={handleSubmit}
      isSubmitting={isSubmitting}
    />
  );
}
