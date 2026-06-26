"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { ChevronLeft, Clock, Eye, MessageCircle } from "lucide-react";
import RequireMember from "@/components/auth/RequireMember";
import { useUserStore } from "@/store/userStore";
import KebabMenu from "@/components/common/KebabMenu";
import { CommentItem } from "@/components/detail/CommentSection";
import CommentEmpty from "@/components/detail/CommentEmpty";

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
  // 빈 상태(댓글 없음) 확인용 — API 연동 시 실제 댓글로 교체
  comments: [] as {
    id: number;
    author: string;
    userId?: number;
    date: string;
    content: string;
    replies?: { id: number; author: string; userId?: number; date: string; content: string }[];
  }[],
};

export default function NewsDetailPage() {
  const router = useRouter();
  const [comment, setComment] = useState("");

  const userId = useUserStore((s) => s.userId);
  const currentUserId = userId ? Number(userId) : null;
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
                className="inline-flex items-center gap-1 rounded-full border border-gray-200 px-5 py-2.5 text-sm text-gray-600 transition-colors hover:bg-gray-50"
              >
                <ChevronLeft size={16} /> 목록으로
              </button>
              <KebabMenu
                onEdit={() => router.push("/news/write")}
                onDelete={() => {
                  if (window.confirm("이 글을 삭제할까요?")) router.push("/news");
                }}
              />
            </div>

            {/* 카테고리 / 제목 / 작성자 / 메타 */}
            <span className="inline-block rounded-full bg-brand px-4 py-1.5 text-sm font-medium text-white">
              [{MOCK_NEWS.category}]
            </span>
            <h1 className="mt-4 text-2xl font-bold text-gray-900">{MOCK_NEWS.title}</h1>
            <p className="mt-3 text-base text-gray-600">{MOCK_NEWS.author}</p>
            <div className="mt-3 flex items-center gap-4 border-b border-gray-200 pb-6 text-sm text-gray-600">
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
            <div className="whitespace-pre-wrap py-10 text-base leading-relaxed text-gray-900">
              {MOCK_NEWS.content}
            </div>

            {/* 하단 조회 / 댓글 카운트 */}
            <div className="flex items-center gap-4 border-b border-gray-200 pb-6 text-sm text-gray-700">
              <span className="flex items-center gap-1">
                <Eye size={16} /> {MOCK_NEWS.views}
              </span>
              <span className="flex items-center gap-1">
                <MessageCircle size={16} /> {commentCount}
              </span>
            </div>

            {/* 댓글 목록 — 답글/대댓글·본인 댓글 메뉴는 공통 CommentItem 재사용 */}
            {MOCK_NEWS.comments.length === 0 ? (
              <CommentEmpty />
            ) : (
              <div>
                {MOCK_NEWS.comments.map((c) => (
                  <CommentItem key={c.id} {...c} currentUserId={currentUserId} />
                ))}
              </div>
            )}

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
          </div>
        </div>
      </main>
    </RequireMember>
  );
}
