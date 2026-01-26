"use client";

import { useUserStore } from "@/store/userStore";
import Link from "next/link";

export default function UserPage() {
  const user = useUserStore((s) => ({
    name: s.name,
    studentNumber: s.studentNumber,
    email: s.email,
    major: s.major,
    grade: s.grade,
    nickName: s.nickName,
  }));

  return (
    <main className="min-h-screen bg-white">
      <div className="px-[9.375%] py-16">
        <div className="max-w-2xl">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8">
            사용자 정보
          </h1>

          {user.name ? (
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

              <Link href="/change-password">
                <button className="w-full px-6 py-3 bg-brand text-white rounded-lg font-medium hover:opacity-90 transition-opacity">
                  비밀번호 변경
                </button>
              </Link>
            </div>
          ) : (
            <div className="text-center py-16">
              <p className="text-gray-600 mb-6">로그인 후 사용자 정보를 확인하세요.</p>
              <Link href="/login">
                <button className="px-6 py-3 bg-brand text-white rounded-lg font-medium hover:opacity-90 transition-opacity">
                  로그인하기
                </button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
