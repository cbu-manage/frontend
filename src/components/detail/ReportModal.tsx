"use client";

import { useState } from "react";
import Modal from "@/components/common/Modal";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const REPORT_REASONS = [
  "욕설·비방·혐오 표현",
  "스팸·광고·홍보",
  "음란물·불쾌한 콘텐츠",
  "개인정보 노출",
  "기타",
] as const;
export type ReportReason = (typeof REPORT_REASONS)[number];

/** BE FlagPostCreateRequest.content 가 500자 제한 — 사유 라벨 몫을 빼고 상세는 300자 */
const DETAIL_MAX = 300;

export type ReportModalProps = {
  open: boolean;
  onClose: () => void;
  /** 제목·문구 분기용 */
  target: "post" | "comment";
  /** 서버로 보낼 최종 사유 문자열. 실패 처리는 호출부 몫 */
  onSubmit: (content: string) => void | Promise<void>;
  isPending?: boolean;
};

/**
 * 신고 사유 선택 모달 — 사유 목록에서 하나 고르고, 필요하면 상세를 적는다. "기타"는 상세 필수.
 * 서버 content 는 `"{사유}"` 또는 `"{사유} / {상세}"` 한 줄로 합쳐 보낸다(BE 스키마 변경 없음).
 * window.prompt 를 대체한다(게시글·댓글 공용).
 */
export default function ReportModal(props: ReportModalProps) {
  // 닫히면 폼을 언마운트해 입력이 비워진다. 열린 채 실패하면(호출부가 onClose 를 안 부름) 입력이 남는다.
  if (!props.open) return null;
  return <ReportModalBody {...props} />;
}

function ReportModalBody({
  open,
  onClose,
  target,
  onSubmit,
  isPending = false,
}: ReportModalProps) {
  const [reason, setReason] = useState<ReportReason | null>(null);
  const [detail, setDetail] = useState("");

  const isOther = reason === "기타";
  const canSubmit =
    !!reason && (!isOther || detail.trim().length > 0) && !isPending;

  const handleSubmit = async () => {
    if (!reason) return;
    const trimmed = detail.trim();
    const content = trimmed ? `${reason} / ${trimmed}` : reason;
    // 성공 여부는 호출부가 판단한다. 성공이면 호출부가 닫고, 닫히면 이 폼이 언마운트돼 입력이 비워진다.
    await onSubmit(content);
  };

  const label = target === "post" ? "게시글" : "댓글";

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`${label} 신고`}
      className="w-full max-w-md"
      footer={
        <Button
          type="button"
          variant="brand"
          className="w-full"
          disabled={!canSubmit}
          onClick={handleSubmit}
        >
          {isPending ? "접수 중..." : "신고하기"}
        </Button>
      }
    >
      <p className="mb-4 text-body-sm text-gray-600">
        신고 사유를 선택해 주세요. 운영진이 확인한 뒤 처리해요.
      </p>

      <div
        role="radiogroup"
        aria-label="신고 사유"
        className="flex flex-col gap-2"
      >
        {REPORT_REASONS.map((r) => {
          const selected = reason === r;
          return (
            <label
              key={r}
              className={cn(
                "flex cursor-pointer items-center gap-3 rounded-lg border px-4 py-3 text-sm transition-colors",
                selected
                  ? "border-brand bg-brand/5 text-gray-900"
                  : "border-gray-200 text-gray-700 hover:bg-gray-50",
              )}
            >
              <input
                type="radio"
                name="report-reason"
                value={r}
                checked={selected}
                onChange={() => setReason(r)}
                className="accent-brand"
              />
              {r}
            </label>
          );
        })}
      </div>

      <div className="mt-4">
        <label
          htmlFor="report-detail"
          className="mb-1 block text-body-sm font-semibold text-gray-700"
        >
          상세 내용{isOther ? " (필수)" : " (선택)"}
        </label>
        <textarea
          id="report-detail"
          value={detail}
          onChange={(e) => setDetail(e.target.value.slice(0, DETAIL_MAX))}
          rows={3}
          placeholder={
            isOther
              ? "어떤 점이 문제인지 적어 주세요."
              : "운영진이 판단할 때 참고할 내용이 있으면 적어 주세요."
          }
          className="w-full resize-none rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 placeholder-gray-400 focus:border-brand focus:outline-none"
        />
        <p className="mt-1 text-right text-xs text-gray-400">
          {detail.length} / {DETAIL_MAX}
        </p>
      </div>
    </Modal>
  );
}
