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
  send: (address: string) =>
    api.post<MailApiResponse>("/mail/send", { address }),

  verify: (address: string, authCode: string) =>
    api.post<MailApiResponse>("/mail/verify", { address, authCode }),

  update: (data: MailUpdateRequest) =>
    api.post("/mail/update", data),
};
