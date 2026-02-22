"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";
import { MessageCircle, Pencil, Trash2 } from "lucide-react";

interface DetailTemplateProps {
  title: string;
  status: "recruiting" | "completed" | "solved" | "unsolved";
  author: string;
  date: string;
  views: number;
  commentsCount?: number;
  infoLabel: string;
  categories: string[];
  content: string;
  backPath: string;
  hasSidebar?: boolean;
  footer?: React.ReactNode;
  comments?: React.ReactNode;
  /** false면 댓글 영역은 보이지만 메타데이터의 댓글 수는 숨김 (예: 로그인 유도 메시지일 때) */
  showCommentsCount?: boolean;
  isMarkdown?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
}

export default function DetailTemplate({
  title,
  status,
  author,
  date,
  views,
  commentsCount = 0,
  infoLabel,
  categories,
  content,
  backPath,
  hasSidebar = true,
  footer,
  comments,
  showCommentsCount = true,
  isMarkdown = false,
  onEdit,
  onDelete,
}: DetailTemplateProps) {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };
    if (menuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menuOpen]);

  // 상태 배지 스타일 및 텍스트 결정
  const getStatusDisplay = () => {
    switch (status) {
      case "recruiting":
        return { text: "모집 중", className: "bg-brand text-white" };
      case "completed":
        return { text: "모집 완료", className: "bg-gray-200 text-gray-500" };
      case "solved":
        return { text: "해결", className: "bg-brand text-white" };
      case "unsolved":
        return { text: "미해결", className: "bg-notice text-white" };
      default:
        return { text: "", className: "" };
    }
  };

  const statusDisplay = getStatusDisplay();

  return (
    <div className={`flex-1 bg-white ${hasSidebar ? "ml-[calc(9.375vw+240px)] px-16" : "px-[9.375%]"} py-16 min-h-screen`}>
      <div className="w-full">
        {/* 상단 네비게이션 (뒤로가기, 메뉴) */}
        <div className="flex justify-between items-center mb-8">
          <button
            onClick={() => router.push(backPath)}
            className="flex items-center justify-center w-14 h-14 shrink-0 rounded-full border border-gray-200 bg-white hover:bg-gray-50 transition-all text-gray-600"
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>
          <div className="relative shrink-0" ref={menuRef}>
            <button
              type="button"
              onClick={() => setMenuOpen((prev) => !prev)}
              className="flex items-center justify-center w-14 h-14 shrink-0 rounded-full hover:bg-gray-50 transition-all text-gray-400"
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="1" />
                <circle cx="12" cy="5" r="1" />
                <circle cx="12" cy="19" r="1" />
              </svg>
            </button>
            {menuOpen && (
              <div className="absolute right-0 top-full mt-1 min-w-[160px] py-1 bg-white rounded-xl border border-gray-200 shadow-lg z-50">
                <button
                  type="button"
                  onClick={() => {
                    onEdit?.();
                    setMenuOpen(false);
                  }}
                  className="flex items-center gap-3 w-full px-4 py-2.5 text-left text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  <Pencil size={18} className="shrink-0 text-gray-500" />
                  수정
                </button>
                <div className="border-t border-gray-100 my-1" />
                <button
                  type="button"
                  onClick={() => {
                    onDelete?.();
                    setMenuOpen(false);
                  }}
                  className="flex items-center gap-3 w-full px-4 py-2.5 text-left text-sm font-medium text-red-600 hover:bg-red-50"
                >
                  <Trash2 size={18} className="shrink-0" />
                  삭제
                </button>
              </div>
            )}
          </div>
        </div>

        {/* 메인 컨텐츠 영역 */}
        <div>
          {/* 상태 배지 */}
          <div className="mb-6">
            <span
              className={`px-4 py-1.5 rounded-full text-sm font-semibold ${statusDisplay.className}`}
            >
              {statusDisplay.text}
            </span>
          </div>

          {/* 제목 */}
          <h1 className="text-3xl font-bold text-gray-900 mb-4 leading-tight">
            {title}
          </h1>

          {/* 메타데이터 */}
          <div className="flex items-center text-sm text-gray-400 gap-4 mb-10">
            <span className="font-semibold text-base text-gray-700">{author}</span>
            <div className="flex items-center gap-1.5">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
              {date}
            </div>
            <div className="flex items-center gap-1.5">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
              {views}
            </div>
            {comments != null && showCommentsCount && (
              <div className="flex items-center gap-1.5">
                <MessageCircle size={14} />
                {commentsCount}
              </div>
            )}
          </div>

          {/* 필터 정보 박스 */}
          <div className="flex items-center self-stretch pl-7 py-3 rounded-[20px] border-2 border-gray-100 mb-12">
            <div className="flex items-center gap-6">
              <span className="text-[18px] font-semibold text-[#54585E] shrink-0">
                {infoLabel}
              </span>
              
              {/* 세로 구분선 */}
              <div className="w-[2px] h-5 bg-gray-300" />

              <div className="flex flex-wrap gap-2">
                {categories.map((cat) => (
                  <span
                    key={cat}
                    className="inline-flex items-center px-4 py-2 bg-gray-100 text-[#3E434A] rounded-full text-base font-medium font-['Inter']"
                  >
                    {cat}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* 구분선 */}
          <div className="border-t border-gray-100 mb-8" />

          {/* 본문 */}
          <div className="prose max-w-none text-gray-700 leading-loose whitespace-pre-wrap min-h-[400px]">
            {isMarkdown ? (
              <ReactMarkdown
                remarkPlugins={[remarkGfm, remarkBreaks]}
                components={{
                  h1: (props) => <h1 className="text-2xl font-bold mt-8 mb-4 text-gray-900" {...props} />,
                  h2: (props) => <h2 className="text-xl font-bold mt-6 mb-3 text-gray-900" {...props} />,
                  h3: (props) => <h3 className="text-lg font-bold mt-4 mb-2 text-gray-900" {...props} />,
                  p: (props) => <p className="mb-4 text-gray-700 leading-relaxed" {...props} />,
                  ul: (props) => <ul className="list-disc pl-6 mb-4 space-y-2" {...props} />,
                  ol: (props) => <ol className="list-decimal pl-6 mb-4 space-y-2" {...props} />,
                  li: (props) => <li className="text-gray-700" {...props} />,
                  blockquote: (props) => <blockquote className="border-l-4 border-gray-200 pl-4 italic my-4 text-gray-600" {...props} />,
                  code: ({ children, className, ...props }: any) => {
                    const match = /language-(\w+)/.exec(className || "");
                    const isCodeBlock = !!match;
                    return isCodeBlock ? (
                      <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto my-4 text-sm font-mono leading-relaxed">
                        <code className={className} {...props}>
                          {children}
                        </code>
                      </pre>
                    ) : (
                      <code className="bg-gray-100 text-[#ff4e4e] px-1.5 py-0.5 rounded text-sm font-mono" {...props}>
                        {children}
                      </code>
                    );
                  },
                }}
              >
                {content}
              </ReactMarkdown>
            ) : (
              content
            )}
          </div>

          {/* 하단 액션 (구분선 + 버튼) */}
          {footer && (
            <div className="mt-10">
              <div className="border-t border-gray-100 pt-8 flex justify-end">
                {footer}
              </div>
            </div>
          )}

          {/* 댓글 영역 */}
          {comments && (
            <div className="mt-16">
              <div className="border-t border-gray-200">
                {comments}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
