"use client";

import { type GroupDetailData } from "@/api";

interface GroupRejectedBannerProps {
  group: GroupDetailData;
  /** 다시 심사 요청 — 모집을 마감해 재심사 대기로 보낸다 */
  onResubmit: () => void;
  /** 작성 화면으로 이동해 내용을 고친 뒤 다시 신청 */
  onEdit: () => void;
  isSubmitting?: boolean;
}

/**
 * 팀장에게만 보이는 반려 안내.
 *
 * 반려되면 서버가 모집을 다시 열어(OPEN) 인원을 더 받을 수 있게 한다.
 * 다시 마감하면 RESUBMITTED가 되어 운영진 재심사로 넘어간다.
 */
export default function GroupRejectedBanner({
  group,
  onResubmit,
  onEdit,
  isSubmitting = false,
}: GroupRejectedBannerProps) {
  return (
    <section
      aria-label="개설 반려 안내"
      className="rounded-xl border border-notice bg-gray-0 px-5 py-4 space-y-3"
    >
      <div className="flex flex-wrap items-center gap-2">
        <span className="inline-block rounded-full bg-notice px-2.5 py-0.5 text-caption font-semibold text-gray-0">
          반려됨
        </span>
        <p className="text-body-sm font-semibold text-gray-900">
          운영진이 이 팀의 개설을 반려했어요.
        </p>
      </div>

      {group.rejectReason && (
        <p className="text-body-sm text-gray-900">
          <span className="text-gray-500">사유 · </span>
          {group.rejectReason}
        </p>
      )}

      <p className="text-caption text-gray-500">
        현재 인원 {group.activeMemberCount}/{group.maxMembers}명 · 지금은 다시
        모집 중이라 팀원을 더 받을 수 있어요. 준비되면 다시 신청해주세요.
      </p>

      <div className="flex flex-wrap gap-2 pt-1">
        <button
          type="button"
          onClick={onResubmit}
          disabled={isSubmitting}
          className="rounded-lg bg-brand px-4 py-2 text-body-sm font-semibold text-gray-0 hover:opacity-90 disabled:opacity-50 transition-opacity"
        >
          {isSubmitting ? "신청 중..." : "다시 신청"}
        </button>
        <button
          type="button"
          onClick={onEdit}
          disabled={isSubmitting}
          className="rounded-lg border border-gray-200 px-4 py-2 text-body-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-colors"
        >
          수정하고 다시 신청
        </button>
      </div>
    </section>
  );
}
