"use client";

import { X } from "lucide-react";
import { useEffect, type ReactNode } from "react";
import { cn } from "@/lib/utils";

type ModalProps = {
  open: boolean;
  onClose: () => void;
  /** 헤더 제목 (선택) */
  title?: ReactNode;
  children: ReactNode;
  /** 하단 버튼 영역 (선택) */
  footer?: ReactNode;
  /** 모달 박스 추가 클래스 (너비/패딩 조정 등) */
  className?: string;
};

/**
 * 공통 모달 래퍼 — 오버레이 + 닫기(X·배경클릭·ESC) + 본문 스크롤 잠금 + 제목/푸터 슬롯.
 * 산재된 모달(ApplicantsModal·SignupCompleteModal 등)을 이걸로 수렴. (Figma: Component/팝)
 *
 * @example
 *   <Modal open={open} onClose={() => setOpen(false)} title="제출 확인"
 *     footer={<Button variant="brand" className="w-full">확인</Button>}>
 *     <p>내용</p>
 *   </Modal>
 */
export default function Modal({
  open,
  onClose,
  title,
  children,
  footer,
  className,
}: ModalProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}
      role="presentation"
    >
      <div
        role="dialog"
        aria-modal="true"
        className={cn(
          "relative w-full max-w-xl rounded-3xl bg-white p-8 shadow-lg",
          className,
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="닫기"
          className="absolute right-5 top-5 rounded-full p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700"
        >
          <X className="size-5" />
        </button>

        {title && (
          <h2 className="mb-3 text-xl font-semibold text-gray-900">{title}</h2>
        )}

        <div>{children}</div>

        {footer && <div className="mt-6">{footer}</div>}
      </div>
    </div>
  );
}
