import { api } from "./client";

export type MailSendResponse = {
  success: boolean;
  responseMessage?: string;
};

export type MailVerifyResponse = {
  success: boolean;
  responseMessage?: string;
};

export type MailUpdateRequest = {
  studentNumber: number;
  email: string;
};

export const mailApi = {
  send: (address: string) =>
    api.post<MailSendResponse>("/mail/send", null, {
      params: { address },
    }),

  verify: (address: string, authCode: string) =>
    api.post<MailVerifyResponse>("/mail/verify", { address, authCode }),

  update: (data: MailUpdateRequest) =>
    api.post("/mail/update", data),
};
