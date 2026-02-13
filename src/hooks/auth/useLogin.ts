"use client";

import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { authApi, type LoginResponse } from "@/api/auth.api";
import { useUserStore } from "@/store/userStore";
import { AxiosError } from "axios";

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
    onSuccess: ({ data, studentNumber, password }) => {
      const emailValue = data.email === "null" ? null : data.email;

      setUser({
        name: data.name,
        studentNumber,
        email: emailValue,
      });
      setAuthStatus({
        isDefaultPassword: password === "1234",
        isEmailNull: emailValue === null,
      });
      setErrorMessage(null);

      if (password === "1234") {
        const shouldChangePassword = window.confirm(
          "기본 비밀번호 사용이 감지되었습니다.\n계정 보호를 위해 비밀번호 변경을 권장합니다.\n변경 페이지로 이동하시겠습니까?"
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
      mutation.mutate(params);
    },
    [mutation]
  );

  return { errorMessage, isLoggedIn: mutation.isSuccess, handleLogin };
}
