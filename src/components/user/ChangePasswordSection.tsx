"use client";

import { useState, useMemo } from "react";
import InputBox from "@/components/common/InputBox";
import LongBtn from "@/components/common/LongBtn";

import { useChangePassword } from "@/hooks/auth";

export default function ChangePasswordSection() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const { mutate: changePassword, errorMessage } = useChangePassword();

  const isNewPasswordValid = useMemo(() => {
    if (newPassword.length < 8) return false;
    const hasLetter = /[a-zA-Z]/.test(newPassword);
    const hasNumber = /[0-9]/.test(newPassword);
    return hasLetter && hasNumber;
  }, [newPassword]);
  const passwordsMatch = newPassword === confirmPassword && newPassword !== "";
  const isFormValid = currentPassword && isNewPasswordValid && passwordsMatch;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return;
    changePassword(newPassword);
  };

  const handleCancel = () => {
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
  };

  return (
    <div className="flex justify-center">
      <div className="w-full max-w-xl bg-white rounded-2xl border border-gray-200 shadow-sm px-14 py-12">
        {/* 제목 */}
        <h2 className="text-2xl font-bold text-gray-900 text-center mb-10">
          비밀번호 변경
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <InputBox
            type="password"
            placeholder="현재 비밀번호"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            required
          />
          <InputBox
            type="password"
            placeholder="새 비밀번호"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            errorMessage={errorMessage ?? undefined}
          />
          {newPassword && !isNewPasswordValid && (
            <small className="block text-xs" style={{ color: "#ff4e4e" }}>
              8자 이상, 영문과 숫자를 조합해 입력해주세요.
            </small>
          )}
          <div>
            <InputBox
              type="password"
              placeholder="새 비밀번호 확인"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
            {newPassword &&
              confirmPassword &&
              newPassword !== confirmPassword && (
                <small
                  className="block text-xs mt-4"
                  style={{ color: "#ff4e4e" }}
                >
                  새 비밀번호가 일치하지 않습니다.
                </small>
              )}
            {newPassword &&
              confirmPassword &&
              newPassword === confirmPassword &&
              isNewPasswordValid && (
                <small
                  className="block text-xs mt-4"
                  style={{ color: "#95c674" }}
                >
                  ✓ 비밀번호가 일치합니다.
                </small>
              )}
          </div>

          {/* 버튼 영역 - 세로 배치 */}
          <div className="flex flex-col gap-3 pt-6">
            <LongBtn type="submit" disabled={!isFormValid} className="text-lg">
              확인
            </LongBtn>
            <button
              type="button"
              onClick={handleCancel}
              className="w-full p-4 rounded-lg bg-white border border-[#95c674] text-[#95c674] text-lg font-semibold hover:bg-green-50 transition-colors"
            >
              취소
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
