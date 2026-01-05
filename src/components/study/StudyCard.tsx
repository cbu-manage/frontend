// src/components/study/StudyCard.tsx
'use client';

// [타입스크립트] 유니온 타입 정의: 허용할 카테고리와 상태 값을 명확히 제한합니다.
export type StudyCategory = '전체' | 'C++' | 'Python' | 'Java' | '알고리즘' | '기타';
export type StudyStatus = '모집 중' | '모집 완료';

interface StudyCardProps {
  number: number;
  // 나중에 데이터를 받아올 때를 대비해 타입을 미리 정의해둡니다.
  category?: StudyCategory; 
  status?: StudyStatus;
  title?: string; // [추가] 카드마다 다른 제목을 받기 위한 속성
  time?: string;  // [추가] 카드마다 다른 업로드 시간을 받기 위한 속성
}

// 1. 카드 컴포넌트 (일반 React/JS 함수형 컴포넌트)
// [수정] title과 time을 props로 추가하여 고정된 문구 대신 전달받은 데이터를 보여줍니다.
export function StudyCard({ 
  number, 
  category = 'C++', 
  status = '모집 중',
  title = '웹개발 스터디 모집합니다~', // 기본값
  time = '6시간 전'                 // 기본값
}: StudyCardProps) {

  // 모집 완료일 경우 배지 색상을 변경하기 위한 조건식
  const isCompleted = status === '모집 완료';

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm flex flex-col hover:shadow-md transition-shadow cursor-pointer overflow-hidden">
      <div className="p-6 flex flex-col gap-4">
        <div className="justify-between items-center flex">
          {/* [수정] 전달받은 status 타입을 출력하고, 상태에 따라 색상이 변하도록 수정 */}
          <span className={`px-2 py-1 rounded text-xs font-bold ${
            isCompleted 
              ? 'bg-red-50 text-red-500' // 모집 완료일 때 빨간 배지
              : 'bg-emerald-50 text-emerald-500' // 모집 중일 때 초록 배지
          }`}>
            {status}
          </span>
          {/* [수정] 고정된 6시간 전 대신 props로 받은 time 출력 */}
          <span className="text-gray-400 text-xs font-light">🕑{time}</span>
        </div>
        <div className="flex flex-col gap-9">
          {/* [수정] 고정된 제목 대신 props로 받은 title 출력 */}
          <h3 className="text-lg font-bold text-gray-900 leading-snug">{title}</h3>
          {/* [수정] 전달받은 category 타입을 화면에 직접 출력 */}
          <div>
            <span className="bg-yellow-100 text-yellow-700 px-2 py-1 rounded text-[10px] font-semibold">
              {category}
            </span>
          </div>
        </div>
      </div>
      <div className="bg-gray-50 px-6 py-4 border-t border-gray-100 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-gray-200 rounded-full"></div>
          <span className="text-sm text-gray-700 font-medium">aBCDFEFGOL</span>
        </div>
        <div className="flex gap-3 text-xs text-gray-400">
          <span>👁️ 122</span>
          <span>💬 333</span>
        </div>
      </div>
    </div>
  );
}