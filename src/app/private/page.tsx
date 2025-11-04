"use client";
import { useUserStore } from "@/store/userStore";
import GuidePassword from "@/components/GuidePassword";
import AddMail from "@/components/AddMail";

export default function PrivateGuidePage() {
  const isDefaultPassword = useUserStore((s) => s.isDefaultPassword);
  const isEmailNull = useUserStore((s) => s.isEmailNull);

  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
        {isDefaultPassword && isEmailNull && (
          <>
            <div className="flex justify-center"><GuidePassword /></div>
            <div className="flex justify-center"><AddMail /></div>
          </>
        )}
        {!isDefaultPassword && isEmailNull && (
          <div className="md:col-span-2 flex justify-center"><AddMail /></div>
        )}
        {isDefaultPassword && !isEmailNull && (
          <div className="md:col-span-2 flex justify-center"><GuidePassword /></div>
        )}
        {!isDefaultPassword && !isEmailNull && (
          <div className="md:col-span-2 text-center text-sm text-zinc-600">이메일이 등록되어 있습니다. 변경이 불가능합니다.</div>
        )}
      </div>
    </main>
  );
}


