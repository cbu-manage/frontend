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
const MOCK_POST = {
  id: 1,
  category: "질문",
  title: "백엔드 면접 후기 - 너무 떨려서 망친 듯 ㅠ",
  author: "익명12",
  date: "2026.04.10",
  views: 156,
  content: `어제 면접 보고 왔는데 답 하나도 제대로 못한 듯 너무 속상해서 적어봅니다…

CS 질문이 너무 깊이 들어와서 준비 부족함을 느낌. 다음엔 OS 메모리·네트워크 3-way handshake·DB 인덱스 좌르르 외워서 가야겠어요.

DB 인덱스에서는 B+ tree 구조랑 클러스터드 인덱스의 차이점도 질문 받았는데 잠깐 얼어서 한참 멈춤…

그래도 프로젝트 면접은 재미있게 했습니다. 다음 회사는 더 잘해보야지ㅠ 우리 동아리에서 도움 많이 받았는데 이렇게 끝 나는 게 보고의 답인가ㅠ`,
  comments: [
    {
      id: 1,
      author: "익명47",
      userId: 47,
      date: "2026.04.18",
      content: "저도 지난주 비슷한 경험입니다. 면접은 결과보다 과정이 중요하니 너무 자책하지 마세요!",
      replies: [
        { id: 11, author: "익명12", userId: 1, date: "2026.04.18", content: "위로 감사해요 ㅠㅠ 다음엔 더 준비해서 갈게요!" },
      ],
    },
    { id: 2, author: "15기 정하은", userId: 2, date: "2026.04.18", content: "면접 후기 공유 고맙워요. CS 정리 자료 필요하시면 동아리 자료방에 공유되어 있습니다." },
    { id: 3, author: "익명83", userId: 83, date: "2026.04.18", content: "프로젝트 면접은 잘하셨다고 하니 그게 더 중요해요. 기술 면접 준비는 다음에 더 철저히!" },
    { id: 4, author: "운영진 14기 최준호", userId: 4, date: "2026.04.19", content: "다음주 CS 스터디 쪼각으로 모이고 있으니 관심 있으시면 단톡방에 와주세요!" },
  ],
};

export default function BoardDetailPage() {
  const router = useRouter();
  const [comment, setComment] = useState("");
  const [anonymous, setAnonymous] = useState(true);

  const userId = useUserStore((s) => s.userId);
  const currentUserId = userId ? Number(userId) : null;
  const commentCount = MOCK_POST.comments.length;

  return (
    <RequireMember>
      <main className="min-h-screen pb-16 bg-white">
        <div className="container-x-lg">
          <div className="pt-6 lg:pt-12">
            {/* 상단 바 — 뒤로 / 더보기 */}
            <div className="flex items-center justify-between mb-6">
              <button
                onClick={() => router.push("/board")}
                className="inline-flex items-center gap-1 rounded-full border border-gray-200 px-5 py-2.5 text-sm text-gray-600 transition-colors hover:bg-gray-50"
              >
                <ChevronLeft size={16} /> 목록으로
              </button>
              <KebabMenu
                onEdit={() => router.push("/board/write")}
                onDelete={() => {
                  if (window.confirm("이 글을 삭제할까요?")) router.push("/board");
                }}
                onReport={() => window.alert("신고가 접수되었습니다.")}
              />
            </div>

            {/* 카테고리 / 제목 / 작성자 / 메타 */}
            <span className="inline-block rounded-full bg-brand px-4 py-1.5 text-sm font-medium text-white">
              [{MOCK_POST.category}]
            </span>
            <h1 className="mt-4 text-2xl font-bold text-gray-900">{MOCK_POST.title}</h1>
            <p className="mt-3 text-base text-gray-600">{MOCK_POST.author}</p>
            <div className="mt-3 flex items-center gap-4 border-b border-gray-200 pb-6 text-sm text-gray-600">
              <span className="flex items-center gap-1">
                <Clock size={14} /> {MOCK_POST.date}
              </span>
              <span className="flex items-center gap-1">
                <Eye size={14} /> {MOCK_POST.views}
              </span>
              <span className="flex items-center gap-1">
                <MessageCircle size={14} /> {commentCount}
              </span>
            </div>

            {/* 본문 */}
            <div className="whitespace-pre-wrap py-10 text-base leading-relaxed text-gray-900">
              {MOCK_POST.content}
            </div>

            {/* 하단 조회 / 댓글 카운트 */}
            <div className="flex items-center gap-4 border-b border-gray-200 pb-6 text-sm text-gray-700">
              <span className="flex items-center gap-1">
                <Eye size={16} /> {MOCK_POST.views}
              </span>
              <span className="flex items-center gap-1">
                <MessageCircle size={16} /> {commentCount}
              </span>
            </div>

            {/* 댓글 목록 — 답글/대댓글·본인 댓글 메뉴는 공통 CommentItem 재사용 */}
            {MOCK_POST.comments.length === 0 ? (
              <CommentEmpty />
            ) : (
              <div>
                {MOCK_POST.comments.map((c) => (
                  <CommentItem key={c.id} {...c} currentUserId={currentUserId} />
                ))}
              </div>
            )}

            {/* 댓글 입력 */}
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
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setAnonymous((v) => !v)}
                    className={`flex items-center gap-1.5 text-sm transition-colors ${
                      anonymous ? "text-gray-800" : "text-gray-400 hover:text-gray-600"
                    }`}
                  >
                    <span
                      className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors ${
                        anonymous ? "border-gray-800 bg-gray-800" : "border-gray-300"
                      }`}
                    >
                      {anonymous && (
                        <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                          <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                    </span>
                    익명으로 작성
                  </button>
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
        </div>
      </main>
    </RequireMember>
  );
}
