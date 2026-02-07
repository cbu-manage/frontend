"use client";

import { useMutation } from "@tanstack/react-query";
import { userApi, type UserInfo } from "@/api/user.api";

type VerifyParams = {
  studentNumber: string;
  nickName: string;
};

export function useVerifyUser() {
  const mutation = useMutation({
    mutationFn: ({ studentNumber, nickName }: VerifyParams) => {
      if (!/^\d{10}$/.test(studentNumber)) {
        throw new Error("학번은 10자리 숫자여야 합니다.");
      }
      return userApi.verify({
        studentNumber: Number(studentNumber),
        nickName,
      });
    },
    onSuccess: () => {
      alert("인증 완료 되었습니다! \n이어서 회원가입을 해주세요!");
    },
    onError: () => {
      alert("인증에 실패하였습니다. \n다시 한 번 확인해주세요.");
    },
  });

  const verificationError = mutation.isError;
  const verificationErrorMessage = mutation.error
    ? (mutation.error as Error).message
    : "";

  const verifyUser = async (
    studentNumber: string,
    nickName: string
  ): Promise<UserInfo | null> => {
    if (!studentNumber || !nickName) {
      alert("이름과 학번을 입력해주세요.");
      return null;
    }

    try {
      const res = await mutation.mutateAsync({ studentNumber, nickName });
      return res.data;
    } catch {
      return null;
    }
  };

  return { verificationError, verificationErrorMessage, verifyUser };
}
