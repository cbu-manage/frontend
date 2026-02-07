"use client";
import { useState, useMemo } from "react";
import Link from "next/link";
import InputBox from "@/components/common/InputBox";
import LongBtn from "@/components/common/LongBtn";
import OutlineBtn from "@/components/common/OutlineBtn";
import { useChangePassword } from "@/hooks/auth";

export default function ChangePasswordPage() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const { mutate: changePassword, errorMessage } = useChangePassword();

  const isNewPasswordValid = useMemo(() => {
    const lengthValid = newPassword.length >= 8;
    return lengthValid;
  }, [newPassword]);

  const passwordsMatch = newPassword === confirmPassword && newPassword !== "";
  const isFormValid = currentPassword && isNewPasswordValid && passwordsMatch;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return;
    changePassword(newPassword);
  };

  return (
    <main className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="flex-col w-full max-w-3xl bg-white rounded-4xl p-24">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">비밀번호 변경</h2>
          <p className="text-sm text-gray-600">보안을 위해 비밀번호를 변경해주세요.</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <InputBox
            type="password"
            placeholder="현재 비밀번호를 입력하세요"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            required
          />
          <InputBox
            type="password"
            placeholder="새 비밀번호를 입력하세요"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            errorMessage={errorMessage ?? undefined}
          />
          <div>
            <InputBox
              type="password"
              placeholder="새 비밀번호를 다시 입력하세요"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
            {newPassword && confirmPassword && newPassword !== confirmPassword && (
              <small className="block text-xs mt-4" style={{ color: "#ff4e4e" }}>
                새 비밀번호가 일치하지 않습니다.
              </small>
            )}
            {newPassword && confirmPassword && newPassword === confirmPassword && newPassword.length >= 8 && (
              <small className="block text-xs mt-4" style={{ color: "#95c674" }}>
                ✓ 비밀번호가 일치합니다.
              </small>
            )}
          </div>
          <LongBtn type="submit" disabled={!isFormValid}>
            비밀번호 변경
          </LongBtn>
        </form>
        <div className="mt-8 flex justify-center gap-6">
          <Link href="/">
            <OutlineBtn type="button">취소</OutlineBtn>
          </Link>
        </div>
      </div>
    </main>
  );
}


