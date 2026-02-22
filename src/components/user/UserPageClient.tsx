"use client";

import { useUserStore } from "@/store/userStore";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { useCallback, useState } from "react";
import Sidebar from "@/components/shared/Sidebar";
import ChangePasswordSection from "@/components/user/ChangePasswordSection";
import MyPostsSection from "@/components/user/MyPostsSection";
import InputBox from "@/components/common/InputBox";

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
      <main className="min-h-screen bg-gray-50">
        <div className="py-16">
          <div className="max-w-2xl">
            <h1 className="text-4xl font-bold text-gray-900 mb-8">
              내 정보
            </h1>
            <div className="text-center py-16">
              <p className="text-gray-600 mb-6">
                로그인 후 내 정보를 확인하세요.
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
    <main className={`min-h-screen bg-gray-50`}>
      <div className="flex py-12">
        <Sidebar
          items={USER_MENU_ITEMS}
          selected={selectedMenu}
          onSelect={handleSelect}
        />
        <div className="flex-1 ml-[calc(9.375vw+240px)] pl-16 pr-[9.375%] min-w-0">
          {selectedMenu === "profile" && (
            <div className="flex justify-center">
              <div className="w-full max-w-2xl bg-white rounded-2xl border border-gray-200 shadow-sm px-14 py-12">
                <div className="flex flex-col items-center text-center mb-10">
                  <Image
                    src="/assets/originowl.svg"
                    alt="씨부엉"
                    width={64}
                    height={64}
                    className="mb-4"
                  />
                  <h2 className="text-2xl font-bold text-gray-900">
                    내 정보
                  </h2>
                </div>
                <form className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <InputBox
                      label="이름"
                      value={user.name}
                      disabled
                    />
                    <InputBox
                      label="학번"
                      value={String(user.studentNumber)}
                      disabled
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <InputBox
                      label="학과"
                      value={user.major}
                      disabled
                    />
                    <InputBox
                      label="학년"
                      value={user.grade}
                      disabled
                    />
                  </div>
                  <InputBox
                    label="학교 이메일"
                    value={user.email || "등록되지 않음"}
                    disabled
                  />
                </form>
                <div className="flex justify-end mt-8 pt-6 border-t border-gray-100">
                  <button
                    type="button"
                    className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
                  >
                    탈퇴하기
                  </button>
                </div>
              </div>
            </div>
          )}

          {selectedMenu === "password" && <ChangePasswordSection />}

          {selectedMenu === "posts" && <MyPostsSection />}
        </div>
      </div>
    </main>
  );
}

