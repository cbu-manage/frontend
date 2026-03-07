"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { useUserStore } from "@/store/userStore";

type RequireMemberProps = {
  children: ReactNode;
};

export default function RequireMember({ children }: RequireMemberProps) {
  const name = useUserStore((s) => s.name);
  const [hasChecked, setHasChecked] = useState(false);

  // persist rehydration 대기 - SSR/초기 렌더에서는 name이 비어 있을 수 있음
  useEffect(() => {
    const id = requestAnimationFrame(() => setHasChecked(true));
    return () => cancelAnimationFrame(id);
  }, []);

  const isMember = !!name;

  // persist rehydration 전에는 로딩 표시 (잘못된 "회원만 접근 가능" 방지)
  if (!hasChecked) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">로딩 중...</p>
      </main>
    );
  }

  if (!isMember) {
    return (
      <main className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-[9.375%]">
        <div className="max-w-xl text-center space-y-3">
          <h1 className="text-2xl sm:text-3xl font-semibold text-gray-900">
            회원만 접근 가능한 페이지입니다.
          </h1>
          <p className="text-base text-gray-600">로그인 이후 이용해주세요.</p>
          <Link href="/login">
            <button className="mt-12 inline-flex items-center justify-center rounded-lg bg-brand px-6 py-3 text-sm sm:text-base font-medium text-white hover:opacity-90 transition-opacity">
              로그인 하러 가기
            </button>
          </Link>
        </div>
      </main>
    );
  }

  return <>{children}</>;
}
