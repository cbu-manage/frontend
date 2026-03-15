"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { resourcesApi } from "@/api";
import RequireMember from "@/components/auth/RequireMember";
import InputBox from "@/components/common/InputBox";
import LongBtn from "@/components/common/LongBtn";

export default function ArchiveWritePage() {
  const [title, setTitle] = useState("");
  const [link, setLink] = useState("");
  const [ogLoading, setOgLoading] = useState(false);

  const router = useRouter();
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: async () => {
      await resourcesApi.create({
        link: link.trim(),
        ...(title.trim() ? { title: title.trim() } : {}),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["resources"] });
      router.push("/archive");
    },
  });

  const fetchOgPreview = useCallback(async (url: string) => {
    if (!url.trim() || !/^https?:\/\//.test(url.trim())) return;
    setOgLoading(true);
    try {
      const res = await resourcesApi.getOgPreview(url.trim());
      const data = res.data?.data;
      if (data?.ogTitle) {
        setTitle((prev) => (prev.trim() ? prev : data.ogTitle ?? ""));
      }
    } catch {
      // 파싱 실패 시 무시
    } finally {
      setOgLoading(false);
    }
  }, []);

  const handleLinkBlur = () => {
    if (link.trim()) fetchOgPreview(link.trim());
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!link.trim()) return;
    createMutation.mutate();
  };

  return (
    <RequireMember>
    <main className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="w-full max-w-4xl bg-white rounded-4xl px-18 py-12">
        {/* 헤더 */}
        <div className="text-center mb-14 flex-1 justify-center">
          <h1 className="text-xl font-semibold text-gray-900">
            자료방 글 작성
          </h1>
        </div>

        {/* 폼 */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* 링크 (필수, 입력 후 blur 시 OG로 제목 자동 완성) */}
          <div>
            <InputBox
              insetLabel="링크"
              placeholder="https://..."
              value={link}
              onChange={(e) => setLink(e.target.value)}
              onBlur={handleLinkBlur}
              required
              className="h-16"
            />
            {ogLoading && (
              <p className="text-xs text-gray-500 mt-1">제목 불러오는 중...</p>
            )}
          </div>

          {/* 제목 (선택, 생략 시 OG 파싱으로 자동 설정) */}
          <div>
            <InputBox
              insetLabel="제목 (선택)"
              placeholder="제목을 입력하세요 (비워두면 링크에서 자동 추출)"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="h-16"
            />
          </div>

          {/* 버튼 */}
          <div className="pt-6">
            <LongBtn type="submit">게시하기</LongBtn>
          </div>
        </form>
      </div>
    </main>
    </RequireMember>
  );
}
