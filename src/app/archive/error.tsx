"use client";

import Link from "next/link";

type Props = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function ArchiveError({ reset }: Props) {
  return (
    <main className="min-h-screen pb-12 bg-white">
      <div className="px-[9.375%] pt-12">
        <div className="max-w-xl mx-auto py-16 text-center space-y-6">
          <h1 className="text-2xl font-bold text-gray-900">
            자료를 불러오는 중 오류가 발생했습니다.
          </h1>
          <p className="text-gray-600">
            잠시 후 다시 시도해 주세요. 문제가 계속되면 관리자에게 문의해주세요.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <button
              type="button"
              onClick={() => reset()}
              className="px-5 py-2.5 text-sm font-medium text-white bg-gray-800 rounded-full hover:bg-gray-900 transition-colors"
            >
              다시 시도
            </button>
            <Link
              href="/archive"
              className="px-5 py-2.5 text-sm font-medium text-gray-600 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors inline-block"
            >
              자료방으로
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
