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

/**
 * 서버가 무엇이 중복인지 도메인 코드로 구분해준다.
 * E-COMMON-0003은 코드 분리 이전 응답이라 구분이 안 되므로 뭉뚱그린 안내를 유지한다.
 */
function parseSignUpError(err: unknown): string {
  if (err instanceof AxiosError && err.response) {
    const { status, data } = err.response;
    const code = (data as { code?: string } | undefined)?.code;

    if (code === "E-AUTH-0009") {
      return "이미 사용 중인 이메일이에요.\n다른 학교 이메일을 입력해주세요.";
    }
    if (code === "E-AUTH-0010") {
      return "이미 가입된 학번이에요.\n로그인하거나 관리자에게 문의해주세요.";
    }
    if (code === "E-COMMON-0003" || status === 409) {
      return "이미 가입에 사용된 정보예요.\n다른 학교 이메일을 입력하거나 관리자에게 문의해주세요.";
    }

    const body = data as { error?: string; message?: string } | undefined;
    return body?.error || body?.message || "회원가입 요청에 실패했습니다.";
  }
  return (
    (err as Error).message || "회원가입 중 알 수 없는 오류가 발생했습니다."
  );
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

  /**
   * 성공 여부와 실패 사유를 함께 돌려준다.
   * mutation.error는 이 함수가 반환하는 시점에 아직 갱신 전이라, 호출부가 그걸 읽으면 사유를 놓친다.
   */
  const registerUser = async (
    email: string,
    studentNumber: number,
    name: string,
    nickName: string,
  ): Promise<{ ok: boolean; message: string }> => {
    try {
      await mutation.mutateAsync({ email, studentNumber, name, nickName });
      return { ok: true, message: "" };
    } catch (err) {
      return { ok: false, message: parseSignUpError(err) };
    }
  };

  return {
    signUpError,
    signUpErrorMessage,
    isSignUpSuccessful,
    registerUser,
  };
}
