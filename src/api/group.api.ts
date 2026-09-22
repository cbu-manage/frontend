/**
 * 그룹 API
 * @see /api/v1/groups/{groupId}...
 */
import { api } from "./client";

/**
 * 그룹 승인 상태. 서버가 내려주는 값 그대로.
 * PENDING·RESUBMITTED = 운영진 심사 대기, ACTIVE = 승인, REJECTED = 반려
 */
export type GroupStatus =
  "ACTIVE" | "PENDING" | "REJECTED" | "RESUBMITTED" | "INACTIVE";

/** PATCH /groups/{groupId}/recruitment 요청 바디 */
export type GroupRecruitmentRequest = {
  /** OPEN = 모집 중, CLOSED = 모집 마감(반려된 팀은 마감 시 재심사 요청으로 넘어간다) */
  groupRecruitmentStatus: "OPEN" | "CLOSED";
};

/** PATCH /groups/{groupId}/admin/status 요청 바디 (GroupReviewRequestDTO) */
export type GroupReviewRequest = {
  action: "APPROVE" | "REJECT";
  /** 반려 사유 */
  reason?: string;
};

/** GET /groups/my 응답의 그룹 멤버 */
export type GroupMemberItem = {
  groupMemberId: number;
  userId: number;
  userName: string;
  grade: string;
  major: string;
  groupMemberRole: string;
  groupMemberStatus: string;
  createdAt: string;
};

/** GET /groups/my 응답의 그룹 한 건 (가입 완료 ACTIVE) */
export type MyGroupItem = {
  groupId: number;
  groupName: string;
  /** 연결된 게시글 ID - 스터디/프로젝트 상세 이동용 */
  postId?: number;
  /** STUDY | PROJECT - 상세 경로 분기용 */
  postType?: "STUDY" | "PROJECT";
  createdAt?: string;
  updatedAt?: string;
  groupRecruitmentStatus?: string;
  groupStatus?: string;
  activeMemberCount: number;
  maxActiveMembers: number;
  minActiveMembers?: number;
  members?: GroupMemberItem[];
};

/** GET /groups/{groupId} 그룹 상세의 멤버 한 명 */
export type GroupMemberDetail = {
  groupMemberId: number;
  userId: number;
  userGeneration: number;
  userName: string;
  grade: string;
  major: string;
  groupMemberRole: string;
  groupMemberStatus: string;
};

/** GET /groups/{groupId} 그룹 상세 응답 data */
export type GroupDetailData = {
  groupId: number;
  groupName: string;
  groupStatus: string;
  /** 운영진이 개설을 반려한 사유. 반려 상태가 아니면 null */
  rejectReason?: string | null;
  groupRecruitmentStatus: string;
  activeMemberCount: number;
  maxMembers: number;
  minMembers: number;
  members: GroupMemberDetail[];
};

export const groupApi = {
  /** 그룹 상세 정보 조회 */
  getById: (groupId: number) =>
    api.get<{ code: string; message: string; data: GroupDetailData }>(
      `/groups/${groupId}`,
    ),

  /** 그룹 가입 요청 */
  join: (groupId: number, data?: unknown) =>
    api.post(`/groups/${groupId}/members`, data),

  /** 그룹 가입 취소 */
  leave: (groupId: number) => api.delete(`/groups/${groupId}/members/me`),

  /** 그룹 모집 상태 변경 (팀장 전용) */
  updateRecruitment: (groupId: number, data: GroupRecruitmentRequest) =>
    api.patch(`/groups/${groupId}/recruitment`, data),

  /**
   * 그룹 승인/반려 (관리자 전용).
   * 서버는 `action`으로 판정한다 — 다른 필드를 보내면 무시하고 기본 반려로 처리하므로 주의.
   */
  updateStatus: (groupId: number, data: GroupReviewRequest) =>
    api.patch(`/groups/${groupId}/admin/status`, data),

  /** 신청 인원 상태 전체 보기 (팀장 전용) */
  getApplicants: (groupId: number) =>
    api.get(`/groups/${groupId}/applicants/overview`),

  /** 가입 신청 수락/거부 (팀장 전용) */
  updateApplicant: (groupMemberId: number, data: unknown) =>
    api.patch(`/groups/members/${groupMemberId}/applicant`, data),

  /** 멤버 상태 변경 - 활동/비활동 (팀장 전용) */
  updateMemberStatus: (groupMemberId: number, data: unknown) =>
    api.patch(`/groups/members/${groupMemberId}/status`, data),

  /** 자신이 가입한 그룹 조회 */
  getMyGroups: () =>
    api.get<{ code: string; message: string; data: MyGroupItem[] }>(
      "/groups/my",
    ),

  /**
   * 내가 신청한 그룹 목록 (승인/대기/거절/비활동)
   * @param page 페이지 번호 (0부터)
   * @param size 한 페이지당 개수
   * @param category 1=스터디, 2=프로젝트, 미입력=전체
   */
  getMyApplications: (params: {
    page: number;
    size: number;
    category?: 1 | 2;
  }) =>
    api.get<{ code: string; message: string; data: unknown }>(
      "/groups/my/applications",
      { params },
    ),

  /**
   * 그룹 전체 조회 (관리자 전용)
   * @param page 페이지 번호 (0부터)
   * @param size 한 페이지당 개수
   * @param groupStatus ACTIVE | PENDING | REJECTED | RESUBMITTED | INACTIVE (미입력 시 전체)
   */
  getAll: (params: { page: number; size: number; groupStatus?: GroupStatus }) =>
    api.get("/groups/admin", { params }),
};
