"use client";

import { useRouter } from "next/navigation";
import { useUserStore } from "@/store/userStore";
import { useState } from "react";
import RequireMember from "@/components/auth/RequireMember";

// TODO: API 연동 후 교체
const MOCK_NOTICE = {
  id: 1,
  category: "공지",
  title: "2026학년도 1학기 정기 모집 안내",
  author: "15기 김민주",
  date: "2026.04.18",
  views: 248,
  content: `안녕하세요, 씨부엉 운영진입니다.

2026학년도 1학기 정기 모집을 시작합니다. 자세한 일정과 모집 분야는 아래 첨부 파일을 확인해주세요.

• 모집 기간 : 2026.03.04 ~ 03.18
• 모집 분야 : 프론트엔드 · 백엔드 · 기획 · 디자인
• 면접 일정 : 2026.03.20 ~ 03.21 (개별 안내)

신규 부원 환영합니다 — 함께 성장해요`,
  comments: [
    { id: 1, author: "14기 이서연", date: "2026.04.18", content: "정기 모집 일정 공유 감사합니다! 디자인 분야 알아 봐 가능할까요?" },
    { id: 2, author: "15기 박도윤", date: "2026.04.18", content: "프론트 면접 일정도 같이 안내해주시면 좋을 것 같아요." },
    { id: 3, author: "14기 윤지우", date: "2026.04.19", content: "스터디 매칭 관련 문의는 어디로 드리면 되나요?" },
  ],
};

export default function NoticeDetailPage() {
  const router = useRouter();
  const isAdmin = useUserStore((s) => s.isAdmin);
  const [comment, setComment] = useState("");

  return (
    <RequireMember>
      <main className="min-h-screen pb-16 bg-white">
        <div className="container-x-lg">
          <div className="pt-6 lg:pt-16">
            <button
              onClick={() => router.push("/notice")}
              className="text-sm text-gray-500 hover:text-gray-800 transition-colors mb-6 flex items-center gap-1"
            >
              ← 소식 목록
            </button>

            <h1 className="text-2xl font-bold text-gray-900 mb-3">{MOCK_NOTICE.title}</h1>
            <div className="flex items-center gap-2 text-sm text-gray-500 pb-5 border-b border-gray-200">
              <span className="rounded bg-gray-800 text-white text-xs font-medium px-1.5 py-0.5">{MOCK_NOTICE.category}</span>
              <span>{MOCK_NOTICE.author}</span>
              <span>·</span>
              <span>{MOCK_NOTICE.date}</span>
              <span>·</span>
              <span>조회 {MOCK_NOTICE.views}</span>
              {isAdmin && (
                <div className="ml-auto flex gap-3">
                  <button className="text-gray-400 hover:text-gray-700 transition-colors">수정</button>
                  <button className="text-gray-400 hover:text-red-500 transition-colors">삭제</button>
                </div>
              )}
            </div>

            <div className="py-10 text-sm text-gray-700 leading-relaxed whitespace-pre-wrap border-b border-gray-200">
              {MOCK_NOTICE.content}
            </div>

            {/* 댓글 */}
            <div className="pt-8">
              <h2 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
                💬 댓글 <span className="text-gray-800">{MOCK_NOTICE.comments.length}</span>
              </h2>

              {/* 댓글 입력 (상단) */}
              <div className="flex gap-2 mb-6">
                <input
                  type="text"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="댓글을 남겨주세요..."
                  className="flex-1 border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-300"
                />
                <button
                  type="button"
                  className="px-4 py-2 bg-gray-800 text-white rounded-lg text-sm font-medium hover:bg-gray-700 transition-colors shrink-0"
                >
                  댓글 작성
                </button>
              </div>

              {/* 댓글 목록 */}
              <div className="space-y-4">
                {MOCK_NOTICE.comments.map((c) => (
                  <div key={c.id} className="pb-4 border-b border-gray-100">
                    <div className="flex items-center gap-2 text-sm mb-1">
                      <span className="font-medium text-gray-800">{c.author}</span>
                      <span className="text-gray-400">·</span>
                      <span className="text-gray-400">{c.date}</span>
                    </div>
                    <p className="text-sm text-gray-700">{c.content}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </RequireMember>
  );
}
