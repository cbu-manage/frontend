"use client";

import { useMutation } from "@tanstack/react-query";
import { authApi, type ResetPasswordRequest } from "@/api/auth.api";

export function useResetPassword() {
  const mutation = useMutation({
    mutationFn: (data: ResetPasswordRequest) => authApi.resetPassword(data),
  });

  const resetPassword = async (
    data: ResetPasswordRequest,
  ): Promise<{ success: boolean; message: string }> => {
    try {
      await mutation.mutateAsync(data);
      return { success: true, message: "" };
    } catch (err) {
      const message = (err as { response?: { data?: { message?: string } } })
        ?.response?.data?.message;
      return {
        success: false,
        message:
          message || "비밀번호 재설정에 실패했습니다. 다시 시도해주세요.",
      };
    }
  };

  return {
    resetPassword,
    isPending: mutation.isPending,
  };
}
