// [Next.js 문법] 'use client'는 이 컴포넌트가 브라우저에서 상호작용(useState, 클릭 등)을 한다는 것을 Next.js에 알림
'use client';

import { useState } from 'react';
// [수정] 컴포넌트와 함께 정의된 유니온 타입들을 가져옵니다. (별칭 PJR 사용)
import { ProjectRow as PJR, ProjectStatus, ProjectPosition } from '@/components/project/ProjectRow';
import PGN from '@/components/shared/Pagination';

// --------------------------------------------------------------------------
// 기존에 ProjectPage 함수 내부에 선언되어 있던 정적 데이터 배열들을 함수 외부(상단)로 이동
// 리렌더링마다 배열이 재생성되는 것을 방지하기 위함
// --------------------------------------------------------------------------

// [자바스크립트 문법] 상수 데이터 배열 정의 (수정: 외부로 이동 및 유니온 타입 적용)
const POSITIONS: ProjectPosition[] = ['전체', '프론트엔드', '백엔드', '개발', '디자인', '기획', '기타'];
const TOTAL_PAGES = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

// [Next.js 문법] export default는 이 파일을 특정 주소(URL)로 접속했을 때 보여줄 '페이지'로 지정
export default function ProjectPage() {
  
  // [자바스크립트/React 문법] 상태 관리 (State)
  const [currentPage, setCurrentPage] = useState(1); // 현재 페이지네이션 번호
  
  // [수정] useState 뒤에 <타입>을 명시하여 지정된 값만 상태로 가질 수 있게 함
  const [selectedPosition, setSelectedPosition] = useState<ProjectPosition>('전체'); // 현재 선택된 포지션 필터
  const [selectedStatus, setSelectedStatus] = useState<ProjectStatus>('모집 중'); // 현재 선택된 모집 여부 필터

  // --- (새로운 기능: 클릭 이벤트 핸들러) ---
  // [자바스크립트 문법] 화살표 함수를 사용하여 클릭 시 상태 변경과 콘솔 기록을 동시에 수행
  // [수정] 매개변수 타입을 유니온 타입으로 변경하여 잘못된 값이 들어오는 일 방지
  const handlePositionClick = (pos: ProjectPosition) => {
    setSelectedPosition(pos);
    console.log(`선택된 포지션: ${pos}`); // 브라우저 개발자 도구 콘솔에 기록
  };

  const handleStatusClick = (status: ProjectStatus) => {
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
                {/* [자바스크립트 문법] .map()을 사용하여 외부 상수의 배열 데이터만큼 버튼 생성 */}
                {POSITIONS.map((pos) => (
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
                {/* [자바스크립트 문법] 즉석에서 생성한 배열에 유니온 타입을 적용하여 map 실행 */}
                {(['모집 중', '완료'] as ProjectStatus[]).map((st) => (
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

          {/* [자바스크립트/React] 분리된 사용자 정의 컴포넌트 PJR(ProjectRow)에 데이터를 전달(Props) */}
          {/* 각 행은 필터와 관계없이 고유한 데이터를 보여줍니다. */}
          <PJR status="모집 중" position="프론트엔드" title="프로젝트 모집합니다~" author="OOO" time="6시간 전" comments={1} />
          <PJR status="완료" position="백엔드" title="공모전 함께하실 분!" author="OOO" time="12시간 전" />
          <PJR status="모집 중" position="개발" title="백엔드 팀원 모집중" author="OOO" time="12시간 전" />
          <PJR status="모집 중" position="디자인" title="신규 프로젝트 팀원을 찾습니다" author="OOO" time="12시간 전" />
          <PJR status="모집 중" position="기획" title="스타트업 사이드 프로젝트" author="OOO" time="12시간 전" />
          <PJR status="모집 중" position="기타" title="VR 게임 개발 같이하실 분" author="OOO" time="12시간 전" />
        </div>

        {/* [3] 페이지네이션 (분리된 공통 컴포넌트 PGN 사용) */}
        {/* [변경사항] 기존의 복잡한 버튼 로직을 삭제하고 외부로 이동한 TOTAL_PAGES 상수를 사용하여 PGN을 호출 */}
        <PGN 
          currentPage={currentPage} 
          totalPages={TOTAL_PAGES} 
          onPageChange={(num) => {
            setCurrentPage(num);
            console.log(`페이지 이동: ${num}`);
          }} 
        />
      </main>
    </div>
  );
}