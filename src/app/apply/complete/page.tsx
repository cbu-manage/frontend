"use client";

import Image from "next/image";
import Link from "next/link";

const CHANNELS = [
  {
    badges: ["카카오톡", "공지방"],
    url: "https://invite.kakao.com/tc/6OyB8jADes",
  },
  {
    badges: ["카카오톡", "수다방"],
    url: "https://invite.kakao.com/tc/WfLi7TTAEp",
  },
  {
    badges: ["디스코드"],
    text: "초대 링크가 가입 시 입력하신 이메일로 발송되었습니다.",
  },
];

export default function ApplyCompletePage() {
  return (
    <main className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4 py-16">
      <div className="w-full max-w-[420px] bg-white rounded-xl shadow-sm px-8 py-10 flex flex-col items-center gap-6">
        <Image
          src="/assets/mascot.svg"
          alt="씨부엉 마스코트"
          width={80}
          height={80}
          className="w-20 h-20"
        />

        <div className="text-center space-y-2">
          <h1 className="text-h1 text-gray-900">씨부엉에 오신 걸 환영해요</h1>
          <p className="text-body-sm text-gray-500">
            회비 납부 확인 후 운영진의 승인을 기다리는 중입니다.
            <br />
            보통 1~3일 소요되며, 승인이 완료되면 이메일·카카오톡으로 안내드립니다.
          </p>
        </div>

        <div className="w-full flex flex-col gap-3">
          {CHANNELS.map((channel, idx) => (
            <div
              key={idx}
              className="rounded-xl border border-gray-200 px-4 py-3.5 flex flex-col gap-2"
            >
              <div className="flex gap-1.5">
                {channel.badges.map((badge) => (
                  <span
                    key={badge}
                    className="text-caption bg-gray-100 text-gray-600 rounded-full px-2 py-0.5"
                  >
                    {badge}
                  </span>
                ))}
              </div>
              {channel.url ? (
                <a
                  href={channel.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-body-sm text-brand font-medium"
                >
                  {channel.url} →
                </a>
              ) : (
                <p className="text-body-sm text-gray-500">{channel.text}</p>
              )}
            </div>
          ))}
        </div>

        <Link
          href="/"
          className="w-full h-12 rounded-xl bg-brand text-white font-semibold flex items-center justify-center hover:opacity-90 transition-opacity"
        >
          홈으로 이동
        </Link>
      </div>
    </main>
  );
}
