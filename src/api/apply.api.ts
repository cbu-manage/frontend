import { type ApiEnvelope } from "./auth.api";
import { api } from "./client";

export type ApplicationMyRequest = {
  studentNumber: number;
  nickname: string;
};

export type ApplicationMyResponse = {
  applicationUuid: string;
  studentNumber: number;
  email: string;
  name: string;
  nickname: string;
  grade: string;
  major: string;
  phoneNumber: string;
  generation: number;
  applicationFields: string[];
  portfolioUrl: string;
  refSource: string;
  refLinkEtc: string;
  canOt: boolean;
  canWelcome: boolean;
  status: string;
  finalDecisionReason: string;
  submittedAt: string;
  decidedAt: string;
  answers: { question: string; answer: string }[];
  portfolios: { label: string; url: string }[];
};

export type ApplicationRequest = {
  email: string;
  name: string;
  nickname: string;
  studentNumber: number;
  phoneNumber: string;
  emailAuthCode: string;
  major: string;
  grade: string;
  applicationFields: string[];
  answers: Record<string, string>;
  portfolioUrl: string;
  refSource: string;
  refLinkEtc: string;
  canOt: boolean;
  canWelcome: boolean;
  privacyPolicy: boolean;
};

/**
 * 현재 진행 중인 모집의 기수·일정 (비로그인 공개).
 * 미설정 항목은 null로 온다.
 */
export type CurrentGeneration = {
  generation: number;
  plannedStartDate: string | null;
  plannedEndDate: string | null;
  announcementDate: string | null;
};

/** 합격 안내 화면(`/apply/passed`)의 본인 확인 정보. 학번은 서버가 가운데를 가려서 준다 */
export type ApplicationResult = {
  name: string;
  maskedStudentNumber: string;
  generation: number;
};

export const applyApi = {
  /** 현재 지원 기수·모집 일정 — 진행 중인 모집이 없으면 404 */
  getCurrentGeneration: () =>
    api.get<ApiEnvelope<CurrentGeneration>>("/applications/generation/current"),

  submit: (data: ApplicationRequest) => api.post("/applications", data),

  /** 합격 안내 조회 — 메일 링크의 지원서 UUID로만 조회한다(비로그인 허용). 합격이 아니면 404 */
  getResult: (applicationUuid: string) =>
    api.get<ApiEnvelope<ApplicationResult>>(
      `/applications/${applicationUuid}/result`,
    ),
  getMy: (data: ApplicationMyRequest) =>
    api.post<ApiEnvelope<ApplicationMyResponse>>("/applications/my", data),
};
