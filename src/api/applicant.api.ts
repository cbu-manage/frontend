/**
 * 신입 부원 신청서(관리자) API — 모집(recruitment) 기반, 식별자는 applicationUuid.
 *
 * 흐름: 현재 모집 조회 → 모집의 신청서 목록 → 상세/투표 → 최종결정/마감.
 * @see /api/v1/admin/recruitments/*, /api/v1/admin/applications/*
 */
import { api } from "./client";
import { type ApiEnvelope } from "./auth.api";

/** 투표 결정값 (운영진 개별 투표) */
export type VoteDecision = "PASS" | "FAIL";
/** 최종 결정값 (합격자 확정) */
export type FinalDecision = "ACCEPT" | "REJECT" | "HOLD";
/** 목록 탭 필터 */
export type ApplicationTab = "ALL" | "REVIEWING" | "ACCEPTED" | "REJECTED";
/** 지원 분야 */
export type ApplicationField =
  "PROJECT" | "ALGORITHM" | "STUDY" | "DESIGN" | "ETC";

/** 현재 모집 정보 — 모집 기간·발표일은 yyyy-MM-dd, 미설정 시 null */
export type Recruitment = {
  recruitmentUuid: string;
  generation: number;
  voterCount: number;
  status: string;
  startedAt: string;
  endedAt: string;
  plannedStartDate: string | null;
  plannedEndDate: string | null;
  announcementDate: string | null;
};

/** 모집 회차 수정 바디 — 보낸 필드만 반영(부분 수정) */
export type RecruitmentUpdateBody = {
  generation?: number;
  plannedStartDate?: string;
  plannedEndDate?: string;
  announcementDate?: string;
};

/** 지원서 질문 */
export type ApplicationQuestion = {
  questionUuid: string;
  /** 답변 제출 시 매칭 키. 기수 내 유일 (예: MOTIVATE) */
  type: string;
  question: string;
  description: string | null;
  isRequired: boolean;
  sortOrder: number;
};

export type QuestionCreateBody = {
  type: string;
  question: string;
  description?: string;
  isRequired?: boolean;
  sortOrder?: number;
};

/** 질문 수정 바디 — type은 변경 불가(제출 답변의 매칭 키라서) */
export type QuestionUpdateBody = {
  question?: string;
  description?: string;
  isRequired?: boolean;
  sortOrder?: number;
};

/** 신청서 목록 한 줄 */
export type ApplicationListItem = {
  applicationUuid: string;
  finalDecision: FinalDecision;
  suggestedDecision: FinalDecision;
  name: string;
  studentNumber: number;
  major: string;
  applicationField: string;
  submittedAt: string;
  voteProgress: number;
  passCount: number;
  failCount: number;
  myReviewed: boolean;
  canOt: boolean;
  canWelcome: boolean;
  note: string;
  status: string;
};

/** Spring Page 래퍼 (목록) */
export type Page<T> = {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
  first: boolean;
  last: boolean;
  empty: boolean;
};

/** 목록 응답 — 총 투표자 수 + 신청서 페이지 */
export type ApplicationListResponse = {
  voterCount: number;
  applications: Page<ApplicationListItem>;
};

export type ApplicationListParams = {
  field?: ApplicationField;
  tab?: ApplicationTab;
  from?: string;
  to?: string;
  keyword?: string;
  page?: number;
  size?: number;
};

/** 신청서 상세 — 지원자 정보 */
export type ApplicantInfo = {
  applicationUuid: string;
  name: string;
  nickname: string;
  grade: string;
  studentNumber: number;
  major: string;
  phoneNumber: string;
  applicationField: string;
  canOt: boolean;
  canWelcome: boolean;
  refSource: string;
  refLinkEtc: string;
};

export type AnswerItem = { question: string; answer: string };
export type PortfolioItem = { label: string; url: string };
export type VoteItem = {
  voterName: string;
  decision: VoteDecision;
  reason?: string;
};
export type MyVote = { decision: VoteDecision | null; reason: string };

/** 신청서 상세 응답 */
export type ApplicationDetail = {
  application: ApplicantInfo;
  answers: AnswerItem[];
  portfolios: PortfolioItem[];
  votes: VoteItem[];
  myVote: MyVote;
};

/** 마감 시 일괄 최종결정 항목 */
export type FinalizeDecision = {
  applicationUuid: string;
  decision: FinalDecision;
};

export const recruitmentApi = {
  /** 현재 진행 중인 모집 (없으면 404) */
  getCurrent: () =>
    api.get<ApiEnvelope<Recruitment>>("/admin/recruitments/current"),

  /** 모집 시작 — 시작 시점 운영진 수를 투표자 수로 고정 */
  create: (generation: number) =>
    api.post<ApiEnvelope<Recruitment>>("/admin/recruitments", { generation }),

  // 모집 종료는 applicantApi.close 사용 (finalize flow와 한 세트)

  /** 모집 회차 정보 수정 — 기수·모집 기간·발표일 */
  update: (recruitmentUuid: string, data: RecruitmentUpdateBody) =>
    api.patch<ApiEnvelope<Recruitment>>(
      `/admin/recruitments/${recruitmentUuid}`,
      data,
    ),

  /** 모집 요약(상태별 카운트·투표 카드) */
  getSummary: (recruitmentUuid: string) =>
    api.get<ApiEnvelope<unknown>>(
      `/admin/recruitments/${recruitmentUuid}/summary`,
    ),
};

/**
 * 지원서 질문 관리 — 질문은 모집 회차(recruitmentUuid)에 종속된다.
 * 조회만 공개 경로(현재 기수)라 관리자 화면도 이 GET을 쓴다.
 */
export const questionApi = {
  /** 현재 기수의 질문 목록 (공개) */
  getCurrent: () =>
    api.get<ApiEnvelope<ApplicationQuestion[]>>(
      "/applications/questions/current",
    ),

  /** 질문 추가 — type이 기수 내 중복이면 409(E-APP-0015) */
  create: (recruitmentUuid: string, data: QuestionCreateBody) =>
    api.post<ApiEnvelope<ApplicationQuestion>>(
      `/admin/recruitments/${recruitmentUuid}/questions`,
      data,
    ),

  /** 질문 수정 */
  update: (
    recruitmentUuid: string,
    questionUuid: string,
    data: QuestionUpdateBody,
  ) =>
    api.patch<ApiEnvelope<ApplicationQuestion>>(
      `/admin/recruitments/${recruitmentUuid}/questions/${questionUuid}`,
      data,
    ),

  /** 질문 삭제 */
  remove: (recruitmentUuid: string, questionUuid: string) =>
    api.delete<ApiEnvelope<null>>(
      `/admin/recruitments/${recruitmentUuid}/questions/${questionUuid}`,
    ),
};

export const applicantApi = {
  /** 모집의 신청서 목록 */
  getList: (recruitmentUuid: string, params?: ApplicationListParams) =>
    api.get<ApiEnvelope<ApplicationListResponse>>(
      `/admin/recruitments/${recruitmentUuid}/applications`,
      { params },
    ),

  /** 신청서 상세 */
  getDetail: (applicationUuid: string) =>
    api.get<ApiEnvelope<ApplicationDetail>>(
      `/admin/applications/${applicationUuid}`,
    ),

  /** 내 합/불 투표 */
  vote: (applicationUuid: string, decision: VoteDecision, reason: string) =>
    api.put<ApiEnvelope<null>>(`/admin/applications/${applicationUuid}/vote`, {
      decision,
      reason,
    }),

  /** 단건 최종결정 */
  finalDecision: (
    applicationUuid: string,
    decision: FinalDecision,
    reason: string,
  ) =>
    api.patch<ApiEnvelope<null>>(
      `/admin/applications/${applicationUuid}/final-decision`,
      { decision, reason },
    ),

  /** 모집 마감 — 일괄 최종결정 확정 */
  finalize: (recruitmentUuid: string, decisions: FinalizeDecision[]) =>
    api.post<ApiEnvelope<null>>(
      `/admin/recruitments/${recruitmentUuid}/applications/finalize`,
      { decisions },
    ),

  /** 모집 종료 */
  close: (recruitmentUuid: string) =>
    api.patch<ApiEnvelope<null>>(
      `/admin/recruitments/${recruitmentUuid}/close`,
    ),
};
