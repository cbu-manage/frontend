"use client";
import { useState } from "react";
import { useVerifyEmail } from "@/hooks/useVerifyEmail";
import { useUserStore } from "@/store/userStore";

export default function AddMail({ onEmailUpdated }: { onEmailUpdated?: () => void }) {
  const userStore = useUserStore();
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const { isVerificationSent, sendEmailToServer, verifyCodeWithServer } = useVerifyEmail();
  const updateEmail = useUserStore((s) => s.updateEmail);

  return (
    <div className="space-y-4 w-full max-w-md">
      <h3 className="text-xl font-semibold text-center">이메일 등록</h3>
      <input
        className="w-full rounded-lg border px-3 py-2 outline-none"
        placeholder="이메일 또는 학번"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <button
        type="button"
        className="w-full rounded-lg bg-zinc-900 text-white py-2"
        onClick={async () => {
          const ok = await sendEmailToServer(email);
          if (ok) alert("인증 메일을 보냈습니다.");
        }}
      >
        인증번호 보내기
      </button>
      {isVerificationSent && (
        <div className="space-y-3">
          <input
            className="w-full rounded-lg border px-3 py-2 outline-none"
            placeholder="인증번호"
            value={code}
            onChange={(e) => setCode(e.target.value)}
          />
          <button
            type="button"
            className="w-full rounded-lg border py-2"
            onClick={async () => {
              const res = await verifyCodeWithServer(email, code);
              if (res.success) {
                const emailWithSuffix = email.includes("@") ? email : `${email}@tukorea.ac.kr`;
                const SERVER_URL = process.env.NEXT_PUBLIC_API_URL || "/api/v1";
                try {
                  const resp = await fetch(`${SERVER_URL}/mail/update`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      studentNumber: userStore.studentNumber,
                      email: emailWithSuffix,
                    }),
                  });
                  if (resp.ok) {
                    updateEmail(emailWithSuffix);
                    alert("📩 이메일이 성공적으로 등록되었습니다!");
                    onEmailUpdated?.();
                  } else {
                    alert("이메일 업데이트에 실패했습니다. 다시 시도해주세요.");
                  }
                } catch (e) {
                  alert("이메일 업데이트 중 오류가 발생했습니다. 다시 시도해주세요.");
                }
              }
            }}
          >
            인증 및 저장
          </button>
        </div>
      )}
    </div>
  );
}


