"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { API_ENDPOINTS } from "@/lib/api";
import { useUserStore } from "@/store/userStore";

type LoginParams = {
  studentId: string;
  password: string;
};

export function useLogin() {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const router = useRouter();
  const setUser = useUserStore((s) => s.setUser);
  const setAuthStatus = useUserStore((s) => s.setAuthStatus);

  const handleLogin = async ({ studentId, password }: LoginParams) => {
    if (!studentId || !password) {
      setErrorMessage("아이디와 비밀번호를 입력하세요.");
      return;
    }

    const studentNumber = Number(String(studentId).replace(/^cbu/, ""));

    try {
      const resp = await fetch(API_ENDPOINTS.LOGIN, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentNumber, password }),
      });

      if (resp.ok) {
        const result = await resp.json();
        const emailValue = result.email === "null" ? null : result.email;

        setUser({
          name: result.name,
          studentNumber,
          email: emailValue,
        });

        setAuthStatus({
          isDefaultPassword: password === "12345678",
          isEmailNull: emailValue === null,
        });

        setIsLoggedIn(true);
        setErrorMessage(null);

        if (password === "12345678" || emailValue === null) {
          router.push("/private");
        } else {
          router.push("/");
        }
      } else {
        let message = "로그인 중 오류가 발생했습니다. 다시 시도해주세요.";
        try {
          const err = await resp.json();
          if (err?.message === "Invalid password") {
            message = "비밀번호가 올바르지 않습니다.\n기억이 나지 않을 시 관리자에게 문의해주세요.";
          } else if (err?.message === "Member isn't exist") {
            message = "해당 멤버가 존재하지 않습니다.\n관리자에게 문의해주세요.";
          }
        } catch {}
        setErrorMessage(message);
        setIsLoggedIn(false);
      }
    } catch (e) {
      setErrorMessage("로그인 중 네트워크 오류가 발생했습니다. 다시 시도해주세요.");
      setIsLoggedIn(false);
    }
  };

  return { errorMessage, isLoggedIn, handleLogin };
}


