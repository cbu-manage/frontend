"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import InputBox from "@/components/common/InputBox";
import LongBtn from "@/components/common/LongBtn";

const WRITE_CONFIG = {
  project: {
    title: "프로젝트 모집",
    backPath: "/project",
  },
  study: {
    title: "스터디 모집",
    backPath: "/study",
  },
} as const;

type WriteType = keyof typeof WRITE_CONFIG;

export default function WritePage() {
  const params = useParams();
  const router = useRouter();
  const type = params.type as string;
  const config = WRITE_CONFIG[type as WriteType];

  const [title, setTitle] = useState("");
  const [link, setLink] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // 나중에 API 호출 - type에 따라 다른 엔드포인트
    console.log({ type, title, link });
  };

  if (!config) {
    router.replace("/");
    return null;
  }

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="w-full max-w-4xl bg-white rounded-4xl p-18 mx-4">
        <div className="text-center mb-14">
          <h1 className="text-xl font-semibold text-gray-900">
            {config.title}
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl mx-auto">
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

          <div>
            <InputBox
              insetLabel="링크"
              placeholder="링크를 입력하세요"
              value={link}
              onChange={(e) => setLink(e.target.value)}
              className="h-16"
            />
          </div>

          <div className="pt-2">
            <LongBtn type="submit">게시하기</LongBtn>
          </div>
        </form>

        <div className="mt-8 flex justify-center">
          <Link href={config.backPath}>
            <button
              type="button"
              className="px-6 py-2 text-gray-600 hover:text-gray-900 text-sm"
            >
              목록으로
            </button>
          </Link>
        </div>
      </div>
    </main>
  );
}
