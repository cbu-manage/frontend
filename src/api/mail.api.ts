import { api } from "./client";

type MailResult = {
  success: boolean;
  responseMessage?: string;
};

type MailApiResponse = {
  code: string;
  message: string;
  data: MailResult;
};

export type MailUpdateRequest = {
  studentNumber: number;
  email: string;
};

export const mailApi = {
  // 백엔드가 address/authCode를 쿼리 파라미터로 받음 (body 아님)
  send: (address: string) =>
    api.post<MailApiResponse>("/mail/send", null, { params: { address } }),

  verify: (address: string, authCode: string) =>
    api.post<MailApiResponse>("/mail/verify", null, {
      params: { address, authCode },
    }),

  update: (data: MailUpdateRequest) => api.post("/mail/update", data),
};
