"use client";
import { useState, useEffect } from "react";
import { useVerifyEmail } from "@/hooks/mail";
import InputBox from "../common/InputBox";
import { Button } from "@/components/ui/button";

export type VerifiedIdentity = {
  studentNumber: number;
  email: string;
  authCode: string;
};

export default function ResetPasswordForm({
  onSubmit,
  isSubmitting,
}: {
  onSubmit: (data: VerifiedIdentity) => void;
  isSubmitting: boolean;
}) {
  const [studentNumber, setStudentNumber] = useState("");
  const [email, setEmail] = useState("");
  const [authCode, setAuthCode] = useState("");
  const [isCodeSent, setIsCodeSent] = useState(false);
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown <= 0) return;
    const id = setInterval(() => {
      setCooldown((prev) => (prev <= 1 ? 0 : prev - 1));
    }, 1000);
    return () => clearInterval(id);
  }, [cooldown]);

  const {
    isSending,
    isVerifying,
    sendEmailToServer,
    verifyCodeWithServer,
    codeExpiresLabel,
  } = useVerifyEmail();

  const isStudentNumberValid = /^\d{10}$/.test(studentNumber);
  const fullEmail = `${email}@tukorea.ac.kr`;

  const handleEmailSend = async () => {
    if (!isStudentNumberValid) {
      alert("학번은 10자리 숫자로 입력해주세요.");
      return;
    }
    if (!email || isSending) return;
    const { success, responseMessage } = await sendEmailToServer(fullEmail);
    if (success) {
      alert("인증번호가 전송되었습니다.");
      setIsCodeSent(true);
      setCooldown(60);
    } else {
      alert(responseMessage);
    }
  };

  const handleVerifyCode = async () => {
    if (!authCode || isVerifying) return;
    const { success, responseMessage } = await verifyCodeWithServer(
      fullEmail,
      authCode,
    );
    if (success) {
      alert("이메일 인증이 완료되었습니다.");
      setIsEmailVerified(true);
    } else {
      alert(responseMessage);
    }
  };

  const canSubmit = isEmailVerified && !!authCode && !isSubmitting;

  const handleSubmit = () => {
    if (!canSubmit) return;
    onSubmit({
      studentNumber: Number(studentNumber),
      email: fullEmail,
      authCode,
    });
  };

  return (
    <div className="space-y-4">
      <InputBox
        label="학번"
        placeholder="학번을 입력하세요"
        value={studentNumber}
        onChange={(e) =>
          setStudentNumber(e.target.value.replace(/\D/g, "").slice(0, 10))
        }
        inputMode="numeric"
        required
      />

      <div className="flex gap-4">
        <div className="flex-1 space-y-1.5">
          <label className="block text-sm font-medium text-gray-900">
            학교 이메일
          </label>
          <div className="flex items-center rounded-lg border bg-gray-50 border-transparent transition-all duration-150 focus-within:bg-gray-0 focus-within:border-brand focus-within:ring-1 focus-within:ring-brand">
            <input
              type="text"
              placeholder="이메일 아이디"
              value={email}
              onChange={(e) => setEmail(e.target.value.replace(/@.*$/, ""))}
              className="flex-1 px-4 py-[15px] text-base font-medium tracking-[-0.048px] leading-normal border-0 outline-none ring-0 shadow-none bg-transparent text-gray-900 placeholder:text-gray-600"
            />
            <span className="pr-4 text-base font-medium shrink-0 select-none text-gray-500">
              @tukorea.ac.kr
            </span>
          </div>
        </div>
        <div className="flex items-end">
          <Button
            type="button"
            variant="default"
            className="h-auto rounded-lg px-8 py-4 text-base font-medium"
            onClick={handleEmailSend}
            disabled={
              !isStudentNumberValid ||
              !email ||
              isEmailVerified ||
              cooldown > 0 ||
              isSending
            }
          >
            {cooldown > 0
              ? `${cooldown}초 후 재전송`
              : isCodeSent
                ? "재전송"
                : "인증번호 받기"}
          </Button>
        </div>
      </div>

      {isCodeSent && (
        <div className="flex gap-4">
          <div className="flex-1">
            <InputBox
              label="인증번호"
              placeholder="메일로 받은 인증번호를 입력하세요"
              value={authCode}
              onChange={(e) => setAuthCode(e.target.value)}
              disabled={isEmailVerified}
              success={isEmailVerified}
              required
            />
            {isEmailVerified ? null : codeExpiresLabel ? (
              <p className="text-caption text-gray-500">
                인증번호 유효시간 {codeExpiresLabel}
              </p>
            ) : (
              <p className="text-caption text-notice">
                인증번호가 만료됐어요. 다시 받아주세요.
              </p>
            )}
          </div>
          <div className="flex items-end">
            <Button
              type="button"
              variant="default"
              className="h-auto rounded-lg px-8 py-4 text-base font-medium"
              onClick={handleVerifyCode}
              disabled={!authCode || isEmailVerified || isVerifying}
            >
              {isEmailVerified ? "인증완료" : "인증하기"}
            </Button>
          </div>
        </div>
      )}

      <div className="pt-4">
        <Button
          type="button"
          variant="brand"
          className="w-full h-auto rounded-lg p-4 text-base font-semibold"
          onClick={handleSubmit}
          disabled={!canSubmit}
        >
          {isSubmitting ? "처리 중..." : "임시 비밀번호 발급"}
        </Button>
      </div>
    </div>
  );
}
