"use client";

import { useUserStore } from "@/store/userStore";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useCallback, useState } from "react";
import Sidebar from "@/components/shared/Sidebar";
import ChangePasswordSection from "@/components/user/ChangePasswordSection";

const USER_MENU_ITEMS = [
  { label: "내 정보", value: "profile" },
  { label: "비밀번호 수정", value: "password" },
  { label: "내 작성글", value: "posts" },
] as const;

type UserMenuValue = (typeof USER_MENU_ITEMS)[number]["value"];

export default function UserPageClient() {
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab");
  const [selectedMenu, setSelectedMenu] = useState<UserMenuValue>(() => {
    if (tabParam === "password" || tabParam === "posts") {
      return tabParam as UserMenuValue;
    }
    return "profile";
  });

  // Zustand selector에서 매 렌더마다 새로운 객체를 만들면
  // React(useSyncExternalStore)가 무한 루프 경고를 낼 수 있으므로
  // 전체 상태를 그대로 가져와 구조 분해만 사용한다.
  const user = useUserStore();

  const handleSelect = useCallback((value: string) => {
    setSelectedMenu(value as UserMenuValue);
  }, []);

  if (!user.name) {
    return (
      <main className="min-h-screen bg-white">
        <div className="px-[9.375%] py-16">
          <div className="max-w-2xl">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8">
              사용자 정보
            </h1>
            <div className="text-center py-16">
              <p className="text-gray-600 mb-6">
                로그인 후 사용자 정보를 확인하세요.
              </p>
              <Link href="/login">
                <button className="px-6 py-3 bg-brand text-white rounded-lg font-medium hover:opacity-90 transition-opacity">
                  로그인하기
                </button>
              </Link>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white">
      <div className="flex">
        <Sidebar
          items={USER_MENU_ITEMS}
          selected={selectedMenu}
          onSelect={handleSelect}
        />
        {/* 고정 사이드바(w-80) 오른쪽으로 컨텐츠를 밀기 위해 ml-80 사용 */}
        <div className="flex-1 ml-80 pl-16 pr-16 py-16">
          {selectedMenu === "profile" && (
            <div className="max-w-2xl">
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8">
                사용자 정보
              </h1>
              <div className="space-y-6">
                <div className="bg-gray-50 rounded-lg p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">
                    기본 정보
                  </h2>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-gray-600">이름</p>
                      <p className="text-base font-medium text-gray-900">
                        {user.name}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">학번</p>
                      <p className="text-base font-medium text-gray-900">
                        {user.studentNumber}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">닉네임</p>
                      <p className="text-base font-medium text-gray-900">
                        {user.nickName}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">
                    학적 정보
                  </h2>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-gray-600">학년</p>
                      <p className="text-base font-medium text-gray-900">
                        {user.grade}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">전공</p>
                      <p className="text-base font-medium text-gray-900">
                        {user.major}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">
                    연락처
                  </h2>
                  <div>
                    <p className="text-sm text-gray-600">이메일</p>
                    <p className="text-base font-medium text-gray-900">
                      {user.email || "등록되지 않음"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {selectedMenu === "password" && <ChangePasswordSection />}

          {selectedMenu === "posts" && (
            <div className="max-w-2xl">
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8">
                내 작성글
              </h1>
              <p className="text-gray-600">
                내가 작성한 글 목록이 여기에 표시됩니다.
              </p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

