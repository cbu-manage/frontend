// [Next.js 문법] 'use client'는 클라이언트 사이드 렌더링을 명시하는 Next.js 전용 지시어
'use client';

import { useState } from 'react';
// [수정] 컴포넌트와 함께 정의된 유니온 타입들을 가져옴 (별칭 SDC 사용)
import { StudyCard as SDC, StudyCategory, StudyStatus } from '@/components/study/StudyCard';
import PGN from '@/components/shared/Pagination';

// --------------------------------------------------------------------------
// [리뷰어 피드백 반영: 위치 변경]
// 기존에 StudyPage 함수 내부에 선언되어 있던 정적 데이터 배열들을 함수 외부(상단)로 이동
// 리렌더링마다 배열이 재생성되는 것을 방지하여 메모리 효율을 높이기 위함
// --------------------------------------------------------------------------
const CATEGORIES: StudyCategory[] = ['전체', 'C++', 'Python', 'Java', '알고리즘', '기타'];
const TOTAL_PAGES = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

// [Next.js 문법] export default 함수는 해당 파일의 대표 페이지가 됩니다. (App Router 라우팅)
export default function StudyPage() {
  
  // [자바스크립트/React 문법] 상태 관리를 위한 Hook 사용
  // [수정] 유니온 타입을 지정하여 잘못된 문자열 입력을 방지
  const [selected, setSelected] = useState<StudyCategory>('전체');
  const [status, setStatus] = useState<StudyStatus>('모집 중');
  const [currentPage, setCurrentPage] = useState(1);

  // --- (7주차 추가 시작 : 콘솔로그 - 자바스크립트 로직 파트) ---
  // [수정] 매개변수 타입을 StudyCategory 유니온 타입으로 제한
  const handleCategoryClick = (category: StudyCategory) => {
    setSelected(category);
    console.log(`선택된 카테고리: ${category}`); // 개별적인 이벤트 로그
  };

  // 모집 상태 클릭 시 실행될 함수
  // [수정] 매개변수 타입을 StudyStatus 유니온 타입으로 제한
  const handleStatusClick = (statusName: StudyStatus) => {
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
            {/* [자바스크립트 문법] .map()을 사용하여 외부 상수의 배열 데이터를 JSX 리스트로 변환 */}
            {CATEGORIES.map((category) => (
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
          {/* [자바스크립트/React] 분리된 사용자 정의 컴포넌트 SDC(StudyCard)를 호출 */}
          {/* [수정] 각 카드마다 원하는 제목과 시간을 개별적으로 지정했습니다. */}
          <SDC number={1} category="C++" status="모집 중" title="웹개발 입문 스터디원 구함" time="10분 전" />
          <SDC number={2} category="Python" status="모집 완료" title="데이터 분석 기초 스터디" time="2시간 전" />
          <SDC number={3} category="Java" status="모집 중" title="자바 스프링 프로젝트 팀빌딩" time="5시간 전" />
          <SDC number={4} category="알고리즘" status="모집 중" title="코딩테스트 1일 1문제 반" time="어제" />
          <SDC number={5} category="기타" status="모집 중" title="디자인 협업하실 개발자분들!" time="3일 전" />
          <SDC number={6} category="C++" status="모집 중" title="자료구조 빡세게 공부할 사람" time="1시간 전" />
          <SDC number={7} category="Python" status="모집 완료" title="머신러닝 스터디 같이해요" time="4시간 전" />
          <SDC number={8} category="Java" status="모집 중" title="안드로이드 앱 개발 스터디" time="30분 전" />
          <SDC number={9} category="알고리즘" status="모집 중" title="LeetCode 같이 풀 사람?" time="어제" />
        </div>

        {/* 4번 네모: 페이지네이션 (공통 컴포넌트 PGN 사용) */}
        <PGN 
          currentPage={currentPage} 
          totalPages={TOTAL_PAGES} 
          onPageChange={(num) => setCurrentPage(num)} 
        />
      </main>
    </div>
  ); 
}