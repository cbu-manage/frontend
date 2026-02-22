"use client";

import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { authApi } from "@/api/auth.api";
import { useUserStore } from "@/store/userStore";

export function useChangePassword() {
  const router = useRouter();
  const studentNumber = useUserStore((s) => s.studentNumber);
  const setAuthStatus = useUserStore((s) => s.setAuthStatus);

  const mutation = useMutation({
    mutationFn: (newPassword: string) =>
      authApi.changePassword({ studentNumber, password: newPassword }),
    onSuccess: () => {
      const { isEmailNull } = useUserStore.getState();
      setAuthStatus({ isDefaultPassword: false, isEmailNull });
      alert("비밀번호 변경 완료!");
      router.push("/");
    },
  });

  const mutate = (newPassword: string) => {
    mutation.mutate(newPassword);
  };

  return {
    mutate,
    isPending: mutation.isPending,
    errorMessage: mutation.isError ? "비밀번호 변경에 실패하였습니다. 다시 시도해주세요." : null,
  };
}
