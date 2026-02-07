"use client";
import React from "react";
import { useSignUp } from "@/hooks/auth";
import { useUserStore } from "@/store/userStore";
import InputBox from "../common/InputBox";
import LongBtn from "../common/LongBtn";

export default function StepTwo({
  email,
  onCompleted,
}: {
  email: string;
  onCompleted: () => void;
}) {
  const { registerUser, signUpErrorMessage } = useSignUp();
  const userStore = useUserStore();

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    const emailWithSuffix = email.includes("@")
      ? email
      : `${email}@tukorea.ac.kr`;
    const success = await registerUser(
      emailWithSuffix,
      userStore.studentNumber,
      userStore.name,
      userStore.nickName
    );
    if (success) {
      onCompleted();
    } else if (signUpErrorMessage) {
      alert(signUpErrorMessage);
    } else {
      alert("회원가입에 실패했습니다.");
    }
  };

  return (
    <form onSubmit={handleJoin} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <InputBox
          label="이름"
          value={userStore.name}
          disabled
        />
        <InputBox
          label="학번"
          value={userStore.studentNumber}
          disabled
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <InputBox
          label="학과"
          value={userStore.major}
          disabled
        />
        <InputBox
          label="학년"
          value={userStore.grade}
          disabled
        />
      </div>
      <InputBox
        label="학교 이메일"
        value={email}
        disabled
      />
      <div className="pt-4">
        <LongBtn type="submit">
          회원가입
        </LongBtn>
      </div>
    </form>
  );
}
