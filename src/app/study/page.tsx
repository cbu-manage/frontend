// [Next.js 문법] 'use client'는 클라이언트 사이드 렌더링을 명시하는 Next.js 전용 지시어
'use client';

import { useState } from 'react';

// 1. 카드 컴포넌트 (일반 React/JS 함수형 컴포넌트)
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

// [Next.js 문법] export default 함수는 해당 파일의 대표 페이지가 됩니다. (App Router 라우팅)
export default function StudyPage() { //라우팅 경로에 맞게 함수명 변경
  
  // [자바스크립트/React 문법] 상태 관리를 위한 Hook 사용
  const [selected, setSelected] = useState('전체');
  const [status, setStatus] = useState('모집 중');
  const [currentPage, setCurrentPage] = useState(1);

  // [자바스크립트 문법] 변수 및 배열 선언
  const categories = ['전체', 'C', 'Python', 'Java', '알고리즘', "기타"];
  const totalPages = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

  // --- (7주차 추가 시작 : 콘솔로그 - 자바스크립트 로직 파트) ---
  // 카테고리 클릭 시 실행될 함수
  const handleCategoryClick = (category: string) => {
    setSelected(category);
    console.log(`선택된 카테고리: ${category}`); // 개별적인 이벤트 로그
  };

  // 모집 상태 클릭 시 실행될 함수
  const handleStatusClick = (statusName: string) => {
    setStatus(statusName);
    // 모집 중이면 true, 모집 완료면 false
    const isRecruiting = statusName === '모집 중'; // 왼쪽 값과 오른쪽 값을 비교하여 결과를 무조건 불리언
    
    // false(모집 완료)일 때만 콘솔에 찍기
    if (!isRecruiting) {
      console.log(`모집 상태: ${isRecruiting}`); 
    }
  };
  // --- (7주차 추가 끝 : 콘솔로그) ---

  return (
  // (7주차 수정) 전체 화면 너비를 차지하는 배경 레이어 추가 -> 사이드 검둥이 제거
  <div className="w-full bg-white min-h-screen">
    <main className="max-w-7xl mx-auto px-6 pt-24 py-12 bg-white min-h-screen">
      
      {/* 1번 네모: 제목 */}
      <div className="mb-8 p-6">
        <h1 className="text-3xl font-bold text-gray-900">스터디 모집 공고</h1>
      </div>

      {/* 2번 네모: 필터 구역 (7주차 수정: 반응형 레이아웃 적용) */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10"> 
        {/* !!!!(7주차 수정) flex-col로 세로 정렬하되, md: 768px 이상에서만 가로(row) 정렬, items-start로 왼쪽 정렬 */}

        {/* 카테고리 버튼 구역 (7주차 수정: 줄바꿈 허용) */}
        <div className="flex flex-wrap gap-2"> 
          {/* (7주차 추가) flex-wrap을 넣어 화면이 좁아지면 버튼이 다음 줄로 넘어가게 함 */}
          {/* [자바스크립트 문법] .map()을 사용하여 배열 데이터를 JSX 리스트로 변환 JSX 안의 {} 사용*/}
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => handleCategoryClick(category)}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${
                selected === category
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* 모집 상태 버튼 구역 (7주차 수정: 모바일 환경에서는 숨기고 데스크톱에서만 표시) */}
          <div className="hidden md:flex bg-gray-100 p-1 rounded-full border border-gray-200"> 
            {/* (7주차 수정) 'hidden'으로 기본 숨김 처리, 'md:flex'로 768px 이상에서만 나타나게 함 -> 모바일 환경 우선*/}  
          <button 
            onClick={() => handleStatusClick('모집 중')}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
              status === '모집 중' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-400 hover:text-gray-600' 
            }`}
          >
            모집 중
          </button>
          <button 
            onClick={() => handleStatusClick('모집 완료')}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
              status === '모집 완료' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            모집 완료
          </button>
        </div>
      </div>

      {/* 3번 네모: 카드 그리드 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"> {/*카드의 반응형을 담당하는 핵심 코드*/}
        {/* [자바스크립트 문법] 빈 배열을 생성하여 반복 렌더링 수행 */}
        {[...Array(9)].map((_, i) => (
          <StudyCard key={i} number={i + 1} />
        ))}
      </div>

     {/* 4번 네모: 페이지네이션 */}
      <div className="flex justify-center items-center gap-2 mt-12">
        {/* [자바스크립트 문법] 화살표 함수와 Math 객체를 활용한 로직 처리 */}
        <button 
          onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
          className="p-2 text-gray-400 hover:text-gray-600" 
        >
          {"<"}
        </button>
        
        {totalPages.map((num) => (
          <button
            key={num}
            onClick={() => setCurrentPage(num)}
            className={`w-8 h-8 flex items-center justify-center rounded-md text-sm font-medium transition-all ${
              currentPage === num
                ? 'bg-gray-200 text-gray-700 shadow-sm'
                : 'text-gray-400 hover:bg-gray-50'
            }`}
          >
            {num}
          </button>
        ))}

        <button 
          onClick={() => setCurrentPage(p => Math.min(totalPages.length, p + 1))}
          className="p-2 text-gray-400 hover:text-gray-600"
        >
          {">"}
        </button>
      </div>
    </main>
  </div>
  ); 
}