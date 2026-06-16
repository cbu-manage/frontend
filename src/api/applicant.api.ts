import { api } from "./client";
import { type ApiEnvelope } from "./auth.api";

export type ApplicantStatus = "PENDING" | "PASS" | "FAIL";

export type ApplicantItem = {
  id: number;
  name: string;
  studentNumber: number;
  major: string;
  passCount: number;
  failCount: number;
  totalVoters: number;
  status: ApplicantStatus;
  appliedAt: string;
  myReviewed?: boolean;
  otAttended?: boolean;
  welcomeAttended?: boolean;
  note?: string;
};

export const applicantApi = {
  getAll: () =>
    api.get<ApiEnvelope<ApplicantItem[]>>("/admin/applicants"),

  updateStatus: (id: number, status: "PASS" | "FAIL") =>
    api.patch<ApiEnvelope<null>>(`/admin/applicants/${id}/status`, { status }),

  notifyPass: () =>
    api.post<ApiEnvelope<null>>("/admin/applicants/notify-pass"),
};
