'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import ArchiveCard from '@/components/archive/card';
import Pagination from '@/components/shared/Pagination';
import { Pencil } from 'lucide-react';

// 샘플 데이터 (나중에 API로 받을 데이터)
const sampleArchives = [
  {
    id: '1',
    title: '웹개발 기초 강의 자료',
    uploadedBy: '강민구',
    uploadedAt: '2024년 12월 15일',
    views: 245,
    likes: 18,
  },
  {
    id: '2',
    title: 'React 심화 학습 가이드',
    uploadedBy: '김철수',
    uploadedAt: '2024년 12월 14일',
    views: 156,
    likes: 42,
  },
  {
    id: '3',
    title: 'TypeScript 기초',
    uploadedBy: '이영희',
    uploadedAt: '2024년 12월 13일',
    views: 89,
    likes: 12,
  },
  {
    id: '4',
    title: 'Tailwind CSS 완전 가이드',
    uploadedBy: '박준호',
    uploadedAt: '2024년 12월 12일',
    views: 312,
    likes: 67,
  },
  {
    id: '5',
    title: '프론트엔드 성능 최적화',
    uploadedBy: '강민구',
    uploadedAt: '2024년 12월 11일',
    views: 178,
    likes: 29,
  },
  {
    id: '6',
    title: 'Next.js 13 최신 기능',
    uploadedBy: '서지수',
    uploadedAt: '2024년 12월 10일',
    views: 234,
    likes: 51,
  },
  {
    id: '7',
    title: 'REST API 설계 원칙',
    uploadedBy: '최준영',
    uploadedAt: '2024년 12월 9일',
    views: 145,
    likes: 33,
  },
  {
    id: '8',
    title: 'CSS Grid 마스터하기',
    uploadedBy: '강민구',
    uploadedAt: '2024년 12월 8일',
    views: 267,
    likes: 45,
  },
  {
    id: '9',
    title: '자바스크립트 클로저 이해하기',
    uploadedBy: '이준호',
    uploadedAt: '2024년 12월 7일',
    views: 198,
    likes: 38,
  },
  {
    id: '10',
    title: 'Git & GitHub 완벽 가이드',
    uploadedBy: '박영수',
    uploadedAt: '2024년 12월 6일',
    views: 342,
    likes: 72,
  },
  {
    id: '11',
    title: '데이터베이스 기본 개념',
    uploadedBy: '김하나',
    uploadedAt: '2024년 12월 5일',
    views: 167,
    likes: 25,
  },
  {
    id: '12',
    title: 'Docker 입문 가이드',
    uploadedBy: '이상민',
    uploadedAt: '2024년 12월 4일',
    views: 289,
    likes: 54,
  },
  {
    id: '13',
    title: 'API 테스팅 with Postman',
    uploadedBy: '최우진',
    uploadedAt: '2024년 12월 3일',
    views: 134,
    likes: 19,
  },
  {
    id: '14',
    title: 'AWS 클라우드 기초',
    uploadedBy: '김민준',
    uploadedAt: '2024년 12월 2일',
    views: 276,
    likes: 48,
  },
  {
    id: '15',
    title: '보안 프로그래밍 입문',
    uploadedBy: '박지훈',
    uploadedAt: '2024년 12월 1일',
    views: 201,
    likes: 31,
  },
  {
    id: '16',
    title: 'GraphQL 실전 가이드',
    uploadedBy: '이수진',
    uploadedAt: '2024년 11월 30일',
    views: 218,
    likes: 43,
  },
  {
    id: '17',
    title: '상태 관리 라이브러리 비교',
    uploadedBy: '강민구',
    uploadedAt: '2024년 11월 29일',
    views: 165,
    likes: 28,
  },
  {
    id: '18',
    title: '모바일 웹 최적화 전략',
    uploadedBy: '김철수',
    uploadedAt: '2024년 11월 28일',
    views: 234,
    likes: 52,
  },
  {
    id: '19',
    title: '테스트 코드 작성 완벽 가이드',
    uploadedBy: '이영희',
    uploadedAt: '2024년 11월 27일',
    views: 189,
    likes: 35,
  },
  {
    id: '20',
    title: 'CI/CD 파이프라인 구축',
    uploadedBy: '박준호',
    uploadedAt: '2024년 11월 26일',
    views: 312,
    likes: 61,
  },
  {
    id: '21',
    title: '디자인 패턴 실전 예제',
    uploadedBy: '서지수',
    uploadedAt: '2024년 11월 25일',
    views: 156,
    likes: 27,
  },
  {
    id: '22',
    title: 'Webpack과 번들링',
    uploadedBy: '최준영',
    uploadedAt: '2024년 11월 24일',
    views: 203,
    likes: 39,
  },
  {
    id: '23',
    title: '비동기 프로그래밍 마스터',
    uploadedBy: '이준호',
    uploadedAt: '2024년 11월 23일',
    views: 278,
    likes: 50,
  },
  {
    id: '24',
    title: 'Web Performance 최적화',
    uploadedBy: '김하나',
    uploadedAt: '2024년 11월 22일',
    views: 295,
    likes: 58,
  },
];

export default function ArchivePage() {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 16; // 4x4 = 16개
  
  // 페이지네이션 계산
  const totalPages = useMemo(() => {
    const pages = Math.ceil(sampleArchives.length / itemsPerPage);
    return Array.from({ length: pages }, (_, i) => i + 1);
  }, []);

  // 현재 페이지의 아이템
  const paginatedArchives = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return sampleArchives.slice(startIndex, startIndex + itemsPerPage);
  }, [currentPage]);

  return (
    <main className="min-h-screen pb-12 bg-white">
      <div className="px-[9.375%]">
        {/* 헤더 섹션 */}
        <div className="pt-12 flex items-start justify-between">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
              자료방
            </h1>
            <p className="text-base text-gray-600">
              스터디와 프로젝트에서 공유된 자료들을 한눈에 확인해보세요.
            </p>
          </div>
          <Link href="/archive/write">
            <button className="px-6 py-3 bg-gray-800 text-white rounded-2xl font-medium text-base hover:bg-[#3E434A]/90 transition-colors flex items-center gap-4 flex-shrink-0 whitespace-nowrap tracking-wide">
              <Pencil size={18} />
              글 작성하기
            </button>
          </Link>
        </div>

        {/* 카드 그리드 */}
        <div className="py-8 md:py-12">
          <div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              {paginatedArchives.map((archive) => (
                <ArchiveCard key={archive.id} {...archive} />
              ))}
            </div>
          </div>
        </div>

        {/* 페이지네이션 */}
        {totalPages.length > 1 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        )}
      </div>
    </main>
  );
}