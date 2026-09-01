"use client";

import { useRouter } from "next/navigation";
import { useFeeInfo, useRecruitmentInfo } from "@/hooks/apply";

/** 2026-09-15 → 2026.09.15 */
function formatDot(iso: string): string {
  const [y, m, d] = iso.split("-");
  return y && m && d ? `${y}.${m}.${d}` : iso;
}

export default function ApplyFeePage() {
  // 기수 표기는 진행 중인 모집을 따른다 (없으면 빈 문자열 → 문구에서 자연히 빠짐)
  const { generationLabel } = useRecruitmentInfo();
  // 계좌·금액·마감일은 운영진이 등록한 값을 그대로 보여준다
  const { feeInfo, isLoading } = useFeeInfo();
  const router = useRouter();

  const accountRows = feeInfo
    ? [
        { label: "은행", value: feeInfo.bankName },
        { label: "계좌 번호", value: feeInfo.accountNumber },
        { label: "예금주", value: feeInfo.accountHolder },
        { label: "입금자명", value: "본인 이름" },
      ]
    : [];

  const handleComplete = () => {
    router.push("/apply/pending");
  };

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4 py-16">
      <div className="w-full max-w-[420px] bg-white rounded-xl shadow-sm px-8 py-10 flex flex-col gap-6">
        <div className="text-center space-y-2">
          <h1 className="text-h1 text-gray-900">회비 납부 안내</h1>
          <p className="text-body-sm text-gray-500">
            씨부엉 {generationLabel && `${generationLabel} `}활동을 시작하려면
            회비를 납부해주세요.
            <br />
            납부 확인 후 운영진이 활동을 승인합니다.
          </p>
        </div>

        <div className="rounded-xl border border-gray-200 px-5 py-4 flex flex-col gap-1.5">
          <span className="text-caption text-brand font-semibold">
            납부 금액
          </span>
          {isLoading ? (
            <p className="text-body-sm text-gray-500">불러오는 중...</p>
          ) : feeInfo ? (
            <>
              <p className="text-h1 text-gray-900">
                {feeInfo.feeAmount.toLocaleString()}원
              </p>
              <p className="text-body-sm text-gray-500">
                휴학생·졸업생은 {feeInfo.discountAmount.toLocaleString()}원
              </p>
            </>
          ) : (
            <p className="text-body-sm text-gray-500">
              회비 안내가 아직 등록되지 않았어요. 운영진에게 문의해주세요.
            </p>
          )}
        </div>

        <div className="flex flex-col gap-3">
          <h2 className="text-h3 text-gray-900">계좌 정보</h2>
          <div className="w-full h-px bg-gray-200" />
          {accountRows.length > 0 ? (
            <dl className="flex flex-col gap-3">
              {accountRows.map(({ label, value }) => (
                <div key={label} className="flex gap-4">
                  <dt className="text-body-sm text-gray-500 w-20 shrink-0">
                    {label}
                  </dt>
                  <dd className="text-body-sm text-gray-900">{value}</dd>
                </div>
              ))}
            </dl>
          ) : (
            <p className="text-body-sm text-gray-500">
              {isLoading ? "불러오는 중..." : "등록된 계좌 정보가 없어요."}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-3">
          <h2 className="text-h3 text-gray-900">납부 마감</h2>
          <div className="w-full h-px bg-gray-200" />
          <p className="text-body-sm text-brand font-semibold">
            {feeInfo?.paymentDeadline
              ? formatDot(feeInfo.paymentDeadline)
              : "미정"}{" "}
            23:59 <span className="font-normal text-gray-900">까지</span>
          </p>
          <p className="text-body-sm text-gray-500">
            미납 시 합격이 자동 취소될 수 있습니다.
          </p>
        </div>

        <button
          type="button"
          onClick={handleComplete}
          className="w-full h-12 rounded-xl bg-brand text-white font-semibold hover:opacity-90 transition-opacity"
        >
          납부 완료 — 승인 대기로 이동
        </button>
      </div>
    </main>
  );
}
