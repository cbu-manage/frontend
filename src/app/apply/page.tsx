"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { applyApi } from "@/api";
import { useRecruitmentInfo } from "@/hooks/apply";

/** yyyy-MM-dd. 자정 경계를 사용자의 오늘로 판정하려고 로컬 날짜를 쓴다 */
function todayLocal(): string {
  const now = new Date();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${now.getFullYear()}-${m}-${d}`;
}

export default function ApplyIntroPage() {
  // 기수 표기는 진행 중인 모집을 따른다 (없으면 빈 문자열 → 문구에서 자연히 빠짐)
  const { generationLabel, periodLabel, resultLabel, recruitment } =
    useRecruitmentInfo();
  const today = todayLocal();
  const startsAt = recruitment?.plannedStartDate ?? null;
  const endsAt = recruitment?.plannedEndDate ?? null;
  const isBeforeStart = !!startsAt && today < startsAt;
  const isAfterEnd = !!endsAt && today > endsAt;
  // 진행 중인 모집이 없으면 서버가 404를 주므로 recruitment 자체가 null이 된다
  const isOpen = !!recruitment && !isBeforeStart && !isAfterEnd;
  const closedReason = !recruitment
    ? "지금은 모집 기간이 아니에요"
    : isBeforeStart
      ? "아직 모집 시작 전이에요"
      : "모집이 마감됐어요";
  const router = useRouter();
  const [studentId, setStudentId] = useState("");
  const [nickname, setNickname] = useState("");
  const [isChecking, setIsChecking] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleCheck = async () => {
    if (!studentId || !nickname) return;
    const studentNumber = parseInt(studentId, 10);
    if (Number.isNaN(studentNumber)) {
      setErrorMessage("학번은 숫자로 입력해주세요.");
      return;
    }
    setIsChecking(true);
    setErrorMessage("");
    try {
      const res = await applyApi.getMy({
        studentNumber,
        nickname,
      });
      sessionStorage.setItem("applyDraft", JSON.stringify(res.data.data));
      router.push("/apply/form");
    } catch (err) {
      setErrorMessage((err as Error).message || "확인 중 오류가 발생했습니다.");
    } finally {
      setIsChecking(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-100 flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-4xl flex flex-col sm:flex-row gap-5 items-stretch">
        {/* 왼쪽 카드 - 신청서 작성 */}
        <div
          className="flex-1 rounded-3xl flex flex-col items-center justify-between px-10 pt-8 pb-10 relative overflow-hidden min-h-[420px]"
          style={{
            background:
              "radial-gradient(circle at 60% 40%, #D2ECBD 0%, #BFDD98 100%)",
          }}
        >
          <div className="w-full flex justify-center">
            <Image
              src="/assets/mascot-together.svg"
              alt="씨부엉 마스코트 일러스트"
              width={380}
              height={267}
              className="w-full max-w-[340px] h-auto drop-shadow-md"
              priority
            />
          </div>

          <div className="flex flex-col items-center gap-3 w-full mt-2">
            <h2 className="text-h1 text-gray-900 text-center">
              {generationLabel && `${generationLabel} `}씨부엉 신청하기
            </h2>
            <p className="text-body-sm font-medium text-gray-700 text-center">
              씨부엉과 함께 성장할{" "}
              {generationLabel ? `${generationLabel} 신입` : "새 부원"}을
              기다리고 있어요!
            </p>
            {(periodLabel || resultLabel) && (
              <dl className="mt-1 flex flex-col gap-1 text-body-sm text-gray-700">
                {periodLabel && (
                  <div className="flex gap-2">
                    <dt className="shrink-0 font-medium">모집 기간</dt>
                    <dd>{periodLabel}</dd>
                  </div>
                )}
                {resultLabel && (
                  <div className="flex gap-2">
                    <dt className="shrink-0 font-medium">결과 발표</dt>
                    <dd>{resultLabel}</dd>
                  </div>
                )}
              </dl>
            )}
            {isOpen ? (
              <Link
                href="/apply/form"
                className="mt-3 w-full max-w-xs flex items-center justify-center h-12 rounded-full bg-white text-brand font-semibold hover:bg-gray-50 transition-colors shadow-sm"
              >
                신청서 작성
              </Link>
            ) : (
              <div className="mt-3 w-full max-w-xs flex items-center justify-center h-12 rounded-full bg-gray-100 text-gray-500 font-semibold cursor-not-allowed">
                {closedReason}
              </div>
            )}
          </div>
        </div>

        {/* 오른쪽 카드 - 제출 확인 */}
        <div className="flex-1 rounded-3xl bg-white flex flex-col items-center justify-center px-10 py-12 gap-5 shadow-sm min-h-[420px]">
          <Image
            src="/assets/mascot.svg"
            alt="씨부엉"
            width={80}
            height={80}
            className="w-20 h-20"
          />

          <div className="text-center space-y-1.5">
            <h2 className="text-h2 text-gray-900">제출 확인</h2>
            <p className="text-body-sm text-gray-500 leading-[var(--leading-relaxed)]">
              입력한 내용을 수정하고 싶다면
              <br />
              입력해주세요!
            </p>
            {/* 서버가 지원서를 낼 때마다 새 인증번호를 요구한다. 미리 알려주지 않으면
                답변만 복원된 화면에서 왜 또 인증하냐는 인상을 준다 */}
            <p className="text-caption text-gray-400">
              불러온 뒤 다시 제출하려면 이메일 인증을 한 번 더 받아야 해요.
            </p>
          </div>

          <div className="w-full space-y-3 mt-2">
            <input
              type="text"
              placeholder="학번을 입력해주세요."
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
              className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3.5 text-body-sm text-gray-900 placeholder:text-gray-400 outline-none focus:border-brand focus:ring-1 focus:ring-brand transition-all"
            />
            <input
              type="text"
              placeholder="닉네임을 입력해주세요."
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3.5 text-body-sm text-gray-900 placeholder:text-gray-400 outline-none focus:border-brand focus:ring-1 focus:ring-brand transition-all"
            />
          </div>

          <button
            type="button"
            onClick={handleCheck}
            disabled={!studentId || !nickname || isChecking}
            className="w-full h-12 rounded-xl font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed bg-brand text-white"
          >
            {isChecking ? "확인 중..." : "제출한 서류 확인하기"}
          </button>

          {errorMessage && (
            <p className="text-body-sm text-center text-notice">
              {errorMessage}
            </p>
          )}
        </div>
      </div>
    </main>
  );
}
