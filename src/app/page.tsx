"use client";
import { useUserStore } from "@/store/userStore";
import Link from "next/link";

export default function Home() {
  const isAdmin = useUserStore((s) => s.isAdmin);
  
  return (
    <div
      className="min-h-screen flex items-center justify-center bg-gray-0"
    >
      <div className="text-center">
        <div className="text-3xl font-semibold text-zinc-900">
          <span className="text-[#95C674] font-semibold">씨부엉</span>에 오신 것을 환영합니다.
        </div>
        <p className="text-xl text-neutral-600 mt-2 mb-9">
          한국공학대학교 프로그래밍 동아리 씨부엉의 공식 웹사이트입니다.
        </p>
        {isAdmin ? (
          <Link
            href="/memberManage"
            className="inline-block px-6 py-3 rounded-full border border-[#95C674] bg-[#95C674] text-white text-base font-semibold transition-all hover:bg-[#7DAA5E] hover:border-[#7DAA5E]"
          >
            멤버 관리로 이동
          </Link>
        ) : (
          <button
            id="recruitment-button"
            disabled
            className="px-6 py-3 rounded-full bg-gray-100 text-gray-600 cursor-not-allowed text-base font-semibold"
          >
            동아리 신청기간이 아닙니다
          </button>
        )}
      </div>
    </div>
  );
}
