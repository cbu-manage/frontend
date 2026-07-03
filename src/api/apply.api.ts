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
  applicationField: string;
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
  applicationField: string[];
  portfolioUrl: string;
  refSource: string;
  canOt: boolean;
  canWelcome: boolean;
  privacyPolicy: boolean;
};

export const applyApi = {
  submit: (data: ApplicationRequest) => api.post("/applications", data),
  getMy: (data: ApplicationMyRequest) =>
    api.post<ApiEnvelope<ApplicationMyResponse>>("/applications/my", data),
};
