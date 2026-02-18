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

'use client';

import { useRouter } from 'next/navigation';
import { MessageCircle } from 'lucide-react';

// ============================================
// 타입 정의
// ============================================

/**
 * 문제 풀이 상태 타입
 * - '미해결': 빨간색 배지
 * - '해결': 초록색 배지
 */
export type SolveStatus = '미해결' | '해결';

/**
 * 프로그래밍 언어 타입
 */
export type Language = 'Python' | 'Java' | 'C++' | 'JavaScript' | 'C' | '기타';

/**
 * 코딩테스트 플랫폼 타입
 */
export type Platform = '프로그래머스' | '백준' | 'LeetCode' | 'SWEA' | '기타';

/**
 * CodingTestRow 컴포넌트 Props 인터페이스
 */
interface CodingTestRowProps {
  /** 고유 ID */
  id: number;

  /** 풀이 상태 */
  status: SolveStatus;

  /** 문제 제목 */
  title: string;

  /** 프로그래밍 언어 */
  language: Language;

  /** 플랫폼 */
  platform: Platform;

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
  author = '34기 씨부엉',
  comments = 333,
}: CodingTestRowProps) {
  const router = useRouter();
  const isSolved = status === '해결';

  return (
    <tr 
      onClick={() => router.push(`/coding-test/${id}`)}
      className="border-b border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer"
    >
      {/* 상태 */}
      <td className="py-4 px-4 text-center">
        <span className={`px-3 py-1 rounded-full text-xs text-white ${
          isSolved
            ? 'bg-[#6ECA8F]'  // 해결: 초록 배경
            : 'bg-red-400'    // 미해결: 빨강 배경
        }`}>
          {status}
        </span>
      </td>

      {/* 문제 */}
      <td className="py-4 px-4 text-gray-800 text-sm">
        {title}
      </td>

      {/* 언어 */}
      <td className="py-4 px-4 text-center text-gray-600 text-sm">
        {language}
      </td>

      {/* 플랫폼 */}
      <td className="py-4 px-4 text-center">
        <span className="text-gray-600 text-sm underline">
          {platform}
        </span>
      </td>

      {/* 작성자 */}
      <td className="py-4 px-4 text-center text-gray-600 text-sm">
        {author}
      </td>

      {/* 댓글 */}
      <td className="py-4 px-4 text-center text-gray-400 text-sm">
        <span className="flex items-center justify-center gap-1">
          <MessageCircle size={14} className="text-gray-400" />
          <span>{comments}</span>
        </span>
      </td>
    </tr>
  );
}
