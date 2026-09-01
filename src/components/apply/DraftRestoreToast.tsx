"use client";

import { formatDistanceToNow } from "date-fns";
import { ko } from "date-fns/locale";

interface DraftRestoreToastProps {
  /** 임시저장 시각 (epoch ms) */
  savedAt: number;
  onRestore: () => void;
  onDiscard: () => void;
}

/**
 * 작성하다 만 신청서가 남아 있을 때 띄우는 안내.
 * 자동으로 채우지 않고 물어보는 이유 — 공용 PC에서 남의 입력이 그대로 뜨면 곤란하다.
 */
export default function DraftRestoreToast({
  savedAt,
  onRestore,
  onDiscard,
}: DraftRestoreToastProps) {
  const when = formatDistanceToNow(new Date(savedAt), {
    addSuffix: true,
    locale: ko,
  });

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed inset-x-0 bottom-8 z-50 flex justify-center px-4"
    >
      <div className="flex w-full max-w-xl flex-wrap items-center justify-between gap-x-6 gap-y-3 rounded-3xl border border-gray-200 bg-gray-0 px-7 py-5 shadow-lg">
        <div className="min-w-0">
          <p className="text-body-sm font-semibold text-gray-900">
            작성하던 신청서가 있어요.
          </p>
          <p className="mt-0.5 text-caption text-gray-500">
            {when} 저장된 내용이에요. 이메일 인증은 다시 받아야 해요.
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={onDiscard}
            className="rounded-lg border border-gray-200 px-4 py-2 text-body-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
          >
            새로 쓰기
          </button>
          <button
            type="button"
            onClick={onRestore}
            className="rounded-lg bg-brand px-4 py-2 text-body-sm font-semibold text-gray-0 transition-opacity hover:opacity-90"
          >
            이어서 쓰기
          </button>
        </div>
      </div>
    </div>
  );
}
