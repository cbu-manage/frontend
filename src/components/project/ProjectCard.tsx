/**
 * @file ProjectCard.tsx
 * @description 프로젝트 모집 컴포넌트 모음
 *
 * 프로젝트 모집 페이지에서 사용되는 컴포넌트들을 포함합니다.
 *
 * @origin 통합된 컴포넌트:
 * - ProjectCard (35~159줄): 기존 src/app/project/page.tsx 인라인 컴포넌트에서 이동
 * - ProjectRow (161~277줄): 기존 src/components/project/ProjectRow.tsx에서 이동
 *
 * 공통 요소:
 * - 모집 상태 (모집 중 / 모집 완료)
 * - 프로젝트 제목
 * - 포지션 태그 (프론트엔드/백엔드/디자인 등)
 * - 작성자 정보, 조회수, 댓글 수
 */

'use client';

// ============================================
// 타입 정의
// ============================================

/**
 * 프로젝트 모집 상태 타입
 * - '모집 중': 초록색 배지
 * - '모집 완료': 빨간색 배지
 */
export type ProjectStatus = '모집 중' | '모집 완료';

/**
 * 프로젝트 포지션 타입
 * 사이드바 필터와 카드 태그에 사용됩니다.
 */
export type ProjectPosition = '전체' | '프론트엔드' | '백엔드' | '개발' | '디자인' | '기획' | '기타';

/**
 * ProjectCard 컴포넌트 Props 인터페이스
 */
interface ProjectCardProps {
  /** 카드 고유 번호 (key용) */
  id: number;

  /** 모집 상태 */
  status?: ProjectStatus;

  /** 프로젝트 제목 */
  title?: string;

  /** 모집 포지션 배열 */
  positions?: string[];

  /** 작성자 닉네임 */
  author?: string;

  /** 조회수 */
  views?: number;

  /** 댓글 수 */
  comments?: number;

  /** 작성 시간 */
  time?: string;
}

// ============================================
// ProjectCard 컴포넌트
// @origin src/app/project/page.tsx (인라인 → 분리)
// ============================================

/**
 * 프로젝트 모집 카드 컴포넌트 (가로형)
 *
 * 스터디 카드와 달리 가로형 레이아웃을 사용합니다.
 * - 왼쪽: 모집 상태 + 제목
 * - 중앙: 포지션 태그
 * - 오른쪽: 작성자, 조회수, 댓글, 시간
 *
 * @param props - ProjectCardProps
 * @returns 프로젝트 카드 JSX 요소
 *
 * @example
 * <ProjectCard
 *   id={1}
 *   status="모집 중"
 *   title="[프론트엔드 개발자 모집] 웹 서비스 개발"
 *   positions={['프론트엔드', '백엔드']}
 *   author="씨부엉 34기"
 *   views={122}
 *   comments={333}
 *   time="6시간 전"
 * />
 */
export function ProjectCard({
  id,
  status = '모집 중',
  title = '[앱 프론트엔드 개발자 모집] 대학생을 위한 중개 플랫폼',
  positions = ['프론트엔드'],
  author = '씨부엉 34기',
  views = 122,
  comments = 333,
  time = '6시간 전',
}: ProjectCardProps) {
  // 모집 완료 여부에 따라 배지 색상 결정
  const isCompleted = status === '모집 완료';

  return (
    // 카드 컨테이너 - 3분할 레이아웃 (왼쪽/중앙/오른쪽)
    <div className="
      bg-white rounded-2xl border border-gray-200
      px-4 sm:px-6 py-4
      min-h-[90px]
      flex flex-col sm:flex-row sm:items-center
      gap-4 sm:gap-0
      hover:shadow-md transition-shadow cursor-pointer
    ">
      {/* ========== 왼쪽: 모집 상태 + 제목 ========== */}
      <div className="flex flex-col gap-2 sm:w-1/3">
        {/* 모집 상태 배지 */}
        <span className={`w-14 text-center py-0.5 rounded-full text-xs text-white ${
          isCompleted
            ? 'bg-red-400'      // 모집 완료: 빨강 배경
            : 'bg-[#6ECA8F]'    // 모집 중: 초록 배경
        }`}>
          {status}
        </span>
        {/* 프로젝트 제목 */}
        <h3 className="text-sm font-bold text-gray-900 line-clamp-2">{title}</h3>
      </div>

      {/* ========== 중앙: 포지션 태그 ========== */}
      <div className="sm:w-1/3 flex justify-center">
        <div className="flex flex-wrap gap-1.5 justify-center">
          {positions.map((pos) => (
            <span key={pos} className="bg-gray-100 text-gray-500 px-2 py-1 rounded text-[10px] font-semibold">
              {pos}
            </span>
          ))}
        </div>
      </div>

      {/* ========== 오른쪽: 메타 정보 ========== */}
      <div className="sm:w-1/3 flex items-center justify-end gap-2 sm:gap-3">
        {/* 작성자 정보 */}
        <div className="flex items-center gap-2">
          {/* 프로필 이미지 플레이스홀더 */}
          <div className="w-5 h-5 bg-gray-200 rounded-full"></div>
          <span className="text-gray-600 text-xs">{author}</span>
        </div>

        {/* 조회수 */}
        <span className="text-xs text-gray-400">👁️ {views}</span>

        {/* 댓글 수 */}
        <span className="text-xs text-gray-400">💬 {comments}</span>

        {/* 작성 시간 */}
        <span className="text-xs text-gray-400">🕑 {time}</span>
      </div>
    </div>
  );
}

// ============================================
// ProjectRow 컴포넌트
// @origin src/components/project/ProjectRow.tsx (통합)
// ============================================

/**
 * ProjectRow 컴포넌트 Props 인터페이스
 */
interface ProjectRowProps {
  /** 모집 상태 */
  status: ProjectStatus;

  /** 모집 포지션 */
  position: ProjectPosition;

  /** 프로젝트 제목 */
  title: string;

  /** 작성자 닉네임 */
  author: string;

  /** 작성 시간 */
  time: string;

  /** 댓글 수 */
  comments?: number;
}

/**
 * 프로젝트 모집 행 컴포넌트 (테이블형)
 *
 * 테이블/리스트 형태의 레이아웃을 사용합니다.
 * - 모바일: 카드형 레이아웃
 * - 태블릿/PC: 그리드형 레이아웃
 *
 * @param props - ProjectRowProps
 * @returns 프로젝트 행 JSX 요소
 *
 * @example
 * <ProjectRow
 *   status="모집 중"
 *   position="프론트엔드"
 *   title="[프론트엔드 개발자 모집] 웹 서비스 개발"
 *   author="씨부엉 34기"
 *   time="6시간 전"
 *   comments={10}
 * />
 */
export function ProjectRow({
  status,
  position,
  title,
  author,
  time,
  comments,
}: ProjectRowProps) {
  // 모집 완료 여부에 따라 배지 색상 결정
  const isCompleted = status === '모집 완료';

  return (
    <div className="border-b border-gray-100 py-4 hover:bg-gray-50 transition-colors cursor-pointer w-full">
      {/* ========== 모바일 카드형 (sm 미만) ========== */}
      <div className="flex flex-col gap-3 sm:hidden px-4 w-full">
        {/* 상단: 상태 및 포지션 배지 */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold text-white ${
            isCompleted
              ? 'bg-red-400'      // 모집 완료: 빨강 배경
              : 'bg-[#6ECA8F]'    // 모집 중: 초록 배경
          }`}>
            {status}
          </span>
          <span className="bg-gray-100 text-gray-500 px-2 py-1 rounded text-[10px] font-semibold">
            {position}
          </span>
        </div>

        {/* 하단: 제목과 작성자/시간 */}
        <div className="flex justify-between items-end gap-4">
          <div className="font-semibold text-gray-800 text-sm leading-snug break-keep">
            {title}
            {comments && <span className="text-blue-500 ml-1 text-xs font-normal">💬 {comments}</span>}
          </div>

          {/* 작성자 및 시간 */}
          <div className="flex flex-col items-end flex-shrink-0 gap-1">
            <span className="text-gray-600 text-[11px] font-medium">{author}</span>
            <span className="text-gray-400 text-[10px] font-normal">{time}</span>
          </div>
        </div>
      </div>

      {/* ========== 태블릿/PC 그리드형 (sm 이상) ========== */}
      <div className="hidden sm:grid sm:grid-cols-6 md:grid-cols-10 lg:grid-cols-13 text-center items-center">
        <div className="col-span-1 md:col-span-2">
          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold text-white inline-block ${
            isCompleted
              ? 'bg-red-400'      // 모집 완료: 빨강 배경
              : 'bg-[#6ECA8F]'    // 모집 중: 초록 배경
          }`}>
            {status}
          </span>
        </div>
        <div className="col-span-2">
          <span className="bg-gray-100 text-gray-500 px-2 py-1 rounded text-[10px] font-semibold">
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
