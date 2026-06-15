"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";

export default function ApplyPendingPage() {
  const router = useRouter();

  const handleLogout = () => {
    router.push("/");
  };

  const handleCheckStatus = () => {
    router.refresh();
  };

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4 py-16">
      <div className="w-full max-w-[420px] bg-white rounded-xl shadow-sm px-8 py-10 flex flex-col items-center gap-6">
        <Image
          src="/assets/hourglass.svg"
          alt="모래시계"
          width={54}
          height={62}
          className="h-16 w-auto"
        />

        <div className="text-center space-y-2">
          <h1 className="text-h1 text-gray-900">승인을 기다리고 있어요!</h1>
          <p className="text-body-sm text-gray-500">
            회비 납부 확인 후 운영진의 승인을 기다리는 중입니다.
            <br />
            보통 1~3일 소요되며, 승인이 완료되면 이메일·카카오톡으로 안내드립니다.
          </p>
        </div>

        <div className="w-full rounded-xl border border-gray-200 px-4 py-4 flex flex-col gap-3">
          <p className="text-body-sm text-gray-600">
            승인이 완료되면 게시판, 자료방 등 모든 기능을 이용할 수 있어요.
          </p>
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <span className="text-caption bg-gray-100 text-gray-600 rounded-full px-2.5 py-0.5 shrink-0">
                승인 전
              </span>
              <span className="text-body-sm text-gray-500">내 정보, 회비 납부</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-caption bg-gray-100 text-gray-600 rounded-full px-2.5 py-0.5 shrink-0">
                승인 후
              </span>
              <span className="text-body-sm text-gray-500">모든 기능</span>
            </div>
          </div>
        </div>

        <div className="w-full flex gap-3">
          <button
            type="button"
            onClick={handleLogout}
            className="flex-1 h-12 rounded-xl border border-gray-200 text-gray-600 font-semibold hover:bg-gray-50 transition-colors"
          >
            로그아웃
          </button>
          <button
            type="button"
            onClick={handleCheckStatus}
            className="flex-1 h-12 rounded-xl bg-brand text-white font-semibold hover:opacity-90 transition-opacity"
          >
            승인 상태 확인
          </button>
        </div>
      </div>
    </main>
  );
}
