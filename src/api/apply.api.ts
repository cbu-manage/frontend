import { api } from "./client";

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
  check: (studentId: string, email: string) =>
    api.get("/application/check", { params: { studentId, email } }),
};
