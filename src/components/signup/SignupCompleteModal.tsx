"use client";

import Link from "next/link";
import Image from "next/image";
import { X } from "lucide-react";
import { useUserStore } from "@/store/userStore";
import LongBtn from "@/components/common/LongBtn";

interface SignupCompleteModalProps {
  open: boolean;
  onClose?: () => void;
}

export default function SignupCompleteModal({ open, onClose }: SignupCompleteModalProps) {
  const userStore = useUserStore();
  const transformedUserId = `cbu${userStore.studentNumber}`;
  const defaultPassword = "12345678";

  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-xl bg-white rounded-2xl p-14 shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <Link
          href="/"
          className="absolute right-4 top-4 p-1 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors"
          onClick={onClose}
        >
          <X className="w-7 h-7" strokeWidth={2} />
        </Link>
        <div className="flex justify-center">
          <Image
            src="/assets/originowl.svg"
            alt="씨부엉 로고"
            width={80}
            height={80}
            className="w-20 h-20 object-contain"
          />
        </div>
        <h3 className="text-xl font-bold text-center text-gray-900 mb-2">
          회원정보 안내
        </h3>
        <p className="text-center text-base text-gray-600 mb-6">
          씨부엉 동아리의 회원이 되신 것을 축하드립니다!
        </p>
        <div className="space-y-4 mb-6">
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
          <p className="text-center text-xs text-gray-600">
            초기 비밀번호를 빠른 시일 내 변경하는 것을 권장드립니다!
          </p>
        </div>
        <div className="flex gap-5">
          <Link
            href="/user?tab=password"
            className="flex-1 min-w-0"
            onClick={onClose}
          >
            <button
              type="button"
              className="w-full rounded-lg p-4 font-semibold bg-gray-0 border border-brand text-brand hover:opacity-90 active:opacity-80 transition-all duration-200"
            >
              비밀번호 변경
            </button>
          </Link>
          <Link href="/login" className="flex-1 min-w-0" onClick={onClose}>
            <LongBtn type="button" className="w-full">
              로그인
            </LongBtn>
          </Link>
        </div>
      </div>
    </div>
  );
}
