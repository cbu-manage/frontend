"use client";
import { useState } from "react";

export function useSignUp() {
  const [signUpError, setSignUpError] = useState(false);
  const [signUpErrorMessage, setSignUpErrorMessage] = useState("");
  const [isSignUpSuccessful, setIsSignUpSuccessful] = useState(false);
  const SERVER_URL = process.env.NEXT_PUBLIC_API_URL || "/api/v1";

  const registerUser = async (
    email: string,
    studentNumber: number,
    name: string,
    nickName: string
  ) => {
    try {
      const payload = {
        email,
        password: "12345678",
        name,
        studentNumber,
        nickname: nickName,
      };
      const response = await fetch(`${SERVER_URL}/login/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (response.ok) {
        await response.text();
        setIsSignUpSuccessful(true);
        setSignUpError(false);
        setSignUpErrorMessage("");
      } else {
        const result = await response.json();
        throw new Error(result?.error || "회원가입 요청 실패");
      }
    } catch (e: any) {
      setSignUpError(true);
      setSignUpErrorMessage(e?.message || "회원가입 중 알 수 없는 오류가 발생했습니다.");
    }
  };

  return { signUpError, signUpErrorMessage, isSignUpSuccessful, registerUser };
}


