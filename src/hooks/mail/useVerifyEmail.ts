"use client";

import { useMutation } from "@tanstack/react-query";
import { mailApi } from "@/api/mail.api";

const addSuffixIfMissing = (email: string): string =>
  email.includes("@") ? email : `${email}@tukorea.ac.kr`;

export function useVerifyEmail() {
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
    onSuccess: (res) => {
      if (res.data.success) alert("인증되었습니다!");
      else alert(`❌ 인증 실패: ${res.data.responseMessage}`);
    },
  });

  const sendEmailToServer = async (mail: string): Promise<boolean> => {
    try {
      const res = await sendMutation.mutateAsync(mail);
      if (res.data.success) return true;
      sendMutation.reset();
      return false;
    } catch {
      return false;
    }
  };

  const verifyCodeWithServer = async (
    email: string,
    code: string
  ): Promise<{ success: boolean; responseMessage: string }> => {
    try {
      const res = await verifyMutation.mutateAsync({ email, code });
      return {
        success: res.data.success,
        responseMessage: res.data.responseMessage || "인증 결과를 확인할 수 없습니다.",
      };
    } catch {
      return { success: false, responseMessage: "네트워크 오류가 발생했습니다." };
    }
  };

  return {
    emailError: sendMutation.isError,
    emailErrorMessage: sendMutation.error
      ? "서버 요청에 실패했습니다. 다시 시도해주세요."
      : sendMutation.data?.data?.responseMessage || "",
    verificationError: verifyMutation.isError,
    verificationErrorMessage: "",
    isVerificationSent: sendMutation.isSuccess,
    sendEmailToServer,
    verifyCodeWithServer,
  };
}
