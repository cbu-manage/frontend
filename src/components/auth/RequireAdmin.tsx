"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { useUserStore } from "@/store/userStore";

type RequireAdminProps = {
  children: ReactNode;
};

export default function RequireAdmin({ children }: RequireAdminProps) {
  const name = useUserStore((s) => s.name);
  const isAdmin = useUserStore((s) => s.isAdmin);
  const [hasChecked, setHasChecked] = useState(false);

  useEffect(() => {
    const id = setTimeout(() => setHasChecked(true), 100);
    return () => clearTimeout(id);
  }, []);

  if (!hasChecked) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">로딩 중...</p>
      </main>
    );
  }

  if (!name) {
    return (
      <main className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-[9.375%]">
        <div className="max-w-xl text-center space-y-3">
          <h1 className="text-2xl sm:text-3xl font-semibold text-gray-900">
            로그인이 필요합니다.
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

  if (!isAdmin) {
    return (
      <main className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-[9.375%]">
        <div className="max-w-xl text-center space-y-3">
          <h1 className="text-2xl sm:text-3xl font-semibold text-gray-900">
            관리자만 접근 가능한 페이지입니다.
          </h1>
          <p className="text-base text-gray-600">
            권한이 없습니다. 관리자 계정으로 로그인해주세요.
          </p>
          <Link href="/">
            <button className="mt-12 inline-flex items-center justify-center rounded-lg bg-brand px-6 py-3 text-sm sm:text-base font-medium text-white hover:opacity-90 transition-opacity">
              홈으로 돌아가기
            </button>
          </Link>
        </div>
      </main>
    );
  }

  return <>{children}</>;
}
