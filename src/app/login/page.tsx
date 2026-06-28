"use client";

import { Suspense } from "react";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useLogin } from "@/hooks/auth";
import InputBox from "@/components/common/InputBox";
import { Button } from "@/components/ui/button";

function LoginClient() {
  const [studentId, setStudentId] = useState("");
  const [password, setPassword] = useState("");
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") ?? undefined;
  const { handleLogin, errorMessage } = useLogin(redirect);

  return (
    <main className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="flex-col w-full max-w-3xl bg-white rounded-4xl p-24">
        <div className="flex justify-center mb-12">
          <Image
            src="/assets/logo.png"
            alt="씨부엉 로고"
            width={120}
            height={120}
            style={{ width: "auto", height: "auto" }}
          />
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleLogin({ studentId, password });
          }}
          className="space-y-6"
        >
          <InputBox
            placeholder="아이디를 입력하세요"
            value={studentId}
            onChange={(e) => setStudentId(e.target.value)}
            required
            errorMessage={errorMessage !== null ? "" : undefined}
          />
          <InputBox
            type="password"
            placeholder="비밀번호를 입력하세요"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            errorMessage={errorMessage ?? undefined}
          />
          <Button
            type="submit"
            variant="brand"
            className="w-full h-auto rounded-lg p-4 text-base font-semibold"
          >
            로그인
          </Button>
        </form>
        <div className="mt-8 flex justify-center gap-6">
          <Link href="/signup">
            <Button
              type="button"
              variant="ghost"
              className="h-auto px-2 py-1 text-base font-medium text-gray-600"
            >
              회원가입
            </Button>
          </Link>
          {/* <Link href="/find-password">
            <Button
              type="button"
              variant="ghost"
              className="h-auto px-2 py-1 text-base font-medium text-gray-600"
            >
              비밀번호 찾기
            </Button>
          </Link> */}
        </div>
      </div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginClient />
    </Suspense>
  );
}
