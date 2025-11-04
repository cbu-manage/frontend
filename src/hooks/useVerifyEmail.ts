"use client";
import { useState } from "react";

const addSuffixIfMissing = (email: string): string =>
  email.includes("@") ? email : `${email}@tukorea.ac.kr`;

export function useVerifyEmail() {
  const [emailError, setEmailError] = useState(false);
  const [emailErrorMessage, setEmailErrorMessage] = useState("");
  const [verificationError, setVerificationError] = useState(false);
  const [verificationErrorMessage, setVerificationErrorMessage] = useState("");
  const [isVerificationSent, setIsVerificationSent] = useState(false);

  const SERVER_URL = process.env.NEXT_PUBLIC_API_URL || "/api/v1";

  const sendEmailToServer = async (mail: string): Promise<boolean> => {
    try {
      const fullEmail = addSuffixIfMissing(mail);
      const requestUrl = `${SERVER_URL}/mail/send?address=${encodeURIComponent(fullEmail)}`;
      const response = await fetch(requestUrl, {
        method: "POST",
        headers: { Accept: "*/*" },
      });
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`서버 오류 발생: ${response.status} ${errorText}`);
      }
      const result = await response.json();
      if (result.success) {
        setIsVerificationSent(true);
        return true;
      } else {
        setEmailError(true);
        setEmailErrorMessage(result?.responseMessage || "메일 전송 실패");
        return false;
      }
    } catch (e) {
      setEmailError(true);
      setEmailErrorMessage("서버 요청에 실패했습니다. 다시 시도해주세요.");
      return false;
    }
  };

  const verifyCodeWithServer = async (
    email: string,
    code: string
  ): Promise<{ success: boolean; responseMessage: string }> => {
    try {
      const fullEmail = addSuffixIfMissing(email);
      const url = `${SERVER_URL}/mail/verify?address=${encodeURIComponent(fullEmail)}&authCode=${encodeURIComponent(code)}`;
      const response = await fetch(url, {
        method: "POST",
        headers: { Accept: "application/json" },
        body: JSON.stringify({ address: fullEmail, authCode: code }),
      });
      if (!response.ok) {
        return { success: false, responseMessage: "서버 오류가 발생했습니다." };
      }
      const result = await response.json();
      if (result.success) {
        alert("인증되었습니다!");
      } else {
        alert(`❌ 인증 실패: ${result.responseMessage}`);
      }
      return { success: result.success, responseMessage: result.responseMessage || "인증 결과를 확인할 수 없습니다." };
    } catch (e) {
      return { success: false, responseMessage: "네트워크 오류가 발생했습니다." };
    }
  };

  return {
    emailError,
    emailErrorMessage,
    verificationError,
    verificationErrorMessage,
    isVerificationSent,
    sendEmailToServer,
    verifyCodeWithServer,
  };
}


