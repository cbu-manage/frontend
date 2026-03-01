"use client";

import { useState } from "react";
import { MessageCircle, Eye } from "lucide-react";
import Link from "next/link";
import PGN from "@/components/shared/Pagination";
import { StudyCard } from "@/components/study/StudyCard";
import { ProjectCard } from "@/components/project/ProjectCard";
import { CodingTestRow, Language } from "@/components/coding-test/CodingTestRow";
import ArchiveCard from "@/components/archive/card";

// ============================================
// 타입 정의
// ============================================

/** 카테고리 필터 키 */
type PostCategory = "전체보기" | "스터디 모집" | "프로젝트 모집" | "코딩테스트 준비" | "자료방";

type PostStatus = "모집 중" | "모집 완료";

interface MyPost {
  id: number;
  /** 글이 속한 카테고리 (전체보기 제외) */
  category: Exclude<PostCategory, "전체보기">;
  status: PostStatus;
  title: string;
  content: string;
  /** 태그 (포지션, 언어, 분야 등) */
  tags: string[];
  views: number;
  comments: number;
  time: string;
  /** 글 상세 링크 */
  href: string;
}

/** 탭에 표시할 카테고리 목록 (전체보기 제외) */
const CATEGORY_LIST: Exclude<PostCategory, "전체보기">[] = [
  "스터디 모집",
  "프로젝트 모집",
  "코딩테스트 준비",
  "자료방",
];

// ============================================
// 더미 데이터 (@todo 실제 API 연동 시 제거)
// ============================================

const DUMMY_POSTS: MyPost[] = [
  // 스터디 모집 (3건)
  ...Array.from({ length: 3 }, (_, i) => ({
    id: 100 + i,
    category: "스터디 모집" as const,
    status: (i === 2 ? "모집 완료" : "모집 중") as PostStatus,
    title: ["Python 알고리즘 스터디 모집", "Java 스프링 스터디원 구합니다", "CS 면접 대비 스터디"][i],
    content: ["파이썬 기반 알고리즘 문제풀이 스터디입니다. 매주 백준/프로그래머스 5문제씩 풀고 코드리뷰합니다.", "Spring Boot 기반 백엔드 개발 스터디입니다. 실무 프로젝트를 함께 진행합니다.", "CS 기초부터 심화까지 면접 대비 스터디입니다. 운영체제, 네트워크, 데이터베이스 등을 다룹니다."][i],
    tags: [["Python", "알고리즘"], ["Java", "Spring"], ["CS", "면접"]][i],
    views: [89, 156, 203][i],
    comments: [12, 28, 45][i],
    time: ["6시간 전", "3일 전", "1주일 전"][i],
    href: `/study/${i + 1}`,
  })),
  // 프로젝트 모집 (3건)
  ...Array.from({ length: 3 }, (_, i) => ({
    id: 200 + i,
    category: "프로젝트 모집" as const,
    status: (i === 1 ? "모집 완료" : "모집 중") as PostStatus,
    title: ["[앱 프론트엔드 개발자 모집] 대학생을 위한 중개 플랫폼", "[백엔드 개발자 모집] Spring Boot 기반 서버 개발", "[풀스택] 동아리 관리 시스템 개발"][i],
    content: ["안녕하세요! 웹/앱 서비스 구현을 목표로 한 사이드 프로젝트를 함께할 팀원을 모집합니다. 📌 프로젝트 개요주제: 일정 관리 웹 서비스", "Spring Boot + JPA 기반 REST API 서버를 함께 개발할 백엔드 개발자를 모집합니다. AWS 배포 경험자 우대합니다.", "Next.js + Spring Boot로 동아리 관리 시스템을 만들 팀원을 모집합니다. 기획부터 배포까지 함께합니다."][i],
    tags: [["프론트엔드", "백엔드", "디자인", "기획"], ["백엔드", "개발"], ["프론트엔드", "백엔드", "개발", "디자인", "기획", "기타"]][i],
    views: [122, 98, 211][i],
    comments: [333, 15, 42][i],
    time: ["3/1", "2/28", "3/15"][i],
    href: `/project/${i + 1}`,
  })),
  // 코딩테스트 준비 (4건)
  ...Array.from({ length: 4 }, (_, i) => ({
    id: 300 + i,
    category: "코딩테스트 준비" as const,
    status: (i === 3 ? "모집 완료" : "모집 중") as PostStatus,
    title: ["백준 골드 도전기 - DP 정복하기", "프로그래머스 Lv.3 풀이 모음", "삼성 SW 역량테스트 대비 풀이", "카카오 코딩테스트 기출 분석"][i],
    content: ["DP 문제 유형별 정리 및 풀이 방법을 공유합니다. 골드 이상 문제 위주로 다룹니다.", "프로그래머스 레벨3 문제를 유형별로 정리했습니다. 그래프, 이진탐색, 완전탐색 중심입니다.", "삼성 SW 역량테스트 기출 문제 풀이와 시뮬레이션 유형을 정리했습니다.", "카카오 2024 블라인드 채용 기출 분석 및 풀이 방법을 공유합니다."][i],
    tags: [["DP", "Python"], ["그래프", "Python"], ["시뮬레이션", "C++"], ["카카오", "Java"]][i],
    views: [342, 178, 267, 445][i],
    comments: [56, 23, 39, 72][i],
    time: ["2/12", "2/8", "1/25", "1/15"][i],
    href: `/coding-test/${i + 1}`,
  })),
  // 자료방 (4건)
  ...Array.from({ length: 4 }, (_, i) => ({
    id: 400 + i,
    category: "자료방" as const,
    status: "모집 중" as PostStatus,
    title: ["운영체제 기말 정리 노트", "컴퓨터네트워크 중간고사 요약", "데이터베이스 설계 프로젝트 자료", "웹프로그래밍 React 실습 자료"][i],
    content: ["운영체제 강의 기말고사 범위 핵심 정리 노트입니다. 프로세스, 메모리, 파일 시스템 중심.", "컴퓨터네트워크 중간고사 대비 요약 정리입니다. OSI 7계층, TCP/IP, HTTP 프로토콜.", "데이터베이스 설계 프로젝트에서 사용한 ERD, 정규화 자료를 공유합니다.", "React를 활용한 웹프로그래밍 실습 자료입니다. 컴포넌트, 상태관리, 라우팅을 다룹니다."][i],
    tags: [["운영체제", "기말"], ["네트워크", "중간"], ["DB", "설계"], ["React", "웹"]][i],
    views: [567, 234, 189, 312][i],
    comments: [88, 34, 21, 47][i],
    time: ["2/14", "2/5", "1/28", "1/20"][i],
    href: `/archive/${i + 1}`,
  })),
];

const TOTAL_PAGES = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

/** 알려진 프로그래밍 언어 목록 (코딩테스트 매핑용) */
const KNOWN_LANGUAGES = ["Python", "Java", "C++", "JavaScript", "C"];

// ============================================
// MyPostsSection 컴포넌트
// ============================================

export default function MyPostsSection() {
  const [activeTab, setActiveTab] = useState<PostCategory>("전체보기");
  const [currentPage, setCurrentPage] = useState(1);

  const filteredPosts =
    activeTab === "전체보기"
      ? DUMMY_POSTS
      : DUMMY_POSTS.filter((p) => p.category === activeTab);

  return (
    <div className="max-w-6xl mx-auto">
      {/* 페이지 제목 */}
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6">
        나의 작성 목록
      </h1>

      {/* 카테고리 탭 필터 */}
      <div className="flex flex-wrap items-center gap-4 mb-8 text-sm">
        <button
          onClick={() => { setActiveTab("전체보기"); setCurrentPage(1); }}
          className={`transition-colors ${activeTab === "전체보기" ? "text-gray-900 font-semibold" : "text-gray-400"}`}
        >
          전체보기({DUMMY_POSTS.length})
        </button>
        {CATEGORY_LIST.map((cat) => {
          const count = DUMMY_POSTS.filter((p) => p.category === cat).length;
          return (
            <button
              key={cat}
              onClick={() => { setActiveTab(cat); setCurrentPage(1); }}
              className={`transition-colors ${activeTab === cat ? "text-gray-900 font-semibold" : "text-gray-400"}`}
            >
              {cat}({count})
            </button>
          );
        })}
      </div>

      {/* ========== 전체보기: 기존 PostCard ========== */}
      {activeTab === "전체보기" && (
        <div className="flex flex-col gap-4">
          {filteredPosts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      )}

      {/* ========== 스터디 모집: StudyCard 그리드 ========== */}
      {activeTab === "스터디 모집" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {filteredPosts.map((post) => (
            <StudyCard
              key={post.id}
              id={post.id}
              status={post.status}
              title={post.title}
              time={post.time}
            />
          ))}
        </div>
      )}

      {/* ========== 프로젝트 모집: ProjectCard 리스트 ========== */}
      {activeTab === "프로젝트 모집" && (
        <div className="flex flex-col gap-4">
          {filteredPosts.map((post) => (
            <ProjectCard
              key={post.id}
              id={post.id}
              status={post.status}
              title={post.title}
              positions={post.tags}
              views={post.views}
              comments={post.comments}
              time={post.time}
              content={post.content}
            />
          ))}
        </div>
      )}

      {/* ========== 코딩테스트 준비: CodingTestRow 테이블 ========== */}
      {activeTab === "코딩테스트 준비" && (
        <div className="bg-white border border-gray-200 overflow-x-auto">
          <table className="w-full min-w-[600px]">
            <thead className="bg-[#95C674] text-white">
              <tr>
                <th className="py-2 sm:py-3 px-2 sm:px-4 text-center text-xs sm:text-sm font-medium w-[80px] sm:w-[100px]">상태</th>
                <th className="py-2 sm:py-3 px-2 sm:px-4 text-center text-xs sm:text-sm font-medium">문제</th>
                <th className="py-2 sm:py-3 px-2 sm:px-4 text-center text-xs sm:text-sm font-medium w-[70px] sm:w-[100px]">언어</th>
                <th className="py-2 sm:py-3 px-2 sm:px-4 text-center text-xs sm:text-sm font-medium w-[90px] sm:w-[120px]">플랫폼</th>
                <th className="py-2 sm:py-3 px-2 sm:px-4 text-center text-xs sm:text-sm font-medium w-[90px] sm:w-[120px]">작성자</th>
                <th className="py-2 sm:py-3 px-2 sm:px-4 text-center text-xs sm:text-sm font-medium w-[60px] sm:w-[80px]"></th>
              </tr>
            </thead>
            <tbody>
              {filteredPosts.map((post) => {
                const lang = (post.tags.find((t) => KNOWN_LANGUAGES.includes(t)) || "Python") as Language;
                return (
                  <CodingTestRow
                    key={post.id}
                    id={post.id}
                    status={post.status === "모집 완료" ? "해결" : "미해결"}
                    title={post.title}
                    language={lang}
                    platform="프로그래머스"
                    comments={post.comments}
                  />
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* ========== 자료방: ArchiveCard 그리드 ========== */}
      {activeTab === "자료방" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {filteredPosts.map((post) => (
            <ArchiveCard
              key={post.id}
              id={String(post.id)}
              title={post.title}
              uploadedBy="씨부엉"
              uploadedAt={`2025년 ${post.time}`}
              views={post.views}
            />
          ))}
        </div>
      )}

      {/* 빈 상태 */}
      {filteredPosts.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          해당 카테고리에 작성한 글이 없습니다.
        </div>
      )}

      {/* 페이지네이션 */}
      <PGN
        currentPage={currentPage}
        totalPages={TOTAL_PAGES}
        onPageChange={(num) => setCurrentPage(num)}
      />
    </div>
  );
}

// ============================================
// PostCard 컴포넌트 (전체보기용)
// ============================================

function PostCard({ post }: { post: MyPost }) {
  const isCompleted = post.status === "모집 완료";

  return (
    <Link
      href={post.href}
      className="group bg-white rounded-2xl border border-gray-200 shadow-sm flex flex-col hover:shadow-md transition-shadow cursor-pointer overflow-hidden"
    >
      {/* 카드 상단: 상태 + 마감일 + 제목 + 내용 미리보기 */}
      <div className="px-4 sm:px-6 pt-5 sm:pt-6 pb-4 sm:pb-5 flex flex-col gap-3">
        {/* 상태 배지 */}
        <div className="flex items-center">
          <span
            className={`text-center py-2 px-4 rounded-full text-xs font-semibold text-white ${
              isCompleted ? "bg-[#FC5E6E]" : "bg-[#45CD89]"
            }`}
          >
            {post.status}
          </span>
        </div>

        {/* 제목 */}
        <h3 className="text-base sm:text-lg font-bold text-gray-900 leading-snug line-clamp-2">
          {post.title}
        </h3>

        {/* 내용 미리보기 */}
        <p className="text-sm text-gray-700 leading-relaxed line-clamp-2">
          {post.content}
        </p>
      </div>

      {/* 구분선 - 카드 좌우 패딩 적용 */}
      <div className="mx-4 sm:mx-6 border-t border-gray-200" />

      {/* 카드 하단: 포지션 태그 + 메타 정보 */}
      <div className="bg-white px-4 sm:px-6 py-4 sm:py-5 flex justify-between items-center">
        {/* 포지션 태그 */}
        <div className="flex flex-wrap gap-1.5">
          {post.tags.map((pos) => (
            <span
              key={pos}
              className="bg-gray-100 text-gray-500 px-4 py-1.5 rounded-full text-sm font-semibold"
            >
              {pos}
            </span>
          ))}
        </div>

        {/* 조회수 + 댓글 수 */}
        <div className="flex items-center gap-12 sm:gap-14 text-xs text-gray-600">
          <span className="flex items-center gap-1">
            <Eye size={14} /> {post.views}
          </span>
          <span className="flex items-center gap-1">
            <MessageCircle size={14} />
            {post.comments}
          </span>
        </div>
      </div>
    </Link>
  );
}
