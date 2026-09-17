"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import PostWriteForm from "@/components/board/PostWriteForm";
import RequireMember from "@/components/auth/RequireMember";
import { SUGGESTION_TYPE_OPTIONS } from "@/components/suggestion/SuggestionBadges";
import { useSuggestionDetail, SUGGESTIONS_QUERY_KEY } from "@/hooks/suggestion";
import { suggestionApi, type SuggestionType } from "@/api";

const TYPE_LABELS = SUGGESTION_TYPE_OPTIONS.map((o) => o.label);

function labelToType(label: string | null): SuggestionType | null {
  return SUGGESTION_TYPE_OPTIONS.find((o) => o.label === label)?.value ?? null;
}
function typeToLabel(type: SuggestionType | undefined): string | undefined {
  return SUGGESTION_TYPE_OPTIONS.find((o) => o.value === type)?.label;
}

function SuggestionWriteClient() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const searchParams = useSearchParams();
  const editId = searchParams.get("edit")
    ? Number(searchParams.get("edit"))
    : null;
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { postQuery } = useSuggestionDetail(editId ?? 0);
  const editPost = editId ? postQuery.data : null;

  const handleSubmit = async ({
    title,
    content,
    category,
  }: {
    title: string;
    content: string;
    category: string | null;
    isAnonymous: boolean;
  }) => {
    const type = labelToType(category);
    if (!type) {
      window.alert("버그 리포트인지 기능 건의인지 분류를 선택해 주세요.");
      return;
    }
    setIsSubmitting(true);
    try {
      if (editId) {
        await suggestionApi.update(editId, { title, content, type });
        await queryClient.invalidateQueries({
          queryKey: SUGGESTIONS_QUERY_KEY,
        });
        router.push(`/suggestion/${editId}`);
      } else {
        await suggestionApi.create({ title, content, type });
        await queryClient.invalidateQueries({
          queryKey: SUGGESTIONS_QUERY_KEY,
        });
        router.push("/suggestion");
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
      boardName="건의방"
      heading={editId ? "건의 수정" : "건의 남기기"}
      subtitle="※ 글과 댓글은 모두 익명으로 올라가요 · 운영진이 확인 후 해결/미해결로 표시해요"
      categories={TYPE_LABELS}
      backPath={editId ? `/suggestion/${editId}` : "/suggestion"}
      contentPlaceholder="어떤 화면에서 무엇이 불편했는지, 어떻게 되면 좋을지 적어 주세요."
      initialValues={
        editPost
          ? {
              title: editPost.title ?? "",
              content: editPost.content ?? "",
              category: typeToLabel(editPost.type),
            }
          : undefined
      }
      onSubmit={handleSubmit}
      isSubmitting={isSubmitting}
    />
  );
}

export default function SuggestionWritePage() {
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
        <SuggestionWriteClient />
      </RequireMember>
    </Suspense>
  );
}
