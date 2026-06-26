"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { ChevronLeft, MoreVertical, Clock, Eye, MessageCircle } from "lucide-react";
import RequireMember from "@/components/auth/RequireMember";

// TODO: API 연동 후 교체
const MOCK_NEWS = {
  id: 1,
  category: "주간",
  title: "4월 4주차 주간 뉴스레터",
  author: "15기 김민주",
  date: "2026.04.28",
  views: 210,
  content: `안녕하세요, 씨부엉입니다.

이번 주 동아리 소식을 전해드립니다.

‣ 씨부엉 해커톤 2026 성황리 개최 — 총 8팀 참가
‣ 5월 워크샵 사전 신청 오픈 (선착순 30명)
‣ 자료방에 4월 세미나 발표자료 업로드 완료

다음 주에도 알찬 소식으로 찾아올게요!`,
  comments: [
    { id: 1, author: "14기 이서연", date: "2026.04.28", content: "이번 주 소식 잘 봤어요! 해커톤 후기도 따로 올라오나요?" },
    { id: 2, author: "15기 박도윤", date: "2026.04.28", content: "워크샵 신청 링크는 어디서 확인할 수 있나요?" },
    { id: 3, author: "14기 윤지우", date: "2026.04.29", content: "세미나 발표자료 공유 감사합니다 🙌" },
  ],
};

export default function NewsDetailPage() {
  const router = useRouter();
  const [comment, setComment] = useState("");

  const commentCount = MOCK_NEWS.comments.length;

  return (
    <RequireMember>
      <main className="min-h-screen pb-16 bg-white">
        <div className="container-x-lg">
          <div className="pt-6 lg:pt-12">
            {/* 상단 바 — 뒤로 / 더보기 */}
            <div className="flex items-center justify-between mb-6">
              <button
                onClick={() => router.push("/news")}
                aria-label="뒤로"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 text-gray-600 transition-colors hover:bg-gray-50"
              >
                <ChevronLeft size={20} />
              </button>
              {/* TODO: 수정/삭제 메뉴 (운영진) */}
              <button
                aria-label="더보기"
                className="flex h-10 w-10 items-center justify-center rounded-full text-gray-400 transition-colors hover:bg-gray-50"
              >
                <MoreVertical size={20} />
              </button>
            </div>

            {/* 카테고리 / 제목 / 작성자 / 메타 */}
            <span className="inline-block rounded-full bg-brand px-4 py-1.5 text-sm font-medium text-white">
              [{MOCK_NEWS.category}]
            </span>
            <h1 className="mt-4 text-2xl font-bold text-gray-900">{MOCK_NEWS.title}</h1>
            <p className="mt-3 text-base text-gray-500">{MOCK_NEWS.author}</p>
            <div className="mt-3 flex items-center gap-4 border-b border-gray-200 pb-6 text-sm text-gray-400">
              <span className="flex items-center gap-1">
                <Clock size={14} /> {MOCK_NEWS.date}
              </span>
              <span className="flex items-center gap-1">
                <Eye size={14} /> {MOCK_NEWS.views}
              </span>
              <span className="flex items-center gap-1">
                <MessageCircle size={14} /> {commentCount}
              </span>
            </div>

            {/* 본문 */}
            <div className="whitespace-pre-wrap py-10 text-sm leading-relaxed text-gray-700">
              {MOCK_NEWS.content}
            </div>

            {/* 하단 조회 / 댓글 카운트 */}
            <div className="flex items-center gap-4 border-b border-gray-200 pb-6 text-sm text-gray-400">
              <span className="flex items-center gap-1">
                <Eye size={16} /> {MOCK_NEWS.views}
              </span>
              <span className="flex items-center gap-1">
                <MessageCircle size={16} /> {commentCount}
              </span>
            </div>

            {/* 댓글 목록 */}
            <div className="divide-y divide-gray-100">
              {MOCK_NEWS.comments.map((c) => (
                <div key={c.id} className="py-5">
                  <div className="flex items-start justify-between">
                    <span className="font-semibold text-gray-900">{c.author}</span>
                    {/* TODO: 댓글 수정/삭제 메뉴 */}
                    <button
                      aria-label="댓글 더보기"
                      className="text-gray-400 transition-colors hover:text-gray-600"
                    >
                      <MoreVertical size={18} />
                    </button>
                  </div>
                  <p className="mt-2 text-sm text-gray-700">{c.content}</p>
                  <div className="mt-3 flex items-center gap-4 text-xs text-gray-400">
                    <span className="flex items-center gap-1">
                      <Clock size={13} /> {c.date}
                    </span>
                    <button className="flex items-center gap-1 transition-colors hover:text-gray-600">
                      <MessageCircle size={13} /> 답글쓰기
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* 댓글 입력 (공지/뉴스레터는 익명 없음) */}
            <div className="mt-6 rounded-2xl border border-gray-200 p-5">
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                maxLength={1000}
                rows={4}
                placeholder="씨부엉 회원들과 함께 이야기를 나눠보세요!"
                className="w-full resize-none text-sm text-gray-700 placeholder-gray-400 focus:outline-none"
              />
              <div className="mt-2 flex items-center justify-between">
                <span className="text-xs text-gray-400">{comment.length} / 1,000</span>
                <button
                  type="button"
                  className="rounded-full bg-gray-800 px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-gray-700"
                >
                  등록
                </button>
              </div>
            </div>

            {/* 목록으로 */}
            <div className="mt-8">
              <button
                onClick={() => router.push("/news")}
                className="inline-flex items-center gap-1 rounded-full border border-gray-200 px-5 py-2.5 text-sm text-gray-600 transition-colors hover:bg-gray-50"
              >
                <ChevronLeft size={16} /> 목록으로
              </button>
            </div>
          </div>
        </div>
      </main>
    </RequireMember>
  );
}
