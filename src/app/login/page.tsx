"use client";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useLogin } from "@/hooks/useLogin";
import InputBox from "@/components/common/InputBox";
import LongBtn from "@/components/common/LongBtn";
import OutlineBtn from "@/components/common/OutlineBtn";

export default function LoginPage() {
  const [studentId, setStudentId] = useState("");
  const [password, setPassword] = useState("");
  const { handleLogin, errorMessage } = useLogin();

  return (
    <main
      className="flex items-center justify-center min-h-screen"
      style={{ background: "var(--color-gray-50)" }}
    >
      <div className="w-full max-w-xl bg-white rounded-4xl px-20 py-24">
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
          <LongBtn type="submit">로그인</LongBtn>
        </form>
        <div className="mt-8 flex justify-center gap-6">
          <Link href="/signup">
            <OutlineBtn type="button">
              회원가입
            </OutlineBtn>
          </Link>
          <Link href="/find-password">
            <OutlineBtn type="button">
              비밀번호 찾기
            </OutlineBtn>
          </Link>
        </div>
      </div>
    </main>
  );
}


