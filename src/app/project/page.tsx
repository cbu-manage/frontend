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
  const isCompleted = status === '완료'; // isCompleted 안에 불리언(true/false) 값 저장
  // // 1번째 함수 (재사용 가능한 UI 조각) 
  return (
    <div className="border-b border-gray-100 py-4 hover:bg-gray-50 transition-colors cursor-pointer w-full">
      {/* [반응형 레이아웃 1] 모바일 카드형 (sm 미만에서 표시, sm 이상에서 hidden) */}
      <div className="flex flex-col gap-3 sm:hidden px-4 w-full">
        {/* 상단: 상태 및 포지션 배지 영역 */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* [자바스크립트 문법] 템플릿 리터럴(` `)과 삼항 연산자를 사용한 동적 클래스 부여 */}
          <span className={`rounded-full px-3 py-1 text-[10px] font-medium ${
            isCompleted 
              ? 'bg-gray-100 border border-gray-200 text-gray-700' // 완료 상태일 때
              : 'border border-gray-300 text-gray-900' // 모집 중 상태일 때
          }`}>
            {status}
          </span>
          <span className="bg-gray-100 px-3 py-1 rounded-md text-[10px] font-semibold text-gray-700">
            {position}
          </span>
        </div>

        {/* 하단: 제목(왼쪽 정렬)과 작성자/시간(오른쪽 정렬) */}
        <div className="flex justify-between items-end gap-4">
          <div className="font-semibold text-gray-800 text-sm leading-snug break-keep">
            {title}
            {/* [자바스크립트 문법] && (단락 평가): comments가 있을 때만 💬 아이콘 렌더링 */}
            {comments && <span className="text-blue-500 ml-1 text-xs font-normal">💬 {comments}</span>}
          </div>

          {/* 작성자 및 업로드 시간을 세로로 배치 */}
          <div className="flex flex-col items-end flex-shrink-0 gap-1">
            <span className="text-gray-600 text-[11px] font-medium">{author}</span>
            <span className="text-gray-400 text-[10px] font-normal">{time}</span>
          </div>
        </div>
      </div>
      
      {/* [반응형 레이아웃 2] 태블릿/PC 그리드형 (sm 이상에서 표시, sm 미만에서 hidden) */}
      <div className="hidden sm:grid sm:grid-cols-6 md:grid-cols-10 lg:grid-cols-13 text-center items-center">
        <div className="col-span-1 md:col-span-2">
          <span className={`rounded-full px-3 md:px-4 py-1 text-xs font-medium ${
            isCompleted ? 'bg-gray-100 border border-gray-200 text-gray-700' : 'border border-gray-300 text-gray-900'
          }`}>
            {status}
          </span>
        </div>
        <div className="col-span-2">
          <span className="bg-gray-100 px-3 py-1 rounded-md text-xs font-semibold text-gray-700">
            {position}
          </span>
        </div>
        <div className="col-span-3 md:col-span-4 lg:col-span-4 text-left md:text-center px-4 font-semibold text-gray-800 text-sm md:text-base">
          {title}
          {comments && <span className="text-blue-500 ml-2 text-xs font-normal">💬 {comments}</span>}
        </div>
        <div className="hidden md:block md:col-span-2 text-gray-500 text-sm">{author}</div>
        <div className="hidden lg:block lg:col-span-2 text-gray-400 text-sm">{time}</div>
      </div>
    </div>
  );
}

// [Next.js 문법] export default는 이 파일을 특정 주소(URL)로 접속했을 때 보여줄 '페이지'로 지정
export default function ProjectPage() {
  
  // [자바스크립트/React 문법] 상태 관리 (State)
  const [currentPage, setCurrentPage] = useState(1); // 현재 페이지네이션 번호
  const [selectedPosition, setSelectedPosition] = useState('전체'); // 현재 선택된 포지션 필터
  const [selectedStatus, setSelectedStatus] = useState('모집 중'); // 현재 선택된 모집 여부 필터

  // [자바스크립트 문법] 상수 데이터 배열 정의
  const positions = ['전체', '프론트엔드', '백엔드', '개발', '디자인', '기획', '기타'];
  const totalPages = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

  // --- (새로운 기능: 클릭 이벤트 핸들러) ---
  // [자바스크립트 문법] 화살표 함수를 사용하여 클릭 시 상태 변경과 콘솔 기록을 동시에 수행
  const handlePositionClick = (pos: string) => {
    setSelectedPosition(pos);
    console.log(`선택된 포지션: ${pos}`); // 브라우저 개발자 도구 콘솔에 기록
  };

  const handleStatusClick = (status: string) => {
    setSelectedStatus(status);
    console.log(`선택된 모집 상태: ${status}`);
  };
  // 2번째 함수 (전체 페이지)
  return (
    <div className="w-full bg-white min-h-screen">
      {/* [메인 영역] pt-64: 모바일에서 길어진 헤더 높이만큼 상단 여백(Padding-Top)을 충분히 확보 */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-64 md:pt-32 py-12 bg-white min-h-screen font-sans">
        
        {/* [1] 필터 구역 */}
        <div className="mb-8 p-4 sm:p-8 bg-white rounded-xl">
          <div className="flex flex-col gap-6 md:gap-8">
            
            {/* 1-1. 구인 포지션 필터 (모바일에서는 세로 레이아웃) */}
            <div className="flex flex-col md:flex-row md:items-center gap-3 md:gap-6">
              <div className="w-auto md:w-28 font-bold text-gray-800 text-base md:text-lg whitespace-nowrap">
                구인 포지션
              </div>
              <div className="flex gap-2 flex-wrap">
                {/* [자바스크립트 문법] .map()을 사용하여 배열 데이터만큼 버튼 생성 */}
                {positions.map((pos) => (
                  <button
                    key={pos}
                    onClick={() => handlePositionClick(pos)}
                    className={`px-4 py-1.5 md:px-6 md:py-2 rounded-full text-xs md:text-sm font-medium transition-all ${
                      selectedPosition === pos
                        ? 'bg-blue-600 text-white shadow-sm' // 선택된 버튼 스타일
                        : 'border border-gray-200 text-gray-700 hover:bg-gray-50' // 일반 버튼 스타일
                    }`}
                  >
                    {pos}
                  </button>
                ))}
              </div>
            </div>

            {/* 1-2. 모집 여부 필터 */}
            <div className="flex flex-col md:flex-row md:items-center gap-3 md:gap-6">
              <div className="w-auto md:w-28 font-bold text-gray-800 text-base md:text-lg whitespace-nowrap">
                모집 여부
              </div>
              <div className="flex gap-2">
                {/* [자바스크립트 문법] 즉석에서 생성한 배열(['모집 중', '완료'])로 map 실행 */}
                {['모집 중', '완료'].map((st) => (
                  <button
                    key={st}
                    onClick={() => handleStatusClick(st)}
                    className={`px-6 py-1.5 md:px-8 md:py-2 rounded-full text-xs md:text-sm font-medium transition-all ${
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

        {/* [2] 리스트 구역 */}
        <div className="mb-8 p-0 sm:p-6 bg-white rounded-xl">
          {/* 리스트 헤더: sm(640px) 이상 화면에서만 보이도록 설정 */}
          <div className="hidden sm:grid sm:grid-cols-6 md:grid-cols-10 lg:grid-cols-13 border-b-2 border-black pb-4 mb-2 text-center font-bold text-gray-700 text-sm md:text-base">
            <div className="col-span-1 md:col-span-2">여부</div>
            <div className="col-span-2">포지션</div>
            <div className="col-span-3 md:col-span-4 lg:col-span-4 text-left md:text-center">프로젝트 모집 글</div>
            <div className="hidden md:block md:col-span-2">작성자</div>
            <div className="hidden lg:block lg:col-span-2">업로드 시간</div>
          </div>

          {/* [자바스크립트/React] 사용자 정의 컴포넌트 ProjectRow에 데이터를 전달(Props) */}
          <ProjectRow status="모집 중" position="프론트" title="프로젝트 모집합니다~" author="OOO" time="6시간 전" comments={1} />
          <ProjectRow status="완료" position="알고리즘" title="공모전 함께하실 분!" author="OOO" time="12시간 전" />
          <ProjectRow status="모집 중" position="서버" title="백엔드 팀원 모집중" author="OOO" time="12시간 전" />
          <ProjectRow status="모집 중" position="전체" title="신규 프로젝트 팀원을 찾습니다" author="OOO" time="12시간 전" />
          <ProjectRow status="모집 중" position="풀스택" title="스타트업 사이드 프로젝트" author="OOO" time="12시간 전" />
          <ProjectRow status="모집 중" position="기타" title="VR 게임 개발 같이하실 분" author="OOO" time="12시간 전" />
        </div>

        {/* [3] 페이지네이션 */}
        <div className="flex justify-center items-center gap-2 mt-12 pb-10">
          <button 
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            className="p-2 text-gray-400 hover:text-gray-600"
          >
            {"<"}
          </button>
          {totalPages.map((num) => (
            <button
              key={num}
              onClick={() => {
                setCurrentPage(num);
                console.log(`페이지 이동: ${num}`);
              }}
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