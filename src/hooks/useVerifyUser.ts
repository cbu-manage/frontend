"use client";
import { useState } from "react";

export interface UserInfo {
  successMemberId: number;
  name: string;
  nickName: string;
  grade: string;
  major: string;
  phoneNumber: string;
  studentNumber: number;
}

export function useVerifyUser() {
  const [verificationError, setVerificationError] = useState(false);
  const [verificationErrorMessage, setVerificationErrorMessage] = useState("");
  const SERVER_URL = process.env.NEXT_PUBLIC_API_URL || "/api/v1";

  const verifyUser = async (
    studentNumber: string,
    nickName: string
  ): Promise<UserInfo | null> => {
    if (!studentNumber || !nickName) {
      setVerificationError(true);
      setVerificationErrorMessage("모든 필드를 입력해주세요.");
      alert("이름과 학번을 입력해주세요.");
      return null;
    }
    if (!/^\d{10}$/.test(studentNumber)) {
      alert("학번은 10자리 숫자여야 합니다.");
      setVerificationError(true);
      setVerificationErrorMessage("학번은 10자리 숫자여야 합니다.");
      return null;
    }
    try {
      const resp = await fetch(`${SERVER_URL}/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentNumber: Number(studentNumber), nickName }),
      });
      if (resp.ok) {
        const text = await resp.text();
        if (!text) {
          alert("서버로부터 빈 응답을 받았습니다.");
          return null;
        }
        const data: UserInfo = JSON.parse(text);
        alert("인증 완료 되었습니다! \n이어서 회원가입을 해주세요!");
        setVerificationError(false);
        setVerificationErrorMessage("");
        return data;
      } else {
        alert("인증에 실패하였습니다. \n다시 한 번 확인해주세요.");
        setVerificationError(true);
        setVerificationErrorMessage("서버 인증 실패.");
        return null;
      }
    } catch (e) {
      alert("인증에 실패하였습니다. \n다시 한 번 확인해주세요.");
      setVerificationError(true);
      setVerificationErrorMessage("네트워크 오류가 발생했습니다.");
      return null;
    }
  };

  return { verificationError, verificationErrorMessage, verifyUser };
}

