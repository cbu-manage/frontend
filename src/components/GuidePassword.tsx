"use client";
import { useRouter } from "next/navigation";

export default function GuidePassword() {
  const router = useRouter();
  return (
    <div className="w-full max-w-md text-center space-y-3">
      <h3 className="text-xl font-semibold">기본 비밀번호 안내</h3>
      <p className="text-sm text-zinc-600">현재 기본 비밀번호를 사용 중입니다. 보안을 위해 비밀번호를 변경해 주세요.</p>
      <button
        className="rounded-lg bg-zinc-900 text-white px-4 py-2"
        onClick={() => router.push("/user?tab=password")}
      >
        비밀번호 변경하러 가기
      </button>
    </div>
  );
}


