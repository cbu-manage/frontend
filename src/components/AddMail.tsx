"use client";
import { useState } from "react";
import { useVerifyEmail } from "@/hooks/mail";
import { useMailUpdate } from "@/hooks/mail";

export default function AddMail({ onEmailUpdated }: { onEmailUpdated?: () => void }) {
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const { isVerificationSent, sendEmailToServer, verifyCodeWithServer } = useVerifyEmail();
  const mailUpdateMutation = useMailUpdate(onEmailUpdated);

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
                mailUpdateMutation.mutate(emailWithSuffix);
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


