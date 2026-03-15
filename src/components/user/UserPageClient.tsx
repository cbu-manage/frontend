"use client";

import { useUserStore } from "@/store/userStore";
import { useAuthStore } from "@/store/authStore";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { useCallback, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Sidebar from "@/components/shared/Sidebar";
import ChangePasswordSection from "@/components/user/ChangePasswordSection";
import MyPostsSection from "@/components/user/MyPostsSection";
import MyApplicationsSection from "@/components/user/MyApplicationsSection";
import InputBox from "@/components/common/InputBox";
import { memberApi } from "@/api";

function getUserIdFromToken(token: string | null): number | null {
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.user_id ?? null;
  } catch {
    return null;
  }
}

const USER_MENU_ITEMS = [
  { label: "내 정보", value: "profile" },
  { label: "비밀번호 수정", value: "password" },
  { label: "내 작성글", value: "posts" },
  { label: "나의 신청 목록", value: "applications" },
] as const;

type UserMenuValue = (typeof USER_MENU_ITEMS)[number]["value"];

export default function UserPageClient() {
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab");
  const [selectedMenu, setSelectedMenu] = useState<UserMenuValue>(() => {
    if (
      tabParam === "password" ||
      tabParam === "posts" ||
      tabParam === "applications"
    ) {
      return tabParam as UserMenuValue;
    }
    return "profile";
  });

  const user = useUserStore();
  const accessToken = useAuthStore((s) => s.accessToken);
  const userId = getUserIdFromToken(accessToken);

  const { data: memberRes } = useQuery({
    queryKey: ["member", userId],
    queryFn: () => memberApi.getById(userId!),
    enabled: !!userId,
  });

  const raw = memberRes?.data as Record<string, unknown> | undefined;
  const memberData = (raw && "data" in raw ? raw.data : raw) as
    | {
        name?: string;
        studentNumber?: number;
        major?: string;
        grade?: string;
        generation?: number;
        email?: string;
      }
    | undefined;

  const profile = {
    name: memberData?.name ?? user.name,
    studentNumber: memberData?.studentNumber ?? user.studentNumber,
    major: memberData?.major ?? user.major,
    grade: memberData?.grade ?? user.grade,
    generation: memberData?.generation,
    email: memberData?.email ?? user.email,
  };

  const handleSelect = useCallback((value: string) => {
    setSelectedMenu(value as UserMenuValue);
  }, []);

  if (!user.name) {
    return (
      <main className="min-h-screen bg-gray-50">
        <div className="py-16">
          <div className="max-w-2xl">
            <h1 className="text-4xl font-bold text-gray-900 mb-8">내 정보</h1>
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
    <main
      className={`min-h-screen ${selectedMenu === "applications" ? "bg-gray-0" : "bg-gray-50"}`}
    >
      <div className="flex pt-14 pb-12">
        <Sidebar
          items={USER_MENU_ITEMS}
          selected={selectedMenu}
          onSelect={handleSelect}
        />
        <div className="flex-1 ml-[calc(9.375vw+240px)] pl-6 pr-[9.375%] min-w-0">
          {selectedMenu === "applications" && (
            <div className="min-h-screen">
              <MyApplicationsSection />
            </div>
          )}
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
                  <h2 className="text-2xl font-bold text-gray-900">내 정보</h2>
                </div>
                <form className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <InputBox label="이름" value={profile.name} disabled />
                    <InputBox
                      label="학번"
                      value={String(profile.studentNumber)}
                      disabled
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <InputBox label="학과" value={profile.major} disabled />
                    <div className="grid grid-cols-2 gap-4">
                      <InputBox label="학년" value={profile.grade} disabled />
                      <InputBox
                        label="기수"
                        value={
                          profile.generation != null
                            ? `${profile.generation}기`
                            : "-"
                        }
                        disabled
                      />
                    </div>
                  </div>
                  <InputBox
                    label="학교 이메일"
                    value={profile.email || "등록되지 않음"}
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
