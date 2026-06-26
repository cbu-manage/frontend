"use client";

import { useRouter } from "next/navigation";
import { useUserStore } from "@/store/userStore";
import { useState } from "react";
import RequireMember from "@/components/auth/RequireMember";

// TODO: API 연동 후 교체
const MOCK_NEWS = {
  id: 1,
  category: "월간",
  title: "4월 월간 뉴스레터 — 신입 모집·해커톤 소식",
  author: "15기 김민주",
  date: "2026.04.30",
  views: 210,
  content: `안녕하세요, 씨부엉입니다.

4월 한 달간의 소식을 전해드립니다.

• 2026 신입 부원 모집 마감 — 총 32명 합류
• 씨부엉 해커톤 2026 성황리 개최
• 5월 워크샵 사전 신청 오픈

다음 달에도 알찬 소식으로 찾아올게요!`,
  comments: [
    { id: 1, author: "14기 이서연", date: "2026.04.30", content: "이번 달 소식 잘 봤어요! 해커톤 후기도 따로 올라오나요?" },
    { id: 2, author: "15기 박도윤", date: "2026.04.30", content: "워크샵 신청 링크는 어디서 확인할 수 있나요?" },
  ],
};

export default function NewsDetailPage() {
  const router = useRouter();
  const isAdmin = useUserStore((s) => s.isAdmin);
  const [comment, setComment] = useState("");

  return (
    <RequireMember>
      <main className="min-h-screen pb-16 bg-white">
        <div className="container-x-lg">
          <div className="pt-6 lg:pt-16">
            <button
              onClick={() => router.push("/news")}
              className="text-sm text-gray-500 hover:text-gray-800 transition-colors mb-6 flex items-center gap-1"
            >
              ← 뉴스레터 목록
            </button>

            <h1 className="text-2xl font-bold text-gray-900 mb-3">{MOCK_NEWS.title}</h1>
            <div className="flex items-center gap-2 text-sm text-gray-500 pb-5 border-b border-gray-200">
              <span className="rounded bg-gray-800 text-white text-xs font-medium px-1.5 py-0.5">{MOCK_NEWS.category}</span>
              <span>{MOCK_NEWS.author}</span>
              <span>·</span>
              <span>{MOCK_NEWS.date}</span>
              <span>·</span>
              <span>조회 {MOCK_NEWS.views}</span>
              {isAdmin && (
                <div className="ml-auto flex gap-3">
                  <button className="text-gray-400 hover:text-gray-700 transition-colors">수정</button>
                  <button className="text-gray-400 hover:text-red-500 transition-colors">삭제</button>
                </div>
              )}
            </div>

            <div className="py-10 text-sm text-gray-700 leading-relaxed whitespace-pre-wrap border-b border-gray-200">
              {MOCK_NEWS.content}
            </div>

            {/* 댓글 */}
            <div className="pt-8">
              <h2 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
                💬 댓글 <span className="text-gray-800">{MOCK_NEWS.comments.length}</span>
              </h2>

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

              <div className="space-y-4">
                {MOCK_NEWS.comments.map((c) => (
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
