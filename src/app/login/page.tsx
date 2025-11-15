"use client";
import { useState } from "react";
import { useLogin } from "@/hooks/useLogin";

export default function LoginPage() {
  const [studentId, setStudentId] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const { handleLogin } = useLogin();

  return (
      <main className="flex items-center justify-center p-6" style={{ background: "var(--color-gray-100)" }}>
      <div className="flex min-h-screen w-full max-w-2xl flex-col items-center justify-center">
      <div className="w-full max-w-md bg-white rounded-xl p-8 shadow">
        <h2 className="text-2xl font-semibold text-gray-900 text-center mb-6">로그인</h2>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleLogin({ studentId, password });
          }}
          className="space-y-4"
        >
          <div>
            <label className="block text-sm font-medium mb-1">아이디</label>
            <input
              className="w-full rounded-lg border px-3 py-2 outline-none"
              placeholder="아이디를 입력하세요"
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">비밀번호</label>
            <div className="relative">
              <input
                className="w-full rounded-lg border px-3 py-2 pr-10 outline-none"
                type={showPassword ? "text" : "password"}
                placeholder="비밀번호를 입력하세요"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className="absolute right-2 top-1/2 -translate-y-1/2 text-sm text-zinc-600"
                onClick={() => setShowPassword((v) => !v)}
              >
                {showPassword ? "숨김" : "표시"}
              </button>
            </div>
          </div>
          <button type="submit" className="w-full rounded-lg bg-zinc-900 text-white py-2">
            로그인
          </button>
        </form>
        <p className="mt-4 text-center text-sm text-zinc-600">
          씨부엉 입부를 축하합니다! 첫 로그인이라면?&nbsp;
            <a href="/join" className="font-semibold text-zinc-900">회원가입</a>
          </p>
        </div>
      </div>
    </main>
  );
}


