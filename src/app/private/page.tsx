"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUserStore } from "@/store/userStore";
import AddMail from "@/components/AddMail";

export default function PrivateGuidePage() {
  const router = useRouter();
  const { isEmailNull, isDefaultPassword, emailUpdated } = useUserStore((s) => ({
    isEmailNull: s.isEmailNull,
    isDefaultPassword: s.isDefaultPassword,
    emailUpdated: s.emailUpdated,
  }));

  // 이메일 등록 완료 후 비밀번호 상태에 따라 다음 단계로 이동
  useEffect(() => {
    if (!isEmailNull && emailUpdated) {
      if (isDefaultPassword) {
        const shouldChangePassword = window.confirm(
          "기본 비밀번호 사용이 감지되었습니다.\n계정 보호를 위해 비밀번호 변경을 권장합니다.\n변경 페이지로 이동하시겠습니까?"
        );
        router.push(shouldChangePassword ? "/user?tab=password" : "/");
      } else {
        router.push("/");
      }
    }
  }, [isEmailNull, isDefaultPassword, emailUpdated, router]);

  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-4xl">
        {isEmailNull ? (
          <div className="flex justify-center">
            <AddMail />
          </div>
        ) : (
          <div className="text-center text-sm text-zinc-600">
            이메일이 등록되어 있습니다. 변경이 불가능합니다.
          </div>
        )}
      </div>
    </main>
  );
}

