"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { ChevronLeft, Clock, Eye, MessageCircle } from "lucide-react";
import RequireMember from "@/components/auth/RequireMember";
import { useUserStore } from "@/store/userStore";
import KebabMenu from "@/components/common/KebabMenu";
import { CommentItem } from "@/components/detail/CommentSection";

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

‣ 모집 기간 : 2026.03.04 ~ 03.18
‣ 모집 분야 : 프론트엔드 · 백엔드 · 기획 · 디자인
‣ 면접 일정 : 2026.03.20 ~ 03.21 (개별 안내)

신규 부원 환영합니다 — 함께 성장해요 🙌`,
  comments: [
    {
      id: 1,
      author: "14기 이서연",
      userId: 21,
      date: "2026.04.18",
      content: "정기 모집 일정 공유 감사합니다! 디자인 분야 참여 가능할까요?",
      replies: [
        { id: 11, author: "15기 김민주", userId: 1, date: "2026.04.18", content: "네 디자인 분야도 모집합니다! 신청서에 포트폴리오 첨부해주세요 :)" },
      ],
    },
    { id: 2, author: "15기 박도윤", userId: 22, date: "2026.04.18", content: "프론트 멘토링 일정도 같이 안내해주시면 좋을 것 같아요." },
    { id: 3, author: "14기 윤지우", userId: 23, date: "2026.04.19", content: "스터디 매칭 관련 문의는 어디로 드리면 되나요?" },
  ],
};

export default function NoticeDetailPage() {
  const router = useRouter();
  const [comment, setComment] = useState("");

  const userId = useUserStore((s) => s.userId);
  const currentUserId = userId ? Number(userId) : null;
  const commentCount = MOCK_NOTICE.comments.length;

  return (
    <RequireMember>
      <main className="min-h-screen pb-16 bg-white">
        <div className="container-x-lg">
          <div className="pt-6 lg:pt-12">
            {/* 상단 바 — 뒤로 / 더보기 */}
            <div className="flex items-center justify-between mb-6">
              <button
                onClick={() => router.push("/notice")}
                aria-label="뒤로"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 text-gray-600 transition-colors hover:bg-gray-50"
              >
                <ChevronLeft size={20} />
              </button>
              <KebabMenu
                onEdit={() => router.push("/notice/write")}
                onDelete={() => {
                  if (window.confirm("이 글을 삭제할까요?")) router.push("/notice");
                }}
              />
            </div>

            {/* 카테고리 / 제목 / 작성자 / 메타 */}
            <span className="inline-block rounded-full bg-brand px-4 py-1.5 text-sm font-medium text-white">
              [{MOCK_NOTICE.category}]
            </span>
            <h1 className="mt-4 text-2xl font-bold text-gray-900">{MOCK_NOTICE.title}</h1>
            <p className="mt-3 text-base text-gray-500">{MOCK_NOTICE.author}</p>
            <div className="mt-3 flex items-center gap-4 border-b border-gray-200 pb-6 text-sm text-gray-400">
              <span className="flex items-center gap-1">
                <Clock size={14} /> {MOCK_NOTICE.date}
              </span>
              <span className="flex items-center gap-1">
                <Eye size={14} /> {MOCK_NOTICE.views}
              </span>
              <span className="flex items-center gap-1">
                <MessageCircle size={14} /> {commentCount}
              </span>
            </div>

            {/* 본문 */}
            <div className="whitespace-pre-wrap py-10 text-base leading-relaxed text-gray-700">
              {MOCK_NOTICE.content}
            </div>

            {/* 하단 조회 / 댓글 카운트 */}
            <div className="flex items-center gap-4 border-b border-gray-200 pb-6 text-sm text-gray-400">
              <span className="flex items-center gap-1">
                <Eye size={16} /> {MOCK_NOTICE.views}
              </span>
              <span className="flex items-center gap-1">
                <MessageCircle size={16} /> {commentCount}
              </span>
            </div>

            {/* 댓글 목록 — 답글/대댓글·본인 댓글 메뉴는 공통 CommentItem 재사용 */}
            <div>
              {MOCK_NOTICE.comments.map((c) => (
                <CommentItem key={c.id} {...c} currentUserId={currentUserId} />
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
                onClick={() => router.push("/notice")}
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
