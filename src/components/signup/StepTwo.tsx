"use client";
import { useState } from "react";
import { useSignUp } from "@/hooks/useSignUp";
import { useVerifyEmail } from "@/hooks/useVerifyEmail";
import { useUserStore } from "@/store/userStore";

export default function StepTwo({
  onCompleted,
}: {
  onCompleted: () => void;
}) {
  const [studentEmail, setStudentEmail] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [isJoinEnabled, setIsJoinEnabled] = useState(false);
  const { registerUser, isSignUpSuccessful } = useSignUp();
  const { isVerificationSent, sendEmailToServer, verifyCodeWithServer } = useVerifyEmail();
  const userStore = useUserStore();

  const handleEmailVerification = async () => {
    const success = await sendEmailToServer(studentEmail);
    if (success) {
      alert("메일이 전송되었습니다!\n인증번호를 입력해주세요!");
    }
  };

  const handleCodeVerification = async () => {
    if (!verificationCode) {
      alert("인증번호를 입력해주세요.");
      return;
    }
    const result = await verifyCodeWithServer(studentEmail, verificationCode);
    if (result.success) {
      setIsJoinEnabled(true);
    } else {
      setIsJoinEnabled(false);
    }
  };

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isVerificationSent) {
      alert("이메일 인증을 완료해주세요!");
      return;
    }
    const emailWithSuffix = studentEmail.includes("@")
      ? studentEmail
      : `${studentEmail}@tukorea.ac.kr`;
    await registerUser(
      emailWithSuffix,
      userStore.studentNumber,
      userStore.name,
      userStore.nickName
    );
    if (isSignUpSuccessful) {
      onCompleted();
    } else {
      alert("회원가입에 실패했습니다.");
    }
  };

  return (
    <form onSubmit={handleJoin} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">이름</label>
          <input
            className="w-full rounded-lg border px-3 py-2 outline-none bg-zinc-50"
            value={userStore.name}
            disabled
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">학번</label>
          <input
            className="w-full rounded-lg border px-3 py-2 outline-none bg-zinc-50"
            value={userStore.studentNumber}
            disabled
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">학과</label>
          <input
            className="w-full rounded-lg border px-3 py-2 outline-none bg-zinc-50"
            value={userStore.major}
            disabled
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">학년</label>
          <input
            className="w-full rounded-lg border px-3 py-2 outline-none bg-zinc-50"
            value={userStore.grade}
            disabled
          />
        </div>
      </div>
      <div className="flex gap-4">
        <div className="flex-1">
          <label className="block text-sm font-medium mb-1">이메일</label>
          <input
            className="w-full rounded-lg border px-3 py-2 outline-none"
            placeholder="학교 이메일을 입력해주세요."
            value={studentEmail}
            onChange={(e) => setStudentEmail(e.target.value)}
            required
          />
        </div>
        <div className="flex items-end">
          <button
            type="button"
            onClick={handleEmailVerification}
            className="w-full rounded-lg bg-zinc-900 text-white py-2 px-4 whitespace-nowrap"
          >
            이메일 인증
          </button>
        </div>
      </div>
      {isVerificationSent && (
        <div className="flex gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium mb-1">인증번호</label>
            <input
              className="w-full rounded-lg border px-3 py-2 outline-none"
              placeholder="인증번호를 입력하세요"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value)}
              required
            />
          </div>
          <div className="flex items-end">
            <button
              type="button"
              onClick={handleCodeVerification}
              className="w-full rounded-lg bg-zinc-900 text-white py-2 px-4 whitespace-nowrap"
            >
              인증하기
            </button>
          </div>
        </div>
      )}
      <button
        type="submit"
        disabled={!isJoinEnabled}
        className="w-full rounded-lg bg-zinc-900 text-white py-2 disabled:bg-zinc-300 disabled:cursor-not-allowed"
      >
        회원가입
      </button>
    </form>
  );
}


