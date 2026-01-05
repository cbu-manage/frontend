// [Next.js 문법] 'use client'는 이 컴포넌트가 브라우저에서 상호작용(useState, 클릭 등)을 한다는 것을 Next.js에 알림
'use client';

// [타입스크립트] 유니온 타입 정의: 허용할 문자열 값을 정확히 지정합니다.
// 이렇게 하면 "모집 중", "완료" 외에 다른 문자열이 들어오면 에러가 발생하여 오타를 방지합니다.
export type ProjectStatus = '모집 중' | '완료';
export type ProjectPosition = '전체' | '프론트엔드' | '백엔드' | '개발' | '디자인' | '기획' | '기타';

// --- (7주차 추가: 공통 컴포넌트 추출 - 프로젝트 리스트 아이템) ---
// [자바스크립트/React] 독립적인 UI 단위를 함수로 만든 '컴포넌트' 파트
interface ProjectRowProps {
  status: ProjectStatus;     // [수정] string -> ProjectStatus 유니온 타입으로 변경
  position: ProjectPosition; // [수정] string -> ProjectPosition 유니온 타입으로 변경
  title: string;
  author: string;
  time: string;
  comments?: number;
}

export function ProjectRow({
  status,
  position,
  title,
  author,
  time,
  comments,
}: ProjectRowProps) {
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