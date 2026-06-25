"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { useUserStore } from "@/store/userStore";
import { useCan } from "@/hooks/auth/useCan";
import type { Capability } from "@/lib/permissions";

type RequirePermissionProps = {
  /** 이 페이지 진입에 필요한 capability */
  need: Capability;
  children: ReactNode;
};

/**
 * 페이지 단위 권한 가드 — RequireAdmin의 capability 일반화 버전.
 * 비로그인 → 로그인 안내, 권한 없음 → 접근 불가 안내.
 *
 * ⚠️ UI 게이팅 전용. 실제 접근은 서버가 최종 판정(401/403).
 *
 * @example <RequirePermission need="flag.manage"><FlagManagePage /></RequirePermission>
 */
export default function RequirePermission({
  need,
  children,
}: RequirePermissionProps) {
  const name = useUserStore((s) => s.name);
  const allowed = useCan(need);
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

  if (!allowed) {
    return (
      <main className="min-h-screen bg-gray-50 flex flex-col items-center justify-center container-x">
        <div className="max-w-xl text-center space-y-3">
          <h1 className="text-h1 font-semibold text-gray-900">
            접근 권한이 없는 페이지입니다.
          </h1>
          <p className="text-base text-gray-600">
            권한이 없습니다. 필요한 권한이 있는 계정으로 로그인해주세요.
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
