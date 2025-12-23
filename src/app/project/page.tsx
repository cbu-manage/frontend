'use client';
import { useState } from 'react';

export default function StudyPage() {
  const [currentPage, setCurrentPage] = useState(1); // 현재 페이지 상태
  const totalPages = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]; // 페이지 번호 목록

  return (
    /* [전체 컨테이너] */
    <main className="max-w-7xl mx-auto px-6 pt-24 py-12 bg-white min-h-screen font-sans">
      {/* [1] 2번 네모: 필터 구역 */}
      <div className="mb-8 p-8 bg-white rounded-xl" >
        <div className="flex flex-col gap-8">
          {/* 1-1. 구인 포지션 필터 */}
          <div className="flex items-center gap-6">
            <div className="w-28 font-bold text-gray-800 text-lg">구인 포지션</div>
            <div className="flex gap-3 flex-wrap">
              <button className="bg-blue-600 text-white px-6 py-2 rounded-full text-sm font-medium shadow-sm">
                전체
              </button>
              <button className="border border-gray-200 text-gray-500 px-6 py-2 rounded-full text-sm font-medium hover:bg-gray-50 transition-colors">
                프론트엔드
              </button>
              <button className="border border-gray-200 text-gray-500 px-6 py-2 rounded-full text-sm font-medium hover:bg-gray-50 transition-colors">
                백엔드
              </button>
              <button className="border border-gray-200 text-gray-500 px-6 py-2 rounded-full text-sm font-medium hover:bg-gray-50 transition-colors">
                개발
              </button>
              <button className="border border-gray-200 text-gray-500 px-6 py-2 rounded-full text-sm font-medium hover:bg-gray-50 transition-colors">
                디자인
              </button>
              <button className="border border-gray-200 text-gray-500 px-6 py-2 rounded-full text-sm font-medium hover:bg-gray-50 transition-colors">
                기획
              </button>
              <button className="border border-gray-200 text-gray-500 px-6 py-2 rounded-full text-sm font-medium hover:bg-gray-50 transition-colors">
                기타
              </button>
            </div>
          </div>

          {/* 1-2. 모집 여부 필터 */}
          <div className="flex items-center gap-6">
            <div className="w-28 font-bold text-gray-800 text-lg">모집 여부</div>
            <div className="flex gap-3">
              <button className="bg-blue-600 text-white px-6 py-2 rounded-full text-sm font-medium shadow-sm">
                모집 중
              </button>
              <button className="border border-gray-200 text-gray-500 px-6 py-2 rounded-full text-sm font-medium hover:bg-gray-50 transition-colors">
                완료
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* [2] 3번 네모: 카드(리스트) 구역 */}
      <div className="mb-8 p-6 bg-white rounded-xl">
        
        {/* 테이블 제목 줄 */}
        <div className="grid grid-cols-13 border-b-2 border-black pb-4 mb-2 text-center font-bold text-gray-700 text-base">
          <div className="col-span-2">모집 여부</div>
          <div className="col-span-2">구인 포지션</div>
          <div className="col-span-4">프로젝트 모집 글</div>
          <div className="col-span-2">작성자</div>
          <div className="col-span-2">업로드 시간</div>
        </div>

        {/* 리스트 줄 - 예시 1 */}
        <div className="grid grid-cols-13 border-b border-gray-100 py-5 text-center items-center hover:bg-gray-50 transition-colors cursor-pointer group">
          <div className="col-span-2">
            <span className="border border-gray-300 rounded-full px-4 py-1 text-xs text-gray-600 font-medium">
              모집 중
            </span>
          </div>
          <div className="col-span-2">
            <span className="bg-gray-100 px-3 py-1 rounded-md text-xs font-semibold text-gray-700">
              프론트
            </span>
          </div>
          <div className="col-span-4 text-center px-4 font-semibold text-gray-800">
            && 프로젝트 모집합니다~
          </div>
          <div className="col-span-2 text-gray-500 text-sm">OOO</div>
          <div className="col-span-2 text-gray-400 text-sm">6시간 전</div>
          <span className="text-blue-500 ml-2 text-xs font-normal">💬 1</span>

        </div>

        {/* 리스트 줄 - 예시 2 */}
        <div className="grid grid-cols-13 border-b border-gray-100 py-5 text-center items-center hover:bg-gray-50 transition-colors cursor-pointer group">
          <div className="col-span-2">
            <span className="bg-gray-100 border border-gray-200 text-gray-400 rounded-full px-4 py-1 text-xs font-medium">
              완료
            </span>
          </div>
          <div className="col-span-2">
            <span className="bg-gray-100 px-3 py-1 rounded-md text-xs font-semibold text-gray-700">
              알고리즘
            </span>
          </div>
          <div className="col-span-4 text-center px-4 font-semibold text-gray-800">
            && 공모전 함께하실 분!
          </div>
          <div className="col-span-2 text-gray-500 text-sm">OOO</div>
          <div className="col-span-2 text-gray-400 text-sm">12시간 전</div>
        </div>
      </div>

      {/* [3] 4번 네모: 페이지네이션 */}
      <div className="flex justify-center items-center gap-2 mt-12">
        {/* 이전 버튼 */}
        <button 
          onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
          className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
        >
          {"<"}
        </button>
        
        {/* 숫자 버튼들 */}
        {totalPages.map((num) => (
          <button
            key={num}
            onClick={() => setCurrentPage(num)}
            className={`w-9 h-9 flex items-center justify-center rounded-md text-sm font-bold transition-all ${
              currentPage === num
                ? 'bg-gray-200 text-gray-800 shadow-inner' 
                : 'text-gray-400 hover:bg-gray-50 hover:text-gray-600'
            }`}
          >
            {num}
          </button>
        ))}

        {/* 다음 버튼 */}
        <button 
          onClick={() => setCurrentPage(p => Math.min(totalPages.length, p + 1))}
          className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
        >
          {">"}
        </button>
      </div>

    </main>
  );
}