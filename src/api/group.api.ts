/**
 * 그룹 API
 * @see /api/v1/groups/{groupId}...
 */
import { api } from "./client";

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

/** GET /groups/my 응답의 그룹 한 건 */
export type MyGroupItem = {
  groupId: number;
  groupName: string;
  createdAt: string;
  updatedAt: string;
  groupRecruitmentStatus: string;
  groupStatus: string;
  activeMemberCount: number;
  maxActiveMembers: number;
  minActiveMembers: number;
  members: GroupMemberItem[];
};

export const groupApi = {
  /** 그룹 상세 정보 조회 */
  getById: (groupId: number) => api.get(`/groups/${groupId}`),

  /** 그룹 가입 요청 */
  join: (groupId: number, data?: unknown) =>
    api.post(`/groups/${groupId}/members`, data),

  /** 그룹 가입 취소 */
  leave: (groupId: number) =>
    api.delete(`/groups/${groupId}/members/me`),

  /** 그룹 모집 상태 변경 (팀장 전용) */
  updateRecruitment: (groupId: number, data: unknown) =>
    api.patch(`/groups/${groupId}/recruitment`, data),

  /** 그룹 상태 변경 (관리자 전용) */
  updateStatus: (groupId: number, data: unknown) =>
    api.patch(`/groups/${groupId}/admin/status`, data),

  /** 신청 인원 확인 (팀장 전용) */
  getApplicants: (groupId: number) =>
    api.get(`/groups/${groupId}/applicants`),

  /** 가입 신청 수락/거부 (팀장 전용) */
  updateApplicant: (groupMemberId: number, data: unknown) =>
    api.patch(`/groups/members/${groupMemberId}/applicant`, data),

  /** 멤버 상태 변경 - 활동/비활동 (팀장 전용) */
  updateMemberStatus: (groupMemberId: number, data: unknown) =>
    api.patch(`/groups/members/${groupMemberId}/status`, data),

  /** 자신이 가입한 그룹 조회 */
  getMyGroups: () =>
    api.get<{ code: string; message: string; data: MyGroupItem[] }>(
      "/groups/my"
    ),

  /** 내가 신청한 그룹(스터디/프로젝트) 목록 - 모든 상태(PENDING/APPROVED/REJECTED) */
  getMyApplications: () =>
    api.get<{ code: string; message: string; data: unknown }>(
      "/groups/my/applications"
    ),

  /** 그룹 전체 조회 (관리자 전용) */
  getAll: () => api.get("/groups/admin"),
};
