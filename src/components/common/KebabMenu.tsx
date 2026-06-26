"use client";

import { useState, useRef, useEffect } from "react";
import { MoreVertical, Pencil, Trash2, Siren } from "lucide-react";
import { cn } from "@/lib/utils";

type KebabMenuProps = {
  onEdit?: () => void;
  onDelete?: () => void;
  onReport?: () => void;
  /** 트리거 버튼 클래스 (기본: 40px 원형) */
  className?: string;
};

/**
 * 세로 점 3개(⋮) 메뉴 — 누르면 수정/삭제/신고 드롭다운. 바깥 클릭 시 닫힘.
 * 상세 페이지 글·댓글 공통 액션 메뉴. 전달된 핸들러가 있는 항목만 표시.
 * (DetailTemplate·CommentSection의 인라인 메뉴와 동일 스타일)
 */
export default function KebabMenu({
  onEdit,
  onDelete,
  onReport,
  className,
}: KebabMenuProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handle = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, [open]);

  if (!onEdit && !onDelete && !onReport) return null;

  const hasDivider = !!onEdit && (!!onDelete || !!onReport);

  return (
    <div className="relative shrink-0" ref={ref}>
      <button
        type="button"
        aria-label="더보기"
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "flex h-10 w-10 items-center justify-center rounded-full text-gray-400 transition-colors hover:bg-gray-50",
          className,
        )}
      >
        <MoreVertical size={20} />
      </button>
      {open && (
        <div className="absolute right-0 top-full z-50 mt-1 min-w-[160px] rounded-xl border border-gray-200 bg-white py-1 shadow-lg">
          {onEdit && (
            <button
              type="button"
              onClick={() => {
                onEdit();
                setOpen(false);
              }}
              className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              <Pencil size={18} className="shrink-0 text-gray-500" />
              수정
            </button>
          )}
          {hasDivider && <div className="my-1 border-t border-gray-100" />}
          {onDelete && (
            <button
              type="button"
              onClick={() => {
                onDelete();
                setOpen(false);
              }}
              className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm font-medium text-red-600 hover:bg-red-50"
            >
              <Trash2 size={18} className="shrink-0" />
              삭제
            </button>
          )}
          {onReport && (
            <button
              type="button"
              onClick={() => {
                onReport();
                setOpen(false);
              }}
              className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              <Siren size={18} className="shrink-0 text-gray-500" />
              신고
            </button>
          )}
        </div>
      )}
    </div>
  );
}
