'use client';

import { useState } from 'react';

// 1. 카드 컴포넌트
function StudyCard({ number }: { number: number }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm flex flex-col hover:shadow-md transition-shadow cursor-pointer overflow-hidden">
      <div className="p-6 flex flex-col gap-4">
        <div className="flex justify-between items-center">
          <span className="bg-emerald-50 text-emerald-500 px-2 py-1 rounded text-xs font-bold">모집 중</span>
          <span className="text-gray-400 text-xs font-light">🕑6시간 전</span>
        </div>
        <div className="flex flex-col gap-9">
          <h3 className="text-lg font-bold text-gray-900 leading-snug">웹개발 스터디 모집합니다~</h3>
          <div><span className="bg-yellow-100 text-yellow-700 px-2 py-1 rounded text-[10px] font-semibold">C++</span></div>
        </div>
      </div>
      <div className="bg-gray-50 px-6 py-4 border-t border-gray-100 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-gray-200 rounded-full"></div>
          <span className="text-sm text-gray-700 font-medium">aBCDFEFGOL</span>
        </div>
        <div className="flex gap-3 text-xs text-gray-400"><span>👁️ 122</span><span>💬 333</span></div>
      </div>
    </div>
  );
}

// 2. 메인 페이지setStatus

export default function StudyPage() {
  const [selected, setSelected] = useState('전체'); // 선택된 카테고리 상태
  const [status, setStatus] = useState('모집 중'); // 모집 상태 상태
  const [currentPage, setCurrentPage] = useState(1); // 현재 페이지 상태

  const categories = ['전체', 'C', 'Python', 'Java', '알고리즘', "기타"]; // 카테고리 목록
  const totalPages = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]; // 페이지 번호 목록

  return (
    <main className="max-w-7xl mx-auto px-6 pt-24 py-12 bg-white min-h-screen">
      
      {/* 1번 네모: 제목 */}
      <div className="mb-8 p-6">
        <h1 className="text-3xl font-bold text-gray-900">스터디 모집 공고</h1>
      </div>

      {/* 2번 네모: 필터 구역 */}
      <div className="flex justify-between items-center mb-10">
        <div className="flex gap-2">
          {categories.map((category) => ( // 카테고리 버튼 */}
            <button
              key={category} // 고유 키 설정
              onClick={() => setSelected(category)} // 클릭 시 선택된 카테고리 변경
              className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${
                selected === category // 선택된 카테고리 스타일 적용
                  ? 'bg-blue-600 text-white shadow-sm' // 선택된 스타일
                  : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'// 선택되지 않은 스타일
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        <div className="flex bg-gray-100 p-1 rounded-full border border-gray-200"> 
          <button 
            onClick={() => setStatus('모집 중')} // 클릭 시 모집 상태 변경
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
              status === '모집 중' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-400 hover:text-gray-600' 
            }`}
          >
            모집 중
          </button>
          <button 
            onClick={() => setStatus('모집 완료')}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
              status === '모집 완료' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            모집 완료
          </button>
        </div>
      </div>

      {/* 3번 네모: 카드 그리드 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"> 
        {[...Array(9)].map((_, i) => (  // 9개의 카드 생성
          <StudyCard key={i} number={i + 1} /> // 고유 키와 번호 전달
        ))}
      </div>

     {/* 4번 네모: 페이지네이션 */}
      <div className="flex justify-center items-center gap-2 mt-12">
        <button 
          onClick={() => setCurrentPage(p => Math.max(1, p - 1))} // 이전 페이지로 이동
          className="p-2 text-gray-400 hover:text-gray-600" 
        >
          {"<"}
        </button>
        
        {totalPages.map((num) => (
          <button
            key={num}
            onClick={() => setCurrentPage(num)} // 클릭 시 페이지 변경
            className={`w-8 h-8 flex items-center justify-center rounded-md text-sm font-medium transition-all ${
              currentPage === num
                ? 'bg-gray-200 text-gray-700 shadow-sm' // 선택된 페이지 스타일
                : 'text-gray-400 hover:bg-gray-50' // 선택되지 않은 페이지 스타일
            }`}
          >
            {num}
          </button>
        ))}

        <button 
          onClick={() => setCurrentPage(p => Math.min(totalPages.length, p + 1))} // 다음 페이지로 이동
          className="p-2 text-gray-400 hover:text-gray-600"
        >
          {">"}
        </button>
      </div>
    </main>
  ); 
}