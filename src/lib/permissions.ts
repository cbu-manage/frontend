/**
 * 권한 매핑 (B안) — 화면/버튼 노출 게이팅 전용.
 *
 * 왜 쓰나: BE엔 capability 개념이 없고 엔드포인트마다 role을 직접 박아둔다
 * (@PreAuthorize · swagger "허용 역할: ..."). 그 role→기능 매핑을 여기 한 곳에 모아,
 * UI는 role이 아니라 capability(`can("news.manage")`)로만 묻게 한다.
 * → 화면마다 `role === ...` 분기를 흩뿌리지 않는다.
 *
 * ⚠️ 실제 접근 통제는 서버가 최종 판정(401/403)한다. 이 맵은 "버튼/메뉴를 보일까"일 뿐,
 *    틀려도 보안 사고가 아니다(권한 없으면 클릭 시 서버가 거절). UI에서 실제로 가리는
 *    capability만 등록한다 — 전체 권한 매트릭스를 복제하지 않는다.
 *
 * 출처: https://dev.tukcbu.com/v3/api-docs/ 의 엔드포인트별 "허용 역할" 서술.
 */

export const ROLES = [
  "ROLE_USER",
  "ROLE_MANAGER",
  "ROLE_PRESIDENT",
  "ROLE_VICE_PRESIDENT",
  "ROLE_TREASURER",
  "ROLE_MEMBER_MANAGER",
  "ROLE_EVENT_MANAGER",
  "ROLE_PROMOTION_MANAGER",
  "ROLE_SECRETARY",
  "ROLE_ADMIN",
] as const;
export type Role = (typeof ROLES)[number];

export type Capability =
  | "applications.review" // 신청서 목록/상세/대시보드 조회
  | "applications.vote" // 합/불합 투표 (⚠️ ADMIN 제외)
  | "applications.finalize" // 일괄 최종처리 / 개별 최종결정 수정
  | "applications.questions" // 지원서 질문 추가/수정/삭제 (운영진 전부)
  | "recruitment.manage" // 모집 회차 시작/조회/마감/정보수정
  | "fee.settings" // 회비·계좌 안내 등록/수정 (총무 포함)
  | "members.read" // 회원 단건/전체 조회
  | "members.write" // 회원 추가/수정/삭제
  | "members.approveFee" // 회비 납부 확인 + 회원 승인
  | "groups.manage" // 전체 그룹 상태 조회 / 승인·반려
  | "flag.manage" // 게시글·댓글 신고 목록/상세/처리
  | "reportDocs.manage" // 보고서 승인 / HWP·ZIP export
  | "system.settings" // 온보딩 링크 조회/수정
  | "staff.assign" // 운영진 역할 지정/해제 (운영진 지정 페이지) — ADMIN·회장·부회장
  | "staff.assignLeader" // 회장·부회장 지정/해제 — ADMIN(owner) 전용
  | "news.manage" // 소식 작성/수정/삭제/상단고정
  | "meetings.manage" // 모임 생성/수정/마감/삭제
  | "meetings.attendanceAdmin" // 관리자용 참석명단 조회/엑셀 (⚠️ ADMIN 전용)
  | "posts.moderate"; // 일반 포스트·댓글 관리성 삭제(작성자 아니어도)

// 모든 운영진 공통: 신청서 심사 조회 + 투표 + 지원서 질문 편집
const STAFF_REVIEW: Capability[] = [
  "applications.review",
  "applications.vote",
  "applications.questions",
];

// 회장/부회장 = 전 운영 기능
const PRESIDENT_CAPS: Capability[] = [
  ...STAFF_REVIEW,
  "applications.finalize",
  "recruitment.manage",
  "members.read",
  "members.write",
  "members.approveFee",
  "fee.settings",
  "groups.manage",
  "flag.manage",
  "reportDocs.manage",
  "system.settings",
  "staff.assign",
  "news.manage",
  "meetings.manage",
  "posts.moderate",
];

export const ROLE_CAPS: Record<Role, Capability[]> = {
  // ADMIN(개발자 슈퍼계정): 회장 권한에서 신청서 투표 제외 + 참석명단/엑셀은 ADMIN 전용
  ROLE_ADMIN: [
    ...PRESIDENT_CAPS.filter((c) => c !== "applications.vote"),
    "meetings.attendanceAdmin",
    "staff.assignLeader", // 회장·부회장 지정은 ADMIN(owner)만
  ],
  ROLE_PRESIDENT: PRESIDENT_CAPS,
  ROLE_VICE_PRESIDENT: PRESIDENT_CAPS, // 회장과 동일 (참석명단/엑셀만 ADMIN 전용)
  ROLE_MANAGER: [...STAFF_REVIEW, "posts.moderate"],
  ROLE_TREASURER: [
    ...STAFF_REVIEW,
    "members.read",
    "members.approveFee",
    "fee.settings",
  ],
  ROLE_MEMBER_MANAGER: [
    ...STAFF_REVIEW,
    "members.read",
    "members.write",
    "groups.manage",
  ],
  ROLE_EVENT_MANAGER: [...STAFF_REVIEW, "meetings.manage"], // 본인 등록 모임만 → 서버 판정
  ROLE_PROMOTION_MANAGER: [...STAFF_REVIEW, "news.manage"],
  // 서버가 보고서 전체 조회·추출에 서기를 포함한다(Role.canViewAllReports, /report/*/export)
  ROLE_SECRETARY: [...STAFF_REVIEW, "reportDocs.manage"],
  ROLE_USER: [],
};

/** role이 capability를 가지는지. 빈/미지의 role은 false(권한 없음으로 안전 처리). */
export function can(role: string | undefined | null, cap: Capability): boolean {
  if (!role) return false;
  return ROLE_CAPS[role as Role]?.includes(cap) ?? false;
}
