"use client";

import { useRouter } from "next/navigation";
import { RECRUIT_GENERATION } from "../constants";

const ACCOUNT_INFO = [
  { label: "은행", value: "카카오 뱅크" },
  { label: "계좌 번호", value: "회비 납부 — 15,000원 (휴학·졸업생 5,000원)" },
  { label: "입금자명", value: "본인 이름" },
];

export default function ApplyFeePage() {
  const router = useRouter();

  const handleComplete = () => {
    router.push("/apply/pending");
  };

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4 py-16">
      <div className="w-full max-w-[420px] bg-white rounded-xl shadow-sm px-8 py-10 flex flex-col gap-6">
        <div className="text-center space-y-2">
          <h1 className="text-h1 text-gray-900">회비 납부 안내</h1>
          <p className="text-body-sm text-gray-500">
            씨부엉 {RECRUIT_GENERATION} 활동을 시작하려면 회비를 납부해주세요.
            <br />
            납부 확인 후 운영진이 활동을 승인합니다.
          </p>
        </div>

        <div className="rounded-xl border border-gray-200 px-5 py-4 flex flex-col gap-1.5">
          <span className="text-caption text-brand font-semibold">납부 금액</span>
          <p className="text-h1 text-gray-900">15,000원</p>
          <p className="text-body-sm text-gray-500">휴학생·졸업생은 5,000원</p>
        </div>

        <div className="flex flex-col gap-3">
          <h2 className="text-h3 text-gray-900">계좌 정보</h2>
          <div className="w-full h-px bg-gray-200" />
          <dl className="flex flex-col gap-3">
            {ACCOUNT_INFO.map(({ label, value }) => (
              <div key={label} className="flex gap-4">
                <dt className="text-body-sm text-gray-500 w-20 shrink-0">{label}</dt>
                <dd className="text-body-sm text-gray-900">{value}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="flex flex-col gap-3">
          <h2 className="text-h3 text-gray-900">납부 마감</h2>
          <div className="w-full h-px bg-gray-200" />
          <p className="text-body-sm text-brand font-semibold">
            2026.03.25 (수) 23:59 <span className="font-normal text-gray-900">까지</span>
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
