"use client";
import React from "react";
import { type UserInfo } from "@/api";
import { useSignUp } from "@/hooks/auth";
import InputBox from "../common/InputBox";
import { Button } from "@/components/ui/button";

export default function StepTwo({
  user,
  email,
  onCompleted,
}: {
  /** 합격자 인증으로 받아온 정보. 가입 전이라 전역 스토어에 두지 않는다 */
  user: UserInfo | null;
  email: string;
  onCompleted: () => void;
}) {
  const { registerUser } = useSignUp();

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    const emailWithSuffix = email.includes("@")
      ? email
      : `${email}@tukorea.ac.kr`;
    if (!user) {
      alert("합격자 인증 정보가 없습니다. 처음부터 다시 진행해주세요.");
      return;
    }
    const { ok, message } = await registerUser(
      emailWithSuffix,
      user.studentNumber,
      user.name,
      user.nickName,
    );
    if (ok) {
      onCompleted();
    } else {
      alert(message || "회원가입에 실패했습니다.");
    }
  };

  return (
    <form onSubmit={handleJoin} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <InputBox label="이름" value={user?.name ?? ""} disabled />
        <InputBox label="학번" value={user?.studentNumber ?? ""} disabled />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <InputBox label="학과" value={user?.major ?? ""} disabled />
        <InputBox label="학년" value={user?.grade ?? ""} disabled />
      </div>
      <InputBox label="학교 이메일" value={email} disabled />
      <div className="pt-4">
        <Button
          type="submit"
          variant="brand"
          className="w-full h-auto rounded-lg p-4 text-base font-semibold"
        >
          회원가입
        </Button>
      </div>
    </form>
  );
}
