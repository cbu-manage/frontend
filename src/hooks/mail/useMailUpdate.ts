"use client";

import { useMutation } from "@tanstack/react-query";
import { mailApi } from "@/api/mail.api";
import { useUserStore } from "@/store/userStore";

export function useMailUpdate(onSuccess?: () => void) {
  const studentNumber = useUserStore((s) => s.studentNumber);
  const updateEmail = useUserStore((s) => s.updateEmail);

  const mutation = useMutation({
    mutationFn: (email: string) =>
      mailApi.update({ studentNumber, email }),
    onSuccess: (_, email) => {
      updateEmail(email);
      alert("📩 이메일이 성공적으로 등록되었습니다!");
      onSuccess?.();
    },
    onError: () => {
      alert("이메일 업데이트에 실패했습니다. 다시 시도해주세요.");
    },
  });

  return mutation;
}
