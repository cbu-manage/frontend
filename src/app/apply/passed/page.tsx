"use client";

import Image from "next/image";
import Link from "next/link";
import { useFeeInfo, useRecruitmentInfo } from "@/hooks/apply";

export default function ApplyPassedPage() {
  // 기수 표기는 진행 중인 모집을 따른다 (없으면 빈 문자열 → 문구에서 자연히 빠짐)
  const { generationLabel } = useRecruitmentInfo();
  // 회비가 아직 등록되지 않았으면 금액을 지어내지 않고 안내만 한다
  const { feeInfo } = useFeeInfo();
  const feeDesc = feeInfo
    ? `${feeInfo.feeAmount.toLocaleString()}원 (휴학·졸업생 ${feeInfo.discountAmount.toLocaleString()}원)`
    : "회비 납부 안내 확인";

  const nextSteps = [
    { step: 1, label: "본인 인증", desc: "학번 + 임시 비밀번호" },
    { step: 2, label: "회비 납부", desc: feeDesc },
    { step: 3, label: "관리자 승인", desc: "홈페이지 활동 시작" },
  ];

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4 py-16">
      <div className="w-full max-w-[420px] bg-white rounded-xl shadow-sm px-8 py-10 flex flex-col items-center gap-6">
        <Image
          src="/assets/mascot-heart.svg"
          alt="씨부엉 마스코트"
          width={93}
          height={86}
          className="w-24 h-auto"
        />

        <div className="text-center space-y-2">
          <h1 className="text-h1 text-gray-900">합격을 축하합니다!</h1>
          <p className="text-body-sm text-gray-500">
            씨부엉 {generationLabel && `${generationLabel} `}신규 부원으로
            선발되셨습니다.
            <br />
            운영진 모두가 환영합니다!
          </p>
        </div>

        <div className="w-full rounded-xl border border-gray-200 px-4 py-4 flex flex-col gap-2.5">
          <div className="flex items-center gap-3">
            <span className="text-body-sm text-gray-500 w-16 shrink-0">
              학번
            </span>
            <span className="text-body-sm text-gray-900">2026XXXXXX</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-body-sm text-gray-500 w-16 shrink-0">
              이름
            </span>
            <span className="text-body-sm text-gray-900">지원자명</span>
          </div>
        </div>

        <div className="w-full flex flex-col gap-3">
          <h2 className="text-h3 text-gray-900">Next</h2>
          <div className="w-full h-px bg-gray-200" />
          <ol className="flex flex-col gap-3">
            {nextSteps.map(({ step, label, desc }) => (
              <li key={step} className="flex items-center gap-3">
                <span className="w-6 h-6 rounded-full bg-gray-100 text-gray-500 text-caption font-semibold flex items-center justify-center shrink-0">
                  {step}
                </span>
                <span className="text-body-sm text-gray-600">
                  {label} — {desc}
                </span>
              </li>
            ))}
          </ol>
        </div>

        <Link
          href="/signup"
          className="w-full h-12 rounded-xl bg-brand text-white font-semibold hover:opacity-90 transition-opacity flex items-center justify-center"
        >
          본인 인증하러 가기
        </Link>
      </div>
    </main>
  );
}
