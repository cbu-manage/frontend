"use client";

import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { authApi, type LoginResponse } from "@/api/auth.api";
import { memberApi } from "@/api";
import { useAuthStore } from "@/store/authStore";
import { useUserStore } from "@/store/userStore";
import { setCookie } from "@/lib/cookie";
import { AxiosError } from "axios";

function decodeTokenPayload(token: string): Record<string, unknown> | null {
  try {
    return JSON.parse(atob(token.split(".")[1]));
  } catch {
    return null;
  }
}

type LoginParams = {
  studentId: string;
  password: string;
};

function parseLoginError(err: unknown): string {
  if (err instanceof AxiosError && err.response?.data) {
    const msg = (err.response.data as { message?: string })?.message;
    if (msg === "Invalid password") {
      return "비밀번호가 올바르지 않습니다.\n기억이 나지 않을 시 관리자에게 문의해주세요.";
    }
    if (msg === "Member isn't exist") {
      return "해당 멤버가 존재하지 않습니다.\n관리자에게 문의해주세요.";
    }
  }
  return "로그인 중 오류가 발생했습니다. 다시 시도해주세요.";
}

export function useLogin() {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const router = useRouter();
  const setUser = useUserStore((s) => s.setUser);
  const setAuthStatus = useUserStore((s) => s.setAuthStatus);
  const setAccessToken = useAuthStore((s) => s.setAccessToken);

  const mutation = useMutation({
    mutationFn: async ({ studentId, password }: LoginParams) => {
      const studentNumber = Number(String(studentId).replace(/^cbu/, ""));
      const res = await authApi.login({ studentNumber, password });
      return { data: res.data, studentNumber, password } as {
        data: LoginResponse;
        studentNumber: number;
        password: string;
      };
    },
    // TODO: react-query v6 onSuccess/onError/onSettled deprecation - 마이그레이션 검토
    onSuccess: async ({ data, studentNumber, password }) => {
      if (data.accessToken) {
        setAccessToken(data.accessToken);
        setCookie("ACCESS_TOKEN", data.accessToken);
      }

      const loginEmail = data.email === "null" ? null : data.email;
      const tokenPayload = data.accessToken
        ? decodeTokenPayload(data.accessToken)
        : null;
      const permissions = Array.isArray(tokenPayload?.permissions)
        ? (tokenPayload.permissions as string[])
        : [];
      const isAdmin = permissions.includes("admin");

      if (isAdmin) {
        setUser({
          name: data.name,
          studentNumber,
          email: loginEmail,
          isAdmin: true,
        });
        setErrorMessage(null);
        router.push("/");
        return;
      }

      const isDefaultPassword =
        password === "12345678" || password === "11111111";

      let emailValue: string | null = null;
      if (loginEmail && loginEmail.endsWith("@tukorea.ac.kr")) {
        emailValue = loginEmail;
      }

      if (!emailValue && tokenPayload) {
        const userId = (tokenPayload.user_id as number) ?? null;
        if (userId) {
          try {
            const memberRes = await memberApi.getById(userId);
            const raw = memberRes?.data as Record<string, unknown> | undefined;
            const memberData = (raw && "data" in raw ? raw.data : raw) as
              | { email?: string }
              | undefined;
            const memberEmail = memberData?.email;
            if (memberEmail && memberEmail.endsWith("@tukorea.ac.kr")) {
              emailValue = memberEmail;
            }
          } catch {
            // 멤버 정보 조회 실패 시 무시
          }
        }
      }

      const isEmailNull = !emailValue;

      setUser({
        name: data.name,
        studentNumber,
        email: emailValue,
      });
      setAuthStatus({
        isDefaultPassword,
        isEmailNull,
      });
      setErrorMessage(null);

      if (isEmailNull) {
        router.push("/private");
        return;
      }

      if (isDefaultPassword) {
        const shouldChangePassword = window.confirm(
          "기본 비밀번호 사용이 감지되었습니다.\n계정 보호를 위해 비밀번호 변경을 권장합니다.\n변경 페이지로 이동하시겠습니까?",
        );
        router.push(shouldChangePassword ? "/user?tab=password" : "/");
      } else {
        router.push("/");
      }
    },
    onError: (err) => {
      setErrorMessage(parseLoginError(err));
    },
  });

  const handleLogin = useCallback(
    (params: LoginParams) => {
      if (!params.studentId || !params.password) {
        setErrorMessage("아이디와 비밀번호를 입력하세요.");
        return;
      }
      if (!/^cbu\d+$/.test(params.studentId)) {
        alert("아이디를 다시 확인해주세요!");
        return;
      }
      mutation.mutate(params);
    },
    [mutation],
  );

  return { errorMessage, isLoggedIn: mutation.isSuccess, handleLogin };
}
