"use client";

import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { authApi } from "@/api/auth.api";

type SignUpParams = {
  email: string;
  studentNumber: number;
  name: string;
  nickName: string;
};

function parseSignUpError(err: unknown): string {
  if (err instanceof AxiosError && err.response?.data) {
    const data = err.response.data as { error?: string; message?: string };
    return data.error || data.message || "회원가입 요청 실패";
  }
  return (err as Error).message || "회원가입 중 알 수 없는 오류가 발생했습니다.";
}

export function useSignUp() {
  const mutation = useMutation({
    mutationFn: ({ email, studentNumber, name, nickName }: SignUpParams) =>
      authApi.signup({
        email,
        password: "12345678",
        name,
        studentNumber,
        nickname: nickName,
      }),
  });

  const signUpError = mutation.isError;
  const signUpErrorMessage = mutation.error
    ? parseSignUpError(mutation.error)
    : "";
  const isSignUpSuccessful = mutation.isSuccess;

  const registerUser = async (
    email: string,
    studentNumber: number,
    name: string,
    nickName: string
  ): Promise<boolean> => {
    try {
      await mutation.mutateAsync({ email, studentNumber, name, nickName });
      return true;
    } catch {
      return false;
    }
  };

  return {
    signUpError,
    signUpErrorMessage,
    isSignUpSuccessful,
    registerUser,
  };
}
