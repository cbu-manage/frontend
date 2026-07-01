"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import ResetPasswordForm, {
  type VerifiedIdentity,
} from "@/components/find-password/ResetPasswordForm";
import ResetCompleteModal from "@/components/find-password/ResetCompleteModal";
import { useResetPassword } from "@/hooks/auth";

// 임시 비밀번호는 고정값. 로그인 시 기본 비밀번호로 인식되어 변경을 유도한다.
const TEMP_PASSWORD = "12345678";

export default function FindPasswordPage() {
  const [issuedStudentNumber, setIssuedStudentNumber] = useState<number | null>(
    null,
  );
  const { resetPassword, isPending } = useResetPassword();

  const handleSubmit = async (identity: VerifiedIdentity) => {
    const { success, message } = await resetPassword({
      ...identity,
      newPassword: TEMP_PASSWORD,
    });
    if (success) {
      setIssuedStudentNumber(identity.studentNumber);
    } else {
      alert(message);
    }
  };

  return (
    <main className="flex items-center justify-center min-h-screen bg-gray-0">
      <div className="w-full max-w-xl px-4">
        <div className="relative mb-4 flex items-center justify-center">
          <Link
            href="/login"
            aria-label="로그인으로 돌아가기"
            className="absolute left-0 p-1 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
          >
            <ChevronLeft className="w-6 h-6" strokeWidth={2} />
          </Link>
          <h2 className="text-2xl font-semibold text-gray-900">
            비밀번호 찾기
          </h2>
        </div>
        <p className="text-center text-sm text-gray-600 mb-8">
          학번과 학교 이메일 인증 후 임시 비밀번호를 발급합니다.
        </p>
        <ResetPasswordForm onSubmit={handleSubmit} isSubmitting={isPending} />
      </div>
      <ResetCompleteModal
        open={issuedStudentNumber !== null}
        studentNumber={issuedStudentNumber ?? 0}
        tempPassword={TEMP_PASSWORD}
      />
    </main>
  );
}
