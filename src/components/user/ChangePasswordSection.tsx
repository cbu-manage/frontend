"use client";

import { useState, useMemo } from "react";
import InputBox from "@/components/common/InputBox";
import LongBtn from "@/components/common/LongBtn";
import OutlineBtn from "@/components/common/OutlineBtn";
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
    <div className="max-w-2xl">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">비밀번호 변경</h2>
        <p className="text-sm text-gray-600">
          보안을 위해 비밀번호를 변경해주세요.
        </p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
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
        {newPassword && !isNewPasswordValid && (
          <small className="block text-xs mb-4" style={{ color: "#ff4e4e" }}>
            8자 이상, 영문과 숫자를 조합해 입력해주세요.
          </small>
        )}
        <div>
          <InputBox
            type="password"
            placeholder="새 비밀번호를 다시 입력하세요"
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
        <div className="flex gap-4 mt-12">
          <LongBtn type="submit" disabled={!isFormValid} className="flex-1">
            비밀번호 변경
          </LongBtn>
          <OutlineBtn type="button" onClick={handleCancel} className="flex-1">
            취소
          </OutlineBtn>
        </div>
      </form>
    </div>
  );
}
