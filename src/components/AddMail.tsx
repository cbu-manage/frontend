"use client";
import { useState } from "react";
import { useVerifyEmail } from "@/hooks/mail";
import { useMailUpdate } from "@/hooks/mail";
import LongBtn from "@/components/common/LongBtn";

export default function AddMail({ onEmailUpdated }: { onEmailUpdated?: () => void }) {
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const { isVerificationSent, sendEmailToServer, verifyCodeWithServer } = useVerifyEmail();
  const mailUpdateMutation = useMailUpdate(onEmailUpdated);

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
          onClick={async () => {
            const fullEmail = `${email}@tukorea.ac.kr`;
            const ok = await sendEmailToServer(fullEmail);
            if (ok) alert("인증 메일을 보냈습니다.");
          }}
        >
          인증번호 보내기
        </LongBtn>
      </div>

      {isVerificationSent && (
        <div className="space-y-3 border-t border-gray-100 pt-4">
          <input
            className="w-full rounded-lg p-4 text-base font-medium bg-gray-50 border border-gray-200 text-gray-900 placeholder:text-gray-600 outline-none transition-all duration-150 focus:bg-gray-0 focus:border-brand focus:ring-1 focus:ring-brand"
            placeholder="인증번호"
            value={code}
            onChange={(e) => setCode(e.target.value)}
          />
          <LongBtn
            type="button"
            className="w-full"
            onClick={async () => {
              const fullEmail = `${email}@tukorea.ac.kr`;
              const res = await verifyCodeWithServer(fullEmail, code);
              if (res.success) {
                mailUpdateMutation.mutate(fullEmail);
              }
            }}
          >
            인증 및 저장
          </LongBtn>
        </div>
      )}
    </div>
  );
}
