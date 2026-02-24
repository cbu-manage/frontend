"use client";
import { useUserStore } from "@/store/userStore";
import AddMail from "@/components/AddMail";

export default function PrivateGuidePage() {
  const isEmailNull = useUserStore((s) => s.isEmailNull);

  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-4xl">
        {isEmailNull ? (
          <div className="flex justify-center">
            <AddMail />
          </div>
        ) : (
          <div className="text-center text-sm text-zinc-600">
            이메일이 등록되어 있습니다. 변경이 불가능합니다.
          </div>
        )}
      </div>
    </main>
  );
}

