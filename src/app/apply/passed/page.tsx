"use client";

import { Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  useApplicationResult,
  useFeeInfo,
  useRecruitmentInfo,
} from "@/hooks/apply";

function ApplyPassedClient() {
  // 기수 표기는 진행 중인 모집을 따른다 (없으면 빈 문자열 → 문구에서 자연히 빠짐)
  const { generationLabel } = useRecruitmentInfo();
  // 합격 안내 메일 링크가 지원서 UUID를 달고 온다. 없으면 본인 정보 없이 안내만 보여준다
  const applicationUuid = useSearchParams().get("a");
  const { result, isLoading } = useApplicationResult(applicationUuid);
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

  // 조회 중에는 아무것도 단정하지 않는다(축하/실패 문구가 깜빡이지 않도록).
  if (isLoading) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <p className="text-body-sm text-gray-500">불러오는 중...</p>
      </main>
    );
  }

  // 본인 확인(합격 지원서 조회)이 안 되면 축하 화면을 보여주지 않는다.
  // 안내 메일 링크(?a=UUID)로 들어온 합격자만 결과를 받는다.
  if (!result) {
    return (
      <main className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4 py-16">
        <div className="w-full max-w-[420px] bg-white rounded-xl shadow-sm px-8 py-10 flex flex-col items-center gap-4 text-center">
          <h1 className="text-h1 text-gray-900">본인 확인이 필요해요</h1>
          <p className="text-body-sm text-gray-500">
            합격 안내 메일에 담긴 링크로 들어와 주세요.
            <br />
            링크가 올바른지 다시 확인해 주세요.
          </p>
          <Link
            href="/"
            className="mt-4 inline-flex items-center justify-center rounded-xl bg-brand px-6 py-3 text-sm font-medium text-white hover:opacity-90 transition-opacity"
          >
            홈으로
          </Link>
        </div>
      </main>
    );
  }

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
            씨부엉{" "}
            {result
              ? `${result.generation}기 `
              : generationLabel && `${generationLabel} `}
            신규 부원으로 선발되셨습니다.
            <br />
            운영진 모두가 환영합니다!
          </p>
        </div>

        {result && (
          <div className="w-full rounded-xl border border-gray-200 px-4 py-4 flex flex-col gap-2.5">
            <div className="flex items-center gap-3">
              <span className="text-body-sm text-gray-500 w-16 shrink-0">
                학번
              </span>
              <span className="text-body-sm text-gray-900">
                {result.maskedStudentNumber}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-body-sm text-gray-500 w-16 shrink-0">
                이름
              </span>
              <span className="text-body-sm text-gray-900">{result.name}</span>
            </div>
          </div>
        )}

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

export default function ApplyPassedPage() {
  return (
    <Suspense fallback={null}>
      <ApplyPassedClient />
    </Suspense>
  );
}
