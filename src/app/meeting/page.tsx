import RequireMember from "@/components/auth/RequireMember";
import Mascot from "@/components/common/Mascot";

// 부엉이 모임(모임 게시판) — 임시 placeholder. 실제 모임 기능은 후속(#115).
export default function MeetingPage() {
  return (
    <RequireMember>
      <main className="container-x section-y flex min-h-[60vh] flex-col items-center justify-center text-center">
        <Mascot emotion="default" size="lg" />
        <h1 className="mt-6 text-h1 text-gray-900">부엉이 모임</h1>
        <p className="mt-2 text-body-sm text-gray-500">
          모임 게시판은 준비 중이에요. 곧 만나요!
        </p>
      </main>
    </RequireMember>
  );
}
