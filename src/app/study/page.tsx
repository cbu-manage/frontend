/**
 * @file study/page.tsx
 * @description 스터디 모집 페이지
 *
 * 스터디 모집 공고를 카드 형태로 보여주는 페이지입니다.
 * - 사이드바: 프로그래밍 언어/분야별 카테고리 필터
 * - 상단 탭: 모집 중 / 모집 완료 필터
 * - 카드 그리드: 필터링된 스터디 목록
 * - 페이지네이션: 페이지 이동
 *
 * @todo [대기] 모바일 반응형 - 사이드바 숨김 처리 필요
 */

'use client';

import { useState } from 'react';
import { StudyCard as SDC, StudyStatus, StudyCategory } from '@/components/study/StudyCard';
import Sidebar from '@/components/shared/Sidebar';
import PGN from '@/components/shared/Pagination';

// ============================================
// 상수 정의
// ============================================

/**
 * 사이드바 카테고리 목록
 * 프로그래밍 언어 및 분야별 필터
 */
const CATEGORIES = [
  { label: '전체', value: '전체' },
  { label: 'C++', value: 'C++' },
  { label: 'Python', value: 'Python' },
  { label: 'Java', value: 'Java' },
  { label: '알고리즘', value: '알고리즘' },
  { label: '기타', value: '기타' },
];

/**
 * 페이지네이션용 페이지 번호 배열
 * @todo 실제 API 연동 시 동적으로 생성
 */
const TOTAL_PAGES = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

// ============================================
// 더미 데이터
// ============================================

/**
 * 스터디 목록 더미 데이터
 * @todo 실제 API 연동 시 제거
 * @todo [대기] 중복 카테고리 지원 시 category → categories: StudyCategory[]
 */
const STUDIES: { id: number; category: StudyCategory; status: StudyStatus; title: string }[] = [
  { id: 1, category: 'C++', status: '모집 중', title: 'C언어 기초 스터디 모집합니다~' },
  { id: 2, category: 'Python', status: '모집 완료', title: '파이썬 데이터분석 스터디 모집합니다~' },
  { id: 3, category: 'Java', status: '모집 중', title: '자바 스프링 스터디 모집합니다~' },
  { id: 4, category: '알고리즘', status: '모집 중', title: '코딩테스트 준비 스터디 모집합니다~' },
  { id: 5, category: '기타', status: '모집 중', title: 'AWS 클라우드 스터디 모집합니다~' },
  { id: 6, category: 'C++', status: '모집 중', title: 'C++ 게임개발 스터디 모집합니다~' },
  { id: 7, category: 'Python', status: '모집 완료', title: '장고 웹개발 스터디 모집합니다~' },
  { id: 8, category: 'Java', status: '모집 중', title: '안드로이드 앱개발 스터디 모집합니다~' },
  { id: 9, category: '알고리즘', status: '모집 중', title: '백준 문제풀이 스터디 모집합니다~' },
];

// ============================================
// StudyPage 컴포넌트
// ============================================

/**
 * 스터디 모집 페이지 컴포넌트
 *
 * @returns 스터디 모집 페이지 JSX 요소
 */
export default function StudyPage() {
  // ========== 상태 관리 ==========

  /** 현재 선택된 카테고리 (사이드바) */
  const [selectedCategory, setSelectedCategory] = useState('전체');

  /** 현재 선택된 모집 상태 (상단 탭) */
  const [statusFilter, setStatusFilter] = useState<StudyStatus>('모집 중');

  /** 현재 페이지 번호 */
  const [currentPage, setCurrentPage] = useState(1);

  // ========== 필터링 로직 ==========

  /**
   * 카테고리 + 모집 상태로 필터링된 스터디 목록
   * @todo [대기] 중복 카테고리 지원 시 includes() 사용
   * 예: study.categories.includes(selectedCategory)
   */
  const filteredStudies = STUDIES.filter((study) => {
    // 카테고리 필터: '전체'가 아닌 경우 해당 카테고리만 표시
    const categoryMatch = selectedCategory === '전체' || study.category === selectedCategory;

    // 모집 상태 필터
    const statusMatch = study.status === statusFilter;

    return categoryMatch && statusMatch;
  });

  return (
    // 페이지 컨테이너 - 전체 화면 배경색
    <div className="w-full bg-gray-50 min-h-screen">

      {/* ========== 사이드바 ========== */}
      {/*
        @todo [대기] 모바일 반응형
        - lg 이상에서만 표시: hidden lg:block
        - 모바일에서는 햄버거 메뉴로 대체
      */}
      <Sidebar
        items={CATEGORIES}
        selected={selectedCategory}
        onSelect={setSelectedCategory}
        writeLink="/study/write"
      />

      {/* ========== 메인 콘텐츠 영역 ========== */}
      {/*
        ml-80: 사이드바 너비(320px)만큼 왼쪽 여백
        @todo [대기] 모바일에서는 ml-0으로 변경
        예: className="ml-0 lg:ml-80"
      */}
      <div className="ml-80">
        <main className="max-w-6xl mx-auto px-4 sm:px-6 pt-8 sm:pt-12 pb-16">

          {/* ========== 페이지 헤더 ========== */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
            {/* 제목 영역 */}
            <div className="flex items-center gap-3">
              <span className="text-2xl sm:text-3xl">📚</span>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">스터디 모집</h1>
            </div>

            {/* 나의 작성 목록 버튼 - pill 스타일 */}
            <span className="
              text-sm text-emerald-600
              bg-white border border-emerald-500
              rounded-full px-4 py-1
              cursor-pointer hover:bg-emerald-50
              w-fit
            ">
              나의 작성 목록 &gt;
            </span>
          </div>

          {/* ========== 모집 상태 필터 탭 ========== */}
          <div className="flex items-center gap-3 mb-6 text-sm">
            {/* 모집 중 버튼 */}
            <button
              onClick={() => {
                // isRecruiting = true → 콘솔에 찍지 않음 (요구사항)
                setStatusFilter('모집 중');
              }}
              className={`flex items-center gap-1 transition-colors ${
                statusFilter === '모집 중'
                  ? 'text-gray-900 font-medium'  // 선택됨
                  : 'text-gray-400'               // 선택 안됨
              }`}
            >
              {/* 체크 아이콘 - 선택된 경우에만 표시 */}
              {statusFilter === '모집 중' && (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              )}
              모집 중
            </button>

            {/* 구분선 */}
            <span className="text-gray-300">|</span>

            {/* 모집 완료 버튼 */}
            <button
              onClick={() => {
                // isRecruiting = false → 콘솔에 찍음 (요구사항)
                const isRecruiting = false;
                console.log(`[모집 상태 필터] isRecruiting: ${isRecruiting}`);
                setStatusFilter('모집 완료');
              }}
              className={`flex items-center gap-1 transition-colors ${
                statusFilter === '모집 완료'
                  ? 'text-gray-900 font-medium'  // 선택됨
                  : 'text-gray-400'               // 선택 안됨
              }`}
            >
              {/* 체크 아이콘 - 선택된 경우에만 표시 */}
              {statusFilter === '모집 완료' && (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              )}
              모집 완료
            </button>
          </div>

          {/* ========== 카드 그리드 ========== */}
          {/*
            반응형 그리드:
            - 모바일 (기본): 1열
            - 태블릿 (md): 2열
            - 데스크탑 (lg): 3열
          */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {filteredStudies.map((study) => (
              <SDC
                key={study.id}
                number={study.id}
                category={study.category}
                status={study.status}
                title={study.title}
                time="6시간 전"
              />
            ))}

            {/* 필터링 결과가 없는 경우 */}
            {filteredStudies.length === 0 && (
              <div className="col-span-full text-center py-12 text-gray-500">
                해당 조건에 맞는 스터디가 없습니다.
              </div>
            )}
          </div>

          {/* ========== 페이지네이션 ========== */}
          <PGN
            currentPage={currentPage}
            totalPages={TOTAL_PAGES}
            onPageChange={(num) => setCurrentPage(num)}
          />
        </main>
      </div>
    </div>
  );
}
