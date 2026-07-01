"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";

interface ResetCompleteModalProps {
  open: boolean;
  studentNumber: number;
  tempPassword: string;
}

export default function ResetCompleteModal({
  open,
  studentNumber,
  tempPassword,
}: ResetCompleteModalProps) {
  const transformedUserId = `cbu${studentNumber}`;

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="relative w-full max-w-xl bg-white rounded-2xl p-14 shadow-lg">
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
          임시 비밀번호 발급 완료
        </h3>
        <p className="text-center text-base text-gray-600 mb-6">
          아래 임시 비밀번호로 로그인해 주세요!
        </p>
        <div className="space-y-4 mb-6">
          <div className="bg-gray-50 p-4 rounded-lg flex justify-between items-center">
            <span className="text-sm font-medium text-gray-600">아이디</span>
            <span className="text-base font-semibold text-gray-900">
              {transformedUserId}
            </span>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg flex justify-between items-center">
            <span className="text-sm font-medium text-gray-600">
              임시 비밀번호
            </span>
            <span className="text-base font-semibold text-gray-900 tracking-wide">
              {tempPassword}
            </span>
          </div>
          <p className="text-center text-xs text-gray-600">
            로그인 후 빠른 시일 내 비밀번호를 변경하는 것을 권장드립니다!
          </p>
        </div>
        <Link href="/login" className="block">
          <Button
            type="button"
            variant="brand"
            className="w-full h-auto rounded-lg p-4 text-base font-semibold"
          >
            로그인
          </Button>
        </Link>
      </div>
    </div>
  );
}
