"use client";
import Link from "next/link";
import Image from "next/image";
import { useUserStore } from "@/store/userStore";

export default function SignupCompleteModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const userStore = useUserStore();
  const transformedUserId = `cbu${userStore.studentNumber}`;
  const defaultPassword = "12345678";

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-[550px] rounded-xl bg-white p-6 shadow-lg border-2 border-zinc-200">
        <h3 className="text-xl font-bold text-center mb-2">회원가입 완료</h3>
        <p className="text-center text-base mb-6">씨부엉 동아리의 회원이 되신 것을 축하드립니다!</p>
        <div className="space-y-4 mb-4 relative">
          <div className="bg-zinc-100 p-3.5 rounded-xl flex justify-between items-center relative z-[15]">
            <span className="font-bold text-base text-zinc-600">아이디</span>
            <span className="font-bold text-base text-zinc-900">{transformedUserId}</span>
            <Image src="/assets/owl2.svg" alt="올빼미" width={60} height={60} className="absolute right-[-15px] top-10 rotate-[10deg] z-0" />
          </div>
          <div className="bg-zinc-100 p-3.5 rounded-xl flex justify-between items-center relative z-[15]">
            <span className="font-bold text-base text-zinc-600">비밀번호</span>
            <span className="font-bold text-base text-zinc-900">{defaultPassword}</span>
            <Image src="/assets/owl1.svg" alt="올빼미" width={60} height={60} className="absolute left-[-20px] top-[100px] z-0" />
          </div>
          <p className="text-center text-xs text-zinc-600 mt-2">
            초기 비밀번호를 빠른 시일 내 변경하는 것을 권장드립니다!
          </p>
        </div>
        <div className="flex gap-3">
          <Link href="/private" className="flex-1 rounded-lg border border-zinc-400 text-zinc-700 px-4 py-2 text-center font-bold">
            비밀번호 변경
          </Link>
          <Link href="/login" className="flex-1 rounded-lg bg-green-600 text-white px-4 py-2 text-center font-bold">
            로그인
          </Link>
        </div>
      </div>
    </div>
  );
}


