// [Next.js 문법] 'use client'는 이 컴포넌트가 브라우저에서 상호작용(useState, 클릭 등)을 한다는 것을 Next.js에 알림
'use client';

import { useState } from 'react';

// --- (7주차 추가: 공통 컴포넌트 추출 - 프로젝트 리스트 아이템) ---
// [자바스크립트/React] 독립적인 UI 단위를 함수로 만든 '컴포넌트' 파트
function ProjectRow({ 
  status, 
  position, 
  title, 
  author, 
  time, 
  comments 
}: { 
  status: string; 
  position: string; 
  title: string; 
  author: string; 
  time: string; 
  comments?: number; 
}) {
  // [자바스크립트 문법] 변수 선언 및 조건식(비교 연산)
  const isCompleted = status === '완료'; //isCompleted 안에 불리언 값 저장

  return (
    <div className="grid grid-cols-13 border-b border-gray-100 py-5 text-center items-center hover:bg-gray-50 transition-colors cursor-pointer group">
      <div className="col-span-2">
        {/* [자바스크립트 문법] 템플릿 리터럴(` `)과 삼항 연산자를 사용하여 조건에 따라 테일윈드 클래스(문자열)를 동적으로 변경. */}
        <span className={`rounded-full px-4 py-1 text-xs font-medium ${        // 템플릿 리터널 -> 자바스크립트안에 테일윈드가 들어감??? 
          isCompleted 
            ? 'bg-gray-100 border border-gray-200 text-gray-700 font-semibold' // 완료된 상태 (참일 때)
            : 'border border-gray-300 text-gray-900' // 모집 중 상태 (거짓일 때)
        }`}>
          {status}
        </span>
      </div>
      <div className="col-span-2">
        <span className="bg-gray-100 px-3 py-1 rounded-md text-xs font-semibold text-gray-700">
          {position}
        </span>
      </div>
      <div className="col-span-4 text-center px-4 font-semibold text-gray-800">
        {title}
        {/* [자바스크립트 문법] && (단락 평가) 문법: comments가 존재할 때만 뒤의 JSX를 렌더링. */}
        {comments && <span className="text-blue-500 ml-2 text-xs font-normal">💬 {comments}</span>}  
        {/* (&& 단락평가 문법)  A && B: A가 **참(true)**이면 B를 반환 A && B: A가 거짓(false)이면 A에서 멈춤.*/}
      </div>
      <div className="col-span-2 text-gray-500 text-sm">{author}</div>
      <div className="col-span-2 text-gray-400 text-sm">{time}</div>
    </div>
  );
}

// [Next.js 문법] export default는 이 파일을 특정 주소(URL)로 접속했을 때 보여줄 '페이지'로 지정
export default function ProjectPage() { // (7주차 수정: 페이지 이름 의미에 맞게 변경)
  
  // [자바스크립트/React 문법] 상태 관리 (State)
  const [currentPage, setCurrentPage] = useState(1); // 페이지네이션 상태
  // --- (7주차 추가: 필터 상태 관리) ---
  const [selectedPosition, setSelectedPosition] = useState('전체'); // (7주차 추가: 필터 상태)
  const [selectedStatus, setSelectedStatus] = useState('모집 중'); // (7주차 추가: 상태 필터)

  // [자바스크립트 문법] 상수 데이터 배열 정의
  const positions = ['전체', '프론트엔드', '백엔드', '개발', '디자인', '기획', '기타'];
  const totalPages = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

  return (
  <div className="w-full bg-white min-h-screen">
    <main className="max-w-7xl mx-auto px-6 pt-24 py-12 bg-white min-h-screen font-sans">
      
      {/* [1] 필터 구역 (컴포넌트화 전, 상태 연동 준비) */}
      <div className="mb-8 p-8 bg-white rounded-xl">
        <div className="flex flex-col gap-8">
          {/* 1-1. 구인 포지션 필터 */}
          <div className="flex items-center gap-6">
            <div className="w-28 font-bold text-gray-800 text-lg">구인 포지션</div>
            <div className="flex gap-3 flex-wrap">
              {/* [자바스크립트 문법] .map()을 사용한 리스트 렌더링 */}
              {positions.map((pos) => (
                <button
                  key={pos}
                  onClick={() => setSelectedPosition(pos)} // (7주차 추가: 클릭 이벤트 - JS 익명 함수)
                  className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${
                    selectedPosition === pos
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'border border-gray-200 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {pos}
                </button>
              ))}
            </div>
          </div>

          {/* 1-2. 모집 여부 필터 */}
          <div className="flex items-center gap-6">
            <div className="w-28 font-bold text-gray-800 text-lg">모집 여부</div>
            <div className="flex gap-3 flex-wrap">
              {/* [자바스크립트 문법] 즉석 배열(['모집 중', '완료'])을 생성하여 map 실행 */}
              {['모집 중', '완료'].map((st) => (
                <button
                  key={st}
                  onClick={() => setSelectedStatus(st)}
                  className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${
                    selectedStatus === st
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'border border-gray-200 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* [2] 리스트 구역 (컴포넌트 적용) */}
      <div className="mb-8 p-6 bg-white rounded-xl">
        <div className="grid grid-cols-13 border-b-2 border-black pb-4 mb-2 text-center font-bold text-gray-700 text-base">
          <div className="col-span-2">모집 여부</div>
          <div className="col-span-2">구인 포지션</div>
          <div className="col-span-4">프로젝트 모집 글</div>
          <div className="col-span-2">작성자</div>
          <div className="col-span-2">업로드 시간</div>
        </div>

        {/* (7주차 수정: 개별 행을 ProjectRow 컴포넌트로 대체) */}
        {/* [자바스크립트/React] 사용자 정의 컴포넌트에 데이터를 전달(Props)하는 파트 */}
        <ProjectRow 
          status="모집 중" 
          position="프론트" 
          title=" 프로젝트 모집합니다~" 
          author="OOO" 
          time="6시간 전" 
          comments={1} 
        />
        <ProjectRow 
          status="완료" 
          position="알고리즘" 
          title=" 공모전 함께하실 분!" 
          author="OOO" 
          time="12시간 전" 
        />
        <ProjectRow 
          status="모집 중" 
          position="서버" 
          title="  " 
          author="OOO" 
          time="12시간 전" 
        />
        <ProjectRow 
          status="모집 중" 
          position="전부" 
          title="  " 
          author="OOO" 
          time="12시간 전" 
        />
        <ProjectRow 
          status="모집 중" 
          position="풀스택" 
          title="  " 
          author="OOO" 
          time="12시간 전" 
        />
        <ProjectRow 
          status="모집 중" 
          position="유니티" 
          title="  " 
          author="OOO" 
          time="12시간 전" 
        />
      </div>

      {/* [3] 페이지네이션 */}
      <div className="flex justify-center items-center gap-2 mt-12">
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
            className={`w-9 h-9 flex items-center justify-center rounded-md text-sm font-bold transition-all ${
              currentPage === num ? 'bg-gray-200 text-gray-800' : 'text-gray-400 hover:bg-gray-50'
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