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
    api.patch(`/admin/applicants/${id}/status`, { status }),

  notifyPass: () =>
    api.post("/admin/applicants/notify-pass"),
};
