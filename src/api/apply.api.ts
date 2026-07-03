import { api } from "./client";
import type { AxiosRequestConfig } from "axios";

type RetriableConfig = AxiosRequestConfig & { _retry?: boolean };

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
  submit: (data: ApplicationRequest) =>
    api.post("/applications", data, { _retry: true } as RetriableConfig),
  check: (studentId: string, email: string) =>
    api.get("/application/check", { params: { studentId, email } }),
};
