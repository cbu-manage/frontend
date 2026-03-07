/**
 * @file CodingTestRow.tsx
 * @description 코딩테스트 준비 페이지 테이블 행 컴포넌트
 *
 * 코딩테스트 문제 목록을 테이블 형태로 표시합니다.
 * - 상태 (미해결 / 해결)
 * - 문제 제목
 * - 언어 (Python, Java 등)
 * - 플랫폼 (프로그래머스, 백준 등)
 * - 작성자 정보
 * - 댓글 수
 */

"use client";

import { useRouter } from "next/navigation";
import { MessageCircle } from "lucide-react";

// ============================================
// 타입 정의
// ============================================

/**
 * 문제 풀이 상태 타입
 * - '미해결': 빨간색 배지
 * - '해결': 초록색 배지
 */
export type SolveStatus = "미해결" | "해결";

/**
 * CodingTestRow 컴포넌트 Props 인터페이스
 * - language, platform: GET /post/languages, /post/platforms 에서 불러온 name 표시
 */
interface CodingTestRowProps {
  /** 고유 ID */
  id: number;

  /** 풀이 상태 */
  status: SolveStatus;

  /** 문제 제목 */
  title: string;

  /** 프로그래밍 언어 (API 언어 목록에서 불러옴) */
  language: string;

  /** 플랫폼 (API 플랫폼 목록에서 불러옴) */
  platform: string;

  /** 작성자 */
  author?: string;

  /** 댓글 수 */
  comments?: number;
}

// ============================================
// CodingTestRow 컴포넌트
// ============================================

/**
 * 코딩테스트 문제 행 컴포넌트
 *
 * @param props - CodingTestRowProps
 * @returns 코딩테스트 행 JSX 요소
 */
export function CodingTestRow({
  id,
  status,
  title,
  language,
  platform,
  author,
  comments = 0,
}: CodingTestRowProps) {
  const router = useRouter();
  const isSolved = status === "해결";

  return (
    <tr
      onClick={() => router.push(`/coding-test/${id}`)}
      className="border-b border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer"
    >
      {/* 상태 */}
      <td className="py-5 px-3 text-center w-20 sm:w-25">
        <span
          className={`inline-flex items-center justify-center px-3.8 py-2.5 rounded-full text-sm font-medium text-white min-w-[65px] ${
            isSolved ? "bg-[#45CD89]" : "bg-[#FC5E6E]"
          }`}
        >
          {status}
        </span>
      </td>

      {/* 문제 */}
      <td className="py-5 px-3 text-center text-gray-800 text-base w-60 sm:w-80">
        {title}
      </td>

      {/* 언어 */}
      <td className="py-5 px-3 text-center text-gray-800 text-base w-32">
        {language}
      </td>

      {/* 플랫폼 */}
      <td className="py-5 px-3 text-center w-32">
        <span className="text-gray-800 text-base">{platform}</span>
      </td>

      {/* 작성자 */}
      <td className="py-5 px-3 text-center text-gray-800 text-base w-32">
        {author}
      </td>

      {/* 댓글 */}
      <td className="py-5 px-3 text-center text-gray-400 text-base">
        <span className="flex items-center justify-center gap-1">
          <MessageCircle size={14} className="text-gray-400" />
          <span>{comments}</span>
        </span>
      </td>
    </tr>
  );
}
