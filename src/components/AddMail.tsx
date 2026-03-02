"use client";
import { useState, useEffect } from "react";
import { useVerifyEmail } from "@/hooks/mail";
import { useMailUpdate } from "@/hooks/mail";
import LongBtn from "@/components/common/LongBtn";
import LoadingSpinner from "@/components/common/LoadingSpinner";

export default function AddMail({ onEmailUpdated }: { onEmailUpdated?: () => void }) {
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [cooldown, setCooldown] = useState(0); // 초 단위
  const { isVerificationSent, isVerifying, sendEmailToServer, verifyCodeWithServer } =
    useVerifyEmail();
  const mailUpdateMutation = useMailUpdate(onEmailUpdated);
  const isUpdating = mailUpdateMutation.isPending;
  const isProcessingVerify = isVerifying || isUpdating;

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown((prev) => (prev > 1 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  return (
    <div className="w-full max-w-xl rounded-2xl bg-white p-8 shadow-md space-y-6">
      <div className="space-y-2 text-center">
        <h3 className="text-xl font-semibold text-gray-900">이메일 등록</h3>
        <p className="text-sm text-gray-600">
          학교 이메일(@tukorea.ac.kr)을 등록해 주세요.
        </p>
      </div>

      <div className="space-y-3">
        <div className="relative">
          <input
            className="w-full rounded-lg p-4 pr-32 text-base font-medium bg-gray-50 border border-gray-200 text-gray-900 placeholder:text-gray-600 outline-none transition-all duration-150 focus:bg-gray-0 focus:border-brand focus:ring-1 focus:ring-brand"
            placeholder="학번 또는 아이디"
            value={email}
            onChange={(e) => {
              // 항상 로컬 파트만 입력받고 도메인은 고정
              const value = e.target.value.split("@")[0];
              setEmail(value);
            }}
          />
          <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-sm font-medium text-gray-700">
            @tukorea.ac.kr
          </span>
        </div>
        <LongBtn
          type="button"
          className="w-full"
          disabled={cooldown > 0 || !email}
          onClick={async () => {
            if (!email || cooldown > 0) return;
            const fullEmail = `${email}@tukorea.ac.kr`;
            const ok = await sendEmailToServer(fullEmail);
            if (ok) {
              alert("인증 메일을 보냈습니다.");
              setCooldown(60);
            }
          }}
        >
          {cooldown > 0 ? `인증번호 재전송 (${cooldown}s)` : "인증번호 보내기"}
        </LongBtn>
      </div>

      {isVerificationSent && (
        <div className="space-y-4 border-t border-gray-100 pt-4">
          <input
            className="w-full rounded-lg p-4 text-base font-medium bg-gray-50 border border-gray-200 text-gray-900 placeholder:text-gray-600 outline-none transition-all duration-150 focus:bg-gray-0 focus:border-brand focus:ring-1 focus:ring-brand"
            placeholder="인증번호"
            value={code}
            onChange={(e) => setCode(e.target.value)}
          />
          {isProcessingVerify && (
            <p className="text-xs text-gray-500 text-center">
              이메일 등록을 진행 중입니다. 잠시만 기다려 주세요.
            </p>
          )}
          <LongBtn
            type="button"
            className="w-full flex items-center justify-center gap-2"
            disabled={isProcessingVerify || !code}
            onClick={async () => {
              if (isProcessingVerify || !code) return;
              const fullEmail = `${email}@tukorea.ac.kr`;
              const res = await verifyCodeWithServer(fullEmail, code);
              if (res.success) {
                mailUpdateMutation.mutate(fullEmail);
              }
            }}
          >
            {isProcessingVerify ? (
              <>
                <LoadingSpinner size="sm" />
                <span>처리 중...</span>
              </>
            ) : (
              "인증 및 저장"
            )}
          </LongBtn>
        </div>
      )}
    </div>
  );
}
