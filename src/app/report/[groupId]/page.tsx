"use client";

import { useParams, useRouter } from "next/navigation";
import RequireMember from "@/components/auth/RequireMember";

export default function ReportWritePage() {
  const params = useParams();
  const router = useRouter();
  const groupId = params.groupId;

  return (
    <RequireMember>
      <main className="min-h-screen pb-12 bg-white">
        <div className="px-[15%] pt-16">
          <button
            type="button"
            onClick={() => router.push("/report")}
            className="text-gray-600 hover:text-gray-900 text-sm mb-6"
          >
            ← 내 스터디/프로젝트로 돌아가기
          </button>
          <p className="text-gray-500">
            그룹 {groupId}의 보고서 작성 기능은 준비 중입니다.
          </p>
        </div>
      </main>
    </RequireMember>
  );
}
