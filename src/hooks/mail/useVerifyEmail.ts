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
  });

  const sendEmailToServer = async (
    mail: string,
  ): Promise<{ success: boolean; responseMessage: string }> => {
    try {
      const res = await sendMutation.mutateAsync(mail);
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
    emailErrorMessage: sendMutation.error
      ? "서버 요청에 실패했습니다. 다시 시도해주세요."
      : sendMutation.data?.data?.data?.responseMessage || "",
    verificationError: verifyMutation.isError,
    verificationErrorMessage: "",
    // 서버가 실패도 200 + { success: false }로 주므로 HTTP 성공만으로 판단하면 안 된다
    isVerificationSent: sendMutation.data?.data?.data?.success === true,
    isSending: sendMutation.isPending,
    isVerifying: verifyMutation.isPending,
    sendEmailToServer,
    verifyCodeWithServer,
  };
}
