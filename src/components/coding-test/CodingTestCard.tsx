"use client";

import { useRouter } from "next/navigation";
import { MessageCircle } from "lucide-react";
import type { SolveStatus } from "./CodingTestRow";
import { StatusBadge } from "@/components/common/StatusBadge";

interface CodingTestCardProps {
  id: number;
  status: SolveStatus;
  title: string;
  language: string;
  platform: string;
  author?: string;
  comments?: number;
}

/** 모바일/태블릿용 코딩테스트 카드 (데스크탑은 CodingTestRow 테이블 사용) */
export function CodingTestCard({
  id,
  status,
  title,
  language,
  platform,
  author,
  comments = 0,
}: CodingTestCardProps) {
  const router = useRouter();
  const isSolved = status === "해결";

  const handleClick = () => {
    const valid = id != null && !Number.isNaN(Number(id)) && Number(id) > 0;
    if (valid) router.push(`/coding-test/${id}`);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className="w-full text-left bg-white border border-gray-200 rounded-2xl p-4 active:bg-gray-50 transition-colors"
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <StatusBadge
            tone={isSolved ? "success" : "danger"}
            className="px-2.5 py-1 text-caption font-medium"
          >
            {status}
          </StatusBadge>
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-caption font-medium bg-gray-100 text-gray-700">
            {platform}
          </span>
        </div>
        <span className="flex items-center gap-1 text-caption text-gray-400">
          <MessageCircle size={14} />
          {comments}
        </span>
      </div>

      <h3 className="text-h3 font-semibold text-gray-900 line-clamp-2 mb-2">
        {title}
      </h3>

      <div className="flex items-center gap-2 text-body-sm text-gray-500">
        <span className="font-medium text-gray-700">{language}</span>
        {author && (
          <>
            <span className="text-gray-300">·</span>
            <span>{author}</span>
          </>
        )}
      </div>
    </button>
  );
}
