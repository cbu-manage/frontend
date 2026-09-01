"use client";

import { useEffect, useState } from "react";
import { useVerifyEmail } from "@/hooks/mail";

export interface EmailVerificationFieldProps {
  email: string;
  onEmailChange: (value: string) => void;
  verificationCode: string;
  onCodeChange: (value: string) => void;
  isVerified: boolean;
  onVerify: () => void;
  errorMessage?: string;
}

/** 재전송 대기 시간(초) — 회원가입 화면(StepOne)과 동일하게 맞춘다 */
const RESEND_COOLDOWN_SEC = 60;

export default function EmailVerificationField({
  email,
  onEmailChange,
  verificationCode,
  onCodeChange,
  isVerified,
  onVerify,
  errorMessage,
}: EmailVerificationFieldProps) {
  const [apiError, setApiError] = useState("");
  const [notice, setNotice] = useState("");
  /** 발송에 성공한 주소. 주소를 고치면 자동으로 발송 단계로 돌아간다 */
  const [sentTo, setSentTo] = useState("");
  const [cooldown, setCooldown] = useState(0);
  const {
    sendEmailToServer,
    verifyCodeWithServer,
    isSending,
    isVerifying,
    codeExpiresLabel,
  } = useVerifyEmail();

  const isSent = !!sentTo && sentTo === email;
  const isLoading = isSending || isVerifying;

  useEffect(() => {
    if (cooldown <= 0) return;
    const id = setInterval(() => setCooldown((c) => c - 1), 1000);
    return () => clearInterval(id);
  }, [cooldown]);
  const isButtonDisabled =
    isVerified ||
    isLoading ||
    (!isSent && !email) ||
    (isSent && !verificationCode);

  const buttonLabel = isVerified
    ? "인증완료"
    : isVerifying
      ? "인증 중..."
      : isSending
        ? "발송 중..."
        : isSent
          ? "인증하기"
          : "인증번호 발송";

  const send = async (resent: boolean) => {
    setApiError("");
    setNotice("");
    const { success, responseMessage } = await sendEmailToServer(email);
    if (!success) {
      setApiError(responseMessage);
      return;
    }
    setSentTo(email);
    setCooldown(RESEND_COOLDOWN_SEC);
    setNotice(
      responseMessage ||
        (resent
          ? "인증번호를 다시 보냈어요."
          : "인증번호를 보냈어요. 메일함을 확인해주세요."),
    );
  };

  const handleButtonClick = async () => {
    setApiError("");
    if (!isSent) {
      await send(false);
    } else {
      const { success, responseMessage } = await verifyCodeWithServer(
        email,
        verificationCode,
      );
      if (success) {
        onVerify();
      } else {
        setApiError(responseMessage);
      }
    }
  };

  const displayError = apiError || errorMessage;

  return (
    <div className="space-y-1.5">
      <p
        id="email-verification-label"
        className="text-body-sm font-medium text-gray-900"
      >
        이메일 입력 <span className="text-notice">*</span>
      </p>
      <div className="grid sm:grid-cols-2 gap-4">
        {/* 이메일 입력 + 고정 도메인 */}
        <div
          className={`flex items-center rounded-xl border transition-all duration-150 ${
            isVerified
              ? "bg-gray-100 border-gray-200"
              : "bg-gray-0 border-gray-200 focus-within:border-brand focus-within:ring-1 focus-within:ring-brand"
          }`}
        >
          <input
            type="text"
            placeholder="이메일 아이디"
            value={email}
            onChange={(e) => {
              const value = e.target.value;
              // 주소를 고치면 이전 발송 안내는 더 이상 맞지 않는다
              setNotice(
                value.includes("@")
                  ? "학교 메일 아이디만 입력해주세요. @tukorea.ac.kr은 자동으로 붙어요."
                  : "",
              );
              onEmailChange(value.split("@")[0]);
            }}
            disabled={isVerified}
            aria-labelledby="email-verification-label"
            aria-describedby={
              displayError ? "email-verification-error" : undefined
            }
            className="flex-1 min-w-0 px-4 py-4 text-base font-medium tracking-[-0.048px] leading-normal border-0 outline-none ring-0 shadow-none bg-transparent text-gray-900 placeholder:text-gray-600 disabled:text-gray-500 disabled:cursor-not-allowed"
          />
          <span className="pr-3 text-base font-medium shrink-0 select-none text-gray-500 whitespace-nowrap">
            @tukorea.ac.kr
          </span>
        </div>

        {/* 인증번호 입력 + 버튼 */}
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="인증번호 입력"
            value={verificationCode}
            onChange={(e) => onCodeChange(e.target.value)}
            disabled={!isSent || isVerified}
            maxLength={6}
            aria-label="인증번호 입력"
            aria-describedby={
              displayError ? "email-verification-error" : undefined
            }
            className="basis-[70%] min-w-0 rounded-xl px-4 py-4 text-base font-medium tracking-[-0.048px] leading-normal border border-gray-200 bg-gray-0 text-left text-gray-900 placeholder:text-gray-600 outline-none transition-all duration-150 focus:border-brand focus:ring-1 focus:ring-brand disabled:text-gray-400 disabled:cursor-not-allowed"
          />
          <button
            type="button"
            onClick={handleButtonClick}
            disabled={isButtonDisabled}
            className={`basis-[30%] rounded-xl px-5 py-4 text-base font-medium transition-colors duration-200 ${
              isVerified
                ? "bg-brand text-gray-0 cursor-not-allowed"
                : isButtonDisabled
                  ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                  : "bg-gray-900 text-gray-0"
            }`}
          >
            {buttonLabel}
          </button>
        </div>
      </div>
      {!displayError && notice && (
        <p aria-live="polite" className="text-caption text-gray-600 mt-1">
          {notice}
        </p>
      )}
      {isSent && !isVerified && (
        <p
          className={`text-caption mt-1 ${
            codeExpiresLabel ? "text-gray-500" : "text-notice"
          }`}
        >
          {codeExpiresLabel
            ? `인증번호 유효시간 ${codeExpiresLabel}`
            : "인증번호가 만료됐어요. 다시 받아주세요."}
        </p>
      )}
      {isSent && !isVerified && (
        <button
          type="button"
          onClick={() => send(true)}
          disabled={cooldown > 0 || isLoading}
          className="text-caption text-gray-600 underline underline-offset-2 disabled:text-gray-400 disabled:no-underline disabled:cursor-not-allowed"
        >
          {cooldown > 0 ? `${cooldown}초 후 재전송` : "인증번호 재전송"}
        </button>
      )}
      {displayError && (
        <p
          id="email-verification-error"
          aria-live="polite"
          className="text-caption text-notice flex items-center gap-1 mt-1"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="11"
            height="11"
            viewBox="0 0 11 11"
            fill="none"
            className="shrink-0 text-notice"
          >
            <path
              d="M5.41667 8.125C5.57014 8.125 5.69878 8.07309 5.8026 7.96927C5.90642 7.86545 5.95833 7.7368 5.95833 7.58333C5.95833 7.42986 5.90642 7.30121 5.8026 7.1974C5.69878 7.09358 5.57014 7.04167 5.41667 7.04167C5.26319 7.04167 5.13455 7.09358 5.03073 7.1974C4.92691 7.30121 4.875 7.42986 4.875 7.58333C4.875 7.7368 4.92691 7.86545 5.03073 7.96927C5.13455 8.07309 5.26319 8.125 5.41667 8.125ZM4.875 5.95833H5.95833V2.70833H4.875V5.95833ZM5.41667 10.8333C4.66736 10.8333 3.96319 10.6911 3.30417 10.4068C2.64514 10.1224 2.07187 9.73646 1.58437 9.24896C1.09687 8.76146 0.710937 8.18819 0.426562 7.52917C0.142187 6.87014 0 6.16597 0 5.41667C0 4.66736 0.142187 3.96319 0.426562 3.30417C0.710937 2.64514 1.09687 2.07187 1.58437 1.58437C2.07187 1.09687 2.64514 0.710937 3.30417 0.426562C3.96319 0.142187 4.66736 0 5.41667 0C6.16597 0 6.87014 0.142187 7.52917 0.426562C8.18819 0.710937 8.76146 1.09687 9.24896 1.58437C9.73646 2.07187 10.1224 2.64514 10.4068 3.30417C10.6911 3.96319 10.8333 4.66736 10.8333 5.41667C10.8333 6.16597 10.6911 6.87014 10.4068 7.52917C10.1224 8.18819 9.73646 8.76146 9.24896 9.24896C8.76146 9.73646 8.18819 10.1224 7.52917 10.4068C6.87014 10.6911 6.16597 10.8333 5.41667 10.8333ZM5.41667 9.75C6.62639 9.75 7.65104 9.33021 8.49062 8.49062C9.33021 7.65104 9.75 6.62639 9.75 5.41667C9.75 4.20694 9.33021 3.18229 8.49062 2.34271C7.65104 1.50312 6.62639 1.08333 5.41667 1.08333C4.20694 1.08333 3.18229 1.50312 2.34271 2.34271C1.50312 3.18229 1.08333 4.20694 1.08333 5.41667C1.08333 6.62639 1.50312 7.65104 2.34271 8.49062C3.18229 9.33021 4.20694 9.75 5.41667 9.75Z"
              fill="currentColor"
            />
          </svg>
          {displayError}
        </p>
      )}
    </div>
  );
}
