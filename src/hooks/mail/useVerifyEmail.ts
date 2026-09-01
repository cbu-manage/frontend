"use client";

import { useEffect, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { mailApi } from "@/api/mail.api";

const addSuffixIfMissing = (email: string): string =>
  email.includes("@") ? email : `${email}@tukorea.ac.kr`;

/** 서버(EmailService)가 인증번호를 Redis에 10분간 보관한다. */
const AUTH_CODE_TTL_SECONDS = 600;

const formatRemaining = (seconds: number): string => {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
};

export function useVerifyEmail() {
  // 발송 성공 시점 + TTL. 만료되면 서버도 "만료되었습니다"를 주므로 화면과 서버 판정이 어긋나지 않는다.
  const [expiresAt, setExpiresAt] = useState<number | null>(null);
  const [codeExpiresIn, setCodeExpiresIn] = useState(0);

  useEffect(() => {
    if (expiresAt === null) return;
    const tick = () => {
      const left = Math.max(0, Math.ceil((expiresAt - Date.now()) / 1000));
      setCodeExpiresIn(left);
      if (left === 0) setExpiresAt(null);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [expiresAt]);

  const sendMutation = useMutation({
    mutationFn: (mail: string) => {
      const fullEmail = addSuffixIfMissing(mail);
      return mailApi.send(fullEmail);
    },
  });

  const verifyMutation = useMutation({
    mutationFn: ({ email, code }: { email: string; code: string }) => {
      const fullEmail = addSuffixIfMissing(email);
      return mailApi.verify(fullEmail, code);
    },
  });

  const sendEmailToServer = async (
    mail: string,
  ): Promise<{ success: boolean; responseMessage: string }> => {
    try {
      const res = await sendMutation.mutateAsync(mail);
      if (res.data.data.success) {
        setExpiresAt(Date.now() + AUTH_CODE_TTL_SECONDS * 1000);
      }
      return {
        success: res.data.data.success,
        responseMessage:
          res.data.data.responseMessage ||
          "인증번호 발송에 실패했습니다. 다시 시도해주세요.",
      };
    } catch (err) {
      const message = (err as { response?: { data?: { message?: string } } })
        ?.response?.data?.message;
      return {
        success: false,
        responseMessage: message || "네트워크 오류가 발생했습니다.",
      };
    }
  };

  const verifyCodeWithServer = async (
    email: string,
    code: string,
  ): Promise<{ success: boolean; responseMessage: string }> => {
    try {
      const res = await verifyMutation.mutateAsync({ email, code });
      if (res.data.data.success) {
        setExpiresAt(null);
        setCodeExpiresIn(0);
      }
      return {
        success: res.data.data.success,
        responseMessage:
          res.data.data.responseMessage || "인증 결과를 확인할 수 없습니다.",
      };
    } catch (err) {
      const message = (err as { response?: { data?: { message?: string } } })
        ?.response?.data?.message;
      return {
        success: false,
        responseMessage: message || "네트워크 오류가 발생했습니다.",
      };
    }
  };

  return {
    emailError: sendMutation.isError,
    // 도메인 제한·발송 한도는 서버가 사유를 한국어로 내려주므로 그대로 보여준다
    emailErrorMessage: sendMutation.error
      ? ((sendMutation.error as { response?: { data?: { message?: string } } })
          ?.response?.data?.message ??
        "서버 요청에 실패했습니다. 다시 시도해주세요.")
      : sendMutation.data?.data?.data?.responseMessage || "",
    verificationError: verifyMutation.isError,
    verificationErrorMessage: "",
    // 서버가 실패도 200 + { success: false }로 주므로 HTTP 성공만으로 판단하면 안 된다
    isVerificationSent: sendMutation.data?.data?.data?.success === true,
    isSending: sendMutation.isPending,
    isVerifying: verifyMutation.isPending,
    /** 인증번호 남은 시간(초). 0이면 미발송이거나 만료 */
    codeExpiresIn,
    /** "9:58" 형태. 남은 시간이 없으면 빈 문자열 */
    codeExpiresLabel: codeExpiresIn > 0 ? formatRemaining(codeExpiresIn) : "",
    sendEmailToServer,
    verifyCodeWithServer,
  };
}
