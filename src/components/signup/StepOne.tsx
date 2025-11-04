"use client";
import { useState } from "react";
import { useVerifyUser, type UserInfo } from "@/hooks/useVerifyUser";
import { useUserStore } from "@/store/userStore";

export default function StepOne({ onVerified }: { onVerified: (data: UserInfo) => void }) {
  const [studentNumber, setStudentNumber] = useState("");
  const [nickName, setNickName] = useState("");
  const { verifyUser } = useVerifyUser();
  const setUser = useUserStore((s) => s.setUser);

  const handleUserVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await verifyUser(studentNumber, nickName);
    if (result) {
      setUser(result);
      onVerified(result);
    }
  };

  return (
    <form onSubmit={handleUserVerification} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">학번</label>
        <input
          className="w-full rounded-lg border px-3 py-2 outline-none"
          placeholder="학번을 입력하세요"
          value={studentNumber}
          onChange={(e) => setStudentNumber(e.target.value)}
          required
        />
      </div>
      <div className="flex gap-4">
        <div className="flex-1">
          <label className="block text-sm font-medium mb-1">지원 시 닉네임</label>
          <input
            className="w-full rounded-lg border px-3 py-2 outline-none"
            placeholder="지원 시 구글폼에 입력한 본인의 닉네임을 적어주세요"
            value={nickName}
            onChange={(e) => setNickName(e.target.value)}
          />
        </div>
        <div className="flex items-end">
          <button
            type="submit"
            className="w-full rounded-lg bg-zinc-900 text-white py-2 px-4 whitespace-nowrap"
          >
            합격자 확인
          </button>
        </div>
      </div>
    </form>
  );
}


