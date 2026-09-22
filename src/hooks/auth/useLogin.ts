"use client";

import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { AxiosError } from "axios";
import { authApi } from "@/api/auth.api";
import { useUserStore } from "@/store/userStore";

type LoginParams = {
  studentId: string;
  password: string;
};

/**
 * 서버는 도메인 코드 + 한국어 메시지를 준다(E-AUTH-0004 사용자 없음 / E-AUTH-0005 비밀번호 불일치).
 * 문구는 바뀔 수 있으니 코드를 먼저 보고, 없으면 상태코드로 판정한다.
 */
function parseLoginError(err: unknown): string {
  if (err instanceof AxiosError && err.response) {
    const { status, data } = err.response;
    const code = (data as { code?: string } | undefined)?.code;

    if (code === "E-AUTH-0004" || status === 404) {
      return "해당 학번의 회원을 찾을 수 없습니다.\n관리자에게 문의해주세요.";
    }
    if (code === "E-AUTH-0005" || status === 401) {
      return "비밀번호가 올바르지 않습니다.\n기억나지 않으면 비밀번호 찾기를 이용해주세요.";
    }

    const msg = (data as { message?: string } | undefined)?.message;
    if (msg) return msg;
  }
  // 형식 검증처럼 우리가 직접 던진 오류는 그대로 보여준다.
  // axios가 만든 영문 메시지(Network Error 등)는 새지 않도록 제외한다.
  if (!(err instanceof AxiosError) && err instanceof Error && err.message) {
    return err.message;
  }
  return "로그인 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.";
}

function safeRedirect(url: string | undefined): string {
  if (url && url.startsWith("/") && !url.startsWith("//")) return url;
  return "/";
}

export function useLogin(redirectUrl?: string) {
  const safeUrl = safeRedirect(redirectUrl);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const router = useRouter();
  const setUser = useUserStore((s) => s.setUser);
  const setAuthStatus = useUserStore((s) => s.setAuthStatus);

  const mutation = useMutation({
    mutationFn: async ({ studentId, password }: LoginParams) => {
      // 회원가입 화면과 형식을 맞춘다. cbu 접두사는 붙여도 되고 안 붙여도 된다
      const digits = String(studentId).trim().replace(/^cbu/i, "");
      if (!/^\d{10}$/.test(digits)) {
        throw new Error("학번은 10자리 숫자로 입력해주세요. (예: 2026000000)");
      }
      const studentNumber = Number(digits);
      const res = await authApi.login({ studentNumber, password });
      return { data: res.data.data, studentNumber, password };
    },
    // TODO: react-query v6 onSuccess/onError/onSettled deprecation - 마이그레이션 검토
    onSuccess: async ({ data, studentNumber, password }) => {
      const loginEmail = data.email === "null" ? null : data.email;
      const isAdmin =
        data.role === "admin" ||
        data.role === "ROLE_ADMIN" ||
        data.role?.toUpperCase().includes("ADMIN");

      if (isAdmin) {
        setUser({
          role: data.role,
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
      const hasValidEmail =
        !!loginEmail && loginEmail.endsWith("@tukorea.ac.kr");
      const isEmailNull = !hasValidEmail;

      setUser({
        role: data.role,
        name: data.name,
        studentNumber,
        email: hasValidEmail ? loginEmail : null,
      });
      setAuthStatus({ isDefaultPassword, isEmailNull });
      setErrorMessage(null);

      if (isEmailNull) {
        router.push("/private");
        return;
      }

      if (isDefaultPassword && !redirectUrl) {
        const shouldChangePassword = window.confirm(
          "기본 비밀번호 사용이 감지되었습니다.\n계정 보호를 위해 비밀번호 변경을 권장합니다.\n변경 페이지로 이동하시겠습니까?",
        );
        router.push(shouldChangePassword ? "/user?tab=password" : safeUrl);
      } else {
        router.push(safeUrl);
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
      mutation.mutate(params);
    },
    [mutation],
  );

  return { errorMessage, isLoggedIn: mutation.isSuccess, handleLogin };
}
