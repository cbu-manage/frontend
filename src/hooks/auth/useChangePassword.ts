"use client";

import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { authApi } from "@/api/auth.api";
import { useUserStore } from "@/store/userStore";

export function useChangePassword() {
  const router = useRouter();
  const setAuthStatus = useUserStore((s) => s.setAuthStatus);

  const mutation = useMutation({
    // 서버는 현재 비밀번호를 대조한 뒤 바꾼다. 새 비밀번호만 보내면 무조건 실패한다.
    mutationFn: (vars: { currentPassword: string; newPassword: string }) =>
      authApi.changePassword(vars),
    // TODO: react-query v6 onSuccess/onError/onSettled deprecation - 마이그레이션 검토
    onSuccess: () => {
      const { isEmailNull } = useUserStore.getState();
      setAuthStatus({ isDefaultPassword: false, isEmailNull });
      alert("비밀번호 변경 완료!");
      router.push("/");
    },
  });

  const mutate = (vars: { currentPassword: string; newPassword: string }) => {
    mutation.mutate(vars);
  };

  return {
    mutate,
    isPending: mutation.isPending,
    errorMessage: mutation.isError
      ? "비밀번호 변경에 실패하였습니다. 다시 시도해주세요."
      : null,
  };
}
