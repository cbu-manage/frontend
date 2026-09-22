"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { useUserStore } from "@/store/userStore";

type RequireStaffProps = {
  children: ReactNode;
};

/**
 * 운영진(ROLE_USER 외) 전용 게이트.
 * 관리자 페이지는 운영진 서브롤도 접근하되, 안에서 권한별로 메뉴가 갈린다(useCan).
 * ⚠️ UI 게이팅용 — 실제 접근 통제는 서버가 최종 판정.
 */
export default function RequireStaff({ children }: RequireStaffProps) {
  const name = useUserStore((s) => s.name);
  const role = useUserStore((s) => s.role);
  const isAdmin = useUserStore((s) => s.isAdmin);
  const [hasChecked, setHasChecked] = useState(false);

  useEffect(() => {
    const id = setTimeout(() => setHasChecked(true), 100);
    return () => clearTimeout(id);
  }, []);

  // 운영진(ROLE_USER 외) 또는 관리자. role 누락 대비 isAdmin 폴백.
  const isStaff = isAdmin || (!!role && role !== "ROLE_USER");

  if (!hasChecked) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">로딩 중...</p>
      </main>
    );
  }

  if (!name) {
    return (
      <main className="min-h-screen bg-gray-50 flex flex-col items-center justify-center container-x">
        <div className="max-w-xl text-center space-y-3">
          <h1 className="text-h1 font-semibold text-gray-900">
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

  if (!isStaff) {
    return (
      <main className="min-h-screen bg-gray-50 flex flex-col items-center justify-center container-x">
        <div className="max-w-xl text-center space-y-3">
          <h1 className="text-h1 font-semibold text-gray-900">
            운영진만 접근 가능한 페이지입니다.
          </h1>
          <p className="text-base text-gray-600">접근 권한이 없습니다.</p>
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
