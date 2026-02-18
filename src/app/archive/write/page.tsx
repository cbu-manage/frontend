"use client";

import { useState } from "react";
import InputBox from "@/components/common/InputBox";
import LongBtn from "@/components/common/LongBtn";

export default function ArchiveWritePage() {
  const [title, setTitle] = useState("");
  const [link, setLink] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // 나중에 API 호출
    console.log({ title, link });
  };

  return (
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
          {/* 제목 */}
          <div>
            <InputBox
              insetLabel="제목"
              placeholder="제목을 입력하세요"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="h-16"
            />
          </div>

          {/* 링크 */}
          <div>
            <InputBox
              insetLabel="링크"
              placeholder="링크를 입력하세요"
              value={link}
              onChange={(e) => setLink(e.target.value)}
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
  );
}
