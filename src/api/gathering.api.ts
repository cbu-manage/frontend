/**
 * 모임 일정(gatherings) API — 회식·MT·박람회 등 모임 + 참석 투표.
 * @see /api/v1/gatherings/*
 */
import { api } from "./client";
import { type ApiEnvelope } from "./auth.api";

/** 모임 종류 */
export type GatheringType = "DINING" | "MT" | "FAIR" | "EVENT" | "OTHER";
/** 내 참석 상태 */
export type MyAttendanceStatus =
  "ATTENDING" | "NOT_ATTENDING" | "UNDECIDED" | "NOT_RESPONDED";
/** 투표 값 (서버는 참석/불참 2지선다만 받음) */
export type VoteDecision = "PASS" | "FAIL";

/** 종류 enum ↔ 한글 라벨 */
export const GATHERING_TYPE_LABEL: Record<GatheringType, string> = {
  DINING: "회식",
  MT: "MT",
  FAIR: "박람회",
  EVENT: "행사",
  OTHER: "기타",
};

export type AttendanceSummary = {
  attending: number;
  notAttending: number;
  undecided: number;
  unanswered: number;
  total: number;
};

/** 모임 목록/상세 응답 */
export type Gathering = {
  id: number;
  title: string;
  type: GatheringType;
  description: string;
  gatheringDate: string;
  location: string;
  voteDeadline: string;
  voteClosed: boolean;
  allMembersTarget: boolean;
  authorGeneration: number;
  authorName: string;
  summary: AttendanceSummary;
  myStatus: MyAttendanceStatus;
  createdAt: string;
  viewCount: number;
};

export type GatheringMember = {
  memberId: number;
  name: string;
  generation: number;
};

/** 참석 명단 (일반) */
export type AttendanceList = {
  gatheringId: number;
  title: string;
  gatheringDate: string;
  voteDeadline: string;
  voteClosed: boolean;
  summary: AttendanceSummary;
  attendingMembers: GatheringMember[];
  notAttendingMembers: GatheringMember[];
  undecidedMembers: GatheringMember[];
};

/** 참석 명단 (관리자 — 미응답 포함) */
export type AdminAttendanceList = AttendanceList & {
  unansweredMembers: GatheringMember[];
};

export type CreateGatheringBody = {
  title: string;
  type: GatheringType;
  description?: string;
  gatheringDate: string;
  location?: string;
  voteDeadline: string;
  allMembersTarget?: boolean;
};

export type UpdateGatheringBody = Partial<
  Omit<CreateGatheringBody, "allMembersTarget">
>;

export const gatheringApi = {
  /** 모임 목록 */
  getList: () => api.get<ApiEnvelope<Gathering[]>>("/gatherings"),

  /** 모임 상세 */
  getById: (id: number) => api.get<ApiEnvelope<Gathering>>(`/gatherings/${id}`),

  /** 모임 등록 */
  create: (body: CreateGatheringBody) =>
    api.post<ApiEnvelope<Gathering>>("/gatherings", body),

  /** 모임 수정 */
  update: (id: number, body: UpdateGatheringBody) =>
    api.patch<ApiEnvelope<Gathering>>(`/gatherings/${id}`, body),

  /** 모임 삭제 */
  remove: (id: number) => api.delete<ApiEnvelope<null>>(`/gatherings/${id}`),

  /** 참석 투표 (PASS=참석 / FAIL=불참) */
  vote: (id: number, decision: VoteDecision, reason = "") =>
    api.post<ApiEnvelope<null>>(`/gatherings/${id}/vote`, { decision, reason }),

  /** 투표 마감 */
  close: (id: number) =>
    api.patch<ApiEnvelope<null>>(`/gatherings/${id}/close`),

  /** 참석 명단 (일반) */
  getAttendance: (id: number) =>
    api.get<ApiEnvelope<AttendanceList>>(`/gatherings/${id}/attendance`),

  /** 참석 명단 (관리자) */
  getAdminAttendance: (id: number) =>
    api.get<ApiEnvelope<AdminAttendanceList>>(
      `/gatherings/${id}/attendance/admin`,
    ),

  /** 참석 명단 엑셀 (관리자, blob) */
  exportAttendance: (id: number) =>
    api.get(`/gatherings/${id}/attendance/export`, { responseType: "blob" }),
};
