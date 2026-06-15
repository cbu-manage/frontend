"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { applyApi } from "@/api/apply.api";
import { RECRUIT_GENERATION } from "./constants";

export default function ApplyIntroPage() {
  const [studentId, setStudentId] = useState("");
  const [email, setEmail] = useState("");
  const [isChecking, setIsChecking] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleCheck = async () => {
    if (!studentId || !email) return;
    setIsChecking(true);
    setMessage(null);
    try {
      await applyApi.check(studentId, email);
      setMessage({ type: "success", text: "신청서가 확인되었습니다." });
    } catch (err) {
      const code = (err as { response?: { data?: { code?: string } } }).response?.data?.code;
      if (code === "E-APP-0002") {
        setMessage({ type: "error", text: "이미 신청된 학번 또는 이메일입니다." });
      } else {
        setMessage({ type: "error", text: "확인 중 오류가 발생했습니다. 다시 시도해주세요." });
      }
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
          style={{ background: "radial-gradient(circle at 60% 40%, #D2ECBD 0%, #BFDD98 100%)" }}
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
              {RECRUIT_GENERATION} 씨부엉 신청하기
            </h2>
            <p className="text-body-sm font-medium text-gray-700 text-center">
              씨부엉과 함께 성장할 30기를 기다리고 있어요!
            </p>
            <Link
              href="/apply/form"
              className="mt-3 w-full max-w-xs flex items-center justify-center h-12 rounded-full bg-white text-brand font-semibold hover:bg-gray-50 transition-colors shadow-sm"
            >
              신청서 작성
            </Link>
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
              placeholder="학교 이메일을 입력해주세요."
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3.5 text-body-sm text-gray-900 placeholder:text-gray-400 outline-none focus:border-brand focus:ring-1 focus:ring-brand transition-all"
            />
          </div>

          <button
            type="button"
            onClick={handleCheck}
            disabled={!studentId || !email || isChecking}
            className="w-full h-12 rounded-xl font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed bg-brand text-white"
          >
            제출한 서류 확인하기
          </button>

          {message && (
            <p className={`text-body-sm text-center ${message.type === "success" ? "text-brand" : "text-notice"}`}>
              {message.text}
            </p>
          )}
        </div>
      </div>
    </main>
  );
}
