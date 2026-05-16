"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useUserStore } from "@/store/userStore";
import RequireMember from "@/components/auth/RequireMember";

// TODO: API 연동 후 교체
const MOCK_POST = {
  id: 1,
  category: "일상",
  title: "백엔드 면접 후기 — 너무 떨려서 망친 듯ㅠ",
  author: "익명12",
  date: "2026.04.18",
  views: 248,
  content: `어제 면접 보고 왔는데 답 하나도 제대로 못한 것 너무 속상해서 적어봅니다...

CS 질문이 너무 많이 들어와서 준비 부족함을 느낌. 다음엔 OS 메모리·네트워크 3-way handshake·DB 인덱스 죄르르 외워서 가겠어요.
DB 인덱스에서는 B+ tree 구조랑 클러스터드 인덱스의 차이점도 질문 받았는데 잠깐 있어서 한참 멈춤...

그래도 프로젝트 면접은 재미있게 했습니다. 다음 회사는 더 잘해보야지ㅠ 우리 동아리에서 도움 많이 받았는데 이렇게 끝 나는 게 보고의 답인가ㅠ`,
  comments: [
    { id: 1, author: "익명47", date: "2026.04.18", content: "저도 지난주 비슷한 경험했어요. 면접은 좋았다고 기대하니 너무 지쳐하지 마세요!" },
    { id: 2, author: "15기 정하은", date: "2026.04.18", content: "면접 후기 공유 고마워요. CS 정리 자료 필요하시면 동아리 자료방에 공유되어 있습니다." },
    { id: 3, author: "익명83", date: "2026.04.18", content: "프로젝트 면접은 잘했다고 하니 그게 더 중요해요. 기술 면접 준비는 다음에 더 철저히!" },
    { id: 4, author: "운영진 14기 최준호", date: "2026.04.19", content: "다음주 CS 스터디 하니 관심 있으시면 단독방에 와주세요!" },
  ],
};

export default function BoardDetailPage() {
  const router = useRouter();
  const name = useUserStore((s) => s.name);
  const [comment, setComment] = useState("");
  const [anonymous, setAnonymous] = useState(false);

  const isAuthor = name && name === MOCK_POST.author;

  return (
    <RequireMember>
      <main className="min-h-screen pb-16 bg-white">
        <div className="container-x-lg">
          <div className="pt-6 lg:pt-16">
            <button
              onClick={() => router.push("/board")}
              className="text-sm text-gray-500 hover:text-gray-800 transition-colors mb-6 flex items-center gap-1"
            >
              ← 자유게시판 목록
            </button>

            <h1 className="text-2xl font-bold text-gray-900 mb-3">{MOCK_POST.title}</h1>
            <div className="flex items-center gap-2 text-sm text-gray-500 pb-5 border-b border-gray-200">
              <span className="rounded bg-gray-900 text-white text-xs font-medium px-1.5 py-0.5">{MOCK_POST.category}</span>
              <span>{MOCK_POST.author}</span>
              <span>·</span>
              <span>{MOCK_POST.date}</span>
              <span>·</span>
              <span>조회 {MOCK_POST.views}</span>
              <div className="ml-auto flex gap-3">
                {isAuthor && (
                  <>
                    <button className="text-gray-400 hover:text-gray-700 transition-colors">수정</button>
                    <button className="text-gray-400 hover:text-red-500 transition-colors">삭제</button>
                  </>
                )}
                <button className="text-gray-400 hover:text-red-500 transition-colors flex items-center gap-0.5">
                  ► 신고
                </button>
              </div>
            </div>

            <div className="py-10 text-sm text-gray-700 leading-relaxed whitespace-pre-wrap border-b border-gray-200">
              {MOCK_POST.content}
            </div>

            {/* 댓글 */}
            <div className="pt-8">
              <h2 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
                💬 댓글 <span className="text-gray-800">{MOCK_POST.comments.length}</span>
              </h2>

              {/* 댓글 입력 (상단) */}
              <div className="flex gap-2 mb-2">
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
              <div className="flex items-center mb-6">
                <button
                  type="button"
                  onClick={() => setAnonymous((v) => !v)}
                  className={`flex items-center gap-1.5 text-sm transition-colors ${
                    anonymous ? "text-gray-800" : "text-gray-400 hover:text-gray-600"
                  }`}
                >
                  <span className={`w-4 h-4 rounded border flex items-center justify-center transition-colors shrink-0 ${anonymous ? "bg-gray-800 border-gray-800" : "border-gray-300"}`}>
                    {anonymous && <svg width="10" height="8" viewBox="0 0 10 8" fill="none"><path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                  </span>
                  익명으로 작성
                </button>
              </div>

              {/* 댓글 목록 */}
              <div className="space-y-4">
                {MOCK_POST.comments.map((c) => (
                  <div key={c.id} className="pb-4 border-b border-gray-100">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2 text-sm">
                        <span className="font-medium text-gray-800">{c.author}</span>
                        <span className="text-gray-400">·</span>
                        <span className="text-gray-400">{c.date}</span>
                      </div>
                      <button className="text-xs text-gray-400 hover:text-red-500 transition-colors">► 신고</button>
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
