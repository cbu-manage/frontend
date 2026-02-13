"use client";

import Link from "next/link";
import Image from "next/image";
import { useUserStore } from "@/store/userStore";
import LongBtn from "@/components/common/LongBtn";
import OutlineBtn from "@/components/common/OutlineBtn";

export default function SignupCompleteModal({ open }: { open: boolean }) {
  const userStore = useUserStore();
  const transformedUserId = `cbu${userStore.studentNumber}`;
  const defaultPassword = "12345678";

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-3xl bg-white rounded-4xl p-24 shadow-lg">
        <div className="flex justify-center mb-8">
          <Image
            src="/assets/logo.png"
            alt="씨부엉 로고"
            width={80}
            height={80}
            style={{ width: "auto", height: "auto" }}
          />
        </div>
        <h3 className="text-2xl font-bold text-center text-gray-900 mb-2">
          회원가입 완료
        </h3>
        <p className="text-center text-base text-gray-600 mb-8">
          씨부엉 동아리의 회원이 되신 것을 축하드립니다!
        </p>
        <div className="space-y-4 mb-8">
          <div className="bg-gray-50 p-4 rounded-lg flex justify-between items-center">
            <span className="text-sm font-medium text-gray-600">아이디</span>
            <span className="text-base font-semibold text-gray-900">
              {transformedUserId}
            </span>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg flex justify-between items-center">
            <span className="text-sm font-medium text-gray-600">비밀번호</span>
            <span className="text-base font-semibold text-gray-900">
              {defaultPassword}
            </span>
          </div>
          <p className="text-center text-xs text-gray-600 mt-2">
            초기 비밀번호를 빠른 시일 내 변경하는 것을 권장드립니다!
          </p>
        </div>
        <div className="flex gap-6 justify-center">
          <Link href="/user?tab=password" className="flex-1 max-w-[200px]">
            <OutlineBtn type="button" className="w-full">
              비밀번호 변경
            </OutlineBtn>
          </Link>
          <Link href="/login" className="flex-1 max-w-[200px]">
            <LongBtn type="button" className="w-full">
              로그인
            </LongBtn>
          </Link>
        </div>
      </div>
    </div>
  );
}
