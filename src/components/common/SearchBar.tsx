"use client";

import { Search } from "lucide-react";
import { cn } from "@/lib/utils";

type SearchBarProps = React.InputHTMLAttributes<HTMLInputElement> & {
  className?: string;
};

/**
 * 검색 입력 — 우측 검색 아이콘, 포커스 시 brand 테두리. (Figma: Component/search bar)
 * 목록 페이지 상단 검색에 사용.
 *
 * @example <SearchBar value={q} onChange={(e) => setQ(e.target.value)} />
 */
export default function SearchBar({
  className,
  placeholder = "제목 · 내용으로 검색해주세요.",
  ...props
}: SearchBarProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-3",
        "transition-colors focus-within:border-brand focus-within:ring-1 focus-within:ring-brand",
        className,
      )}
    >
      <input
        type="search"
        placeholder={placeholder}
        className="flex-1 bg-transparent text-sm text-gray-900 outline-none placeholder:text-gray-500"
        {...props}
      />
      <Search className="size-5 shrink-0 text-gray-500" aria-hidden />
    </div>
  );
}
